import {
  AlertTriangle,
  Car,
  LayoutDashboard,
  Map,
  Package,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Dispatch', to: '/dispatch', icon: Map },
  { label: 'Deliveries', to: '/deliveries', icon: Package },
  { label: 'Vehicles', to: '/vehicles', icon: Car },
  { label: 'Drivers', to: '/drivers', icon: Users },
  { label: 'Maintenance', to: '/maintenance', icon: Wrench },
  { label: 'Alerts', to: '/alerts', icon: AlertTriangle },
]
