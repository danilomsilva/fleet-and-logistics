import type { ReactNode } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface FilterDropdownGroup {
  label: string
  /** Current value — pass the same "all"-sentinel-normalized value used
   * elsewhere (e.g. `filters.status || 'all'`). */
  value: string
  onValueChange: (value: string) => void
  /** value -> label, in display order (the "clear this filter" option, e.g.
   * "All statuses", should be the first entry). */
  items: Record<string, string>
}

export interface FilterDropdownProps {
  groups: FilterDropdownGroup[]
  /** Extra content appended after the option groups (e.g. a date input) —
   * not itself a menu item, so interacting with it never closes the menu. */
  children?: ReactNode
}

/** A single "Filters" dropdown grouping every filter for a table. Picking an
 * option updates the table immediately but keeps the menu open, so several
 * filters can be set in one visit rather than reopening it each time. */
export function FilterDropdown({ groups, children }: FilterDropdownProps) {
  const activeCount = groups.filter((group) => group.value && group.value !== 'all').length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            <Filter aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        {groups.map((group, index) => (
          <DropdownMenuGroup key={group.label}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={group.value} onValueChange={group.onValueChange}>
              {Object.entries(group.items).map(([value, label]) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  onSelect={(event) => event.preventDefault()}
                >
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        ))}
        {children && (
          <>
            <DropdownMenuSeparator />
            <div className="space-y-1 px-1.5 py-1">{children}</div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
