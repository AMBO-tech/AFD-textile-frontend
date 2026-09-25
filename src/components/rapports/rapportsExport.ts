import type {
  BoutiqueRapport,
  CategorieRapport,
  CreancesRapport,
  KpisRapport,
  StockRapport,
  TendanceRapport,
  TissuRapport,
} from '@/services/reports.service';

export interface DonneesRapport {
  kpis: KpisRapport;
  tendance?: TendanceRapport;
  tissus?: TissuRapport[];
  categories?: CategorieRapport[];
  boutiques?: BoutiqueRapport[];
  creances?: CreancesRapport;
  stock?: StockRapport;
}

export interface EnteteRapport {
  periode: string;
  perimetre: string;
}

type Cellule = string | number | null | undefined;

/** Excel français : séparateur « ; », décimales à virgule, guillemets doublés. */
const cellule = (v: Cellule): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(Math.round(v * 100) / 100).replace('.', ',') : '';
  return /[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

const ligne = (...cellules: Cellule[]) => cellules.map(cellule).join(';');

const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-SN');

/** Rapport complet en CSV (une section par bloc, séparées par une ligne vide). */
export function rapportEnCsv(d: DonneesRapport, entete: EnteteRapport): string {
  const k = d.kpis;
  const blocs: string[][] = [
    [
      ligne('Rapport AFD Textile'),
      ligne('Période', `${entete.periode} (${dateCourte(k.periode.dateDebut)} au ${dateCourte(k.periode.dateFin)})`),
      ligne('Périmètre', entete.perimetre),
      ligne('Comparée à', k.periodePrecedente.label),
      ligne('Généré le', new Date().toLocaleString('fr-SN')),
    ],
    [
      ligne('INDICATEURS', 'Valeur', 'Évolution vs période précédente (%)'),
      ligne('Chiffre d’affaires facturé (F CFA)', k.caFactureNet, k.variationCaFactureNetPct),
      ligne('Encaissé (F CFA)', k.caEncaisse, k.variationCaEncaissePct),
      ligne('Créances en attente (F CFA)', k.soldeCreancesEnAttente),
      ligne('Taux de recouvrement (%)', k.tauxRecouvrementPct),
      ligne('Nombre de ventes', k.nombreVentes, k.variationNombreVentesPct),
      ligne('Panier moyen (F CFA)', k.panierMoyen, k.variationPanierMoyenPct),
      ligne('Mètres vendus', k.metresLineairesVendus),
      ligne('Rouleaux vendus', k.rouleauxVendus),
      ligne('Valeur du stock (F CFA)', k.valeurStockDisponible),
    ],
  ];
  if (d.tendance?.points.length) {
    blocs.push([
      ligne('ÉVOLUTION', 'Facturé (F CFA)', 'Encaissé (F CFA)', 'Crédit (F CFA)', 'Ventes', 'Mètres vendus'),
      ...d.tendance.points.map((p) => ligne(p.label, p.caFacture, p.caEncaisse, p.soldeCredit, p.nombreVentes, p.metresVendus)),
    ]);
  }
  if (d.boutiques?.length) {
    blocs.push([
      ligne('BOUTIQUES', 'Chiffre d’affaires (F CFA)', 'Encaissé (F CFA)', 'Créances (F CFA)', 'Ventes', 'Panier moyen (F CFA)', 'Part du réseau (%)', 'Mètres vendus'),
      ...d.boutiques.map((b) => ligne(b.boutiqueNom, b.chiffreAffaires, b.montantEncaisse, b.soldeCreances, b.nombreVentes, b.panierMoyen, b.partCaPourcentage, b.metresVendus)),
    ]);
  }
  if (d.tissus?.length) {
    blocs.push([
      ligne('TISSUS LES PLUS VENDUS', 'Référence', 'Catégorie', 'Chiffre d’affaires (F CFA)', 'Quantité', 'Unité', 'Ventes', 'Part (%)'),
      ...d.tissus.map((t) => ligne(t.produitNom, t.produitReference, t.categorieNom, t.chiffreAffaires, t.quantiteVendue, t.unitePrincipale, t.nombreVentes, t.partCaPourcentage)),
    ]);
  }
  if (d.categories?.length) {
    blocs.push([
      ligne('CATÉGORIES', 'Chiffre d’affaires (F CFA)', 'Part (%)', 'Mètres vendus', 'Lignes de vente'),
      ...d.categories.map((c) => ligne(c.categorieNom, c.chiffreAffaires, c.partCaPourcentage, c.metresVendus, c.nombreLignesVente)),
    ]);
  }
  if (d.creances) {
    const c = d.creances;
    blocs.push([
      ligne('CRÉANCES (au jour de l’export)', 'Montant (F CFA)', 'Part (%)', 'Factures'),
      ligne('Moins de 30 jours', c.moinsDe30Jours.montant, c.moinsDe30Jours.pourcentage, c.moinsDe30Jours.nombreFactures),
      ligne('31 à 60 jours', c.entre31Et60Jours.montant, c.entre31Et60Jours.pourcentage, c.entre31Et60Jours.nombreFactures),
      ligne('61 à 90 jours', c.entre61Et90Jours.montant, c.entre61Et90Jours.pourcentage, c.entre61Et90Jours.nombreFactures),
      ligne('Plus de 90 jours', c.plusDe90Jours.montant, c.plusDe90Jours.pourcentage, c.plusDe90Jours.nombreFactures),
      ligne('Total', c.totalCreancesGlobal),
    ]);
    if (c.topDebiteurs.length) {
      blocs.push([
        ligne('PRINCIPAUX DÉBITEURS', 'Téléphone', 'Reste dû (F CFA)', 'Factures impayées', 'Ancienneté max (jours)'),
        ...c.topDebiteurs.map((x) => ligne(x.clientNom, x.clientTelephone, x.totalDu, x.nombreFacturesImpayees, x.joursAncienneteMax)),
      ]);
    }
  }
  if (d.stock) {
    const s = d.stock;
    blocs.push([
      ligne('STOCK (au jour de l’export)', 'Valeur'),
      ligne('Valeur totale (F CFA)', s.valeurTotaleStock),
      ligne('Lignes de stock', s.nombreTotalReferences),
      ligne('Ruptures', s.nombreRuptures),
      ligne('Stock bas', s.nombreStockBas),
    ]);
    if (s.produitsEnAlerte.length) {
      blocs.push([
        ligne('À RÉAPPROVISIONNER', 'Référence', 'Emplacement', 'Quantité', 'Seuil', 'Unité', 'État'),
        ...s.produitsEnAlerte.map((p) => ligne(p.produitNom, p.produitReference, p.boutiqueNom, p.quantiteActuelle, p.seuilAlerte, p.unite, p.statutAlerte === 'RUPTURE' ? 'Rupture' : 'Stock bas')),
      ]);
    }
  }
  return blocs.map((b) => b.join('\r\n')).join('\r\n\r\n');
}

/** Nom de fichier lisible : rapport-afd_ce-mois_boutique-dakar_2026-09-25.csv */
export const nomFichier = (entete: EnteteRapport) => {
  const slug = (t: string) =>
    t
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  return `rapport-afd_${slug(entete.periode)}_${slug(entete.perimetre)}_${new Date().toISOString().slice(0, 10)}.csv`;
};

/** Télécharge le texte comme fichier ; le BOM UTF-8 fait ouvrir les accents correctement par Excel. */
export function telecharger(nom: string, contenu: string): void {
  const url = URL.createObjectURL(new Blob(['﻿', contenu], { type: 'text/csv;charset=utf-8' }));
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nom;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
