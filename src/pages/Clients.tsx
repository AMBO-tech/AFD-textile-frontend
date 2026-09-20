import React, { useState } from 'react'
import {
  Search,
  Plus,
  Phone,
  MapPin,
  CreditCard,
  MessageCircle,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import { useClients, useCreateClient, useRecordPayment } from '@/hooks/useClients'
import { RelanceWhatsApp } from '@/components/crm/RelanceWhatsApp'
import { RelanceSMS } from '@/components/crm/RelanceSMS'
import type { Client } from '@/types/api'
import { toast } from 'sonner'

const MODES_PAIEMENT = ['Espèces', 'Wave', 'Orange Money', 'Free Money', 'Carte bancaire']

export const Clients: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState<Client | null>(null)

  // Formulaire client
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')

  // Formulaire règlement
  const [montantPaiement, setMontantPaiement] = useState('')
  const [modePaiement, setModePaiement] = useState('Wave')

  const { data: clientsData, isLoading } = useClients()
  const createClientMutation = useCreateClient()
  const recordPaymentMutation = useRecordPayment()

  const clients = clientsData?.items || []

  const clientsFiltres = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      (c.telephone && c.telephone.includes(search))
  )

  const debiteurs = clients.filter((c) => c.totalDu > 0)
  const totalCreances = debiteurs.reduce((sum, c) => sum + c.totalDu, 0)

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }

    try {
      await createClientMutation.mutateAsync({
        nom: nom.trim(),
        telephone: telephone.trim() || undefined,
        adresse: adresse.trim() || undefined,
      })
      toast.success('Fiche client créée avec succès')
      setShowAddModal(false)
      setNom('')
      setTelephone('')
      setAdresse('')
    } catch {
      toast.error('Erreur lors de la création du client')
    }
  }

  const handleEnregistrerReglement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPaymentModal || !montantPaiement) return

    const m = Number(montantPaiement)
    if (isNaN(m) || m <= 0) {
      toast.error('Montant invalide')
      return
    }

    try {
      await recordPaymentMutation.mutateAsync({
        clientId: showPaymentModal.id,
        montant: m,
        moyenPaiement: (modePaiement.toUpperCase() === 'ESPÈCES' ? 'ESPECES' : modePaiement.toUpperCase()) as any,
      })
      toast.success(`Encaissement de ${m.toLocaleString()} F validé`)
      setShowPaymentModal(null)
      setMontantPaiement('')
    } catch {
      toast.error("Erreur lors de l'enregistrement du règlement")
    }
  }

  return (
    <div className="space-y-5 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Gestion des Clients & Créances
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {clients.length} clients enregistrés • {debiteurs.length} comptes débiteurs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-sm self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <UserPlus size={15} />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-red-600">
            {totalCreances.toLocaleString('fr-FR')} FCFA
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Total des créances dues</div>
          <div className="h-1 rounded-full mt-2 bg-red-50">
            <div className="h-full rounded-full w-4/5 bg-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-gray-900">
            {debiteurs.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Clients en souffrance</div>
          <div className="h-1 rounded-full mt-2 bg-amber-50">
            <div className="h-full rounded-full w-2/3 bg-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="font-['Poppins',sans-serif] font-bold text-lg text-emerald-600">
            {clients.length - debiteurs.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Clients à jour</div>
          <div className="h-1 rounded-full mt-2 bg-emerald-50">
            <div className="h-full rounded-full w-full bg-[#22C55E]" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom de client ou téléphone..."
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5]"
        />
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Client List */}
        <div className="lg:col-span-7 space-y-2">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Chargement des dossiers clients...
            </div>
          ) : clientsFiltres.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Aucun client trouvé pour « {search} ».
            </div>
          ) : (
            clientsFiltres.map((client) => {
              const aDette = client.totalDu > 0
              const isSelected = selectedClient?.id === client.id

              return (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1E88E5] ring-2 ring-[#1E88E5]/15'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{
                          background: aDette
                            ? 'linear-gradient(135deg, #EF4444, #F59E0B)'
                            : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
                        }}
                      >
                        {client.nom
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <div className="font-semibold text-sm text-gray-900 leading-snug">
                          {client.nom}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {client.telephone && (
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-gray-400" />
                              {client.telephone}
                            </span>
                          )}
                          {client.adresse && (
                            <span>• {client.adresse}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-gray-400">Solde dû</div>
                      <div
                        className={`font-['Poppins',sans-serif] font-bold text-sm ${
                          aDette ? 'text-red-600' : 'text-gray-400'
                        }`}
                      >
                        {client.totalDu.toLocaleString('fr-FR')} FCFA
                      </div>
                      {aDette && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPaymentModal(client)
                          }}
                          className="mt-1 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Encaisser
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right: Selected Client Detail & Multichannel Reminders */}
        <div className="lg:col-span-5">
          {selectedClient ? (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                  Dossier Client
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <div className="text-lg font-bold text-gray-900">{selectedClient.nom}</div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <div>Téléphone : {selectedClient.telephone || 'Non renseigné'}</div>
                  <div>Adresse : {selectedClient.adresse || 'Dakar'}</div>
                  <div>Réseau : AFD Textile</div>
                </div>
              </div>

              {/* Debt Box */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedClient.totalDu > 0
                    ? 'bg-red-50/60 border-red-200'
                    : 'bg-emerald-50/60 border-emerald-200'
                }`}
              >
                <div>
                  <div className="text-xs text-gray-500 font-medium">Solde Débiteur Actuel</div>
                  <div
                    className={`font-['Poppins',sans-serif] font-bold text-xl mt-0.5 ${
                      selectedClient.totalDu > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {selectedClient.totalDu.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                {selectedClient.totalDu > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(selectedClient)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22C55E)' }}
                  >
                    Régler
                  </button>
                )}
              </div>

              {/* Multichannel Notification Reminders */}
              {selectedClient.totalDu > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Relances Immédiates
                  </div>
                  <RelanceWhatsApp client={selectedClient} />
                  <RelanceSMS client={selectedClient} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 text-center text-gray-400">
              <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-gray-700">Sélectionnez un client</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Consultez le solde, encaissez les créances et déclenchez des relances WhatsApp / SMS.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouveau Client */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateClient}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                Nouveau Client
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Nom complet *</label>
                <input
                  required
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Awa Ndiaye"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Téléphone (WhatsApp/SMS)</label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Adresse</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Dakar, Médina"
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createClientMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer shadow-xs"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                {createClientMutation.isPending ? 'Enregistrement...' : 'Créer le client'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Règlement Créance */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleEnregistrerReglement}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-['Poppins',sans-serif] font-bold text-base text-gray-900">
                Règlement de Créance
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-800">{showPaymentModal.nom}</p>
              <p className="text-xs text-red-600 font-bold mt-0.5">
                Solde dû : {showPaymentModal.totalDu.toLocaleString('fr-FR')} FCFA
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Montant versé (FCFA) *</label>
                <input
                  required
                  type="number"
                  max={showPaymentModal.totalDu}
                  value={montantPaiement}
                  onChange={(e) => setMontantPaiement(e.target.value)}
                  placeholder={showPaymentModal.totalDu.toString()}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mode de règlement :</label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                >
                  {MODES_PAIEMENT.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={recordPaymentMutation.isPending}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22C55E)' }}
              >
                {recordPaymentMutation.isPending ? 'Enregistrement...' : 'Valider l’encaissement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Clients
