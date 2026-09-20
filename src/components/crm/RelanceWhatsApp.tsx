import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink } from 'lucide-react'
import { useSendRelance } from '@/hooks/useClients'
import type { Client } from '@/types/api'
import { toast } from 'sonner'

interface RelanceWhatsAppProps {
  client: Client
}

export const RelanceWhatsApp: React.FC<RelanceWhatsAppProps> = ({ client }) => {
  const sendRelanceMutation = useSendRelance()

  const handleSend = () => {
    const rawPhone = client.telephone ? client.telephone.replace(/[^0-9]/g, '') : ''
    if (!rawPhone) {
      toast.error('Aucun numéro de téléphone valide enregistré pour ce client')
      return
    }

    const message = `Bonjour ${client.nom}, votre créance de ${client.totalDu.toLocaleString('fr-FR')} FCFA est toujours en attente. Merci de régulariser votre situation auprès de votre boutique AFD Textile.`
    const url = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')

    sendRelanceMutation.mutate({
      clientId: client.id,
      canal: 'WHATSAPP',
      message,
    })
  }

  return (
    <Button
      onClick={handleSend}
      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
    >
      <MessageSquare className="w-4 h-4" />
      Relancer via WhatsApp
      <ExternalLink className="w-3 h-3 opacity-70" />
    </Button>
  )
}
