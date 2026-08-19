import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DriversTable } from './components/DriversTable'
import { DriverFormDialog } from './components/DriverFormDialog'

export function DriversPage() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Drivers</h1>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          Add driver
        </Button>
      </div>
      <DriversTable />
      {addOpen && <DriverFormDialog onOpenChange={setAddOpen} />}
    </div>
  )
}
