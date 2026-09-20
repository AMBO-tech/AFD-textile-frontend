import React, { useState } from 'react'
import {
  ShoppingBag,
  History,
  Search,
  Plus,
  RotateCcw,
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { BoutiqueHeaderSync, PosTerminalPanel, SaleCancellationModal } from '@/components/reorganized'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStocks } from '@/hooks/useStocks'
import { useSales } from '@/hooks/useSales'
import { useAppStore } from '@/stores/useAppStore'
import type { Vente } from '@/types/sales'
import type { StockLevel } from '@/types/stocks'

export const CaissePosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'historique'>('terminal')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUT')
  const [venteToCancel, setVenteToCancel] = useState<Vente | null>(null)

  const { currentLocation, addToCart } = useAppStore()

  const { data: stocksData, isLoading: isLoadingStocks } = useStocks({
    locationId: currentLocation?.id,
    search: searchQuery,
  })

  const { data: salesData, isLoading: isLoadingSales } = useSales({
    boutiqueId: currentLocation?.id,
  })

  const stockItems = stocksData?.items || []
  const salesHistory = salesData?.items || []

  const handleAddProductToCart = (item: StockLevel) => {
    addToCart({
      produitId: item.produitId,
      reference: item.produitReference,
      nom: item.produitNom,
      quantite: 1,
      unite: item.uniteStockage || 'Mètre',
      prixUnitaire: 8500, // Prix indicatif standard ou extrait
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Sync */}
      <BoutiqueHeaderSync />

      {/* 2. Top Bar with Tabs and Boutique Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
              Caisse & Point de Vente
            </h1>
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Terminal Ouvert
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Encaissement immédiat (Espèces, Wave, OM, CB) et enregistrement des ventes à terme
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'terminal'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#1E88E5]" />
            <span>Encaissement</span>
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'historique'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Historique ({salesHistory.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace */}
      {activeTab === 'terminal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Fabric Catalog */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Category Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Recherche rapide de tissu ou référence..."
                  className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['TOUT', 'Bazin', 'Soie & Satin', 'Coton & Voile', 'Dentelle', 'Wax'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#0F3D5E] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {isLoadingStocks ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Card key={n} className="p-4 rounded-xl border border-slate-100">
                    <Skeleton className="h-24 w-full rounded-lg mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </Card>
                ))}
              </div>
            ) : stockItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Aucun tissu dans cette sélection</p>
                <p className="text-xs text-slate-400 mt-1">
                  Tous les stocks de la boutique sont synchronisés en direct avec l'entrepôt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stockItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddProductToCart(item)}
                    className="group bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-[#1E88E5] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 font-mono">
                          {item.produitReference}
                        </Badge>
                        <span className="text-[11px] font-bold text-emerald-600">
                          {item.quantite} {item.uniteStockage?.toLowerCase() || 'm'}
                        </span>
                      </div>
                      <h4 className="font-display font-medium text-xs sm:text-sm text-slate-900 group-hover:text-[#1E88E5] transition-colors line-clamp-2">
                        {item.produitNom}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">8 500 F</span>
                      <div className="w-7 h-7 rounded-lg bg-[#1E88E5]/10 text-[#1E88E5] group-hover:bg-[#1E88E5] group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Reorganized Live POS Terminal Panel */}
          <div className="lg:col-span-5">
            <PosTerminalPanel />
          </div>
        </div>
      ) : (
        /* History & Cancellation Section */
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Journal des Ventes Récentes</h3>
              <p className="text-xs text-slate-500">Traçabilité des encaissements et annulations sécurisées</p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-slate-600">
              {salesHistory.length} transaction{salesHistory.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium">
                <tr>
                  <th className="p-3.5">Référence Facture</th>
                  <th className="p-3.5">Date & Heure</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Montant Net</th>
                  <th className="p-3.5">Statut Paiement</th>
                  <th className="p-3.5 text-right">Action Sécurisée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingSales ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Chargement des ventes...
                    </td>
                  </tr>
                ) : salesHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Aucune transaction récente enregistrée sur ce point de vente.
                    </td>
                  </tr>
                ) : (
                  salesHistory.map((vente) => (
                    <tr key={vente.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-slate-900">{vente.referenceFacture}</td>
                      <td className="p-3.5 text-slate-500">{new Date(vente.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3.5 text-slate-800">{vente.clientNom || 'Passage'}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {vente.montantTotal.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] uppercase font-bold ${
                            vente.statutPaiement === 'SOLDE'
                              ? 'bg-[#22C55E]/10 text-[#22C55E]'
                              : 'bg-[#EF4444]/10 text-[#EF4444]'
                          }`}
                        >
                          {vente.statutPaiement}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        {vente.statut === 'CONFIRMEE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVenteToCancel(vente)}
                            className="h-8 px-2 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 gap-1 rounded-lg"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Annuler
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
      )}

      {/* 4. Sale Cancellation Modal with mandatory reason and audit */}
      <SaleCancellationModal
        sale={venteToCancel}
        isOpen={Boolean(venteToCancel)}
        onClose={() => setVenteToCancel(null)}
      />
    </div>
  )
}

export default CaissePosPage
