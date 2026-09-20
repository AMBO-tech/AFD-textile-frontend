import React from 'react'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useSendRelance } from '@/hooks/useClients'
import type { Client } from '@/types/api'
import { toast } from 'sonner'

interface RelanceSMSProps {
  client: Client
}

export const RelanceSMS: React.FC<RelanceSMSProps> = ({ client }) => {
  const sendRelanceMutation = useSendRelance()

  const handleSend = () => {
    const rawPhone = client.telephone ? client.telephone.replace(/[^0-9]/g, '') : ''
    if (!rawPhone) {
      toast.error('Aucun numéro de téléphone valide enregistré pour ce client')
      return
    }

    const message = `Bonjour ${client.nom}, votre créance de ${client.totalDu.toLocaleString('fr-FR')} FCFA est toujours en attente. Merci de régulariser votre situation auprès de votre boutique AFD Textile.`
    const url = `sms:${rawPhone}?body=${encodeURIComponent(message)}`
    window.location.href = url

    sendRelanceMutation.mutate({
      clientId: client.id,
      canal: 'SMS',
      message,
    })
  }

  return (
    <Button
      onClick={handleSend}
      className="bg-primary hover:bg-primary/90 text-white rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
    >
      <Send className="w-4 h-4" />
      Envoyer via SMS
    </Button>
  )
}
