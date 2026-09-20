import React from 'react'
import { Store, Wifi, WifiOff, RefreshCw, Bell, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'

interface BoutiqueHeaderSyncProps {
  onSearchChange?: (q: string) => void
  onOpenNotifications?: () => void
  unreadNotifications?: number
}

export const BoutiqueHeaderSync: React.FC<BoutiqueHeaderSyncProps> = ({
  onSearchChange,
  onOpenNotifications,
  unreadNotifications = 0,
}) => {
  const { currentLocation, isOnline, syncStatus, pendingSyncCount, setSyncStatus } = useAppStore()
  const { user } = useAuthStore()

  const handleManualSync = () => {
    setSyncStatus('syncing')
    setTimeout(() => {
      setSyncStatus('synced')
    }, 1200)
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-[0_1px_3px_rgba(15,61,94,0.05)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Boutique identity & status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F3D5E] text-white flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-[#1E88E5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-slate-900 text-sm sm:text-base leading-tight">
                {currentLocation?.nom || 'AFD Textile - Réseau Boutiques'}
              </h2>
              <Badge variant="outline" className="text-[11px] font-medium border-[#1E88E5]/30 text-[#1E88E5] bg-[#1E88E5]/5">
                {currentLocation?.code || 'DKR'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>{currentLocation?.ville || 'Dakar'}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    <Wifi className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-[#22C55E]">En ligne</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <WifiOff className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="text-[#F59E0B]">Mode hors ligne</span>
                  </>
                )}
              </span>
              <span>•</span>
              <span className="text-slate-600">
                {syncStatus === 'syncing' && 'Synchronisation en cours...'}
                {syncStatus === 'synced' && 'Synchronisation réussie'}
                {syncStatus === 'pending' && `${pendingSyncCount} action(s) en attente de sync`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick search, sync button, and notification bell */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {onSearchChange && (
            <div className="relative flex-1 sm:w-64 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher tissu, réf..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F5F7FA] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] transition-all"
              />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={syncStatus === 'syncing'}
            className="h-9 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 rounded-xl"
            title="Synchroniser avec le serveur"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1E88E5] ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync</span>
          </Button>

          {onOpenNotifications && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenNotifications}
              className="relative h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>
          )}

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#0F3D5E]/10 text-[#0F3D5E] font-display font-semibold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-800 leading-tight flex items-center gap-1">
                <span>{user?.name || 'Gérant Principal'}</span>
                {user?.role === 'ADMIN' && <ShieldCheck className="w-3 h-3 text-[#1E88E5]" />}
              </div>
              <div className="text-[11px] text-slate-400 capitalize">{user?.role?.toLowerCase() || 'gérant'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
