import React, { useState } from 'react'
import {
  Search,
  ShoppingCart,
  CheckCircle,
  X,
  RotateCcw,
  Package,
  ChevronLeft,
  Minus,
  Plus,
  Tag,
  CreditCard,
  User,
} from 'lucide-react'
import { useStocks } from '@/hooks/useStocks'
import { useSales, useCancelSale, useCreateSale } from '@/hooks/useSales'
import { useClients } from '@/hooks/useClients'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import type { StockLevel, Sale } from '@/types/api'
import { toast } from 'sonner'

const MODES_PAIEMENT = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Carte bancaire']

export const Ventes: React.FC = () => {
  const [tab, setTab] = useState<'vente' | 'historique'>('vente')
  const [searchProd, setSearchProd] = useState('')
  const [categorieChoisie, setCategorieChoisie] = useState<string | null>(null)
  const [produitSelectionne, setProduitSelectionne] = useState<StockLevel | null>(null)

  // Formulaire configuration article
  const [qte, setQte] = useState(1)
  const [unite, setUnite] = useState('mètre')
  const [remiseMontant, setRemiseMontant] = useState(0)

  // Panier
  type LignePanier = {
    produitId: string
    produitNom: string
    produitReference: string
    qte: number
    unite: string
    prixUnitaire: number
    remise: number
  }
  const [panier, setPanier] = useState<LignePanier[]>([])
  const [vuePanier, setVuePanier] = useState(false)
  const [paiementGlobal, setPaiementGlobal] = useState('Espèces')
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  // Annulation
  const [showCancel, setShowCancel] = useState<Sale | null>(null)
  const [motifAnnulation, setMotifAnnulation] = useState('Erreur de saisie')

  const { currentLocation, isOnline } = useLocationStore()
  const { user } = useAuthStore()

  const { data: stocksData, isLoading: loadingStocks } = useStocks({
    locationId: currentLocation.id,
    search: searchProd,
  })
  const { data: salesData, isLoading: loadingSales } = useSales({
    boutiqueId: currentLocation.id,
  })
  const { data: clientsData } = useClients()
  const createSaleMutation = useCreateSale()
  const cancelSaleMutation = useCancelSale()

  const stocks = stocksData?.items || []
  const sales = salesData?.items || []
  const clients = clientsData?.items || []

  const categories = Array.from(new Set(stocks.map((s) => s.produitNom.split(' ')[0] || 'Tissu')))

  const selectProduit = (p: StockLevel) => {
    setProduitSelectionne(p)
    setQte(1)
    setUnite(p.uniteStockage)
    setRemiseMontant(0)
  }

  const handleAjouterAuPanier = () => {
    if (!produitSelectionne) return
    const prix = 7500 // prix indicatif
    setPanier((prev) => [
      ...prev.filter((l) => l.produitId !== produitSelectionne.produitId),
      {
        produitId: produitSelectionne.produitId,
        produitNom: produitSelectionne.produitNom,
        produitReference: produitSelectionne.produitReference,
        qte,
        unite,
        prixUnitaire: prix,
        remise: remiseMontant,
      },
    ])
    setProduitSelectionne(null)
    toast.success(`${produitSelectionne.produitNom} ajouté au panier`)
  }

  const totalPanier = panier.reduce(
    (sum, l) => sum + l.prixUnitaire * l.qte - Math.min(l.remise, l.prixUnitaire * l.qte),
    0
  )

  const handleValiderVente = async () => {
    if (panier.length === 0) return

    const clientObj = clients.find((c) => c.id === selectedClientId)
    const payload = {
      referenceFacture: `FAC-${Date.now().toString().slice(-6)}`,
      boutiqueId: currentLocation.id,
      boutiqueNom: currentLocation.nom,
      vendeurNom: user?.name || 'Boutiquier',
      clientId: selectedClientId || undefined,
      clientNom: clientObj ? clientObj.nom : 'Client Comptant (Passage)',
      statut: 'CONFIRMEE' as const,
      statutPaiement: 'SOLDE' as const,
      montantTotal: totalPanier,
      montantPaye: totalPanier,
      soldeDu: 0,
      moyenPaiement: (paiementGlobal.toUpperCase() === 'ESPÈCES' ? 'ESPECES' : paiementGlobal.toUpperCase()) as any,
      lignes: panier.map((l) => ({
        produitId: l.produitId,
        produitNom: l.produitNom,
        produitReference: l.produitReference,
        quantite: l.qte,
        unite: l.unite,
        prixUnitaire: l.prixUnitaire,
        remise: l.remise,
        totalLigne: l.prixUnitaire * l.qte - l.remise,
      })),
    }

    try {
      await createSaleMutation.mutateAsync(payload)
      setPanier([])
      setVuePanier(false)
      toast.success(
        isOnline ? 'Vente enregistrée avec succès' : 'Vente enregistrée en mode hors ligne'
      )
    } catch {
      toast.error("Erreur lors de l'enregistrement de la vente")
    }
  }

  const handleConfirmCancel = async () => {
    if (!showCancel) return
    try {
      await cancelSaleMutation.mutateAsync({
        id: showCancel.id,
        motif: motifAnnulation,
      })
      toast.success('Vente annulée avec succès')
      setShowCancel(null)
    } catch {
      toast.error("Erreur lors de l'annulation")
    }
  }

  return (
    <div className="space-y-4 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Caisse & Point de Vente
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {currentLocation.nom} • {sales.length} ventes aujourd'hui
          </p>
        </div>

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={() => setVuePanier(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-sm relative"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <ShoppingCart size={16} />
          <span>Panier ({panier.length})</span>
          {panier.length > 0 && (
            <span className="bg-[#22C55E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {totalPanier.toLocaleString('fr-FR')} F
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-xs max-w-xs">
        <button
          type="button"
          onClick={() => setTab('vente')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === 'vente' ? 'bg-[#0F3D5E] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Nouvelle Vente
        </button>
        <button
          type="button"
          onClick={() => setTab('historique')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            tab === 'historique' ? 'bg-[#0F3D5E] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Historique ({sales.length})
        </button>
      </div>

      {tab === 'vente' ? (
        <div className="space-y-4">
          {/* Recherche & Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchProd}
                onChange={(e) => setSearchProd(e.target.value)}
                placeholder="Rechercher par tissu ou référence..."
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategorieChoisie(null)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  !categorieChoisie
                    ? 'bg-[#0F3D5E] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategorieChoisie(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    categorieChoisie === cat
                      ? 'bg-[#0F3D5E] text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grille des produits */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {loadingStocks ? (
              <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
                Chargement des tissus en boutique...
              </div>
            ) : stocks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
                Aucun tissu disponible.
              </div>
            ) : (
              stocks
                .filter((s) => !categorieChoisie || s.produitNom.startsWith(categorieChoisie))
                .map((p) => {
                  const critique = p.estEnAlerte || p.quantite <= p.seuilAlerte
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectProduit(p)}
                      className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-3.5 flex flex-col justify-between hover:border-[#1E88E5] hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-gray-400 font-semibold">
                            {p.produitReference}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              critique ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {p.quantite} {p.uniteStockage}
                          </span>
                        </div>
                        <h4 className="font-['Poppins',sans-serif] font-bold text-sm text-gray-900 leading-snug line-clamp-2">
                          {p.produitNom}
                        </h4>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-bold text-[#0F3D5E] text-sm">7 500 F</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E88E5] flex items-center justify-center">
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      ) : (
        /* Historique des ventes */
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
              Journal des Ventes
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Tickets enregistrés et traçabilité</p>
          </div>

          <div className="divide-y divide-gray-100">
            {loadingSales ? (
              <div className="p-8 text-center text-xs text-gray-400">Chargement de l'historique...</div>
            ) : sales.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">Aucune vente enregistrée.</div>
            ) : (
              sales.map((vente) => (
                <div key={vente.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">{vente.referenceFacture}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E88E5]">
                        {vente.moyenPaiement}
                      </span>
                      {vente.statut === 'ANNULEE' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                          Annulée
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vente.clientNom || 'Passage'} • {new Date(vente.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-['Poppins',sans-serif] font-bold text-sm text-gray-900">
                      {vente.montantTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                    {vente.statut === 'CONFIRMEE' && (
                      <button
                        type="button"
                        onClick={() => setShowCancel(vente)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Annuler le ticket"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Produit Choisi -> Quantité & Remise */}
      {produitSelectionne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                  {produitSelectionne.produitNom}
                </h3>
                <p className="text-xs text-gray-500">
                  Disponible : {produitSelectionne.quantite} {produitSelectionne.uniteStockage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProduitSelectionne(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quantité selector */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">Quantité vendue :</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQte((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={produitSelectionne.quantite}
                    value={qte}
                    onChange={(e) => setQte(Math.max(1, Number(e.target.value)))}
                    className="flex-1 h-10 text-center font-['Poppins',sans-serif] font-bold text-base border border-gray-200 rounded-xl bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setQte((q) => Math.min(produitSelectionne.quantite, q + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">Remise commerciale (FCFA) :</label>
                <input
                  type="number"
                  value={remiseMontant}
                  onChange={(e) => setRemiseMontant(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Prix estimé :</span>
                <span className="font-['Poppins',sans-serif] font-bold text-[#0F3D5E] text-base">
                  {Math.max(0, 7500 * qte - remiseMontant).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProduitSelectionne(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAjouterAuPanier}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer shadow-xs"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer / Modal Panier */}
      {vuePanier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-[#1E88E5]" />
                <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                  Panier Caisse ({panier.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVuePanier(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {panier.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">Le panier est vide</div>
              ) : (
                panier.map((ligne) => (
                  <div
                    key={ligne.produitId}
                    className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-800">{ligne.produitNom}</div>
                      <div className="text-gray-400">
                        {ligne.qte} {ligne.unite} × {ligne.prixUnitaire.toLocaleString()} F
                        {ligne.remise > 0 && ` (-${ligne.remise} F)`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {(ligne.prixUnitaire * ligne.qte - ligne.remise).toLocaleString()} F
                      </span>
                      <button
                        type="button"
                        onClick={() => setPanier((p) => p.filter((item) => item.produitId !== ligne.produitId))}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Client & Paiement */}
            {panier.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs shrink-0">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Client (Optionnel) :</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs"
                  >
                    <option value="">Client Comptant (Passage)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} {c.totalDu > 0 ? `(Dû: ${c.totalDu} F)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Moyen de paiement :</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MODES_PAIEMENT.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaiementGlobal(mode)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                          paiementGlobal === mode
                            ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-semibold">Total Net à Payer :</span>
                  <span className="font-['Poppins',sans-serif] font-bold text-lg text-[#0F3D5E]">
                    {totalPanier.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleValiderVente}
                  disabled={createSaleMutation.isPending}
                  className="w-full py-3.5 rounded-xl text-white font-['Poppins',sans-serif] font-bold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #16a34a, #22C55E)' }}
                >
                  <CheckCircle size={16} />
                  {createSaleMutation.isPending ? 'Validation...' : 'Encaisser la vente'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Annulation */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4">
            <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
              Annuler la vente #{showCancel.referenceFacture}
            </h3>
            <p className="text-xs text-gray-500">
              Le stock sera immédiatement réintégré et une écriture d'annulation sera horodatée.
            </p>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Motif :</label>
              <select
                value={motifAnnulation}
                onChange={(e) => setMotifAnnulation(e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs"
              >
                <option value="Erreur de saisie">Erreur de saisie</option>
                <option value="Retour client">Retour client</option>
                <option value="Produit défectueux">Produit défectueux</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancel(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelSaleMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                {cancelSaleMutation.isPending ? 'Annulation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ventes
