

;

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
