import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowDownUp } from 'lucide-react'
import type { StockLevel } from '@/types/api'

interface StockTableProps {
  items: StockLevel[]
  isLoading?: boolean
  onAdjust?: (item: StockLevel) => void
}

export const StockTable: React.FC<StockTableProps> = ({ items, isLoading, onAdjust }) => {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900">État Détaillé des Stocks</h3>
          <p className="text-xs text-slate-500">Métrages physiques, seuils de réapprovisionnement et alertes</p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold text-slate-700 border-slate-200">
          {items.length} référence{items.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium">
            <tr>
              <th className="p-3.5">Référence</th>
              <th className="p-3.5">Nom du Tissu</th>
              <th className="p-3.5">Emplacement</th>
              <th className="p-3.5">Quantité Réelle</th>
              <th className="p-3.5">Unité</th>
              <th className="p-3.5">Statut</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Chargement de l'inventaire en cours...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Aucun stock répertorié pour ce filtre.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-semibold text-slate-900">{item.produitReference}</td>
                  <td className="p-3.5 font-medium text-slate-900">{item.produitNom}</td>
                  <td className="p-3.5 text-slate-500">{item.locationNom}</td>
                  <td className="p-3.5 font-display font-bold text-slate-900 text-sm">{item.quantite}</td>
                  <td className="p-3.5 text-slate-600">{item.uniteStockage}</td>
                  <td className="p-3.5">
                    {item.estEnAlerte ? (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-800 bg-amber-50 gap-1 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Stock Faible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 font-semibold">
                        Disponible
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    {onAdjust && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjust(item)}
                        className="h-8 text-xs text-primary-light hover:bg-primary-light/10 font-semibold rounded-lg gap-1 cursor-pointer"
                      >
                        <ArrowDownUp className="w-3.5 h-3.5" />
                        Ajuster
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
