import type { UniteStockage } from '@/types/enums';

export interface ProductsProps {
  role: string;
}

export const isGerant = (role: string) => role === 'OWNER' || role?.toLowerCase() === 'gerant';

export const UNITES_STOCKAGE: { id: UniteStockage; label: string; aide: string }[] = [
  { id: 'METRE', label: 'Au mètre', aide: 'Stock et vente au mètre (ou au yard).' },
  { id: 'ROULEAU', label: 'Au rouleau', aide: 'Stock en rouleaux ; la longueur d’un rouleau est obligatoire.' },
  { id: 'KG', label: 'Au kilo', aide: 'Stock au poids ; le poids au mètre est obligatoire.' },
];

export const LIBELLE_UNITE_STOCKAGE: Record<UniteStockage, string> = {
  METRE: 'mètre',
  ROULEAU: 'rouleau',
  KG: 'kg',
};

/** Code technique d'une catégorie dérivé de son nom (« Bazin riche » → « BAZIN_RICHE »). */
export const codeCategorie = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 50);
