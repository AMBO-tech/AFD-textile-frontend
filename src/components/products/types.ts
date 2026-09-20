import type { Produit, Categorie } from '../../data/useMockStore';

export type { Produit, Categorie };

export interface ProductsProps {
  role?: 'gerant' | 'boutiquier';
}

export interface ProductFormData {
  nom: string;
  categorie: string;
  couleur: string;
  prix: string;
  quantite: string;
  unite: string;
  pieces: string;
  photo: string;
}
