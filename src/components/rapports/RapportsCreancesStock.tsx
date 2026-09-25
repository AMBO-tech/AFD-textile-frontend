import React from 'react';
import { AlertTriangle, PackageX, Moon, CheckCircle2 } from 'lucide-react';
import type { CreancesRapport, StockRapport } from '@/services/reports.service';
import { formatMontant } from '@/utils/format';
import { cn } from '@/lib/utils';
import { CARTE, nombre } from './types';

const TRANCHES: { cle: keyof Pick<CreancesRapport, 'moinsDe30Jours' | 'entre31Et60Jours' | 'entre61Et90Jours' | 'plusDe90Jours'>; label: string; couleur: string }[] = [
  { cle: 'moinsDe30Jours', label: 'Moins de 30 jours', couleur: 'bg-emerald-500' },
  { cle: 'entre31Et60Jours', label: '31 à 60 jours', couleur: 'bg-amber-400' },
  { cle: 'entre61Et90Jours', label: '61 à 90 jours', couleur: 'bg-orange-500' },
  { cle: 'plusDe90Jours', label: 'Plus de 90 jours', couleur: 'bg-rose-600' },
];

const UNITE: Record<string, string> = { METRE: 'm', YARD: 'yd', KG: 'kg', ROULEAU: 'rl' };

/** Créances par ancienneté et principaux débiteurs ; santé du stock (état actuel, hors période). */
export const RapportsCreancesStock: React.FC<{ creances: CreancesRapport; stock: StockRapport }> = ({ creances, stock }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className={CARTE}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display font-bold text-gray-900 text-base">Créances clients</h2>
        <span className="font-display font-extrabold text-violet-800">{formatMontant(creances.totalCreancesGlobal)}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">Reste dû aujourd’hui, par ancienneté de la facture</p>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
        {TRANCHES.map((t) => (
          <div key={t.cle} className={t.couleur} style={{ width: `${creances[t.cle].pourcentage}%` }} title={t.label} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {TRANCHES.map((t) => (
          <div key={t.cle} className="flex items-start gap-2 text-xs">
            <span className={cn('w-2.5 h-2.5 rounded-full mt-1 shrink-0', t.couleur)} />
            <div>
              <div className="text-gray-500">{t.label}</div>
              <div className="font-semibold text-gray-900">
                {formatMontant(creances[t.cle].montant)} <span className="font-normal text-gray-400">• {creances[t.cle].nombreFactures} fact.</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Principaux débiteurs</h3>
      {creances.topDebiteurs.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune créance en cours.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {creances.topDebiteurs.map((d) => (
            <li key={d.clientId} className="py-2 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{d.clientNom}</div>
                <div className="text-[11px] text-gray-400">
                  {d.clientTelephone} • {d.nombreFacturesImpayees} facture{d.nombreFacturesImpayees > 1 ? 's' : ''} • {d.joursAncienneteMax} j
                </div>
              </div>
              <span className="font-bold text-violet-800 whitespace-nowrap">{formatMontant(d.totalDu)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className={CARTE}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display font-bold text-gray-900 text-base">Santé du stock</h2>
        <span className="font-display font-extrabold text-gray-900">{formatMontant(stock.valeurTotaleStock)}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">État actuel ({nombre(stock.nombreTotalReferences)} lignes de stock)</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Ruptures', v: stock.nombreRuptures, icon: PackageX, c: 'bg-rose-50 text-rose-700' },
          { label: 'Stock bas', v: stock.nombreStockBas, icon: AlertTriangle, c: 'bg-amber-50 text-amber-700' },
          { label: 'Sains', v: stock.nombreStockSain, icon: CheckCircle2, c: 'bg-emerald-50 text-emerald-700' },
        ].map((b) => {
          const Icone = b.icon;
          return (
            <div key={b.label} className={cn('rounded-xl p-2.5 text-center', b.c)}>
              <Icone size={16} className="mx-auto" />
              <div className="font-display font-extrabold text-lg leading-tight">{nombre(b.v)}</div>
              <div className="text-[10px] font-semibold">{b.label}</div>
            </div>
          );
        })}
      </div>
      <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">À réapprovisionner</h3>
      {stock.produitsEnAlerte.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">Aucun tissu sous son seuil.</p>
      ) : (
        <ul className="divide-y divide-gray-50 mb-3">
          {stock.produitsEnAlerte.slice(0, 8).map((p) => (
            <li key={`${p.produitId}-${p.boutiqueNom}`} className="py-2 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{p.produitNom}</div>
                <div className="text-[11px] text-gray-400 truncate">
                  {p.boutiqueNom} • seuil {nombre(p.seuilAlerte)} {UNITE[p.unite] ?? ''}
                </div>
              </div>
              <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap', p.statutAlerte === 'RUPTURE' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700')}>
                {nombre(p.quantiteActuelle)} {UNITE[p.unite] ?? ''}
              </span>
            </li>
          ))}
        </ul>
      )}
      {stock.produitsDormants.length > 0 && (
        <>
          <h3 className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            <Moon size={12} /> Sans vente depuis longtemps
          </h3>
          <ul className="space-y-1">
            {stock.produitsDormants.slice(0, 5).map((p) => (
              <li key={p.produitId} className="flex justify-between gap-2 text-xs text-gray-600">
                <span className="truncate">{p.produitNom}</span>
                <span className="whitespace-nowrap text-gray-400">
                  {nombre(p.quantiteEnStock)} en stock • {p.joursSansVente} j
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  </div>
);

export default RapportsCreancesStock;
