import { lazy } from 'react'
import { Route, Routes } from 'react-router'
import { AppShell } from './layout/AppShell'

const AlertsPage = lazy(() =>
  import('@/features/alerts/AlertsPage').then((m) => ({ default: m.AlertsPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const DeliveriesPage = lazy(() =>
  import('@/features/deliveries/DeliveriesPage').then((m) => ({ default: m.DeliveriesPage })),
)
const DeliveryDetailPage = lazy(() =>
  import('@/features/deliveries/DeliveryDetailPage').then((m) => ({
    default: m.DeliveryDetailPage,
  })),
)
const DispatchPage = lazy(() =>
  import('@/features/dispatch/DispatchPage').then((m) => ({ default: m.DispatchPage })),
)
const DriversPage = lazy(() =>
  import('@/features/drivers/DriversPage').then((m) => ({ default: m.DriversPage })),
)
const DriverDetailPage = lazy(() =>
  import('@/features/drivers/DriverDetailPage').then((m) => ({ default: m.DriverDetailPage })),
)
const MaintenancePage = lazy(() =>
  import('@/features/maintenance/MaintenancePage').then((m) => ({ default: m.MaintenancePage })),
)
const MaintenanceDetailPage = lazy(() =>
  import('@/features/maintenance/MaintenanceDetailPage').then((m) => ({
    default: m.MaintenanceDetailPage,
  })),
)
const VehiclesPage = lazy(() =>
  import('@/features/vehicles/VehiclesPage').then((m) => ({ default: m.VehiclesPage })),
)
const VehicleDetailPage = lazy(() =>
  import('@/features/vehicles/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/:id" element={<DriverDetailPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="maintenance/:id" element={<MaintenanceDetailPage />} />
        <Route path="alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  )
}
