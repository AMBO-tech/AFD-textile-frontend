

export interface BoutiqueItem {
  id: string;
  code: string;
  nom: string;
  type: 'BOUTIQUE' | 'ENTREPOT';
  lieu: string;
  adresse: string;
  telephone: string;
  gerant: string;
  actif: boolean;
}

export interface BoutiqueFormData {
  code: string;
  nom: string;
  type: 'BOUTIQUE' | 'ENTREPOT';
  lieu: string;
  adresse: string;
  telephone: string;
  gerant: string;
}

export type BoutiqueFilter = 'tous' | 'BOUTIQUE' | 'ENTREPOT';

export interface BoutiqueWithStaff extends BoutiqueItem {
  personnel: UtilisateurItem[];
  nbArticlesStock: number;
}
