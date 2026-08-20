import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { ConfirmDialog } from '@/shared/components/confirm-dialog/ConfirmDialog'
import { useActivity } from '@/shared/hooks/useActivity'
import { useServiceRecord } from './hooks/useServiceRecord'
import { useUpdateServiceStatus } from './hooks/useUpdateServiceStatus'
import { useDeleteServiceRecord } from './hooks/useDeleteServiceRecord'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { formatKm } from '@/shared/lib/format'
import { SERVICE_PRIORITY_CONFIG, SERVICE_STATUS_CONFIG } from './service-status-config'
import { ServiceFormDialog } from './components/ServiceFormDialog'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: record, isLoading, isError, refetch } = useServiceRecord(id ?? '')
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const { data: activityData } = useActivity({
    entityKind: 'service',
    entityId: id,
    pageSize: 50,
  })
  const updateStatus = useUpdateServiceStatus()
  const deleteRecord = useDeleteServiceRecord()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) return <DetailPageSkeleton label="Loading service record" />
  if (isError || !record) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load service record" onRetry={() => refetch()} />
      </div>
    )
  }

  function handleDelete() {
    deleteRecord.mutate(record!.id, {
      onSuccess: () => {
        toast.success(`${record!.id} deleted.`)
        navigate('/services')
      },
      onError: () => toast.error("Couldn't delete the record. Please try again."),
    })
  }

  const vehicle = vehiclesData?.data.find((v) => v.id === record.vehicleId)
  const statusConfig = SERVICE_STATUS_CONFIG[record.status]
  const priorityConfig = SERVICE_PRIORITY_CONFIG[record.priority]

  function handleStatusChange(status: 'in_progress' | 'completed', successMessage: string) {
    updateStatus.mutate(
      { id: record!.id, status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: () => toast.error("Couldn't update the service record. Please try again."),
      },
    )
  }

  const fields: [string, React.ReactNode][] = [
    [
      'Vehicle',
      vehicle ? (
        <Link to={`/vehicles/${vehicle.id}`} className="hover:underline">
          {vehicle.name}
        </Link>
      ) : (
        record.vehicleId
      ),
    ],
    ['Type', <span className="capitalize">{record.serviceType.replace('_', ' ')}</span>],
    [
      'Priority',
      <StatusBadge
        label={priorityConfig.label}
        tone={priorityConfig.tone}
        icon={priorityConfig.icon}
      />,
    ],
    [
      'Status',
      <StatusBadge label={statusConfig.label} tone={statusConfig.tone} icon={statusConfig.icon} />,
    ],
    ['Scheduled date', formatDate(record.scheduledDate)],
    ['Completion date', formatDate(record.completionDate)],
    ['Mileage', formatKm(record.mileage)],
    ['Description', record.description],
    ['Notes', record.notes || '—'],
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{record.id}</h1>
        <div className="flex flex-wrap gap-2">
          {(record.status === 'scheduled' || record.status === 'due') && (
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                disabled={updateStatus.isPending || !vehicle?.driverId}
                onClick={() => handleStatusChange('in_progress', `Service ${record.id} started.`)}
              >
                Start
              </Button>
              {!vehicle?.driverId && (
                <p className="text-xs text-muted-foreground">
                  Assign a driver to this vehicle before starting service.
                </p>
              )}
            </div>
          )}
          {record.status === 'in_progress' && (
            <Button
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() =>
                handleStatusChange('completed', `Service ${record.id} marked complete.`)
              }
            >
              Mark complete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil aria-hidden="true" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="space-y-1 rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-sm font-medium">{value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Activity</h2>
        <ActivityTimeline events={activityData?.data ?? []} readOnly />
      </div>

      {editOpen && <ServiceFormDialog onOpenChange={setEditOpen} record={record} />}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${record.id}?`}
        description="This removes the service record. This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteRecord.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
