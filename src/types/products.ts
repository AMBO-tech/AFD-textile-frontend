import type { ProductStatus, UniteStockage } from './enums'
import type { PaginationParams } from './api'

export interface Categorie { photo?: string;
  id: string
  code: string
  nom: string
  description?: string | null
  actif: boolean
  createdAt: string
  updatedAt: string
}

export interface Unite {
  id: string
  code: string
  nom: string
}

export interface Produit { photo?: string; lieu?: string; prix?: number; unite?: string;
  id: string
  reference: string
  nom: string
  categorie: Pick<Categorie, 'id' | 'code' | 'nom'>
  categorieId?: string
  couleur?: string | null
  motif?: string | null
  photoUrl: string
  uniteStockage: UniteStockage
  unitePrincipale: Pick<Unite, 'id' | 'code' | 'nom'>
  unitePrincipaleId?: string
  prixIndicatif: number
  prixMinimum?: number | null
  longueurRouleauMetres?: number | null
  poidsAuMetreKg?: number | null
  statut: ProductStatus
  quantiteEnStock?: number
  createdAt: string
  updatedAt: string
}

export interface CreateProduitDto {
  reference: string
  nom: string
  categorieId: string
  unitePrincipaleId: string
  uniteStockage?: UniteStockage
  couleur?: string
  motif?: string
  photoUrl: string
  prixIndicatif: number
  prixMinimum?: number
  longueurRouleauMetres?: number
  poidsAuMetreKg?: number
}

export interface UpdateProduitDto {
  reference?: string
  nom?: string
  categorieId?: string
  unitePrincipaleId?: string
  uniteStockage?: UniteStockage
  couleur?: string
  motif?: string
  photoUrl?: string
  prixIndicatif?: number
  prixMinimum?: number
  longueurRouleauMetres?: number
  poidsAuMetreKg?: number
  statut?: ProductStatus
}

export interface ProductQueryParams extends PaginationParams {
  categorieId?: string
  uniteStockage?: UniteStockage
  statut?: ProductStatus
  locationId?: string
  enRupture?: boolean
}
