import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
import { navItems } from './nav-items'

export function Sidebar() {
  return (
    <nav aria-label="Primary" className="flex h-full flex-col gap-1 p-3">
      <ul className="flex flex-col gap-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                )
              }
            >
              <item.icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
