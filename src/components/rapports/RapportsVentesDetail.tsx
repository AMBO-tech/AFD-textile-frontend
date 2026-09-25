import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorieRapport, TissuRapport } from '@/services/reports.service';
import { formatMontant } from '@/utils/format';
import { CARTE, nombre, pourcent } from './types';

const COULEURS = ['#0F3D5E', '#1E88E5', '#16a34a', '#f59e0b', '#db2777', '#7c3aed', '#0891b2', '#ea580c'];

const UNITE: Record<string, string> = { METRE: 'm', YARD: 'yd', KG: 'kg', ROULEAU: 'rl' };

/** Palmarès des tissus et répartition du chiffre d'affaires par catégorie. */
export const RapportsVentesDetail: React.FC<{ tissus: TissuRapport[]; categories: CategorieRapport[] }> = ({ tissus, categories }) => (
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div className={`${CARTE} lg:col-span-3`}>
      <h2 className="font-display font-bold text-gray-900 text-base">Tissus les plus vendus</h2>
      <p className="text-xs text-gray-400 mb-3">Par chiffre d’affaires sur la période</p>
      {tissus.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Aucune vente sur cette période.</p>
      ) : (
        <ol className="space-y-2">
          {tissus.map((t, i) => (
            <li key={t.produitId} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-900 text-sm truncate">{t.produitNom}</span>
                  <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatMontant(t.chiffreAffaires)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, t.partCaPourcentage)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {nombre(t.quantiteVendue)} {UNITE[t.unitePrincipale] ?? ''} • {t.categorieNom} • {pourcent(t.partCaPourcentage)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>

    <div className={`${CARTE} lg:col-span-2`}>
      <h2 className="font-display font-bold text-gray-900 text-base">Par catégorie</h2>
      <p className="text-xs text-gray-400 mb-2">Part du chiffre d’affaires</p>
      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Aucune vente sur cette période.</p>
      ) : (
        <>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categories} dataKey="chiffreAffaires" nameKey="categorieNom" innerRadius="55%" outerRadius="90%" paddingAngle={2}>
                  {categories.map((c, i) => (
                    <Cell key={c.categorieId} fill={COULEURS[i % COULEURS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMontant(Number(v) || 0)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 mt-2">
            {categories.map((c, i) => (
              <li key={c.categorieId} className="flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COULEURS[i % COULEURS.length] }} />
                  <span className="truncate text-gray-700">{c.categorieNom}</span>
                </span>
                <span className="text-gray-500 whitespace-nowrap">
                  {formatMontant(c.chiffreAffaires)} • <b className="text-gray-800">{pourcent(c.partCaPourcentage)}</b>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  </div>
);

export default RapportsVentesDetail;
