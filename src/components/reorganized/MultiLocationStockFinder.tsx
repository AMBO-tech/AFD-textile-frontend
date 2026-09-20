import React, { useState } from 'react'
import { Search, Building2, Warehouse, ArrowRight, CheckCircle2, AlertCircle, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStocks } from '@/hooks/useStocks'
import { useLocations } from '@/hooks/useLocations'
import { useCreateDemande } from '@/hooks/useDemandes'
import { useAppStore } from '@/stores/useAppStore'
import { toast } from 'sonner'

export const MultiLocationStockFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string
    nom: string
    reference: string
  } | null>(null)
  const [quantiteDemandee, setQuantiteDemandee] = useState<number>(10)
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')

  const { currentLocation } = useAppStore()
  const { data: stocksData, isLoading: isLoadingStocks } = useStocks({ search: searchTerm })
  const { data: locations } = useLocations()
  const createDemande = useCreateDemande()

  const allItems = stocksData?.items || []
  const filteredStocks = searchTerm.trim()
    ? allItems.filter(
        (s) =>
          s.produitNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.produitReference.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allItems

  const handleCreateTransferRequest = async () => {
    if (!selectedProduct) {
      toast.error('Veuillez sélectionner un tissu')
      return
    }
    if (!currentLocation?.id) {
      toast.error('Boutique destinataire introuvable')
      return
    }
    if (quantiteDemandee <= 0) {
      toast.error('La quantité demandée doit être supérieure à 0')
      return
    }

    try {
      await createDemande.mutateAsync({
        locationSourceId: selectedSourceId || undefined,
        locationDestinationId: currentLocation.id,
        lignes: [
          {
            produitId: selectedProduct.id,
            quantite: quantiteDemandee,
            unite: 'Mètre',
          },
        ],
      })
      setSelectedProduct(null)
      setSearchTerm('')
    } catch {
      // Handled in mutation hook
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
      <CardHeader className="bg-gradient-to-r from-[#0F3D5E]/5 via-[#1E88E5]/5 to-transparent border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-semibold text-[#0F3D5E] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#1E88E5]" />
              Localisateur Intelligent & Demande Inter-Boutiques
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              Vérifiez la disponibilité d'un tissu en direct : Boutique locale, Autres boutiques et Entrepôt Central
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs border-[#1E88E5]/40 text-[#1E88E5] bg-white">
            Destination : {currentLocation?.nom || 'Ma boutique'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom de tissu ou référence (ex: Bazin Riche, Soie, REF-102)..."
            className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white"
          />
        </div>

        {/* Results grid */}
        {isLoadingStocks && (
          <div className="text-center py-8 text-xs text-slate-500">
            Recherche de disponibilité sur l'ensemble du réseau en cours...
          </div>
        )}

        {!isLoadingStocks && searchTerm.trim() && filteredStocks.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Aucun tissu correspondant à « {searchTerm} »</p>
            <p className="text-xs text-slate-500 mt-1">Vérifiez l'orthographe ou la référence saisie.</p>
          </div>
        )}

        {filteredStocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStocks.slice(0, 6).map((item) => {
              const isLocal = item.locationId === currentLocation?.id
              const isWarehouse = item.locationType === 'ENTREPOT'

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedProduct({
                      id: item.produitId,
                      nom: item.produitNom,
                      reference: item.produitReference,
                    })
                    setSelectedSourceId(item.locationId)
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedProduct?.id === item.produitId && selectedSourceId === item.locationId
                      ? 'border-[#1E88E5] bg-[#1E88E5]/5 ring-2 ring-[#1E88E5]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-display font-medium text-sm text-slate-900 leading-snug">
                        {item.produitNom}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.produitReference}</div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase font-semibold ${
                        isLocal
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : isWarehouse
                          ? 'bg-[#0F3D5E]/10 text-[#0F3D5E]'
                          : 'bg-[#1E88E5]/10 text-[#1E88E5]'
                      }`}
                    >
                      {isLocal ? 'Ici (Local)' : isWarehouse ? 'Entrepôt' : 'Autre Boutique'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    <span className="flex items-center gap-1 text-slate-500">
                      {isWarehouse ? <Warehouse className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                      <span className="truncate max-w-[130px]">{item.locationNom}</span>
                    </span>
                    <span className={`font-semibold ${item.quantite > 0 ? 'text-slate-800' : 'text-[#EF4444]'}`}>
                      {item.quantite} {item.uniteStockage?.toLowerCase() || 'mètres'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Action Panel for Selected Product */}
        {selectedProduct && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1E88E5]/10 text-[#1E88E5] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Demande pour : {selectedProduct.nom} ({selectedProduct.reference})
                </div>
                <div className="text-xs text-slate-500">
                  Emplacement source :{' '}
                  <span className="font-medium text-slate-700">
                    {locations?.find((l) => l.id === selectedSourceId)?.nom || 'Entrepôt ou Boutique source'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Quantité :</span>
                <Input
                  type="number"
                  min={1}
                  value={quantiteDemandee}
                  onChange={(e) => setQuantiteDemandee(Number(e.target.value))}
                  className="w-20 h-9 bg-white text-center text-sm font-semibold"
                />
                <span className="text-xs text-slate-500">mètres</span>
              </div>

              <Button
                onClick={handleCreateTransferRequest}
                disabled={createDemande.isPending}
                className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-xl h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {createDemande.isPending ? 'Envoi...' : 'Transmettre la demande'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
