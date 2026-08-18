import { VehiclesTable } from './components/VehiclesTable'

export function VehiclesPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Vehicles</h1>
      <VehiclesTable />
    </div>
  )
}
