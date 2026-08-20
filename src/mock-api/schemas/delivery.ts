import { z } from 'zod'
import { geoPointSchema } from './common'
import { vehicleTypeSchema } from './vehicle'

export const deliveryStatusSchema = z.enum(['new', 'in_transit', 'delivered', 'delayed'])
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>

export const deliveryPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export type DeliveryPriority = z.infer<typeof deliveryPrioritySchema>

export const deliverySchema = z.object({
  id: z.string(),
  customer: z.string(),
  pickup: geoPointSchema,
  destination: geoPointSchema,
  driverId: z.string().nullable(),
  vehicleId: z.string().nullable(),
  requiredVehicleType: vehicleTypeSchema,
  priority: deliveryPrioritySchema,
  status: deliveryStatusSchema,
  eta: z.string().datetime().nullable(),
  scheduledTime: z.string().datetime(),
  distanceKm: z.number().nonnegative(),
  notes: z.string(),
})
export type Delivery = z.infer<typeof deliverySchema>

/** The user-editable subset of a delivery for the Add Delivery form. New
 * deliveries always start as 'new' with no driver/vehicle — those are set
 * by Dispatch, not at creation. */
export const deliveryInputSchema = z
  .object({
    customer: z.string().trim().min(1, 'Customer is required'),
    pickup: z.string().min(1, 'Pickup is required'),
    destination: z.string().min(1, 'Destination is required'),
    requiredVehicleType: vehicleTypeSchema,
    priority: deliveryPrioritySchema,
    scheduledTime: z.string().min(1, 'Scheduled time is required'),
    notes: z.string(),
  })
  .refine((input) => input.pickup !== input.destination, {
    message: 'Pickup and destination must be different',
    path: ['destination'],
  })
export type DeliveryInput = z.infer<typeof deliveryInputSchema>
