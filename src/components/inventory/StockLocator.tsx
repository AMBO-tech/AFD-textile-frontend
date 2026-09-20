import React, { useState } from 'react'
import { Search, Building2, Warehouse, AlertCircle, ArrowRight, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStocks } from '@/hooks/useStocks'
import { useLocationStore } from '@/stores/locationStore'
import type { StockLevel } from '@/types/api'

interface StockLocatorProps {
  onSelectForTransfer?: (item: StockLevel) => void
}

export const StockLocator: React.FC<StockLocatorProps> = ({ onSelectForTransfer }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const { currentLocation } = useLocationStore()
  const { data: stocksData, isLoading } = useStocks({ search: searchTerm })

  const items = stocksData?.items || []
  const filtered = searchTerm.trim()
    ? items.filter(
        (s) =>
          s.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.produitReference.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items

  return (
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header with blue icon in light blue background */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5] shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-lg text-[#0F3D5E]">
              Localisateur Multi-Boutiques & Entrepôt
            </h3>
            <p className="font-inter text-xs text-gray-500">
              Vérifiez la disponibilité d'un tissu sur tout le réseau et initiez un transfert immédiat
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs font-semibold text-[#1E88E5] border-[#1E88E5]/30 bg-[#1E88E5]/5 self-start sm:self-auto rounded-full px-3 py-1">
          Point actuel : {currentLocation.nom}
        </Badge>
      </div>

      {/* Input de recherche: h-12, rounded-xl, bg-gray-50, border-gray-200, placeholder Inter, icon Search left, focus:ring #1E88E5 */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par tissu ou référence (ex: Bazin Riche, Soie, REF-102)..."
          className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 font-inter text-sm text-slate-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] transition-all"
        />
      </div>

      {isLoading ? (
        <div className="text-xs font-inter text-center py-8 text-gray-400">Recherche de disponibilité sur le réseau...</div>
      ) : filtered.length === 0 && searchTerm.trim() ? (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700 font-inter">Aucun tissu correspondant à « {searchTerm} »</p>
          <p className="text-[11px] text-gray-400 mt-0.5 font-inter">Vérifiez la référence ou le nom saisi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 6).map((item) => {
            const isLocal = item.locationId === currentLocation.id
            const isWarehouse = item.locationType === 'ENTREPOT'

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-gray-100 hover:border-[#1E88E5] transition-all bg-white flex flex-col justify-between shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-poppins text-xs font-bold text-[#0F3D5E] leading-snug">{item.produitNom}</span>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-semibold rounded-full px-2.5 py-0.5 ${
                        isLocal
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isWarehouse
                          ? 'bg-[#0F3D5E]/10 text-[#0F3D5E]'
                          : 'bg-[#1E88E5]/10 text-[#1E88E5]'
                      }`}
                    >
                      {isLocal ? 'Ici (Boutique)' : isWarehouse ? 'Entrepôt' : 'Autre Magasin'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono font-semibold">{item.produitReference}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-inter">
                  <span className="flex items-center gap-1.5 text-gray-500 truncate max-w-[140px]">
                    {isWarehouse ? <Warehouse className="w-3.5 h-3.5 text-[#0F3D5E]" /> : <Building2 className="w-3.5 h-3.5 text-[#1E88E5]" />}
                    <span className="truncate">{item.locationNom}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-poppins font-bold text-slate-900 text-sm">
                      {item.quantite} {item.uniteStockage}
                    </span>
                    {!isLocal && onSelectForTransfer && (
                      <Button
                        size="sm"
                        onClick={() => onSelectForTransfer(item)}
                        className="h-8 px-3 text-xs font-semibold bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-xl gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3" />
                        Demander
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

