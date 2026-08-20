import { z } from 'zod'

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string(),
})
export type GeoPoint = z.infer<typeof geoPointSchema>

export const entityKindSchema = z.enum(['vehicle', 'driver', 'delivery', 'service', 'alert'])
export type EntityKind = z.infer<typeof entityKindSchema>

export const entityRefSchema = z.object({
  kind: entityKindSchema,
  id: z.string(),
})
export type EntityRef = z.infer<typeof entityRefSchema>
