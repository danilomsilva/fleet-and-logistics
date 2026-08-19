import { z } from 'zod'

export const driverStatusSchema = z.enum(['available', 'driving', 'on_break', 'offline'])
export type DriverStatus = z.infer<typeof driverStatusSchema>

export const driverShiftSchema = z.enum(['morning', 'afternoon', 'overnight'])
export type DriverShift = z.infer<typeof driverShiftSchema>

export const driverAvailabilitySchema = z.object({
  shift: driverShiftSchema,
})
export type DriverAvailability = z.infer<typeof driverAvailabilitySchema>

export const driverSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: driverStatusSchema,
  assignedVehicleId: z.string().nullable(),
  deliveriesToday: z.number().int().nonnegative(),
  completedDeliveries: z.number().int().nonnegative(),
  availability: driverAvailabilitySchema,
  lastActiveAt: z.string().datetime(),
})
export type Driver = z.infer<typeof driverSchema>

/** The user-editable subset of a driver, used for both create and edit. */
export const driverInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    status: driverStatusSchema,
    assignedVehicleId: z.string().nullable(),
  })
  .refine((input) => input.assignedVehicleId !== null, {
    message: 'A vehicle must be assigned',
    path: ['assignedVehicleId'],
  })
export type DriverInput = z.infer<typeof driverInputSchema>
