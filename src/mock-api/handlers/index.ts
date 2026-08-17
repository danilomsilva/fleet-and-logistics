import type { HttpHandler } from 'msw'
import { activityHandlers } from './activity'
import { alertHandlers } from './alerts'
import { deliveryHandlers } from './deliveries'
import { driverHandlers } from './drivers'
import { maintenanceHandlers } from './maintenance'
import { vehicleHandlers } from './vehicles'

export const handlers: HttpHandler[] = [
  ...vehicleHandlers,
  ...driverHandlers,
  ...deliveryHandlers,
  ...maintenanceHandlers,
  ...alertHandlers,
  ...activityHandlers,
]
