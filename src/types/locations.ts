import type { LocationType } from './enums'

export interface Location { lieu?: string;
  id: string
  type: LocationType
  nom: string
  adresse?: string | null
  telephone?: string | null
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLocationDto {
  type: LocationType
  nom: string
  adresse?: string
  telephone?: string
  actif?: boolean
}

export interface UpdateLocationDto {
  type?: LocationType
  nom?: string
  adresse?: string
  telephone?: string
  actif?: boolean
}
export type Boutique = Location;


