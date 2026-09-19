import React, { useState } from 'react';
import { Download } from 'lucide-react';
import type { Periode, PeriodeOption } from './types';
import RapportsKpiCards from './RapportsKpiCards';
import RapportsSalesBarChart from './RapportsSalesBarChart';
import RapportsCategoryPieChart from './RapportsCategoryPieChart';

const PERIODES: PeriodeOption[] = [
  { id: 'jour', label: 'Jour' },
  { id: 'semaine', label: 'Semaine' },
  { id: 'mois', label: 'Mois' },
  { id: 'annee', label: 'Année' },
];

export const Rapports: React.FC = () => {
  const [periode, setPeriode] = useState<Periode>('semaine');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Rapports</h1>
          <p className="text-sm text-gray-500">Toutes boutiques confondues</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Download size={14} /> Exporter
        </button>
      </div>

      {/* Période */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {PERIODES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriode(p.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: periode === p.id ? 'white' : 'transparent',
              color: periode === p.id ? '#0F3D5E' : '#9ca3af',
              boxShadow: periode === p.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <RapportsKpiCards />

      {/* CA Chart */}
      <RapportsSalesBarChart periode={periode} />

      {/* Pie */}
      <RapportsCategoryPieChart />
    </div>
  );
};

export default Rapports;
