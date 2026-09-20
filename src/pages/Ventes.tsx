import React, { useState } from 'react'
import { Plus, Search, Tag, History, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { POSTerminal } from '@/components/pos/POSTerminal'
import { useStocks } from '@/hooks/useStocks'
import { useSales, useCancelSale } from '@/hooks/useSales'
import { usePosStore } from '@/stores/posStore'
import { useLocationStore } from '@/stores/locationStore'
import type { StockLevel, Sale } from '@/types/api'

export const Ventes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pos' | 'historique'>('pos')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('TOUT')
  const [cancelingSale, setCancelingSale] = useState<Sale | null>(null)
  const [cancelMotif, setCancelMotif] = useState('Erreur de saisie')

  const { currentLocation } = useLocationStore()
  const { addToCart } = usePosStore()
  const { data: stocksData, isLoading: loadingStocks } = useStocks({
    locationId: currentLocation.id,
    search,
  })
  const { data: salesData, isLoading: loadingSales } = useSales({
    boutiqueId: currentLocation.id,
  })
  const cancelSaleMutation = useCancelSale()

  const stocks = stocksData?.items || []
  const sales = salesData?.items || []

  const handleAddProduct = (item: StockLevel) => {
    addToCart({
      produitId: item.produitId,
      produitNom: item.produitNom,
      produitReference: item.produitReference,
      quantite: 1,
      unite: item.uniteStockage,
      prixUnitaire: 7500, // prix indicatif
      remise: 0,
    })
  }

  const handleConfirmCancel = async () => {
    if (!cancelingSale) return
    await cancelSaleMutation.mutateAsync({
      id: cancelingSale.id,
      motif: cancelMotif,
    })
    setCancelingSale(null)
  }

  return (
    <div className="space-y-6 pb-8 font-inter">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <h1 className="font-poppins font-bold text-[24px] text-[#0F3D5E] leading-tight">
            Point de Vente & Caisse Enregistreuse
          </h1>
          <p className="font-inter text-[14px] text-gray-500 mt-1">
            Encaissement immédiat (Wave, Orange Money, Espèces, Virement) et suivi des tickets
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-full border border-gray-200 shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-[#0F3D5E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Encaissement Caisse
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
              activeTab === 'historique'
                ? 'bg-[#0F3D5E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique ({sales.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Fabric Catalog */}
          <div className="lg:col-span-7 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Recherche rapide de tissu, réf (Bazin, Soie, Coton)..."
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 pl-11 pr-4 font-inter text-sm text-slate-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['TOUT', 'Bazin Riche', 'Soie & Satin', 'Coton Voile', 'Dentelle Guipure', 'Wax Hollandais'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-[#0F3D5E] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Catalog Grid */}
            {loadingStocks ? (
              <div className="text-center py-12 text-xs text-gray-400">Chargement des rouleaux en boutique...</div>
            ) : stocks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 font-inter">Aucun tissu en stock sur ce filtre</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stocks.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddProduct(item)}
                    className="group bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-primary-light hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-700 font-mono">
                          {item.produitReference}
                        </Badge>
                        <span className="text-[11px] font-bold text-success">
                          {item.quantite} {item.uniteStockage}
                        </span>
                      </div>
                      <h4 className="font-display font-medium text-xs sm:text-sm text-slate-900 group-hover:text-primary-light transition-colors line-clamp-2">
                        {item.produitNom}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">7 500 F</span>
                      <div className="w-7 h-7 rounded-lg bg-primary-light/10 text-primary-light group-hover:bg-primary-light group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: POS Terminal */}
          <div className="lg:col-span-5">
            <POSTerminal />
          </div>
        </div>
      ) : (
        /* History View */
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden font-inter">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-poppins font-bold text-lg text-[#0F3D5E]">Journal des Ventes Enregistrées</h3>
            <p className="font-inter text-xs text-gray-500 mt-0.5">Traçabilité des factures et annulations sécurisées</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-[12px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Référence Facture</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Montant Net</th>
                  <th className="px-6 py-4">Règlement</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingSales ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Chargement de l'historique...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Aucune vente enregistrée sur cette caisse.
                    </td>
                  </tr>
                ) : (
                  sales.map((vente) => (
                    <tr key={vente.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{vente.referenceFacture}</td>
                      <td className="p-3.5 text-slate-500">{new Date(vente.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-3.5 font-medium text-slate-800">{vente.clientNom || 'Client Comptant'}</td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {vente.montantTotal.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                          {vente.moyenPaiement}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        {vente.statut === 'CONFIRMEE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelingSale(vente)}
                            className="h-8 px-2.5 text-xs text-danger hover:bg-danger/10 font-semibold gap-1 rounded-lg cursor-pointer"
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

      {/* Sale Cancel Modal */}
      {cancelingSale && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Annulation de la Vente #{cancelingSale.referenceFacture}</h3>
            <p className="text-xs text-slate-500">
              Cette action réintégrera automatiquement les articles en stock et inscrira une ligne d'audit.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Motif obligatoire :</label>
              <select
                value={cancelMotif}
                onChange={(e) => setCancelMotif(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Erreur de saisie">Erreur de saisie</option>
                <option value="Retour client">Retour client</option>
                <option value="Produit défectueux">Produit défectueux</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCancelingSale(null)}
                className="rounded-xl h-10 text-xs font-semibold border-slate-200 cursor-pointer"
              >
                Fermer
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={cancelSaleMutation.isPending}
                className="bg-danger hover:bg-danger/90 text-white rounded-xl h-10 text-xs font-semibold cursor-pointer"
              >
                {cancelSaleMutation.isPending ? 'Annulation...' : 'Confirmer l’annulation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ventes
