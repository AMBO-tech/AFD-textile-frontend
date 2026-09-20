import React, { useState } from 'react'
import {
  CreditCard,
  MessageSquare,
  Phone,
  Search,
  Send,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useClients, useSendRelance } from '@/hooks/useClients'
import type { Client } from '@/types/clients'
import { toast } from 'sonner'

export const DebtsManagerPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [customMessage, setCustomMessage] = useState<string>('')

  const { data: clientsData, isLoading } = useClients({ avecDetteSeulement: true })
  const sendRelance = useSendRelance()

  const clientsWithDebt = (clientsData?.items || []).filter(
    (c) => (c.totalDu && c.totalDu > 0) || (c.nombreFacturesImpayees && c.nombreFacturesImpayees > 0)
  )

  const filteredClients = searchTerm.trim()
    ? clientsWithDebt.filter(
        (c) =>
          c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.telephone && c.telephone.includes(searchTerm))
      )
    : clientsWithDebt

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    const formattedMontant = (client.totalDu || 0).toLocaleString('fr-FR') + ' FCFA'
    setCustomMessage(
      `Bonjour ${client.nom}, votre créance de ${formattedMontant} est toujours en attente. Merci de régulariser votre situation auprès de votre boutique AFD Textile.`
    )
  }

  const handleSendWhatsApp = () => {
    if (!selectedClient) return
    const phoneClean = (selectedClient.telephone || '').replace(/[^0-9]/g, '')
    if (!phoneClean) {
      toast.error('Ce client n’a pas de numéro de téléphone enregistré')
      return
    }
    const encodedText = encodeURIComponent(customMessage)
    const url = `https://wa.me/${phoneClean}?text=${encodedText}`
    window.open(url, '_blank')

    sendRelance.mutate({
      clientId: selectedClient.id,
      canal: 'WHATSAPP',
      message: customMessage,
    })
  }

  const handleSendSMS = () => {
    if (!selectedClient) return
    const phoneClean = (selectedClient.telephone || '').replace(/[^0-9]/g, '')
    if (!phoneClean) {
      toast.error('Ce client n’a pas de numéro de téléphone enregistré')
      return
    }
    const encodedText = encodeURIComponent(customMessage)
    const url = `sms:${phoneClean}?body=${encodedText}`
    window.location.href = url

    sendRelance.mutate({
      clientId: selectedClient.id,
      canal: 'SMS',
      message: customMessage,
    })
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden mb-6">
      <CardHeader className="bg-gradient-to-r from-[#EF4444]/5 via-amber-500/5 to-transparent border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="font-display text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#EF4444]" />
              Centre de Gestion des Créances & Relances Multicanal
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-500">
              Suivi des soldes débiteurs et relance directe WhatsApp / SMS avec messages normalisés
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/5 text-xs font-semibold">
            {clientsWithDebt.length} créancier{clientsWithDebt.length > 1 ? 's' : ''} identifié{clientsWithDebt.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: List of debtor clients */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou numéro..."
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {isLoading && (
              <div className="text-xs text-center py-8 text-slate-400">Chargement des comptes clients...</div>
            )}

            {!isLoading && filteredClients.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />
                Aucune créance en attente de recouvrement.
              </div>
            )}

            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedClient?.id === client.id
                    ? 'border-[#EF4444] bg-[#EF4444]/5 ring-2 ring-[#EF4444]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-slate-900">{client.nom}</div>
                  <div className="text-xs font-bold text-[#EF4444]">
                    {(client.totalDu || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{client.telephone || 'Non renseigné'}</span>
                  <span>{client.nombreFacturesImpayees || 1} impayé(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Action & messaging details */}
        <div className="lg:col-span-7">
          {selectedClient ? (
            <div className="h-full flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-slate-900 text-base">{selectedClient.nom}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedClient.telephone || 'Pas de numéro disponible'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">Montant total dû</span>
                    <span className="font-display text-lg font-bold text-[#EF4444]">
                      {(selectedClient.totalDu || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Message de relance (Template officiel AFD Textile) :
                  </label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5] text-slate-800"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Conforme au modèle exigé : « Bonjour [Nom], votre créance de [Montant] est toujours en attente... »
                  </span>
                </div>
              </div>

              {/* Relance Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end mt-4">
                <Button
                  onClick={handleSendWhatsApp}
                  disabled={!selectedClient.telephone}
                  className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white text-xs font-semibold rounded-xl h-10 px-4 gap-1.5 shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  Envoyer via WhatsApp
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Button>

                <Button
                  onClick={handleSendSMS}
                  disabled={!selectedClient.telephone}
                  className="bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white text-xs font-semibold rounded-xl h-10 px-4 gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Envoyer via SMS
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400">
              <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Sélectionnez un client à gauche</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Visualisez le montant de sa créance et déclenchez instantanément une notification de rappel par WhatsApp ou SMS.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
