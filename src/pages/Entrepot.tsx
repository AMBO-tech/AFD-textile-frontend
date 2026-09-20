import React, { useState } from 'react'
import {
  Warehouse,
  Plus,
  ArrowDown,
  ArrowUp,
  X,
  Send,
  CheckSquare,
  Square,
  Package,
} from 'lucide-react'
import { useStocks, useAdjustStock } from '@/hooks/useStocks'
import { useLocationStore } from '@/stores/locationStore'
import { useTransferts, useCreateTransfert } from '@/hooks/useTransferts'
import type { StockLevel } from '@/types/api'
import { toast } from 'sonner'

export const Entrepot: React.FC = () => {
  const { locations } = useLocationStore()
  const boutiques = locations.filter((l) => l.type === 'BOUTIQUE')
  const entrepot = locations.find((l) => l.type === 'ENTREPOT')

  const { data: stocksData, isLoading } = useStocks({
    locationId: entrepot?.id,
  })
  const adjustStockMutation = useAdjustStock()
  const createTransfertMutation = useCreateTransfert()

  const items = stocksData?.items || []

  // Modal entrée/sortie
  const [opModal, setOpModal] = useState<{ type: 'entree' | 'sortie'; item: StockLevel } | null>(null)
  const [qteOp, setQteOp] = useState('')

  // Modal transfert multi-boutiques
  const [transferModal, setTransferModal] = useState<StockLevel | null>(null)
  const [transferBoutiques, setTransferBoutiques] = useState<string[]>([])
  const [transferQtes, setTransferQtes] = useState<Record<string, string>>({})

  const toggleBoutique = (id: string) => {
    setTransferBoutiques((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  const totalTransfere = transferBoutiques.reduce(
    (sum, id) => sum + (Number(transferQtes[id]) || 0),
    0
  )

  const handleConfirmOp = async () => {
    if (!opModal || !qteOp) return
    const q = Number(qteOp)
    if (isNaN(q) || q <= 0) {
      toast.error('Quantité invalide')
      return
    }

    try {
      await adjustStockMutation.mutateAsync({
        produitId: opModal.item.produitId,
        locationId: opModal.item.locationId,
        quantite: opModal.type === 'entree' ? q : -q,
        motif: opModal.type === 'entree' ? 'Réception entrepôt' : 'Sortie entrepôt',
      })
      toast.success(
        opModal.type === 'entree'
          ? `${q} unités ajoutées à l'entrepôt`
          : `${q} unités sorties de l'entrepôt`
      )
      setOpModal(null)
      setQteOp('')
    } catch {
      toast.error('Erreur lors du mouvement de stock')
    }
  }

  const handleConfirmTransfer = async () => {
    if (!transferModal || transferBoutiques.length === 0 || totalTransfere <= 0) {
      toast.error('Veuillez sélectionner au moins une boutique et une quantité valide')
      return
    }

    try {
      for (const boutiqueId of transferBoutiques) {
        const qte = Number(transferQtes[boutiqueId]) || 0
        if (qte > 0) {
          await createTransfertMutation.mutateAsync({
            sourceLocationId: transferModal.locationId,
            targetLocationId: boutiqueId,
            items: [
              {
                produitId: transferModal.produitId,
                quantite: qte,
              },
            ],
            notes: 'Transfert planifié depuis entrepôt central',
          })
        }
      }
      toast.success(`Transfert de ${totalTransfere} unités initié avec succès`)
      setTransferModal(null)
      setTransferBoutiques([])
      setTransferQtes({})
    } catch {
      toast.error("Erreur lors de l'initiation du transfert")
    }
  }

  return (
    <div className="space-y-5 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Entrepôt Central & Hub Logistique
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Gestion des arrivages massifs, stocks de sécurité et réapprovisionnement réseau
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1E88E5] border border-blue-100">
            {boutiques.length} Boutiques reliées
          </span>
        </div>
      </div>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-gray-900">
            {items.reduce((sum, i) => sum + i.quantite, 0).toLocaleString('fr-FR')} m
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Stock total en réserve</div>
          <div className="h-1 rounded-full mt-2 bg-blue-50">
            <div className="h-full rounded-full w-4/5 bg-[#1E88E5]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-gray-900">
            {items.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Références entreposées</div>
          <div className="h-1 rounded-full mt-2 bg-slate-50">
            <div className="h-full rounded-full w-2/3 bg-[#0F3D5E]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-emerald-600">
            {boutiques.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Points de distribution actifs</div>
          <div className="h-1 rounded-full mt-2 bg-emerald-50">
            <div className="h-full rounded-full w-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      {/* Liste des articles en entrepôt */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
            Stock de Réserve Entrepôt
          </h3>
          <span className="text-xs text-gray-400">{items.length} articles répertoriés</span>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Chargement des réserves...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Aucun article dans l'entrepôt central.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
                  >
                    <Warehouse size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 leading-snug">
                      {item.produitNom}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {item.produitReference} • Entrepôt Central
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <div className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                      {item.quantite.toLocaleString('fr-FR')} {item.uniteStockage}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setOpModal({ type: 'entree', item })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer transition-colors"
                      title="Entrée réception"
                    >
                      + Entrée
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpModal({ type: 'sortie', item })}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold cursor-pointer transition-colors"
                      title="Sortie réserve"
                    >
                      - Sortie
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTransferModal(item)
                        setTransferBoutiques([])
                        setTransferQtes({})
                      }}
                      className="px-3 py-1.5 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1"
                      style={{ background: '#0F3D5E' }}
                      title="Transférer vers les boutiques"
                    >
                      <Send size={12} />
                      <span>Transférer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Entrée / Sortie */}
      {opModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                {opModal.type === 'entree' ? 'Entrée Réception' : 'Sortie Réserve'}
              </h3>
              <button
                type="button"
                onClick={() => setOpModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">{opModal.item.produitNom}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Stock actuel : {opModal.item.quantite} {opModal.item.uniteStockage}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Quantité en {opModal.item.uniteStockage} :
              </label>
              <input
                type="number"
                min={1}
                value={qteOp}
                onChange={(e) => setQteOp(e.target.value)}
                placeholder="Ex: 50"
                className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOpModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmOp}
                disabled={adjustStockMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                {adjustStockMutation.isPending ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Transfert Multi-Boutiques */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                  Transfert vers les Boutiques
                </h3>
                <p className="text-xs text-gray-500">
                  {transferModal.produitNom} • Dispo : {transferModal.quantite} {transferModal.uniteStockage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTransferModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-700 block">
                Sélectionnez les boutiques destinataires :
              </label>

              {boutiques.map((b) => {
                const checked = transferBoutiques.includes(b.id)
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border transition-all ${
                      checked ? 'bg-blue-50/50 border-[#1E88E5]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div
                      onClick={() => toggleBoutique(b.id)}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      {checked ? (
                        <CheckSquare size={16} className="text-[#1E88E5]" />
                      ) : (
                        <Square size={16} className="text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-900">{b.nom}</div>
                        <div className="text-[11px] text-gray-500">{b.ville}</div>
                      </div>
                    </div>

                    {checked && (
                      <div className="mt-2 pt-2 border-t border-blue-100 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-600">Quantité ({transferModal.uniteStockage}) :</span>
                        <input
                          type="number"
                          min={1}
                          max={transferModal.quantite}
                          value={transferQtes[b.id] || ''}
                          onChange={(e) =>
                            setTransferQtes({
                              ...transferQtes,
                              [b.id]: e.target.value,
                            })
                          }
                          placeholder="Ex: 20"
                          className="w-24 h-8 px-2 text-xs bg-white border border-gray-300 rounded-lg text-right font-bold"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Total prélevé de l'entrepôt :</span>
              <span className="font-['Poppins',sans-serif] font-bold text-sm text-[#0F3D5E]">
                {totalTransfere} {transferModal.uniteStockage}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={totalTransfere <= 0 || totalTransfere > transferModal.quantite}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer shadow-xs disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                Valider le transfert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Entrepot
