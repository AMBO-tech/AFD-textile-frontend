import type { StockLevel } from '../../types/stocks';

/**
 * Calculs du point de vente, alignés sur le backend (common/sale-units.ts + CreateSaleUseCase) :
 * le serveur reste l'autorité, ces valeurs servent à afficher le même montant que celui facturé.
 */

export type UniteVente = 'METRE' | 'YARD' | 'KG' | 'ROULEAU';

export const LIBELLES_UNITE: Record<UniteVente, string> = {
  METRE: 'mètre',
  YARD: 'yard',
  KG: 'kilo',
  ROULEAU: 'rouleau',
};

const METRES_PAR_YARD = 0.9144;

/** Produit tel qu'affiché au POS : une ligne de stock de la boutique active. */
export interface PosProduit {
  id: string;
  produitId: string;
  locationId: string;
  nom: string;
  reference: string;
  photo: string;
  categorieId: string;
  /** Prix de vente par unité de stock (prix boutique, sinon prix indicatif). */
  prix: number;
  unite: UniteVente;
  quantite: number;
  poidsAuMetreKg: number | null;
  longueurRouleauMetres: number | null;
}

export interface LigneVente {
  produit: PosProduit;
  qte: number;
  unite: UniteVente;
  remise: number;
}

export const toPosProduit = (stock: StockLevel): PosProduit => ({
  id: stock.id,
  produitId: stock.produitId,
  locationId: stock.locationId,
  nom: stock.produitNom,
  reference: stock.produitReference,
  photo: stock.produitPhotoUrl,
  categorieId: stock.categorieId ?? '',
  prix: stock.prixEffectif ?? 0,
  unite: stock.uniteStockage,
  quantite: stock.quantite,
  poidsAuMetreKg: stock.poidsAuMetreKg ?? null,
  longueurRouleauMetres: stock.longueurRouleauMetres ?? null,
});

const round = (valeur: number, decimales: number) => {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
};

const versMetres = (qte: number, unite: UniteVente, p: PosProduit): number | null => {
  switch (unite) {
    case 'METRE':
      return qte;
    case 'YARD':
      return qte * METRES_PAR_YARD;
    case 'KG':
      return p.poidsAuMetreKg ? qte / p.poidsAuMetreKg : null;
    case 'ROULEAU':
      return p.longueurRouleauMetres ? qte * p.longueurRouleauMetres : null;
  }
};

/** Quantité de stock correspondant à 1 unité saisie (non arrondie), ou null si non convertible. */
const facteurVersStock = (unite: UniteVente, p: PosProduit): number | null => {
  if (unite === p.unite) return 1;
  const metres = versMetres(1, unite, p);
  if (metres === null) return null;
  switch (p.unite) {
    case 'METRE':
      return metres;
    case 'KG':
      return p.poidsAuMetreKg ? metres * p.poidsAuMetreKg : null;
    case 'ROULEAU':
      return p.longueurRouleauMetres ? metres / p.longueurRouleauMetres : null;
    default:
      return null;
  }
};

/** Quantité déstockée (unité de stock du produit, 3 décimales), ou null si la conversion est impossible. */
export const quantiteEnStock = (qte: number, unite: UniteVente, p: PosProduit): number | null => {
  const facteur = facteurVersStock(unite, p);
  return facteur === null ? null : round(qte * facteur, 3);
};

/** Unités proposables pour ce tissu (celles que le serveur saura convertir). */
export const unitesDisponibles = (p: PosProduit): UniteVente[] =>
  (Object.keys(LIBELLES_UNITE) as UniteVente[]).filter(
    (unite) => quantiteEnStock(1, unite, p) !== null,
  );

/** Prix d'une unité saisie (ex. prix d'un yard pour un tissu stocké au mètre). */
export const prixParUnite = (unite: UniteVente, p: PosProduit): number =>
  round((facteurVersStock(unite, p) ?? 0) * p.prix, 2);

export const montantsLigne = (l: LigneVente) => {
  const brut = round((quantiteEnStock(l.qte, l.unite, l.produit) ?? 0) * l.produit.prix, 2);
  const remise = Math.min(Math.max(l.remise, 0), brut);
  return { brut, remise, net: round(brut - remise, 2) };
};

export const totalPanier = (lignes: LigneVente[]) =>
  round(
    lignes.reduce((total, l) => total + montantsLigne(l).net, 0),
    2,
  );
