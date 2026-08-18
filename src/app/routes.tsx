import { Route, Routes } from 'react-router'
import { AlertsPage } from '@/features/alerts/AlertsPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { DeliveriesPage } from '@/features/deliveries/DeliveriesPage'
import { DispatchPage } from '@/features/dispatch/DispatchPage'
import { DriversPage } from '@/features/drivers/DriversPage'
import { DriverDetailPage } from '@/features/drivers/DriverDetailPage'
import { MaintenancePage } from '@/features/maintenance/MaintenancePage'
import { VehiclesPage } from '@/features/vehicles/VehiclesPage'
import { VehicleDetailPage } from '@/features/vehicles/VehicleDetailPage'
import { AppShell } from './layout/AppShell'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vehicles/:id" element={<VehicleDetailPage />} />
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/:id" element={<DriverDetailPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  )
}
