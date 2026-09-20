import React, { useState } from 'react'
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  X,
  Plus,
  AlertCircle,
} from 'lucide-react'
import { useTransferts, useCreateTransfert, useUpdateTransfertStatut } from '@/hooks/useTransferts'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import { useProducts } from '@/hooks/useProducts'
import type { Transfert } from '@/types/api'
import { toast } from 'sonner'

const STATUTS = [
  { id: 'DEMANDE', label: 'En attente', color: '#F59E0B', bg: '#FFFBEB' },
  { id: 'VALIDE', label: 'Acceptée', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'EN_TRANSIT', label: 'En transfert', color: '#1E88E5', bg: '#EBF5FB' },
  { id: 'RECU', label: 'Livrée', color: '#22C55E', bg: '#F0FDF4' },
  { id: 'REFUSE', label: 'Refusée', color: '#EF4444', bg: '#FEF2F2' },
]

export const Demandes: React.FC = () => {
  const [filterStatut, setFilterStatut] = useState<string>('')
  const [showNew, setShowNew] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState<Transfert | null>(null)

  // Formulaire nouvelle demande
  const [produitId, setProduitId] = useState('')
  const [quantite, setQuantite] = useState('10')
  const [targetLocationId, setTargetLocationId] = useState('')
  const [priorite, setPriorite] = useState('normale')

  const { currentLocation, locations } = useLocationStore()
  const { user } = useAuthStore()
  const isGerant = user?.role === 'gerant' || user?.role === 'ADMIN'

  const { data: transfertsData, isLoading } = useTransferts()
  const { data: productsData } = useProducts()
  const createTransfertMutation = useCreateTransfert()
  const updateStatutMutation = useUpdateTransfertStatut()

  const transferts = transfertsData?.items || []
  const products = productsData?.items || []

  const filtered = transferts.filter((d) => !filterStatut || d.statut === filterStatut)
  const enAttenteCount = transferts.filter((d) => d.statut === 'DEMANDE').length

  const handleValidation = async (id: string, newStatut: 'ACCEPTEE' | 'REFUSEE') => {
    try {
      await updateStatutMutation.mutateAsync({
        id,
        statut: newStatut,
      })
      toast.success(newStatut === 'ACCEPTEE' ? 'Demande validée' : 'Demande refusée')
    } catch {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleNewDemande = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!produitId || !quantite) {
      toast.error('Veuillez renseigner tous les champs')
      return
    }

    try {
      const entrepot = locations.find((l) => l.type === 'ENTREPOT')
      await createTransfertMutation.mutateAsync({
        sourceLocationId: entrepot?.id || locations[0]?.id,
        targetLocationId: currentLocation.id,
        items: [
          {
            produitId,
            quantite: Number(quantite),
          },
        ],
        notes: `Demande de réapprovisionnement (${priorite === 'haute' ? 'URGENTE' : 'Standard'})`,
      })
      toast.success('Demande envoyée avec succès')
      setShowNew(false)
      setProduitId('')
      setQuantite('10')
    } catch {
      toast.error("Erreur lors de l'envoi de la demande")
    }
  }

  return (
    <div className="space-y-4 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Demandes de Transfert
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {enAttenteCount} demande{enAttenteCount > 1 ? 's' : ''} en attente de validation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={15} />
          <span>Nouvelle Demande</span>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterStatut('')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            !filterStatut
              ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Toutes ({transferts.length})
        </button>
        {STATUTS.map((st) => {
          const count = transferts.filter((d) => d.statut === st.id).length
          const active = filterStatut === st.id
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterStatut(st.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {st.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Requests List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
            Chargement des demandes de réapprovisionnement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
            Aucune demande répertoriée pour ce filtre.
          </div>
        ) : (
          filtered.map((d) => {
            const stCfg = STATUTS.find((s) => s.id === d.statut) || STATUTS[0]
            const firstItem = (d.lignes && d.lignes[0]) || (d.items && d.items[0]) || { produitNom: d.produitNom, quantite: d.quantite, unite: d.unite }
            return (
              <div
                key={d.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900">
                      {firstItem?.produitNom || 'Tissu réseau'}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: stCfg.bg, color: stCfg.color }}
                    >
                      {stCfg.label}
                    </span>
                    {d.notes?.includes('URGENT') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Quantité : {firstItem?.quantite} unités
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    De : {d.sourceLocationNom} → Vers : {d.targetLocationNom} • {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Manager actions */}
                {isGerant && d.statut === 'DEMANDE' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleValidation(d.id, 'ACCEPTEE')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer shadow-xs"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValidation(d.id, 'REFUSEE')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal Nouvelle Demande */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleNewDemande}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                Demande de Réapprovisionnement
              </h3>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tissu désiré :</label>
                <select
                  required
                  value={produitId}
                  onChange={(e) => setProduitId(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                >
                  <option value="">Sélectionnez un tissu...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} ({p.reference})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Quantité (mètres) :</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Degré d'urgence :</label>
                <select
                  value={priorite}
                  onChange={(e) => setPriorite(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                >
                  <option value="normale">Normale (prochaine livraison)</option>
                  <option value="haute">Urgente (rupture rayon)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createTransfertMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer shadow-xs"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                {createTransfertMutation.isPending ? 'Transmission...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Demandes
