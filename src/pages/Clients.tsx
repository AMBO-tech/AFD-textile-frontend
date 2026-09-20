import React, { useState } from 'react'
import { Users, UserPlus, Phone, CreditCard, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DebtPanel } from '@/components/crm/DebtPanel'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { toast } from 'sonner'

export const Clients: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')

  const { data: clientsData, isLoading } = useClients()
  const createClientMutation = useCreateClient()

  const clients = clientsData?.items || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) {
      toast.error('Nom obligatoire')
      return
    }

    try {
      await createClientMutation.mutateAsync({
        nom: nom.trim(),
        telephone: telephone.trim() || undefined,
        adresse: adresse.trim() || undefined,
      })
      setShowAddModal(false)
      setNom('')
      setTelephone('')
      setAdresse('')
    } catch {
      // Handled in mutation
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
              Clients & Recouvrement des Créances
            </h1>
            <Badge className="bg-danger text-white text-xs font-semibold">Priorité Trésorerie</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surveillance des impayés, historique d'achats et relance instantanée WhatsApp / SMS
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau Client
        </Button>
      </div>

      {/* Debt & Recovery Multichannel Console */}
      <DebtPanel />

      {/* Complete Client Directory */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-light" />
              Répertoire Général des Clients
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Coordonnées de contact et soldes en compte
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
            {clients.length} comptes
          </Badge>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-medium">
              <tr>
                <th className="p-3.5">Nom du Client</th>
                <th className="p-3.5">Numéro WhatsApp / SMS</th>
                <th className="p-3.5">Adresse</th>
                <th className="p-3.5">Solde Dû</th>
                <th className="p-3.5">Statut Compte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Chargement du répertoire client...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Aucun client enregistré pour l'instant.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{c.nom}</td>
                    <td className="p-3.5 text-slate-600">{c.telephone || '—'}</td>
                    <td className="p-3.5 text-slate-500">{c.adresse || '—'}</td>
                    <td className="p-3.5 font-bold font-display">
                      {c.totalDu > 0 ? (
                        <span className="text-danger">{c.totalDu.toLocaleString('fr-FR')} FCFA</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {c.totalDu > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-danger border-danger/30 bg-danger/5 font-semibold">
                          Créance en cours
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5 font-semibold">
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

      {/* New Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">Nouveau Client</h3>
            <p className="text-xs text-slate-500">
              Coordonnées requises pour le suivi des tickets de caisse et les relances.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nom complet * :</label>
                <Input
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Awa Ndiaye"
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">Adresse :</label>
                <Input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Dakar, Médina Rue 6"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl h-10 text-xs font-semibold border-slate-200 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createClientMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-xs font-semibold cursor-pointer"
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

export default Clients
