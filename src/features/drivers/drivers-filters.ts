import { z } from 'zod'

export const driversFiltersSchema = z.object({
  status: z.string().optional().default(''),
  q: z.string().optional().default(''),
})
