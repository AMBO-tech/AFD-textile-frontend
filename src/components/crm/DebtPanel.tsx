import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CreditCard, Search, Phone, AlertCircle, CheckCircle2 } from 'lucide-react'
import { RelanceWhatsApp } from './RelanceWhatsApp'
import { RelanceSMS } from './RelanceSMS'
import { useClients } from '@/hooks/useClients'
import type { Client } from '@/types/api'

export const DebtPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const { data: clientsData, isLoading } = useClients({ avecDetteSeulement: true })
  const clients = clientsData?.items || []

  const debtors = clients.filter((c) => c.totalDu > 0)
  const filtered = searchTerm.trim()
    ? debtors.filter(
        (c) =>
          c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.telephone && c.telephone.includes(searchTerm))
      )
    : debtors

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-danger" />
              Recouvrement des Créances & Relances Multicanal
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Surveillance des soldes débiteurs et notifications en 1 clic
            </CardDescription>
          </div>
          <Badge className="bg-danger text-white text-xs font-semibold self-start sm:self-auto">
            {debtors.length} Dossier{debtors.length > 1 ? 's' : ''} en Souffrance
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Debtor List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher débiteur ou téléphone..."
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="text-xs text-center py-6 text-slate-400">Chargement des dossiers créances...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
                Aucune créance en attente sur ce périmètre.
              </div>
            ) : (
              filtered.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedClient?.id === client.id
                      ? 'border-danger bg-danger/5 ring-1 ring-danger/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{client.nom}</span>
                    <span className="text-xs font-bold text-danger">
                      {client.totalDu.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{client.telephone || 'Non renseigné'}</span>
                    <span>{client.nombreFacturesImpayees || 1} impayé(s)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Actions & WhatsApp/SMS Console */}
        <div className="lg:col-span-7">
          {selectedClient ? (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 h-full flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">{selectedClient.nom}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedClient.telephone || 'Aucun téléphone renseigné'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Créance totale</span>
                    <span className="font-display text-lg font-bold text-danger">
                      {selectedClient.totalDu.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                    Template certifié de relance :
                  </span>
                  <p className="italic text-slate-800">
                    « Bonjour {selectedClient.nom}, votre créance de{' '}
                    <span className="font-bold">{selectedClient.totalDu.toLocaleString('fr-FR')} FCFA</span> est toujours en attente. Merci de régulariser votre situation auprès de votre boutique AFD Textile. »
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <RelanceSMS client={selectedClient} />
                <RelanceWhatsApp client={selectedClient} />
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">Sélectionnez un client débiteur</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs">
                Visualisez la fiche de créance et déclenchez instantanément une notification WhatsApp ou SMS.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
