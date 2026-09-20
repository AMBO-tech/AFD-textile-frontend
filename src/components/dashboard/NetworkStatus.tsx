import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Warehouse, Wifi, CheckCircle2 } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'

export const NetworkStatus: React.FC = () => {
  const { locations, currentLocation } = useLocationStore()

  return (
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 font-inter space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-poppins text-lg font-bold text-[#0F3D5E] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F3D5E]" />
            État du Réseau AFD Textile
          </h3>
          <p className="font-inter text-xs text-gray-500 mt-0.5">
            Synchronisation instantanée des boutiques et de l'entrepôt
          </p>
        </div>
        <Badge className="bg-[#0F3D5E] text-white text-xs font-semibold rounded-full px-3 py-1">
          {locations.length} Sites Actifs
        </Badge>
      </div>

      <div className="space-y-3">
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
      </div>
    </Card>
  )
}
