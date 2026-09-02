import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  category: z.string().trim().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
  currentStock: z.number().int().min(0, 'Current stock cannot be negative'),
  minStockAlert: z.number().int().min(0, 'Min stock alert cannot be negative'),
  location: z.string().trim().min(1, 'Location is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const queryProductSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  lowStockOnly: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type QueryProductInput = z.infer<typeof queryProductSchema>;
