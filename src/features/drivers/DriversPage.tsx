import { DriversTable } from './components/DriversTable'

export function DriversPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Drivers</h1>
      <DriversTable />
    </div>
  )
}
