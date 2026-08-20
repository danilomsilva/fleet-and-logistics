import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateDelivery } from '../hooks/useCreateDelivery'
import { deliveryInputSchema, deliveryPrioritySchema } from '@/mock-api/schemas/delivery'
import { vehicleTypeSchema } from '@/mock-api/schemas/vehicle'
import { IRISH_TOWNS } from '@/mock-api/generators/geo'
import { DELIVERY_PRIORITY_CONFIG } from '../delivery-status-config'

const TOWN_ITEMS: Record<string, string> = Object.fromEntries(
  IRISH_TOWNS.map(([name]) => [name, name]),
)

const TYPE_ITEMS: Record<string, string> = Object.fromEntries(
  vehicleTypeSchema.options.map((type) => [type, type[0].toUpperCase() + type.slice(1)]),
)

const PRIORITY_ITEMS: Record<string, string> = Object.fromEntries(
  deliveryPrioritySchema.options.map((priority) => [
    priority,
    DELIVERY_PRIORITY_CONFIG[priority].label,
  ]),
)

export interface DeliveryFormDialogProps {
  /** Called with `false` to close. The caller should stop rendering this
   * component in response, so a fresh instance (and fresh form state) mounts
   * the next time it's opened — see DeliveriesPage. */
  onOpenChange: (open: boolean) => void
}

export function DeliveryFormDialog({ onOpenChange }: DeliveryFormDialogProps) {
  const createDelivery = useCreateDelivery()

  const [customer, setCustomer] = useState('')
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [requiredVehicleType, setRequiredVehicleType] = useState<string>('van')
  const [priority, setPriority] = useState<string>('medium')
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit() {
    const parsed = deliveryInputSchema.safeParse({
      customer,
      pickup,
      destination,
      requiredVehicleType,
      priority,
      scheduledTime: scheduledDate ? new Date(scheduledDate).toISOString() : '',
      notes,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check the form.')
      return
    }

    createDelivery.mutate(parsed.data, {
      onSuccess: (delivery) => {
        toast.success(`${delivery.id} added.`)
        onOpenChange(false)
      },
      onError: () => toast.error("Couldn't add the delivery. Please try again."),
    })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Delivery</DialogTitle>
          <DialogDescription>Schedule a new delivery for dispatch.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="delivery-customer" className="text-sm font-medium">
              Customer
            </label>
            <Input
              id="delivery-customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Pickup</span>
              <Select items={TOWN_ITEMS} value={pickup} onValueChange={(v) => v && setPickup(v)}>
                <SelectTrigger className="w-full" aria-label="Pickup">
                  <SelectValue placeholder="Select a town" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOWN_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Destination</span>
              <Select
                items={TOWN_ITEMS}
                value={destination}
                onValueChange={(v) => v && setDestination(v)}
              >
                <SelectTrigger className="w-full" aria-label="Destination">
                  <SelectValue placeholder="Select a town" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOWN_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-sm font-medium">Required vehicle type</span>
              <Select
                items={TYPE_ITEMS}
                value={requiredVehicleType}
                onValueChange={(v) => v && setRequiredVehicleType(v)}
              >
                <SelectTrigger className="w-full" aria-label="Required vehicle type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium">Priority</span>
              <Select
                items={PRIORITY_ITEMS}
                value={priority}
                onValueChange={(v) => v && setPriority(v)}
              >
                <SelectTrigger className="w-full" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="delivery-scheduled-date" className="text-sm font-medium">
              Scheduled date
            </label>
            <Input
              id="delivery-scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="delivery-notes" className="text-sm font-medium">
              Notes
            </label>
            <Input id="delivery-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button
            disabled={
              createDelivery.isPending || !customer || !pickup || !destination || !scheduledDate
            }
            onClick={handleSubmit}
          >
            Add Delivery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
