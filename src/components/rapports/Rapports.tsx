import React, { useState, useMemo } from 'react';
import { Download, BarChart2 } from 'lucide-react';
import type { Periode, PeriodeOption } from './types';
import RapportsKpiCards from './RapportsKpiCards';
import RapportsSalesBarChart from './RapportsSalesBarChart';
import RapportsCategoryPieChart from './RapportsCategoryPieChart';
import BoutiqueSelector from '../sales/BoutiqueSelector';
import { useMockStore } from '../../data/useMockStore';
import { soldeClient } from '../clients/types';

const PERIODES: PeriodeOption[] = [
  { id: 'jour', label: 'Jour' },
  { id: 'semaine', label: 'Semaine' },
  { id: 'mois', label: 'Mois' },
  { id: 'annee', label: 'Année' },
];

export const Rapports: React.FC = () => {
  const { boutiques, ventes, clients } = useMockStore();
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string>('tous');
  const [periode, setPeriode] = useState<Periode>('semaine');

  // Métriques KPI dynamiques selon la boutique sélectionnée
  const kpiData = useMemo(() => {
    const vFiltered =
      selectedBoutiqueId === 'tous'
        ? ventes
        : ventes.filter((v) => v.boutique === selectedBoutiqueId);

    const validSales = vFiltered.filter((v) => v.statut === 'validée');
    const totalCa = validSales.reduce((acc, v) => acc + v.montant, 0);

    const cFiltered =
      selectedBoutiqueId === 'tous'
        ? clients
        : clients.filter((c) => c.boutique === selectedBoutiqueId || c.boutiqueId === selectedBoutiqueId);

    const totalCreances = cFiltered.reduce((acc, c) => acc + soldeClient(c), 0);
    const benefice = Math.round(totalCa * 0.28); // Marge commerciale moyenne textile ~28%

    return {
      ca: totalCa > 0 ? totalCa : 1678000,
      benefice: totalCa > 0 ? benefice : 420000,
      creances: totalCreances > 0 ? totalCreances : 577500,
    };
  }, [selectedBoutiqueId, ventes, clients]);

  return (
    <div className="space-y-4">
      {/* En-tête avec titre, sélecteur de boutique et export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart2 size={18} />
            </div>
            <h1 className="font-display text-xl font-bold text-gray-900">Rapports & Statistiques</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chiffre d&apos;affaires, marges bénéficiaires et ventilation des ventes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <BoutiqueSelector
            boutiques={boutiques.filter((b) => b.type === 'BOUTIQUE')}
            selectedId={selectedBoutiqueId}
            allowAll={true}
            onSelect={setSelectedBoutiqueId}
          />
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            <Download size={14} />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Période */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {PERIODES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriode(p.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: periode === p.id ? 'white' : 'transparent',
              color: periode === p.id ? '#0F3D5E' : '#6b7280',
              boxShadow: periode === p.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI cards dynamiques */}
      <RapportsKpiCards
        ca={kpiData.ca}
        benefice={kpiData.benefice}
        creances={kpiData.creances}
      />

      {/* CA Chart */}
      <RapportsSalesBarChart periode={periode} />

      {/* Pie */}
      <RapportsCategoryPieChart />
    </div>
  );
};

export default Rapports;
