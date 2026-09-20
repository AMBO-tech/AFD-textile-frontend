import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, CheckCircle2, User } from 'lucide-react'
import { Cart } from './Cart'
import { DiscountInput } from './DiscountInput'
import { PaymentSelector } from './PaymentSelector'
import { usePosStore } from '@/stores/posStore'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import { useClients } from '@/hooks/useClients'
import { useCreateSale } from '@/hooks/useSales'
import { toast } from 'sonner'

export const POSTerminal: React.FC = () => {
  const {
    cartItems,
    discountPct,
    setDiscountPct,
    paymentMethod,
    setPaymentMethod,
    selectedClientId,
    setSelectedClientId,
    clearCart,
    getTotalNet,
  } = usePosStore()

  const { currentLocation, isOnline } = useLocationStore()
  const { user } = useAuthStore()
  const { data: clientsData } = useClients()
  const createSaleMutation = useCreateSale()

  const clients = clientsData?.items || []
  const totalNet = getTotalNet()

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Le panier est vide')
      return
    }

    const payload = {
      referenceFacture: `FAC-${Date.now().toString().slice(-6)}`,
      boutiqueId: currentLocation.id,
      boutiqueNom: currentLocation.nom,
      vendeurNom: user?.name || 'Vendeur',
      clientId: selectedClientId || undefined,
      clientNom: clients.find((c) => c.id === selectedClientId)?.nom || 'Client Comptant',
      statut: 'CONFIRMEE' as const,
      statutPaiement: 'SOLDE' as const,
      montantTotal: totalNet,
      montantPaye: totalNet,
      soldeDu: 0,
      moyenPaiement: paymentMethod,
      lignes: cartItems,
    }

    try {
      await createSaleMutation.mutateAsync(payload)
      clearCart()
      toast.success(
        isOnline
          ? 'Encaissement validé et synchronisé'
          : 'Encaissement validé (Mode hors ligne : synchronisation en attente)'
      )
    } catch {
      // Handled in mutation
    }
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col h-full">
      <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-light" />
            Caisse & Facturation
          </CardTitle>
          <Badge className="bg-primary text-white text-xs font-semibold">
            {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
        {/* Client Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Client associé (Optionnel)
          </label>
          <div className="relative">
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light/30 focus:border-primary-light"
            >
              <option value="">Client Comptant (Passage)</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} {c.telephone ? `(${c.telephone})` : ''} {c.totalDu > 0 ? `— Dû: ${c.totalDu} F` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Cart */}
        <Cart />

        {/* Commercial Discount */}
        {cartItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <DiscountInput discountPct={discountPct} onChange={setDiscountPct} />
          </div>
        )}

        {/* Payment Methods */}
        {cartItems.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
        <Button
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || createSaleMutation.isPending}
          className="w-full bg-success hover:bg-success/90 text-white rounded-xl h-11 text-sm font-semibold gap-2 shadow-sm cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          {createSaleMutation.isPending ? 'Encaissement...' : `Valider l'encaissement (${totalNet.toLocaleString('fr-FR')} FCFA)`}
        </Button>
      </CardFooter>
    </Card>
  )
}
