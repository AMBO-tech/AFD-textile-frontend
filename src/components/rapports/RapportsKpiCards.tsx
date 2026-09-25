import React from 'react';
import { TrendingUp, TrendingDown, Minus, Receipt, Wallet, HandCoins, Percent, ShoppingBag, Ruler, Boxes, Scale } from 'lucide-react';
import type { KpisRapport } from '@/services/reports.service';
import { formatMontant } from '@/utils/format';
import { cn } from '@/lib/utils';
import { nombre, pourcent } from './types';

interface Kpi {
  label: string;
  valeur: string;
  icon: typeof Receipt;
  teinte: string;
  variation?: number;
  aide?: string;
}

const Variation: React.FC<{ v?: number }> = ({ v }) => {
  if (v === undefined) return null;
  const Icone = v > 0 ? TrendingUp : v < 0 ? TrendingDown : Minus;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-bold', v > 0 ? 'text-emerald-600' : v < 0 ? 'text-rose-600' : 'text-gray-400')}>
      <Icone size={12} /> {v > 0 ? '+' : ''}
      {pourcent(v)}
    </span>
  );
};

/** Indicateurs de la période, avec l'évolution par rapport à la période précédente de même durée. */
export const RapportsKpiCards: React.FC<{ kpis: KpisRapport }> = ({ kpis }) => {
  const cartes: Kpi[] = [
    { label: 'Chiffre d’affaires', valeur: formatMontant(kpis.caFactureNet), icon: Receipt, teinte: 'bg-blue-50 text-blue-700', variation: kpis.variationCaFactureNetPct, aide: 'Ventes confirmées, remises déduites' },
    { label: 'Encaissé', valeur: formatMontant(kpis.caEncaisse), icon: Wallet, teinte: 'bg-emerald-50 text-emerald-700', variation: kpis.variationCaEncaissePct, aide: 'Paiements reçus sur la période' },
    { label: 'Créances en attente', valeur: formatMontant(kpis.soldeCreancesEnAttente), icon: HandCoins, teinte: 'bg-violet-50 text-violet-700', aide: 'Reste dû des ventes de la période' },
    { label: 'Taux de recouvrement', valeur: pourcent(kpis.tauxRecouvrementPct), icon: Percent, teinte: 'bg-amber-50 text-amber-700', aide: 'Encaissé / facturé' },
    { label: 'Ventes', valeur: nombre(kpis.nombreVentes), icon: ShoppingBag, teinte: 'bg-sky-50 text-sky-700', variation: kpis.variationNombreVentesPct },
    { label: 'Panier moyen', valeur: formatMontant(kpis.panierMoyen), icon: Scale, teinte: 'bg-indigo-50 text-indigo-700', variation: kpis.variationPanierMoyenPct },
    { label: 'Métrage vendu', valeur: `${nombre(kpis.metresLineairesVendus)} m`, icon: Ruler, teinte: 'bg-cyan-50 text-cyan-700', aide: kpis.rouleauxVendus ? `dont ${nombre(kpis.rouleauxVendus)} rouleau(x)` : undefined },
    { label: 'Valeur du stock', valeur: formatMontant(kpis.valeurStockDisponible), icon: Boxes, teinte: 'bg-slate-100 text-slate-700', aide: 'Au prix de vente, aujourd’hui' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cartes.map((c) => {
        const Icone = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs break-inside-avoid">
            <div className="flex items-center justify-between gap-2">
              <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center', c.teinte)}>
                <Icone size={16} />
              </span>
              <Variation v={c.variation} />
            </div>
            <div className="mt-2 text-[11px] text-gray-500">{c.label}</div>
            <div className="font-display font-extrabold text-gray-900 text-base sm:text-lg leading-tight break-words">{c.valeur}</div>
            {c.aide && <div className="text-[10px] text-gray-400 mt-0.5">{c.aide}</div>}
          </div>
        );
      })}
    </div>
  );
};

export default RapportsKpiCards;
