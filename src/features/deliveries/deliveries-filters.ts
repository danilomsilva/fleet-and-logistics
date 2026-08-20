import { z } from 'zod'

export const deliveriesFiltersSchema = z.object({
  status: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  driverId: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  date: z.string().optional().default(''),
  q: z.string().optional().default(''),
})
