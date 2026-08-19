import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VehiclesTable } from './components/VehiclesTable'
import { VehicleFormDialog } from './components/VehicleFormDialog'

export function VehiclesPage() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicles</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          Add vehicle
        </Button>
      </div>
      <VehiclesTable />
      {addOpen && <VehicleFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
