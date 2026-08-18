import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { MobileSidebarDrawer } from './MobileSidebarDrawer'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useSidebarDrawerStore } from './sidebar-store'

// Tailwind's default `md` breakpoint — the point at which the desktop
// Sidebar takes over and the mobile drawer becomes redundant.
const DESKTOP_QUERY = '(min-width: 768px)'

export function AppShell() {
  const isDrawerOpen = useSidebarDrawerStore((state) => state.isOpen)
  const toggleDrawer = useSidebarDrawerStore((state) => state.toggle)
  const closeDrawer = useSidebarDrawerStore((state) => state.close)

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer()
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [closeDrawer])

  return (
    <div className="flex min-h-svh">
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to main content
      </a>
      <aside className="hidden w-64 shrink-0 border-r md:block">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar isOpen={isDrawerOpen} onMenuClick={toggleDrawer} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <MobileSidebarDrawer />
    </div>
  )
}
