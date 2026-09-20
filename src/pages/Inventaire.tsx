import React, { useState } from 'react'
import {
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Warehouse,
  Search,
  ArrowDown,
  Boxes,
} from 'lucide-react'
import { useStocks, useAdjustStock } from '@/hooks/useStocks'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import { StockLocator } from '@/components/inventory/StockLocator'
import { TransferRequestModal } from '@/components/inventory/TransferRequestModal'
import type { Product, StockLevel } from '@/types/api'
import { toast } from 'sonner'

export const Inventaire: React.FC = () => {
  const [tab, setTab] = useState<'stock' | 'catalogue' | 'locator'>('stock')
  const [catChoisie, setCatChoisie] = useState<string | null>(null)
  const [searchProd, setSearchProd] = useState('')
  const [ouvertes, setOuvertes] = useState<Set<string>>(new Set(['Bazin', 'Soie', 'Dentelle', 'Wax', 'Coton']))

  // Modal Ajustement/Mouvement
  const [modalAjustement, setModalAjustement] = useState<StockLevel | null>(null)
  const [ajustQte, setAjustQte] = useState('')
  const [ajustMotif, setAjustMotif] = useState('Inventaire périodique')

  // Modal Nouveau Produit
  const [showAddProd, setShowAddProd] = useState(false)
  const [prodForm, setProdForm] = useState({
    nom: '',
    reference: '',
    categorie: 'Bazin',
    prixVente: '',
    unite: 'mètre',
    seuilAlerte: '10',
  })

  // Modal Transfert
  const [selectedForTransfer, setSelectedForTransfer] = useState<StockLevel | null>(null)

  const { currentLocation } = useLocationStore()
  const { user } = useAuthStore()
  const isGerant = user?.role === 'gerant' || user?.role === 'ADMIN'

  const { data: stocksData, isLoading: loadingStocks } = useStocks({
    locationId: currentLocation.id,
  })
  const { data: productsData, isLoading: loadingProducts } = useProducts()
  const adjustMutation = useAdjustStock()
  const createProductMutation = useCreateProduct()

  const stocks = stocksData?.items || []
  const products = productsData?.items || []

  const alertes = stocks.filter((s) => s.estEnAlerte || s.quantite <= s.seuilAlerte)
  const categoriesList = Array.from(
    new Set(
      stocks.map((s) => {
        const p = products.find((pr) => pr.id === s.produitId)
        return p?.categorie || 'Général'
      })
    )
  )

  const toggleCat = (cat: string) => {
    setOuvertes((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleConfirmAdjust = async () => {
    if (!modalAjustement || !ajustQte) return
    const qteNum = Number(ajustQte)
    if (isNaN(qteNum) || qteNum === 0) {
      toast.error('Quantité invalide')
      return
    }

    try {
      await adjustMutation.mutateAsync({
        produitId: modalAjustement.produitId,
        locationId: modalAjustement.locationId,
        quantite: qteNum,
        motif: ajustMotif,
      })
      toast.success('Stock ajusté avec succès')
      setModalAjustement(null)
      setAjustQte('')
    } catch {
      toast.error("Erreur lors de l'ajustement")
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodForm.nom || !prodForm.prixVente) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }

    try {
      await createProductMutation.mutateAsync({
        nom: prodForm.nom,
        reference: prodForm.reference || `REF-${Date.now().toString().slice(-4)}`,
        categorie: prodForm.categorie,
        prixVente: Number(prodForm.prixVente),
        unite: prodForm.unite,
        seuilAlerte: Number(prodForm.seuilAlerte) || 10,
      })
      toast.success('Référence tissu ajoutée au catalogue')
      setShowAddProd(false)
      setProdForm({
        nom: '',
        reference: '',
        categorie: 'Bazin',
        prixVente: '',
        unite: 'mètre',
        seuilAlerte: '10',
      })
    } catch {
      toast.error('Erreur lors de la création du produit')
    }
  }

  return (
    <div className="space-y-5 font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Gestion du Stock & Inventaire
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {stocks.length} références physiques • {alertes.length} alerte{alertes.length > 1 ? 's' : ''} en boutique
          </p>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-gray-200 shadow-xs">
            <button
              type="button"
              onClick={() => setTab('stock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'stock'
                  ? 'bg-[#0F3D5E] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Stock Rayon
            </button>
            <button
              type="button"
              onClick={() => setTab('catalogue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'catalogue'
                  ? 'bg-[#0F3D5E] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Catalogue ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('locator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'locator'
                  ? 'bg-[#0F3D5E] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Localisateur Réseau
            </button>
          </div>

          {isGerant && (
            <button
              type="button"
              onClick={() => setShowAddProd(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              <Plus size={14} />
              <span>Nouveau Tissu</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-gray-900">
            {stocks.reduce((sum, s) => sum + s.quantite, 0).toLocaleString('fr-FR')}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Métrage total en rayon</div>
          <div className="h-1 rounded-full mt-2 bg-blue-50">
            <div className="h-full rounded-full w-4/5 bg-[#1E88E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-red-600">
            {alertes.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Alertes stock critique</div>
          <div className="h-1 rounded-full mt-2 bg-red-50">
            <div className="h-full rounded-full w-2/3 bg-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-gray-900">
            {categoriesList.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Catégories de tissus</div>
          <div className="h-1 rounded-full mt-2 bg-slate-50">
            <div className="h-full rounded-full w-3/4 bg-[#0F3D5E]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-emerald-600">
            {products.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Articles au catalogue</div>
          <div className="h-1 rounded-full mt-2 bg-emerald-50">
            <div className="h-full rounded-full w-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      {/* Critical stock alert banner */}
      {alertes.length > 0 && (
        <div
          onClick={() => {
            if (alertes[0]) setSelectedForTransfer(alertes[0])
          }}
          className="bg-red-50 border border-red-100 rounded-2xl p-4 cursor-pointer hover:bg-red-100/80 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100 text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="font-['Poppins',sans-serif] font-bold text-red-700 text-sm">
                  {alertes.length} produit{alertes.length > 1 ? 's' : ''} en rupture imminente
                </div>
                <div className="text-xs text-red-500 mt-0.5">
                  Cliquez pour demander un réapprovisionnement depuis l'entrepôt
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-500" />
          </div>
        </div>
      )}

      {/* Main Content according to active tab */}
      {tab === 'stock' && (
        <div className="space-y-3">
          {loadingStocks ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Chargement des stocks physiques en boutique...
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Aucun stock répertorié. Ajoutez des arrivages ou produits.
            </div>
          ) : (
            categoriesList.map((cat) => {
              const items = stocks.filter((s) => {
                const p = products.find((pr) => pr.id === s.produitId)
                return (p?.categorie || 'Général') === cat
              })
              const stockCat = items.reduce((sum, item) => sum + item.quantite, 0)
              const alertesCat = items.filter((item) => item.estEnAlerte || item.quantite <= item.seuilAlerte).length
              const ouverte = ouvertes.has(cat)

              return (
                <div key={cat} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-gray-50/70 cursor-pointer"
                    style={{ background: ouverte ? '#F0F6FF' : '#F8FAFC' }}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        size={15}
                        className="text-[#1E88E5] transition-transform duration-200"
                        style={{ transform: ouverte ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                      <span className="font-['Poppins',sans-serif] font-bold text-gray-800 text-sm">
                        {cat}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({items.length} référence{items.length > 1 ? 's' : ''})
                      </span>
                      {alertesCat > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} /> {alertesCat}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#0F3D5E]">
                      {stockCat} en stock
                    </span>
                  </button>

                  {/* Items list */}
                  {ouverte && (
                    <div className="divide-y divide-gray-50 border-t border-gray-100">
                      {items.map((p) => {
                        const critique = p.estEnAlerte || p.quantite <= p.seuilAlerte
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                              critique ? 'bg-red-50/40' : 'hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-800 text-sm">
                                  {p.produitNom}
                                </span>
                                <span className="text-xs font-mono text-gray-400">
                                  {p.produitReference}
                                </span>
                                {critique && (
                                  <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    Stock faible
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                Emplacement : {p.locationNom} • Seuil alerte : {p.seuilAlerte} {p.uniteStockage}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`font-['Poppins',sans-serif] font-bold text-base ${
                                  critique ? 'text-red-600' : 'text-gray-900'
                                }`}
                              >
                                {p.quantite}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">{p.uniteStockage}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              <button
                                type="button"
                                onClick={() => setModalAjustement(p)}
                                title="Ajuster le stock"
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-[#1E88E5] transition-colors cursor-pointer"
                              >
                                Ajuster
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedForTransfer(p)}
                                title="Demander un transfert"
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer"
                                style={{ background: '#0F3D5E' }}
                              >
                                Réappro
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Catalogue tab */}
      {tab === 'catalogue' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchProd}
              onChange={(e) => setSearchProd(e.target.value)}
              placeholder="Rechercher par référence, nom ou catégorie..."
              className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products
              .filter(
                (p) =>
                  p.nom.toLowerCase().includes(searchProd.toLowerCase()) ||
                  p.reference.toLowerCase().includes(searchProd.toLowerCase()) ||
                  p.categorie.toLowerCase().includes(searchProd.toLowerCase())
              )
              .map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-3.5 flex flex-col justify-between hover:border-[#1E88E5] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] text-gray-400 font-semibold">{p.reference}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E88E5]">
                        {p.categorie}
                      </span>
                    </div>
                    <h4 className="font-['Poppins',sans-serif] font-bold text-sm text-gray-900 leading-snug line-clamp-2">
                      {p.nom}
                    </h4>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F3D5E] text-sm">
                      {p.prixVente.toLocaleString('fr-FR')} F
                    </span>
                    <span className="text-gray-400">/{p.unite}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Locator Tab */}
      {tab === 'locator' && (
        <StockLocator onSelectForTransfer={(item) => setSelectedForTransfer(item)} />
      )}

      {/* Modal Ajustement */}
      {modalAjustement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                Ajuster le stock
              </h3>
              <button
                type="button"
                onClick={() => setModalAjustement(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">{modalAjustement.produitNom}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Actuel : {modalAjustement.quantite} {modalAjustement.uniteStockage}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Quantité (+ entrée, - sortie) :
                </label>
                <input
                  type="number"
                  value={ajustQte}
                  onChange={(e) => setAjustQte(e.target.value)}
                  placeholder="Ex: +10 ou -5"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Motif :</label>
                <input
                  type="text"
                  value={ajustMotif}
                  onChange={(e) => setAjustMotif(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAjustement(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                disabled={adjustMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                {adjustMutation.isPending ? 'Validation...' : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Tissu */}
      {showAddProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateProduct}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                Nouveau Tissu au Catalogue
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProd(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nom du tissu *</label>
                <input
                  required
                  type="text"
                  value={prodForm.nom}
                  onChange={(e) => setProdForm({ ...prodForm, nom: e.target.value })}
                  placeholder="Ex: Bazin Riche Getzner Imperial"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Catégorie</label>
                  <select
                    value={prodForm.categorie}
                    onChange={(e) => setProdForm({ ...prodForm, categorie: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  >
                    <option value="Bazin">Bazin</option>
                    <option value="Wax">Wax</option>
                    <option value="Soie & Satin">Soie & Satin</option>
                    <option value="Dentelle">Dentelle</option>
                    <option value="Coton Voile">Coton Voile</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Prix Vente (FCFA) *</label>
                  <input
                    required
                    type="number"
                    value={prodForm.prixVente}
                    onChange={(e) => setProdForm({ ...prodForm, prixVente: e.target.value })}
                    placeholder="7500"
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Unité</label>
                  <select
                    value={prodForm.unite}
                    onChange={(e) => setProdForm({ ...prodForm, unite: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  >
                    <option value="mètre">mètre</option>
                    <option value="yard">yard</option>
                    <option value="rouleau">rouleau</option>
                    <option value="pièce">pièce</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Seuil Alerte</label>
                  <input
                    type="number"
                    value={prodForm.seuilAlerte}
                    onChange={(e) => setProdForm({ ...prodForm, seuilAlerte: e.target.value })}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProd(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                {createProductMutation.isPending ? 'Création...' : 'Créer l’article'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Request Modal */}
      <TransferRequestModal
        item={selectedForTransfer}
        isOpen={Boolean(selectedForTransfer)}
        onClose={() => setSelectedForTransfer(null)}
      />
    </div>
  )
}

export default Inventaire
