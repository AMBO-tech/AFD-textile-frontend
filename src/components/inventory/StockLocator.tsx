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
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-light" />
              Localisateur Multi-Boutiques & Entrepôt
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Vérifiez la disponibilité d'un tissu sur tout le réseau et initiez un transfert
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-primary-light border-primary-light/30 bg-primary-light/5 self-start sm:self-auto">
            Point actuel : {currentLocation.nom}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par tissu ou référence (ex: Bazin Riche, Soie, REF-102)..."
            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs focus:bg-white"
          />
        </div>

        {isLoading ? (
          <div className="text-xs text-center py-6 text-slate-400">Recherche de disponibilité sur le réseau...</div>
        ) : filtered.length === 0 && searchTerm.trim() ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Aucun tissu correspondant à « {searchTerm} »</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Vérifiez la référence ou le nom saisi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.slice(0, 6).map((item) => {
              const isLocal = item.locationId === currentLocation.id
              const isWarehouse = item.locationType === 'ENTREPOT'

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-primary-light transition-all bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-snug">{item.produitNom}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold ${
                          isLocal
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isWarehouse
                            ? 'bg-primary/10 text-primary'
                            : 'bg-primary-light/10 text-primary-light'
                        }`}
                      >
                        {isLocal ? 'Ici (Boutique)' : isWarehouse ? 'Entrepôt' : 'Autre Magasin'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.produitReference}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-slate-500 truncate max-w-[140px]">
                      {isWarehouse ? <Warehouse className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span className="truncate">{item.locationNom}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {item.quantite} {item.uniteStockage}
                      </span>
                      {!isLocal && onSelectForTransfer && (
                        <Button
                          size="sm"
                          onClick={() => onSelectForTransfer(item)}
                          className="h-7 px-2.5 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-lg gap-1 cursor-pointer"
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
      </CardContent>
    </Card>
  )
}
