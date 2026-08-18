import { DeliveriesTable } from './components/DeliveriesTable'

export function DeliveriesPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Deliveries</h1>
      <DeliveriesTable />
    </div>
  )
}
