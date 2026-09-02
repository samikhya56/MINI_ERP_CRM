import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from '../schemas/product.schema';

/**
 * Create a new Product with SKU uniqueness validation
 * POST /api/products
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const existingSku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingSku) {
      res.status(409).json({
        success: false,
        error: `Product with SKU '${validatedData.sku}' already exists`,
      });
      return;
    }

    const product = await prisma.product.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product details
 * PUT /api/products/:id
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    const validatedData = updateProductSchema.parse(req.body);

    if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
      const duplicateSku = await prisma.product.findUnique({
        where: { sku: validatedData.sku },
      });
      if (duplicateSku) {
        res.status(409).json({
          success: false,
          error: `Product with SKU '${validatedData.sku}' already exists`,
        });
        return;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List products with search, pagination, and lowStockOnly filter
 * GET /api/products
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, lowStockOnly } = queryProductSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Handle lowStockOnly: currentStock <= minStockAlert
    if (lowStockOnly) {
      // Prisma raw query or field comparison support
      // We can perform raw query or filter low stock products efficiently
      const lowStockProducts = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM products 
        WHERE "currentStock" <= "minStockAlert"
      `;
      const lowStockIds = lowStockProducts.map((p) => p.id);
      where.id = { in: lowStockIds };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: products,
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
 * Fetch Product details by ID
 * GET /api/products/:id
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve audit log of stock movements for a specific product
 * GET /api/products/:id/movements
 */
export const getProductStockMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};
