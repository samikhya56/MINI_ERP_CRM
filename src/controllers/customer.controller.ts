import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  createCustomerSchema,
  updateCustomerSchema,
  queryCustomerSchema,
  createCustomerNoteSchema,
} from '../schemas/customer.schema';

/**
 * Add a new Customer
 * POST /api/customers
 */
export const createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = createCustomerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Customer details
 * PUT /api/customers/:id
 */
export const updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
      return;
    }

    const validatedData = updateCustomerSchema.parse(req.body);

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.followUpDate !== undefined && {
          followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
        }),
      },
    });

    res.status(200).json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List Customers with pagination, search, and status filters
 * GET /api/customers
 */
export const getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, search, status } = queryCustomerSchema.parse(req.query);

    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: customers,
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
 * Fetch Customer details by ID including follow-up notes
 * GET /api/customers/:id
 */
export const getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        customerNotes: {
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
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Append follow-up notes linked to the authenticated user
 * POST /api/customers/:id/notes
 */
export const addCustomerNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: customerId } = req.params;
    const userId = req.user!.id;

    const customerExists = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customerExists) {
      res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
      return;
    }

    const { note } = createCustomerNoteSchema.parse(req.body);

    const createdNote = await prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdBy: userId,
      },
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

    res.status(201).json({
      success: true,
      data: createdNote,
    });
  } catch (error) {
    next(error);
  }
};
