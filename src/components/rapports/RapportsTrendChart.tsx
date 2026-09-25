import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TendanceRapport } from '@/services/reports.service';
import { formatMontant } from '@/utils/format';
import { CARTE } from './types';

const PAS: Record<TendanceRapport['granularite'], string> = { JOUR: 'par jour', SEMAINE: 'par semaine', MOIS: 'par mois' };

/** Chiffre d'affaires facturé (barres) et encaissé (courbe) sur la période. */
export const RapportsTrendChart: React.FC<{ tendance: TendanceRapport }> = ({ tendance }) => {
  const vide = tendance.points.every((p) => p.caFacture === 0 && p.caEncaisse === 0);
  return (
    <div className={CARTE}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-base">Évolution du chiffre d’affaires</h2>
          <p className="text-xs text-gray-400">Facturé et encaissé, {PAS[tendance.granularite]}</p>
        </div>
        <div className="text-xs text-gray-500">
          Facturé <b className="text-gray-900">{formatMontant(tendance.totalCaFacture)}</b> • Encaissé{' '}
          <b className="text-emerald-700">{formatMontant(tendance.totalCaEncaisse)}</b>
        </div>
      </div>
      {vide ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">Aucune vente sur cette période.</div>
      ) : (
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={tendance.points} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1_000_000 ? `${v / 1_000_000}M` : v >= 1000 ? `${v / 1000}k` : String(v))}
              />
              <Tooltip
                formatter={(v, nom) => [formatMontant(Number(v) || 0), nom === 'caFacture' ? 'Facturé' : 'Encaissé']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Legend formatter={(v) => (v === 'caFacture' ? 'Facturé' : 'Encaissé')} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="caFacture" fill="#0F3D5E" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Line type="monotone" dataKey="caEncaisse" stroke="#16a34a" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RapportsTrendChart;
