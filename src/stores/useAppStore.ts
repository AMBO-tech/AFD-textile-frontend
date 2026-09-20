import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BoutiqueLocation {
  id: string
  nom: string
  code: string
  type: 'BOUTIQUE' | 'ENTREPOT'
  ville: string
  adresse?: string
  telephone?: string
  responsableNom?: string
  actif: boolean
}

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced' | 'error'

interface AppState {
  // Boutique / Emplacement actif
  currentLocationId: string | null
  currentLocation: BoutiqueLocation | null
  setCurrentLocation: (loc: BoutiqueLocation) => void

  // Mode Hors Ligne & Synchronisation
  isOnline: boolean
  syncStatus: SyncStatus
  pendingSyncCount: number
  setIsOnline: (online: boolean) => void
  setSyncStatus: (status: SyncStatus) => void
  incrementPendingSync: () => void
  resetPendingSync: () => void

  // Panier / Caisse POS en cours
  cartItems: Array<{
    produitId: string
    reference: string
    nom: string
    quantite: number
    unite: string
    prixUnitaire: number
    remise: number
    totalLigne: number
  }>
  addToCart: (item: {
    produitId: string
    reference: string
    nom: string
    quantite: number
    unite: string
    prixUnitaire: number
    remise?: number
  }) => void
  updateCartItemQuantity: (produitId: string, delta: number) => void
  removeFromCart: (produitId: string) => void
  clearCart: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentLocationId: 'loc-dkr-01',
      currentLocation: {
        id: 'loc-dkr-01',
        nom: 'Boutique Dakar Marché HLM',
        code: 'DKR-01',
        type: 'BOUTIQUE',
        ville: 'Dakar',
        adresse: 'Marché HLM, Allée 3',
        telephone: '+221 77 123 45 67',
        actif: true,
      },
      setCurrentLocation: (loc) => set({ currentLocationId: loc.id, currentLocation: loc }),

      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      syncStatus: 'synced',
      pendingSyncCount: 0,
      setIsOnline: (isOnline) => set({ isOnline }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      incrementPendingSync: () => set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1, syncStatus: 'pending' })),
      resetPendingSync: () => set({ pendingSyncCount: 0, syncStatus: 'synced' }),

      cartItems: [],
      addToCart: (item) => {
        const existing = get().cartItems.find((i) => i.produitId === item.produitId)
        const remise = item.remise || 0
        if (existing) {
          const newQty = existing.quantite + item.quantite
          const total = (item.prixUnitaire * newQty) - remise
          set({
            cartItems: get().cartItems.map((i) =>
              i.produitId === item.produitId
                ? { ...i, quantite: newQty, totalLigne: Math.max(0, total) }
                : i
            ),
          })
        } else {
          const total = (item.prixUnitaire * item.quantite) - remise
          set({
            cartItems: [
              ...get().cartItems,
              {
                ...item,
                remise,
                totalLigne: Math.max(0, total),
              },
            ],
          })
        }
      },
      updateCartItemQuantity: (produitId, delta) => {
        set({
          cartItems: get()
            .cartItems.map((i) => {
              if (i.produitId !== produitId) return i
              const newQty = Math.max(1, i.quantite + delta)
              return {
                ...i,
                quantite: newQty,
                totalLigne: Math.max(0, (i.prixUnitaire * newQty) - i.remise),
              }
            })
            .filter((i) => i.quantite > 0),
        })
      },
      removeFromCart: (produitId) => {
        set({
          cartItems: get().cartItems.filter((i) => i.produitId !== produitId),
        })
      },
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'afd-app-store',
      partialize: (state) => ({
        currentLocationId: state.currentLocationId,
        currentLocation: state.currentLocation,
        cartItems: state.cartItems,
      }),
    }
  )
)
