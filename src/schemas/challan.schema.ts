import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  status: z
    .nativeEnum(ChallanStatus, {
      errorMap: () => ({ message: 'status must be Draft or Confirmed' }),
    })
    .optional()
    .default(ChallanStatus.Draft),
  items: z.array(challanItemInputSchema).min(1, 'Sales Challan must include at least one item'),
});

export const updateChallanStatusSchema = z.object({
  status: z.nativeEnum(ChallanStatus, {
    errorMap: () => ({ message: 'status must be Draft, Confirmed, or Cancelled' }),
  }),
});

export const queryChallanSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  status: z.nativeEnum(ChallanStatus).optional(),
  customerId: z.string().optional(),
  search: z.string().trim().optional(),
});

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanStatusInput = z.infer<typeof updateChallanStatusSchema>;
export type QueryChallanInput = z.infer<typeof queryChallanSchema>;
