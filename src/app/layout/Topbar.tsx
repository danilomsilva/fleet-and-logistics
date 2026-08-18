import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4 md:hidden">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation menu">
        <Menu aria-hidden="true" />
      </Button>
      <span className="font-semibold">FleetOS</span>
    </header>
  )
}
