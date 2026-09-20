import React from 'react'
import { Store, Wifi, WifiOff, RefreshCw, Bell, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  onSearchChange?: (q: string) => void
}

export const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  const { currentLocation, locations, setCurrentLocation, isOnline, syncStatus, pendingSyncCount, triggerManualSync } = useLocationStore()
  const { user } = useAuthStore()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 min-h-16 h-auto sm:h-16 px-4 sm:px-6 py-2 sm:py-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        {/* Left: Boutique identity & live sync status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F3D5E] text-white flex items-center justify-center shadow-xs shrink-0">
            <Store className="w-5 h-5 text-[#1E88E5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={currentLocation.id}
                onChange={(e) => {
                  const found = locations.find((l) => l.id === e.target.value)
                  if (found) setCurrentLocation(found)
                }}
                className="font-display font-semibold text-slate-900 text-sm sm:text-base bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-2"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.nom}
                  </option>
                ))}
              </select>
              <Badge variant="outline" className="text-[11px] font-medium border-primary-light/30 text-primary-light bg-primary-light/5">
                {currentLocation.code}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>{currentLocation.ville}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <Wifi className="w-3.5 h-3.5 text-success" />
                    <span className="text-success">En ligne</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <WifiOff className="w-3.5 h-3.5 text-warning" />
                    <span className="text-warning">Hors ligne</span>
                  </>
                )}
              </span>
              <span>•</span>
              <span className="text-slate-600">
                {syncStatus === 'syncing' && 'Synchronisation en cours...'}
                {syncStatus === 'synced' && 'Synchronisation réussie'}
                {syncStatus === 'pending' && `${pendingSyncCount} action(s) en attente`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Search, Sync Button & User info */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {onSearchChange && (
            <div className="relative flex-1 sm:w-64 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher tissu, réf..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light/30 focus:border-primary-light transition-all"
              />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={triggerManualSync}
            disabled={syncStatus === 'syncing'}
            className="h-9 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 rounded-xl cursor-pointer"
            title="Synchroniser"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-light ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sync</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="relative h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              2
            </span>
          </Button>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-display font-semibold text-xs flex items-center justify-center">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-slate-800 leading-tight flex items-center gap-1">
                <span>{user?.name || 'Amadou Diallo'}</span>
                {user?.role === 'gerant' && <ShieldCheck className="w-3 h-3 text-primary-light" />}
              </div>
              <div className="text-[11px] text-slate-400 capitalize">{user?.role || 'gérant'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
