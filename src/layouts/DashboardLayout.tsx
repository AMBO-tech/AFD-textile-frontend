import { Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUiStore } from '@/stores/useUiStore'
import { Button } from '@/components/ui/button'
import { LogOut, User as UserIcon, Menu } from 'lucide-react'

export const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useUiStore()

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Topbar Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Menu"
            className="md:hidden"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-lg font-bold tracking-tight text-primary">
            AFD Textile
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-sm">
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="size-4" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
