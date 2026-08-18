import { MaintenanceTable } from './components/MaintenanceTable'

export function MaintenancePage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Maintenance</h1>
      <MaintenanceTable />
    </div>
  )
}
