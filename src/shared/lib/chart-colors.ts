import type { StatusTone } from '@/shared/components/status-badge/StatusBadge'

/** Hex equivalents of the StatusBadge tone palette, for chart libraries
 * (Recharts) that need real color values rather than Tailwind classes —
 * keeps chart colors consistent with the status badges shown everywhere else. */
export const TONE_CHART_COLOR: Record<StatusTone, string> = {
  neutral: '#6b7280',
  info: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
}
