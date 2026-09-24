export interface Demande {
  id: string;
  produit: string;
  quantite: number;
  unite?: string;
  boutique_demande: string;
  boutique_source?: string;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'en_transfert' | 'livree';
  priorite: 'haute' | 'moyenne' | 'basse';
  date: string;
  demandeur: string;
}