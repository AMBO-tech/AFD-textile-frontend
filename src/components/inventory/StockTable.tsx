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
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden font-inter">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-poppins font-bold text-lg text-[#0F3D5E]">État Détaillé des Stocks</h3>
          <p className="font-inter text-xs text-gray-500 mt-0.5">Métrages physiques, seuils de réapprovisionnement et alertes</p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold text-gray-700 border-gray-200 rounded-full px-3 py-1">
          {items.length} référence{items.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-[12px] uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Référence</th>
              <th className="px-6 py-4">Nom du Tissu</th>
              <th className="px-6 py-4">Emplacement</th>
              <th className="px-6 py-4">Quantité Réelle</th>
              <th className="px-6 py-4">Unité</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  Chargement de l'inventaire en cours...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  Aucun stock répertorié pour ce filtre.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-slate-900">{item.produitReference}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.produitNom}</td>
                  <td className="px-6 py-4 text-gray-500">{item.locationNom}</td>
                  <td className="px-6 py-4 font-poppins font-bold text-slate-900 text-sm">{item.quantite}</td>
                  <td className="px-6 py-4 text-gray-600">{item.uniteStockage}</td>
                  <td className="px-6 py-4">
                    {item.estEnAlerte ? (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-800 bg-amber-50 gap-1 font-semibold rounded-full px-2.5 py-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        Stock Faible
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-700 bg-emerald-50 font-semibold rounded-full px-2.5 py-0.5">
                        Disponible
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onAdjust && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAdjust(item)}
                        className="h-8 text-xs text-[#1E88E5] hover:bg-[#1E88E5]/10 font-semibold rounded-xl gap-1.5 cursor-pointer"
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
