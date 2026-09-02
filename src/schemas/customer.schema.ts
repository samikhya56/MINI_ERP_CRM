import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required'),
  mobile: z.string().trim().min(5, 'Valid mobile number is required'),
  email: z.string().trim().email('Invalid email address format'),
  businessName: z.string().trim().min(1, 'Business name is required'),
  gstNumber: z.string().trim().nullable().optional(),
  customerType: z.nativeEnum(CustomerType, {
    errorMap: () => ({ message: 'customerType must be Retail, Wholesale, or Distributor' }),
  }),
  address: z.string().trim().min(1, 'Address is required'),
  status: z.nativeEnum(CustomerStatus, {
    errorMap: () => ({ message: 'status must be Lead, Active, or Inactive' }),
  }),
  followUpDate: z
    .string()
    .datetime({ message: 'followUpDate must be a valid ISO datetime string' })
    .nullable()
    .optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const queryCustomerSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
});

export const createCustomerNoteSchema = z.object({
  note: z.string().trim().min(1, 'Note content cannot be empty'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type QueryCustomerInput = z.infer<typeof queryCustomerSchema>;
export type CreateCustomerNoteInput = z.infer<typeof createCustomerNoteSchema>;
