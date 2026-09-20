import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MoyenPaiement, SaleLine } from '@/types/api'

interface PosState {
  cartItems: SaleLine[]
  discountPct: number
  paymentMethod: MoyenPaiement
  selectedClientId: string | null

  addToCart: (item: Omit<SaleLine, 'totalLigne'>) => void
  updateQuantity: (produitId: string, delta: number) => void
  removeFromCart: (produitId: string) => void
  clearCart: () => void
  setDiscountPct: (pct: number) => void
  setPaymentMethod: (method: MoyenPaiement) => void
  setSelectedClientId: (clientId: string | null) => void

  // Calculs
  getSousTotalBrut: () => number
  getRemiseMontant: () => number
  getTotalNet: () => number
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      discountPct: 0,
      paymentMethod: 'ESPECES',
      selectedClientId: null,

      addToCart: (item) => {
        const current = get().cartItems
        const existing = current.find((i) => i.produitId === item.produitId)
        if (existing) {
          const newQty = existing.quantite + item.quantite
          const total = item.prixUnitaire * newQty - item.remise
          set({
            cartItems: current.map((i) =>
              i.produitId === item.produitId
                ? { ...i, quantite: newQty, totalLigne: Math.max(0, total) }
                : i
            ),
          })
        } else {
          const total = item.prixUnitaire * item.quantite - item.remise
          set({
            cartItems: [
              ...current,
              { ...item, totalLigne: Math.max(0, total) },
            ],
          })
        }
      },

      updateQuantity: (produitId, delta) => {
        const current = get().cartItems
        set({
          cartItems: current
            .map((i) => {
              if (i.produitId !== produitId) return i
              const newQty = Math.max(1, i.quantite + delta)
              const total = i.prixUnitaire * newQty - i.remise
              return { ...i, quantite: newQty, totalLigne: Math.max(0, total) }
            })
            .filter((i) => i.quantite > 0),
        })
      },

      removeFromCart: (produitId) => {
        set({ cartItems: get().cartItems.filter((i) => i.produitId !== produitId) })
      },

      clearCart: () => set({ cartItems: [], discountPct: 0, selectedClientId: null }),

      setDiscountPct: (discountPct) => set({ discountPct }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setSelectedClientId: (selectedClientId) => set({ selectedClientId }),

      getSousTotalBrut: () => {
        return get().cartItems.reduce((acc, item) => acc + item.prixUnitaire * item.quantite, 0)
      },

      getRemiseMontant: () => {
        const brut = get().getSousTotalBrut()
        return (brut * get().discountPct) / 100
      },

      getTotalNet: () => {
        const brut = get().getSousTotalBrut()
        const remise = get().getRemiseMontant()
        return Math.max(0, brut - remise)
      },
    }),
    {
      name: 'afd-pos-store',
    }
  )
)
