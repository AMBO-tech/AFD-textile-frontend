import { useState } from 'react';
import { BarChart3, Download, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useDashboardKpis } from '../hooks/useDashboard';
import { useLocationStore } from '../stores/locationStore';

type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

const DATA_JOUR = [
  { label: '08h', montant: 120000 },
  { label: '10h', montant: 280000 },
  { label: '12h', montant: 450000 },
  { label: '14h', montant: 310000 },
  { label: '16h', montant: 580000 },
  { label: '18h', montant: 420000 },
  { label: '20h', montant: 190000 },
];

const DATA_SEMAINE = [
  { label: 'Lun', montant: 420000 },
  { label: 'Mar', montant: 680000 },
  { label: 'Mer', montant: 510000 },
  { label: 'Jeu', montant: 790000 },
  { label: 'Ven', montant: 950000 },
  { label: 'Sam', montant: 1240000 },
  { label: 'Dim', montant: 380000 },
];

const DATA_MOIS = [
  { label: 'Jan', montant: 3200000 },
  { label: 'Fév', montant: 2800000 },
  { label: 'Mar', montant: 4100000 },
  { label: 'Avr', montant: 3700000 },
  { label: 'Mai', montant: 4500000 },
  { label: 'Juin', montant: 3900000 },
  { label: 'Juil', montant: 5200000 },
  { label: 'Août', montant: 4800000 },
  { label: 'Sep', montant: 3100000 },
];

const PIE_DATA = [
  { name: 'Wax Hollandais', value: 38, color: '#1E88E5' },
  { name: 'Bazin Riche', value: 24, color: '#0F3D5E' },
  { name: 'Ankara Fancy', value: 18, color: '#22C55E' },
  { name: 'Satin & Soie', value: 12, color: '#F59E0B' },
  { name: 'Autres tissus', value: 8, color: '#9ca3af' },
];

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' F CFA';
}

export default function Rapports() {
  const { currentStore } = useLocationStore();
  const { data: kpisData } = useDashboardKpis(currentStore?.id);
  const [periode, setPeriode] = useState<Periode>('semaine');

  const PERIODES: { id: Periode; label: string }[] = [
    { id: 'jour', label: 'Jour' },
    { id: 'semaine', label: 'Semaine' },
    { id: 'mois', label: 'Mois' },
    { id: 'annee', label: 'Année' },
  ];

  const caTotal = kpisData?.caSemaine ?? 4970000;
  const creancesTotal = kpisData?.creancesTotal ?? 577500;
  const benefice = Math.round(caTotal * 0.28);

  const kpis = [
    {
      label: 'Chiffre d\'affaires',
      value: formatMontant(caTotal),
      icon: TrendingUp,
      color: '#1E88E5',
      bg: '#EBF5FB',
      delta: '+12%',
      positive: true
    },
    {
      label: 'Bénéfice estimé (28%)',
      value: formatMontant(benefice),
      icon: TrendingUp,
      color: '#0F3D5E',
      bg: '#EBF0F5',
      delta: '+5%',
      positive: true
    },
    {
      label: 'Créances en cours',
      value: formatMontant(creancesTotal),
      icon: CreditCard,
      color: '#EF4444',
      bg: '#FEF2F2',
      delta: '-3%',
      positive: false
    },
  ];

  const getChartData = () => {
    switch (periode) {
      case 'jour': return DATA_JOUR;
      case 'semaine': return DATA_SEMAINE;
      case 'mois':
      case 'annee': return DATA_MOIS;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Rapports & Performance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyse des ventes, bénéfices et répartition du catalogue
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={15} /> Exporter en PDF
          </button>
        </div>
      </div>

      {/* Sélecteur Période */}
      <div className="flex gap-1.5 bg-gray-200/70 p-1.5 rounded-2xl max-w-md">
        {PERIODES.map(p => (
          <button
            key={p.id}
            onClick={() => setPeriode(p.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: periode === p.id ? 'white' : 'transparent',
              color: periode === p.id ? '#0F3D5E' : '#6B7280',
              boxShadow: periode === p.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                  <Icon size={18} color={k.color} />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    k.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {k.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {k.delta}
                </span>
              </div>
              <div className="font-display font-bold text-xl text-gray-900 leading-tight">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* CA Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-gray-800 text-base">
              Chiffre d'affaires par {periode === 'jour' ? 'tranche horaire' : periode === 'semaine' ? 'jour' : 'mois'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Progression des flux d'encaissement</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('Export Excel en préparation')}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-colors font-medium"
            >
              <Download size={13} /> Excel
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000) + 'k'} />
            <Tooltip
              formatter={(v) => [formatMontant(Number(v)), 'CA']}
              contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            />
            <Bar dataKey="montant" fill="#1E88E5" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-bold text-gray-800 text-base mb-1">Répartition des ventes par catégorie</h3>
        <p className="text-xs text-gray-400 mb-4">Pourcentage du volume global commercialisé</p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={80} innerRadius={42} dataKey="value" stroke="none">
              {PIE_DATA.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 12, color: '#4b5563', marginRight: 12 }}>{v}</span>} />
            <Tooltip formatter={(v) => [Number(v) + '%', 'Part']} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
