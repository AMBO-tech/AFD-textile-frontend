import React, { useState } from 'react'
import { AlertOctagon, RotateCcw, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCancelSale } from '@/hooks/useSales'
import type { Vente } from '@/types/sales'
import { toast } from 'sonner'

interface SaleCancellationModalProps {
  sale: Vente | null
  isOpen: boolean
  onClose: () => void
}

const MOTIFS = [
  'Erreur de saisie',
  'Retour client',
  'Produit défectueux',
  'Autre',
] as const

export const SaleCancellationModal: React.FC<SaleCancellationModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const [motifSelectionne, setMotifSelectionne] = useState<string>(MOTIFS[0])
  const [justificationDetail, setJustificationDetail] = useState<string>('')

  const cancelSaleMutation = useCancelSale()

  if (!sale) return null

  const handleConfirmCancel = async () => {
    const motifComplet = justificationDetail.trim()
      ? `${motifSelectionne} : ${justificationDetail.trim()}`
      : motifSelectionne

    try {
      await cancelSaleMutation.mutateAsync({
        id: sale.id,
        dto: { motif: motifComplet },
      })
      onClose()
    } catch {
      // Error handled in hook
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mb-3">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <DialogTitle className="font-display text-lg font-bold text-slate-900">
            Annulation Sécurisée de Vente
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Facture réf : <span className="font-mono font-semibold text-slate-800">{sale.referenceFacture}</span> • Montant :{' '}
            <span className="font-semibold text-slate-800">{sale.montantTotal.toLocaleString('fr-FR')} FCFA</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>
              La validation de cette annulation réintégrera automatiquement les quantités d'articles dans le stock de la boutique et enregistrera une trace d'audit.
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Motif d'annulation obligatoire :
            </label>
            <div className="space-y-1.5">
              {MOTIFS.map((motif) => (
                <label
                  key={motif}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                    motifSelectionne === motif
                      ? 'border-[#EF4444] bg-[#EF4444]/5 font-semibold text-slate-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="motif_annulation"
                    value={motif}
                    checked={motifSelectionne === motif}
                    onChange={(e) => setMotifSelectionne(e.target.value)}
                    className="accent-[#EF4444]"
                  />
                  <span>{motif}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Précisions complémentaires (Optionnel) :
            </label>
            <textarea
              rows={2}
              value={justificationDetail}
              onChange={(e) => setJustificationDetail(e.target.value)}
              placeholder="Ex: Tissu déchiré sur 2 mètres, retour immédiat au comptoir..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 focus:border-[#EF4444]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 text-xs font-semibold border-slate-200"
          >
            Fermer
          </Button>
          <Button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelSaleMutation.isPending}
            className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-xl h-10 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            {cancelSaleMutation.isPending ? 'Traitement...' : 'Confirmer l’annulation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
