import { Outlet } from 'react-router'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useSidebarDrawerStore } from './sidebar-store'

export function AppShell() {
  const toggleDrawer = useSidebarDrawerStore((state) => state.toggle)

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={toggleDrawer} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <MobileSidebarDrawer />
    </div>
  )
}
