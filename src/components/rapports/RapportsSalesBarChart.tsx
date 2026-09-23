import { formatMontant } from '@/utils/format';
import React from 'react';
import { Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import type { Periode } from './types';

interface RapportsSalesBarChartProps {
  periode: Periode;
}

const DATA_MOIS = [
  { mois: 'Jan', ca: 3200000 },
  { mois: 'Fév', ca: 2800000 },
  { mois: 'Mar', ca: 4100000 },
  { mois: 'Avr', ca: 3700000 },
  { mois: 'Mai', ca: 4500000 },
  { mois: 'Jun', ca: 3900000 },
  { mois: 'Jul', ca: 5200000 },
  { mois: 'Aoû', ca: 4800000 },
  { mois: 'Sep', ca: 3100000 },
];

export const RapportsSalesBarChart: React.FC<RapportsSalesBarChartProps> = ({ periode }) => {
  const chartData =
    periode === 'annee'
      ? DATA_MOIS
      : VENTES_SEMAINE.map((v: any) => ({ ...v, mois: v.jour, ca: v.montant }));

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-800 text-sm">
          CA par {periode === 'annee' ? 'mois' : 'jour'}
        </h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1">
            <Download size={11} /> PDF
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2 py-1">
            <Download size={11} /> Excel
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={periode === 'annee' ? 'mois' : 'jour'}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: any) => v / 1000 + 'k'}
          />
          <Tooltip
            formatter={(v: any) => [formatMontant(Number(v)), 'CA']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Bar
            dataKey={periode === 'annee' ? 'ca' : 'montant'}
            fill="#1E88E5"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RapportsSalesBarChart;
