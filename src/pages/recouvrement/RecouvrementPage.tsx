import React, { useState } from 'react'
import { CreditCard, UserPlus, Users, AlertTriangle, MessageSquare, Phone, Plus } from 'lucide-react'
import { BoutiqueHeaderSync, DebtsManagerPanel } from '@/components/reorganized'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { toast } from 'sonner'

export const RecouvrementPage: React.FC = () => {
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')

  const { data: clientsData, isLoading } = useClients()
  const createClientMutation = useCreateClient()

  const clients = clientsData?.items || []

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) {
      toast.error('Le nom du client est requis')
      return
    }

    try {
      await createClientMutation.mutateAsync({
        nom: nom.trim(),
        telephone: telephone.trim() || undefined,
        adresse: adresse.trim() || undefined,
      })
      setShowAddClientModal(false)
      setNom('')
      setTelephone('')
      setAdresse('')
    } catch {
      // Handled in mutation hook
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Sync Header */}
      <BoutiqueHeaderSync />

      {/* 2. Top Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
              CRM & Recouvrement des Créances
            </h1>
            <Badge variant="outline" className="text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30 text-xs font-semibold">
              Priorité Trésorerie
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Suivi des soldes débiteurs et relances directes WhatsApp & SMS
          </p>
        </div>

        <Button
          onClick={() => setShowAddClientModal(true)}
          className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau Client
        </Button>
      </div>

      {/* 3. Reorganized Debts & Multichannel Recovery Console */}
      <DebtsManagerPanel />

      {/* 4. Complete Client Directory Table */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1E88E5]" />
              Répertoire Intégral des Clients
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Coordonnées, adresses et encaissements enregistrés
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
            {clients.length} compte{clients.length > 1 ? 's' : ''}
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium">
              <tr>
                <th className="p-3.5">Nom / Entreprise</th>
                <th className="p-3.5">Téléphone</th>
                <th className="p-3.5">Adresse</th>
                <th className="p-3.5">Solde Dû</th>
                <th className="p-3.5">Statut Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Chargement de l'annuaire client...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Aucun client enregistré pour le moment.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">{client.nom}</td>
                    <td className="p-3.5 text-slate-600">{client.telephone || '—'}</td>
                    <td className="p-3.5 text-slate-500">{client.adresse || '—'}</td>
                    <td className="p-3.5 font-display font-bold">
                      {client.totalDu && client.totalDu > 0 ? (
                        <span className="text-[#EF4444]">{client.totalDu.toLocaleString('fr-FR')} FCFA</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {client.totalDu && client.totalDu > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30 font-semibold">
                          Créance en cours
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200 font-semibold">
                          À jour
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Ajout Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateClient}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">Enregistrer un Nouveau Client</h3>
            <p className="text-xs text-slate-500">
              Renseignez les coordonnées exactes pour permettre les relances automatiques.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nom complet * :</label>
                <Input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Fatou Diop"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Téléphone (WhatsApp/SMS) :</label>
                <Input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Adresse ou Quartier :</label>
                <Input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Dakar, HLM Grand Médine"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddClientModal(false)}
                className="rounded-xl h-10 text-xs font-semibold border-slate-200"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createClientMutation.isPending}
                className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-xl h-10 text-xs font-semibold shadow-sm"
              >
                {createClientMutation.isPending ? 'Enregistrement...' : 'Créer la fiche'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default RecouvrementPage
