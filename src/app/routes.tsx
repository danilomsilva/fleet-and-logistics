import { Route, Routes } from 'react-router'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { DispatchPage } from '@/features/dispatch/DispatchPage'
import { DeliveriesPage } from '@/features/deliveries/DeliveriesPage'
import { VehiclesPage } from '@/features/vehicles/VehiclesPage'
import { DriversPage } from '@/features/drivers/DriversPage'
import { MaintenancePage } from '@/features/maintenance/MaintenancePage'
import { AlertsPage } from '@/features/alerts/AlertsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<DashboardPage />} />
      <Route path="dispatch" element={<DispatchPage />} />
      <Route path="deliveries" element={<DeliveriesPage />} />
      <Route path="vehicles" element={<VehiclesPage />} />
      <Route path="drivers" element={<DriversPage />} />
      <Route path="maintenance" element={<MaintenancePage />} />
      <Route path="alerts" element={<AlertsPage />} />
    </Routes>
  )
}
