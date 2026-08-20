import { z } from 'zod'

export const alertsFiltersSchema = z.object({
  category: z.string().optional().default(''),
  status: z.string().optional().default(''),
  type: z.string().optional().default(''),
  q: z.string().optional().default(''),
})
