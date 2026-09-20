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
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col h-full font-inter overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5] shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-poppins text-lg font-bold text-[#0F3D5E]">
              Caisse & Facturation
            </h3>
            <p className="font-inter text-xs text-gray-500">Panier et règlement</p>
          </div>
        </div>
        <Badge className="bg-[#0F3D5E] text-white text-xs font-semibold rounded-full px-3 py-1">
          {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="p-6 space-y-5 flex-1 overflow-y-auto">
        {/* Client Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5 font-inter">
            Client associé (Optionnel)
          </label>
          <div className="relative">
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="w-full h-12 px-4 text-sm font-inter bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-[#1E88E5] transition-all"
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
          <div className="pt-3 border-t border-gray-100">
            <DiscountInput discountPct={discountPct} onChange={setDiscountPct} />
          </div>
        )}

        {/* Payment Methods */}
        {cartItems.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <Button
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || createSaleMutation.isPending}
          className="w-full bg-success hover:bg-success/90 text-white rounded-xl h-12 text-sm font-semibold gap-2 shadow-sm cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          {createSaleMutation.isPending ? 'Encaissement...' : `Valider l'encaissement (${totalNet.toLocaleString('fr-FR')} FCFA)`}
        </Button>
      </div>
    </Card>
  )
}
