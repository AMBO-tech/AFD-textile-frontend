import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Warehouse, Wifi, CheckCircle2 } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'

export const NetworkStatus: React.FC = () => {
  const { locations, currentLocation } = useLocationStore()

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              État du Réseau AFD Textile
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Synchronisation instantanée des boutiques et de l'entrepôt
            </CardDescription>
          </div>
          <Badge className="bg-primary text-white text-xs font-semibold">
            {locations.length} Sites Actifs
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {locations.map((loc) => {
          const isCurrent = loc.id === currentLocation.id
          const isWarehouse = loc.type === 'ENTREPOT'

          return (
            <div
              key={loc.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isCurrent
                  ? 'border-primary-light bg-primary-light/5 ring-1 ring-primary-light/30'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isWarehouse ? 'bg-primary text-white' : 'bg-primary-light/10 text-primary-light'
                  }`}
                >
                  {isWarehouse ? <Warehouse className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{loc.nom}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Sélectionné
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {loc.ville} • {loc.adresse || 'Centre Commercial'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-success">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connecté</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
