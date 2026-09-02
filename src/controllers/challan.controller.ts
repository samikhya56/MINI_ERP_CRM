import { Request, Response, NextFunction } from 'express';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  createChallanSchema,
  updateChallanStatusSchema,
  queryChallanSchema,
} from '../schemas/challan.schema';

/**
 * Generate autoincrementing Challan number: CH-YYYYMMDD-XXXX
 */
async function generateChallanNumber(tx: Prisma.TransactionClient): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `CH-${dateStr}-`;

  const countToday = await tx.salesChallan.count({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
  });

  const sequenceStr = String(countToday + 1).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
}

/**
 * Create a new Sales Challan
 * POST /api/challans
 */
export const createChallan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerId, status, items } = createChallanSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify Customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
      return;
    }

    // Fetch and snapshot product details
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    const challanItemsData: Array<{
      productId: string;
      snapshotProductName: string;
      snapshotSku: string;
      snapshotUnitPrice: number | Prisma.Decimal;
      quantity: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res.status(404).json({
          success: false,
          error: `Product not found: ${item.productId}`,
        });
        return;
      }

      totalQuantity += item.quantity;

      challanItemsData.push({
        productId: product.id,
        snapshotProductName: product.name,
        snapshotSku: product.sku,
        snapshotUnitPrice: product.unitPrice,
        quantity: item.quantity,
      });
    }

    // Execute within Interactive Transaction
    const newChallan = await prisma.$transaction(async (tx) => {
      const challanNumber = await generateChallanNumber(tx);

      // Create Challan record with items
      const createdChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          totalQuantity,
          status,
          createdById: userId,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          customer: true,
          items: true,
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // If initial status is "Confirmed", deduct stock & record StockMovements atomically
      if (status === ChallanStatus.Confirmed) {
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.currentStock < item.quantity) {
            const productName = product ? product.name : item.productId;
            throw new Error(`INSUFFICIENT_STOCK:Insufficient stock for product: ${productName}`);
          }

          // Decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          // Record StockMovement (OUT)
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan #${challanNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      return createdChallan;
    });

    res.status(201).json({
      success: true,
      data: newChallan,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      const cleanMessage = error.message.replace('INSUFFICIENT_STOCK:', '');
      res.status(400).json({
        success: false,
        error: cleanMessage,
      });
      return;
    }
    next(error);
  }
};

/**
 * Transition Sales Challan status (Draft, Confirmed, Cancelled)
 * PATCH /api/challans/:id/status
 */
export const updateChallanStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = updateChallanStatusSchema.parse(req.body);
    const userId = req.user!.id;

    const existingChallan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingChallan) {
      res.status(404).json({
        success: false,
        error: 'Sales Challan not found',
      });
      return;
    }

    const currentStatus = existingChallan.status;

    // No-op if status is identical
    if (currentStatus === targetStatus) {
      res.status(200).json({
        success: true,
        data: existingChallan,
      });
      return;
    }

    // Disallow invalid transition from Confirmed back to Draft
    if (currentStatus === ChallanStatus.Confirmed && targetStatus === ChallanStatus.Draft) {
      res.status(400).json({
        success: false,
        error: 'Cannot revert a Confirmed challan back to Draft. You can only Cancel it.',
      });
      return;
    }

    // Execute Status Transition inside Interactive Transaction
    const updatedChallan = await prisma.$transaction(async (tx) => {
      // 1. Transitioning TO "Confirmed" (from Draft or Cancelled)
      if (targetStatus === ChallanStatus.Confirmed) {
        for (const item of existingChallan.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.currentStock < item.quantity) {
            const productName = item.snapshotProductName || product?.name || item.productId;
            throw new Error(`INSUFFICIENT_STOCK:Insufficient stock for product: ${productName}`);
          }

          // Decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          // Create StockMovement (OUT)
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan #${existingChallan.challanNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      // 2. Transitioning TO "Cancelled" FROM "Confirmed"
      if (targetStatus === ChallanStatus.Cancelled && currentStatus === ChallanStatus.Confirmed) {
        for (const item of existingChallan.items) {
          // Increment stock back
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          // Create compensating StockMovement (IN)
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.IN,
              reason: `Cancelled Challan #${existingChallan.challanNumber}`,
              createdBy: userId,
            },
          });
        }
      }

      // Update Challan Status
      const result = await tx.salesChallan.update({
        where: { id },
        data: { status: targetStatus },
        include: {
          customer: true,
          items: true,
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      return result;
    });

    res.status(200).json({
      success: true,
      data: updatedChallan,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('INSUFFICIENT_STOCK:')) {
      const cleanMessage = error.message.replace('INSUFFICIENT_STOCK:', '');
      res.status(400).json({
        success: false,
        error: cleanMessage,
      });
      return;
    }
    next(error);
  }
};

/**
 * List Sales Challans with pagination, status, customer, and search filters
 * GET /api/challans
 */
export const getChallans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status, customerId, search } = queryChallanSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Prisma.SalesChallanWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [challans, totalCount] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: challans,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch Sales Challan details by ID
 * GET /api/challans/:id
 */
export const getChallanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                currentStock: true,
                location: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!challan) {
      res.status(404).json({
        success: false,
        error: 'Sales Challan not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: challan,
    });
  } catch (error) {
    next(error);
  }
};
