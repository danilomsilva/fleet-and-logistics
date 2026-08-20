import { z } from 'zod'

export const serviceFiltersSchema = z.object({
  status: z.string().optional().default(''),
  priority: z.string().optional().default(''),
  vehicleId: z.string().optional().default(''),
  q: z.string().optional().default(''),
})
