import { useParams, Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DetailPageSkeleton } from '@/shared/components/skeletons/DetailPageSkeleton'
import { ErrorState } from '@/shared/components/error-state/ErrorState'
import { StatusBadge } from '@/shared/components/status-badge/StatusBadge'
import { ActivityTimeline } from '@/shared/components/activity-timeline/ActivityTimeline'
import { useActivity } from '@/shared/hooks/useActivity'
import { useMaintenanceRecord } from './hooks/useMaintenanceRecord'
import { useUpdateMaintenanceStatus } from './hooks/useUpdateMaintenanceStatus'
import { useVehicles } from '@/features/vehicles/hooks/useVehicles'
import { MAINTENANCE_PRIORITY_CONFIG, MAINTENANCE_STATUS_CONFIG } from './maintenance-status-config'

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '—'
}

export function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: record, isLoading, isError, refetch } = useMaintenanceRecord(id ?? '')
  const { data: vehiclesData } = useVehicles({ pageSize: 200 })
  const { data: activityData } = useActivity({
    entityKind: 'maintenance',
    entityId: id,
    pageSize: 50,
  })
  const updateStatus = useUpdateMaintenanceStatus()

  if (isLoading) return <DetailPageSkeleton label="Loading maintenance record" />
  if (isError || !record) {
    return (
      <div className="p-6">
        <ErrorState title="Couldn't load maintenance record" onRetry={() => refetch()} />
      </div>
    )
  }

  const vehicle = vehiclesData?.data.find((v) => v.id === record.vehicleId)
  const statusConfig = MAINTENANCE_STATUS_CONFIG[record.status]
  const priorityConfig = MAINTENANCE_PRIORITY_CONFIG[record.priority]

  function handleStatusChange(status: 'in_progress' | 'completed', successMessage: string) {
    updateStatus.mutate(
      { id: record!.id, status },
      {
        onSuccess: () => toast.success(successMessage),
        onError: () => toast.error("Couldn't update the maintenance record. Please try again."),
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
    ['Type', <span className="capitalize">{record.maintenanceType.replace('_', ' ')}</span>],
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
    ['Mileage', `${record.mileage.toLocaleString()} km`],
    ['Description', record.description],
    ['Notes', record.notes || '—'],
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{record.id}</h1>
        <div className="flex flex-wrap gap-2">
          {(record.status === 'scheduled' || record.status === 'due') && (
            <Button
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => handleStatusChange('in_progress', `Maintenance ${record.id} started.`)}
            >
              Start
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() =>
                handleStatusChange('completed', `Maintenance ${record.id} marked complete.`)
              }
            >
              Mark complete
            </Button>
          )}
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
        <ActivityTimeline events={activityData?.data ?? []} />
      </div>
    </div>
  )
}
