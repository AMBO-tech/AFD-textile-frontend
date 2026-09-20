import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { StockLevel } from '@/types/api'

interface CriticalAlertsProps {
  alerts: StockLevel[]
  isLoading?: boolean
  onRequestReassort?: (item: StockLevel) => void
  onViewAll?: () => void
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = ({
  alerts,
  isLoading,
  onRequestReassort,
  onViewAll,
}) => {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 font-inter space-y-4">
      <div className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-poppins text-lg font-bold text-[#0F3D5E] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alertes de Réapprovisionnement Critique
          </h3>
          <p className="font-inter text-xs text-gray-500 mt-0.5">
            Articles dont le stock physique est au seuil d'alerte
          </p>
        </div>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs text-[#1E88E5] hover:text-[#0F3D5E] font-semibold gap-1.5 h-8 cursor-pointer rounded-xl"
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="text-xs text-center py-6 text-slate-400">Vérification des niveaux de stock...</div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="font-semibold text-slate-700">Aucun produit sous le seuil critique</p>
            <p className="text-slate-400 mt-0.5">Tous les rouleaux et métrages sont dans les normes requises.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.produitNom}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Réf: {item.produitReference} • Emplacement: {item.locationNom}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold border-amber-300 text-amber-800 bg-amber-100/60">
                    {item.quantite} {item.uniteStockage}
                  </Badge>
                  {onRequestReassort && (
                    <Button
                      size="sm"
                      onClick={() => onRequestReassort(item)}
                      className="h-8 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer"
                    >
                      Demander
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
