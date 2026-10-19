import { z } from 'zod'

export const registerSchema = z.object({
  orgName: z.string().min(1, 'Organization name is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
})

export const unitSchema = z.object({
  label: z.string().min(1, 'Unit label is required'),
  notes: z.string().optional(),
})

export const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional(),
  notes: z.string().optional(),
  propertyId: z.string().optional(),
  monthlyRent: z.coerce.number().positive('Rent must be greater than 0').optional(),
  dueDate: z.string().min(1, 'Due date is required'),
})

export const leaseSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  tenantId: z.string().min(1, 'Tenant is required'),
  rentPaise: z.number().positive('Rent must be positive'),
  depositPaise: z.number().nonnegative('Deposit cannot be negative').default(0),
  dueDay: z.number().min(1).max(28),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type UnitInput = z.infer<typeof unitSchema>
export type TenantInput = z.infer<typeof tenantSchema>
export type LeaseInput = z.infer<typeof leaseSchema>
