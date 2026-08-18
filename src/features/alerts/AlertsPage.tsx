import { AlertsTable } from './components/AlertsTable'

export function AlertsPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Alerts</h1>
      <AlertsTable />
    </div>
  )
}
