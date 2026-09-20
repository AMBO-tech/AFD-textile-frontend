import React, { useState } from 'react'
import { Package, Warehouse, Boxes, ArrowDownUp, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StockLocator } from '@/components/inventory/StockLocator'
import { StockTable } from '@/components/inventory/StockTable'
import { TransferRequestModal } from '@/components/inventory/TransferRequestModal'
import { useStocks, useAdjustStock } from '@/hooks/useStocks'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import type { StockLevel } from '@/types/api'
import { toast } from 'sonner'

export const Inventaire: React.FC = () => {
  const [tab, setTab] = useState<'boutique' | 'entrepot' | 'catalogue'>('boutique')
  const [selectedForTransfer, setSelectedForTransfer] = useState<StockLevel | null>(null)
  const [adjustingItem, setAdjustingItem] = useState<StockLevel | null>(null)
  const [adjustQty, setAdjustQty] = useState<number>(0)
  const [adjustMotif, setAdjustMotif] = useState<string>('Inventaire périodique')

  const { currentLocation } = useLocationStore()
  const { user } = useAuthStore()

  const { data: stocksData, isLoading: loadingStocks } = useStocks({
    locationId: tab === 'boutique' ? currentLocation.id : undefined,
  })
  const { data: productsData, isLoading: loadingProducts } = useProducts()
  const adjustMutation = useAdjustStock()

  const stocks = stocksData?.items || []
  const products = productsData?.items || []

  const isManager = user?.role === 'gerant' || user?.role === 'ADMIN'

  const handleConfirmAdjust = async () => {
    if (!adjustingItem || adjustQty === 0) {
      toast.error('Quantité invalide')
      return
    }

    await adjustMutation.mutateAsync({
      produitId: adjustingItem.produitId,
      locationId: adjustingItem.locationId,
      quantite: adjustQty,
      motif: adjustMotif,
    })
    setAdjustingItem(null)
    setAdjustQty(0)
  }

  return (
    <div className="space-y-6 pb-8 font-inter">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="font-poppins font-bold text-[24px] text-[#0F3D5E] leading-tight">
            Hub d'Inventaire & Chaîne Logistique
          </h1>
          <p className="font-inter text-[14px] text-gray-500 mt-1">
            Supervision unifiée des stocks en rayon, des réserves de l'entrepôt et du catalogue
          </p>
        </div>

        {/* Tab Controls: pills avec bg white, border, active bg #0F3D5E text white, rounded-full */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-full border border-gray-200 shadow-xs self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('boutique')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              tab === 'boutique'
                ? 'bg-[#0F3D5E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className={`w-4 h-4 ${tab === 'boutique' ? 'text-white' : 'text-[#1E88E5]'}`} />
            <span>Stock Boutique</span>
          </button>

          {isManager && (
            <button
              type="button"
              onClick={() => setTab('entrepot')}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                tab === 'entrepot'
                  ? 'bg-[#0F3D5E] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Warehouse className={`w-4 h-4 ${tab === 'entrepot' ? 'text-white' : 'text-[#1E88E5]'}`} />
              <span>Entrepôt Central</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setTab('catalogue')}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              tab === 'catalogue'
                ? 'bg-[#0F3D5E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Boxes className={`w-4 h-4 ${tab === 'catalogue' ? 'text-white' : 'text-success'}`} />
            <span>Catalogue ({products.length})</span>
          </button>
        </div>
      </div>

      {/* Smart Stock Locator */}
      <StockLocator onSelectForTransfer={(item) => setSelectedForTransfer(item)} />

      {/* Tab View */}
      {tab === 'boutique' && (
        <StockTable
          items={stocks.filter((s) => s.locationType === 'BOUTIQUE')}
          isLoading={loadingStocks}
          onAdjust={(item) => setAdjustingItem(item)}
        />
      )}

      {tab === 'entrepot' && (
        <StockTable
          items={stocks.filter((s) => s.locationType === 'ENTREPOT')}
          isLoading={loadingStocks}
          onAdjust={(item) => setAdjustingItem(item)}
        />
      )}

      {tab === 'catalogue' && (
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-poppins font-bold text-lg text-[#0F3D5E]">Catalogue Références Tissus</h3>
              <p className="font-inter text-xs text-gray-500">Tarification officielle et unités de conditionnement</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold rounded-full border-gray-200 px-3 py-1 text-gray-700">
              {products.length} articles
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProducts ? (
              <div className="col-span-full text-center py-10 text-xs text-gray-400">Chargement du catalogue...</div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-10 text-xs text-gray-400">Catalogue prêt.</div>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#1E88E5] transition-all shadow-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-gray-400 font-semibold">{prod.reference}</span>
                    <Badge variant="secondary" className="text-[10px] bg-[#1E88E5]/10 text-[#1E88E5] font-bold rounded-full px-2.5">
                      {prod.categorie}
                    </Badge>
                  </div>
                  <h4 className="font-poppins font-bold text-sm text-[#0F3D5E]">{prod.nom}</h4>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-[#0F3D5E] text-sm">{prod.prixVente.toLocaleString('fr-FR')} FCFA</span>
                    <span className="text-gray-500 font-medium">{prod.unite}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Transfer Request Modal */}
      <TransferRequestModal
        item={selectedForTransfer}
        isOpen={Boolean(selectedForTransfer)}
        onClose={() => setSelectedForTransfer(null)}
      />

      {/* Stock Adjust Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Ajuster le Stock</h3>
            <p className="text-xs text-slate-500">
              {adjustingItem.produitNom} ({adjustingItem.produitReference}) • Actuel: {adjustingItem.quantite} {adjustingItem.uniteStockage}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Correction (+ ou -) :</label>
                <Input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="Ex: -5 ou +10"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Motif :</label>
                <Input
                  value={adjustMotif}
                  onChange={(e) => setAdjustMotif(e.target.value)}
                  placeholder="Ex: Découpe coupon, avarie..."
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setAdjustingItem(null)}
                className="rounded-xl h-10 text-xs font-semibold border-slate-200 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmAdjust}
                disabled={adjustMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-xs font-semibold cursor-pointer"
              >
                {adjustMutation.isPending ? 'Enregistrement...' : 'Valider'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventaire
