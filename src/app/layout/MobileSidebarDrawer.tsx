import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { useSidebarDrawerStore } from './sidebar-store'

export function MobileSidebarDrawer() {
  const isOpen = useSidebarDrawerStore((state) => state.isOpen)
  const close = useSidebarDrawerStore((state) => state.close)

  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && close()}>
      <SheetContent id="mobile-sidebar-drawer" side="left" className="p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
