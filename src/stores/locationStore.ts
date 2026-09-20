import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Location } from '@/types/api'

export type SyncStatus = 'idle' | 'pending' | 'syncing' | 'synced'

interface LocationState {
  currentLocationId: string
  currentLocation: Location
  locations: Location[]
  isOnline: boolean
  syncStatus: SyncStatus
  pendingSyncCount: number

  setCurrentLocation: (loc: Location) => void
  setIsOnline: (online: boolean) => void
  setSyncStatus: (status: SyncStatus) => void
  triggerManualSync: () => Promise<void>
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'loc-dkr-01',
    nom: 'Boutique Dakar Marché HLM',
    code: 'DKR-01',
    type: 'BOUTIQUE',
    ville: 'Dakar',
    adresse: 'Marché HLM, Allée 3',
    telephone: '+221 77 123 45 67',
    actif: true,
  },
  {
    id: 'loc-dkr-02',
    nom: 'Boutique Sandaga Grand Centre',
    code: 'DKR-02',
    type: 'BOUTIQUE',
    ville: 'Dakar',
    adresse: 'Avenue Lamine Guèye',
    telephone: '+221 77 987 65 43',
    actif: true,
  },
  {
    id: 'loc-thies-01',
    nom: 'Boutique Thiès Escale',
    code: 'THS-01',
    type: 'BOUTIQUE',
    ville: 'Thiès',
    adresse: 'Marché Central Escale',
    telephone: '+221 76 555 44 33',
    actif: true,
  },
  {
    id: 'loc-ent-01',
    nom: 'Entrepôt Central Diamniadio',
    code: 'ENT-01',
    type: 'ENTREPOT',
    ville: 'Diamniadio',
    adresse: 'Zone Industrielle Pôle Urbain',
    telephone: '+221 33 800 00 00',
    actif: true,
  },
]

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocationId: DEFAULT_LOCATIONS[0].id,
      currentLocation: DEFAULT_LOCATIONS[0],
      locations: DEFAULT_LOCATIONS,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      syncStatus: 'synced',
      pendingSyncCount: 0,

      setCurrentLocation: (loc) => set({ currentLocationId: loc.id, currentLocation: loc }),
      setIsOnline: (isOnline) => set({ isOnline }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),

      triggerManualSync: async () => {
        set({ syncStatus: 'syncing' })
        await new Promise((r) => setTimeout(r, 1000))
        set({ syncStatus: 'synced', pendingSyncCount: 0 })
      },
    }),
    {
      name: 'afd-location-store',
      partialize: (state) => ({
        currentLocationId: state.currentLocationId,
        currentLocation: state.currentLocation,
      }),
    }
  )
)
