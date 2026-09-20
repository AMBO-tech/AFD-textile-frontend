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
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
            Hub d'Inventaire & Chaîne Logistique
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervision unifiée des stocks en rayon, des réserves de l'entrepôt et du catalogue
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('boutique')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              tab === 'boutique'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-primary-light" />
            <span>Stock Boutique</span>
          </button>

          {isManager && (
            <button
              type="button"
              onClick={() => setTab('entrepot')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                tab === 'entrepot'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Warehouse className="w-4 h-4 text-primary" />
              <span>Entrepôt Central</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setTab('catalogue')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              tab === 'catalogue'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-success" />
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
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-base text-slate-900">Catalogue Références Tissus</h3>
            <Badge variant="outline" className="text-xs font-semibold">
              {products.length} articles
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingProducts ? (
              <div className="col-span-full text-center py-10 text-xs text-slate-400">Chargement du catalogue...</div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-10 text-xs text-slate-400">Catalogue prêt.</div>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary-light transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs text-slate-400 font-semibold">{prod.reference}</span>
                    <Badge variant="secondary" className="text-[10px] bg-primary-light/10 text-primary-light font-bold">
                      {prod.categorie}
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900">{prod.nom}</h4>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{prod.prixVente.toLocaleString('fr-FR')} FCFA</span>
                    <span className="text-slate-500">{prod.unite}</span>
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
