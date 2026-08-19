import { z } from 'zod'

export const vehiclesFiltersSchema = z.object({
  status: z.string().optional().default(''),
  type: z.string().optional().default(''),
  q: z.string().optional().default(''),
})
