import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, CheckCircle2 } from 'lucide-react'
import { useCreateTransfert } from '@/hooks/useTransferts'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import type { StockLevel } from '@/types/api'
import { toast } from 'sonner'

interface TransferRequestModalProps {
  item: StockLevel | null
  isOpen: boolean
  onClose: () => void
}

export const TransferRequestModal: React.FC<TransferRequestModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [quantite, setQuantite] = useState<number>(10)
  const [priorite, setPriorite] = useState<'NORMALE' | 'URGENTE'>('NORMALE')

  const { currentLocation } = useLocationStore()
  const { user } = useAuthStore()
  const createTransfertMutation = useCreateTransfert()

  if (!item) return null

  const handleConfirm = async () => {
    if (quantite <= 0) {
      toast.error('Quantité invalide')
      return
    }

    try {
      await createTransfertMutation.mutateAsync({
        reference: `TRF-${Date.now().toString().slice(-6)}`,
        produitId: item.produitId,
        produitNom: item.produitNom,
        produitReference: item.produitReference,
        quantite,
        unite: item.uniteStockage,
        locationSourceId: item.locationId,
        locationSourceNom: item.locationNom,
        locationDestinationId: currentLocation.id,
        locationDestinationNom: currentLocation.nom,
        demandeurNom: user?.name || 'Vendeur',
        statut: 'EN_ATTENTE',
        priorite,
      })
      onClose()
      setQuantite(10)
    } catch {
      // Handled in hook
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
            <Send className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-lg font-bold text-slate-900">
            Demande de Réassort Inter-Boutiques
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Transfert de stock depuis <span className="font-semibold text-slate-800">{item.locationNom}</span> vers{' '}
            <span className="font-semibold text-slate-800">{currentLocation.nom}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">{item.produitNom}</div>
            <div className="text-slate-500 font-mono">
              Réf : {item.produitReference} • Dispo à la source : {item.quantite} {item.uniteStockage}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Quantité demandée ({item.uniteStockage}) :
            </label>
            <Input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Degré de priorité :</label>
            <div className="flex gap-2">
              {(['NORMALE', 'URGENTE'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorite(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    priorite === p
                      ? 'border-primary bg-primary text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p === 'NORMALE' ? 'Standard' : 'Urgente (Rupture)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 text-xs font-semibold border-slate-200 cursor-pointer"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={createTransfertMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {createTransfertMutation.isPending ? 'Envoi...' : 'Transmettre la demande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
