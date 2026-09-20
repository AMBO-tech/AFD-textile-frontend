import React, { useState } from 'react'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Wallet,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle2,
  Percent,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/useAppStore'
import { useClients } from '@/hooks/useClients'
import { useCreateSale } from '@/hooks/useSales'
import type { MoyenPaiement } from '@/types/enums'
import { toast } from 'sonner'

export const PosTerminalPanel: React.FC = () => {
  const { cartItems, updateCartItemQuantity, removeFromCart, clearCart, currentLocation, isOnline, incrementPendingSync } = useAppStore()
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [modePaiement, setModePaiement] = useState<MoyenPaiement>('ESPECES')
  const [globalDiscountPct, setGlobalDiscountPct] = useState<number>(0)
  const [montantEncaisse, setMontantEncaisse] = useState<number>(0)

  const { data: clientsData } = useClients()
  const createSale = useCreateSale()

  const clients = clientsData?.items || []

  // Calculs financiers
  const sousTotalBrut = cartItems.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0)
  const remiseGlobale = (sousTotalBrut * globalDiscountPct) / 100
  const netAPayer = Math.max(0, sousTotalBrut - remiseGlobale)

  const handleValidateSale = async () => {
    if (cartItems.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    const salePayload = {
      boutiqueId: currentLocation?.id,
      clientId: selectedClientId || undefined,
      lignes: cartItems.map((item) => ({
        produitId: item.produitId,
        quantite: item.quantite,
        uniteSaisie: item.unite,
        prixUnitaireApplique: item.prixUnitaire,
        remiseMontant: (item.prixUnitaire * item.quantite * globalDiscountPct) / 100,
      })),
      paiementInitial: {
        montant: montantEncaisse > 0 ? montantEncaisse : netAPayer,
        modePaiement: modePaiement,
      },
    }

    if (!isOnline) {
      incrementPendingSync()
      toast.success('Vente enregistrée en mode hors ligne (synchronisation ultérieure)')
      clearCart()
      return
    }

    try {
      await createSale.mutateAsync(salePayload)
      clearCart()
      setGlobalDiscountPct(0)
      setMontantEncaisse(0)
    } catch {
      // Handled in mutation hook
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col h-full">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1E88E5]" />
            Terminal de Caisse & Facturation
          </CardTitle>
          <Badge variant="secondary" className="bg-[#0F3D5E]/10 text-[#0F3D5E] font-semibold text-xs">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Client Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Client (Optionnel)</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/30 focus:border-[#1E88E5]"
          >
            <option value="">Client Comptant (Passage)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} {c.telephone ? `(${c.telephone})` : ''} {c.totalDu ? `— Dette: ${c.totalDu} FCFA` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Sélectionnez des tissus dans la liste pour les ajouter au ticket
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.produitId}
                className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 truncate">{item.nom}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {item.prixUnitaire.toLocaleString('fr-FR')} FCFA / {item.unite}
                  </div>
                </div>

                {/* Quantité controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => updateCartItemQuantity(item.produitId, -1)}
                    className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200 shadow-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-slate-800">{item.quantite}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.produitId, 1)}
                    className="w-6 h-6 rounded bg-white flex items-center justify-center text-slate-600 hover:bg-slate-200 shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Total Ligne */}
                <div className="text-right min-w-[70px]">
                  <div className="text-xs font-bold text-slate-900">
                    {(item.prixUnitaire * item.quantite).toLocaleString('fr-FR')} F
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.produitId)}
                  className="text-slate-400 hover:text-[#EF4444] transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Global Discount */}
        {cartItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-slate-400" />
              Remise commerciale :
            </span>
            <div className="flex items-center gap-1">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setGlobalDiscountPct(pct)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    globalDiscountPct === pct
                      ? 'bg-[#1E88E5] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Modes */}
        {cartItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Mode de règlement</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setModePaiement('ESPECES')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  modePaiement === 'ESPECES'
                    ? 'border-[#0F3D5E] bg-[#0F3D5E] text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[10px] font-medium">Espèces</span>
              </button>

              <button
                type="button"
                onClick={() => setModePaiement('WAVE')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  modePaiement === 'WAVE'
                    ? 'border-[#1E88E5] bg-[#1E88E5] text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-medium">Wave</span>
              </button>

              <button
                type="button"
                onClick={() => setModePaiement('ORANGE_MONEY')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  modePaiement === 'ORANGE_MONEY'
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] font-medium">Orange M.</span>
              </button>

              <button
                type="button"
                onClick={() => setModePaiement('VIREMENT')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  modePaiement === 'VIREMENT'
                    ? 'border-[#0F3D5E] bg-[#0F3D5E] text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-medium">Virement</span>
              </button>

              <button
                type="button"
                onClick={() => setModePaiement('AUTRE')}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  modePaiement === 'AUTRE'
                    ? 'border-slate-800 bg-slate-800 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-medium">Autre / Crédit</span>
              </button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer Calculation & Action */}
      <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-4 flex flex-col gap-3">
        <div className="w-full space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Sous-total brut</span>
            <span className="font-semibold">{sousTotalBrut.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {remiseGlobale > 0 && (
            <div className="flex justify-between text-[#22C55E]">
              <span>Remise ({globalDiscountPct}%)</span>
              <span>- {remiseGlobale.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          <div className="flex justify-between text-slate-900 text-base font-display font-bold pt-1 border-t border-slate-200">
            <span>Net à payer</span>
            <span className="text-[#0F3D5E]">{netAPayer.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <Button
          onClick={handleValidateSale}
          disabled={cartItems.length === 0 || createSale.isPending}
          className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-white rounded-xl h-11 text-sm font-semibold gap-2 shadow-sm transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          {createSale.isPending ? 'Enregistrement en cours...' : 'Valider et Encaisser'}
        </Button>
      </CardFooter>
    </Card>
  )
}
