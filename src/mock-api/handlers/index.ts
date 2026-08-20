import type { HttpHandler } from 'msw'
import { activityHandlers } from './activity'
import { alertHandlers } from './alerts'
import { deliveryHandlers } from './deliveries'
import { dispatchHandlers } from './dispatch'
import { driverHandlers } from './drivers'
import { serviceHandlers } from './services'
import { vehicleHandlers } from './vehicles'

export const handlers: HttpHandler[] = [
  ...vehicleHandlers,
  ...driverHandlers,
  ...deliveryHandlers,
  ...serviceHandlers,
  ...alertHandlers,
  ...activityHandlers,
  ...dispatchHandlers,
]
