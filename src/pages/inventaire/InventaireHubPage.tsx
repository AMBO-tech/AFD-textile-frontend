import React, { useState } from 'react'
import {
  Package,
  Warehouse,
  Boxes,
  Plus,
  ArrowDownUp,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Layers,
} from 'lucide-react'
import {
  BoutiqueHeaderSync,
  MultiLocationStockFinder,
} from '@/components/reorganized'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStocks, useAdjustStock } from '@/hooks/useStocks'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useLocations } from '@/hooks/useLocations'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

export const InventaireHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stock_boutique' | 'entrepot' | 'catalogue'>('stock_boutique')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedStockId, setSelectedStockId] = useState<string>('')
  const [adjustQuantite, setAdjustQuantite] = useState<number>(0)
  const [adjustMotif, setAdjustMotif] = useState<string>('')

  const { currentLocation } = useAppStore()
  const { user } = useAuthStore()

  const { data: stocksData, isLoading: isLoadingStocks } = useStocks({
    locationId: activeTab === 'stock_boutique' ? currentLocation?.id : undefined,
    search: searchQuery,
  })

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    search: searchQuery,
  })

  const { data: locations } = useLocations()
  const adjustStockMutation = useAdjustStock()

  const stockItems = stocksData?.items || []
  const productItems = productsData?.items || []

  const isManager = user?.role === 'ADMIN' || user?.role === 'gerant'

  const handleConfirmAdjust = async () => {
    if (!selectedStockId || adjustQuantite === 0) {
      toast.error('Veuillez renseigner une quantité valide')
      return
    }

    const item = stockItems.find((s) => s.id === selectedStockId)
    if (!item) return

    try {
      await adjustStockMutation.mutateAsync({
        produitId: item.produitId,
        locationId: item.locationId,
        quantiteAjustement: Math.abs(adjustQuantite),
        sens: adjustQuantite > 0 ? 'ENTREE' : 'SORTIE',
        justification: adjustMotif || 'Ajustement d’inventaire régulier',
      })
      setShowAdjustModal(false)
      setAdjustQuantite(0)
      setAdjustMotif('')
    } catch {
      // Error handled in hook
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sync Header */}
      <BoutiqueHeaderSync />

      {/* 2. Top Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
              Hub d'Inventaire & Chaîne Logistique
            </h1>
            <Badge className="bg-[#0F3D5E] text-white hover:bg-[#0F3D5E] text-xs font-semibold">
              Unifié
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervision centralisée des stocks boutiques, de l'entrepôt central et des catalogues
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('stock_boutique')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'stock_boutique'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-[#1E88E5]" />
            <span>Stock Boutique</span>
          </button>

          {isManager && (
            <button
              onClick={() => setActiveTab('entrepot')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'entrepot'
                  ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Warehouse className="w-4 h-4 text-[#0F3D5E]" />
              <span>Entrepôt Central</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'catalogue'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-[#22C55E]" />
            <span>Catalogue Tissus ({productItems.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Intelligent Stock Finder & Request Generator */}
      <MultiLocationStockFinder />

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, tissu ou catégorie..."
            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={() => setShowAdjustModal(true)}
            className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-10 text-xs font-semibold gap-1.5"
          >
            <ArrowDownUp className="w-4 h-4 text-[#1E88E5]" />
            Ajuster le Stock
          </Button>
        </div>
      </div>

      {/* 5. Tab Views */}
      {activeTab === 'stock_boutique' && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Inventaire Physique : {currentLocation?.nom || 'Ma Boutique'}
              </h3>
              <p className="text-xs text-slate-500">Mètres linéaires et rouleaux disponibles en rayon</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold border-slate-200 text-slate-700">
              {stockItems.length} article{stockItems.length > 1 ? 's' : ''}
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
                  <th className="p-3.5">État du Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingStocks ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Chargement des niveaux de stock...
                    </td>
                  </tr>
                ) : stockItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Aucun tissu en stock pour cet emplacement.
                    </td>
                  </tr>
                ) : (
                  stockItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-slate-900">{item.produitReference}</td>
                      <td className="p-3.5 font-medium text-slate-900">{item.produitNom}</td>
                      <td className="p-3.5 text-slate-500">{item.locationNom}</td>
                      <td className="p-3.5 font-display font-bold text-slate-900 text-sm">{item.quantite}</td>
                      <td className="p-3.5 text-slate-600">{item.uniteStockage || 'Mètre'}</td>
                      <td className="p-3.5">
                        {item.estEnAlerte ? (
                          <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            Seuil Faible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50 font-semibold">
                            Normal
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStockId(item.id)
                            setShowAdjustModal(true)
                          }}
                          className="h-8 text-xs text-[#1E88E5] hover:bg-[#1E88E5]/10 font-semibold rounded-lg"
                        >
                          Ajuster
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'entrepot' && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Stocks Consolidation : Entrepôt Central
              </h3>
              <p className="text-xs text-slate-500">Réserves en tonnes, pièces et rouleaux pour réassort réseau</p>
            </div>
            <Badge className="bg-[#0F3D5E] text-white text-xs font-semibold">Accès Gérant</Badge>
          </div>

          <div className="p-6 text-center text-xs text-slate-500">
            {stockItems.filter((s) => s.locationType === 'ENTREPOT').length === 0 ? (
              <div className="py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Warehouse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Entrepôt Central prêt pour réceptions</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Enregistrez les arrivages de conteneurs, tonnes de tissus et rouleaux destinés à l'approvisionnement des boutiques.
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-left">
                {stockItems
                  .filter((s) => s.locationType === 'ENTREPOT')
                  .map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-900">{item.produitNom}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.produitReference}</div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {item.quantite} {item.uniteStockage}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'catalogue' && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Catalogue Général des Produits</h3>
              <p className="text-xs text-slate-500">Fiches techniques, prix de vente indicatifs et unités</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-slate-600">
              {productItems.length} référence{productItems.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {isLoadingProducts ? (
              [1, 2, 3].map((n) => (
                <Card key={n} className="p-4 border border-slate-100">
                  <Skeleton className="h-20 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))
            ) : productItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                Aucun produit enregistré pour le moment.
              </div>
            ) : (
              productItems.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#1E88E5] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-semibold text-slate-500">{prod.reference}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold text-[#1E88E5] bg-[#1E88E5]/10">
                        {prod.categorie?.nom || 'Textile'}
                      </Badge>
                    </div>
                    <h4 className="font-display font-semibold text-sm text-slate-900">{prod.nom}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Unité : {prod.unitePrincipale?.nom || 'Mètre'} • Couleur : {prod.couleur || 'Standard'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {prod.prixIndicatif?.toLocaleString('fr-FR')} FCFA
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      Actif
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Modal Ajustement de stock */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Ajustement Manuel de Stock</h3>
            <p className="text-xs text-slate-500">
              Saisissez la variation (+ pour entrée / - pour sortie ou perte) et la justification.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Article sélectionné :</label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Choisir un tissu...</option>
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.produitNom} ({s.produitReference}) — Dispo: {s.quantite}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Quantité de correction (+ ou -) :
                </label>
                <Input
                  type="number"
                  value={adjustQuantite}
                  onChange={(e) => setAdjustQuantite(Number(e.target.value))}
                  placeholder="Ex: -5 ou +10"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Motif obligatoire :</label>
                <Input
                  value={adjustMotif}
                  onChange={(e) => setAdjustMotif(e.target.value)}
                  placeholder="Ex: Découpe coupon, avarie, inventaire physique..."
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAdjustModal(false)}
                className="rounded-xl h-10 text-xs font-semibold border-slate-200"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmAdjust}
                disabled={adjustStockMutation.isPending}
                className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-xl h-10 text-xs font-semibold shadow-sm"
              >
                {adjustStockMutation.isPending ? 'Enregistrement...' : 'Valider l’ajustement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventaireHubPage
