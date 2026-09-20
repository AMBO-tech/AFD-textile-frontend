import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Clock,
  CreditCard,
  Warehouse,
  BarChart2,
  BarChart3,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useDashboardKpis } from '@/hooks/useDashboard'
import { useStockAlerts } from '@/hooks/useStocks'
import { useLocationStore } from '@/stores/locationStore'
import { useAuthStore } from '@/stores/authStore'
import { StockLocator } from '@/components/inventory/StockLocator'
import { TransferRequestModal } from '@/components/inventory/TransferRequestModal'
import type { StockLevel } from '@/types/api'

const VENTES_SEMAINE_DATA = [
  { jour: 'Lun', montant: 1100000 },
  { jour: 'Mar', montant: 1450000 },
  { jour: 'Mer', montant: 950000 },
  { jour: 'Jeu', montant: 1800000 },
  { jour: 'Ven', montant: 2100000 },
  { jour: 'Sam', montant: 2600000 },
  { jour: 'Dim', montant: 1250000 },
]

const TOP_PRODUITS_DATA = [
  { nom: 'Bazin Getzner', ventes: 84 },
  { nom: 'Soie Satinée', ventes: 62 },
  { nom: 'Dentelle Guipure', ventes: 45 },
  { nom: 'Coton Voile Brodé', ventes: 38 },
  { nom: 'Wax Vlisco', ventes: 29 },
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { currentLocation } = useLocationStore()
  const { user } = useAuthStore()
  const { data: kpis } = useDashboardKpis(currentLocation.id)
  const { data: alerts } = useStockAlerts(currentLocation.id)

  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState<StockLevel | null>(null)

  const alertesCount = alerts?.length ?? 3
  const caJour = kpis?.caJour ?? 1250000
  const caSemaine = kpis?.caSemaine ?? 8450000
  const stockTotal = kpis?.stockTotal ?? 18400
  const creancesTotal = kpis?.creancesTotal ?? 1620000

  const stats = [
    {
      label: 'CA du jour',
      value: `${caJour.toLocaleString('fr-FR')} FCFA`,
      icon: TrendingUp,
      color: '#1E88E5',
      bg: '#EBF5FB',
      hasPulse: false,
    },
    {
      label: 'CA semaine',
      value: `${caSemaine.toLocaleString('fr-FR')} FCFA`,
      icon: BarChart2,
      color: '#0F3D5E',
      bg: '#EBF0F5',
      hasPulse: false,
    },
    {
      label: 'Ventes totales',
      value: '48',
      icon: ShoppingBag,
      color: '#22C55E',
      bg: '#F0FDF4',
      hasPulse: false,
    },
    {
      label: 'Produits en stock',
      value: `${stockTotal.toLocaleString('fr-FR')} m`,
      icon: Package,
      color: '#1E88E5',
      bg: '#EBF5FB',
      hasPulse: false,
    },
    {
      label: 'Alertes stock',
      value: alertesCount.toString(),
      icon: AlertTriangle,
      color: '#EF4444',
      bg: '#FEF2F2',
      hasPulse: alertesCount > 0,
    },
    {
      label: 'Créances clients',
      value: `${creancesTotal.toLocaleString('fr-FR')} FCFA`,
      icon: CreditCard,
      color: '#F59E0B',
      bg: '#FFFBEB',
      hasPulse: false,
    },
    {
      label: 'Demandes en attente',
      value: '4',
      icon: Clock,
      color: '#F59E0B',
      bg: '#FFFBEB',
      hasPulse: true,
    },
    {
      label: 'Stock entrepôt',
      value: '12 400 m',
      icon: Warehouse,
      color: '#0F3D5E',
      bg: '#EBF0F5',
      hasPulse: false,
    },
  ]

  return (
    <div className="p-6 bg-[#F8FAFC] space-y-6 font-['Inter',sans-serif] rounded-2xl">
      {/* Header Dashboard Poppins Bold */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Poppins',sans-serif] text-2xl font-bold text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Supervision consolidée AFD Textile • {currentLocation.nom}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/inventaire')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer transition-all"
        >
          <BarChart3 size={15} className="text-[#1E88E5]" />
          <span>Rapports & Stocks</span>
        </button>
      </div>

      {/* Grille 4 cols gap-4 cards rounded-xl border shadow */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 transition-all hover:border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.bg }}
                >
                  <Icon size={18} color={stat.color} />
                </div>
                {stat.hasPulse && (
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{ background: stat.color }}
                  />
                )}
              </div>
              <div className="font-['Poppins',sans-serif] font-bold text-gray-900 text-lg leading-tight truncate">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Grille 2 cols evolution + produits plus vendus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Évolution des ventes (semaine) */}
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-gray-800 text-sm mb-4">
            Évolution des ventes (semaine)
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VENTES_SEMAINE_DATA}>
                <defs>
                  <linearGradient id="ventesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="jour"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toLocaleString('fr-FR')} FCFA`, 'Ventes']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#1E88E5"
                  strokeWidth={2.5}
                  fill="url(#ventesGrad)"
                  dot={{ fill: '#1E88E5', r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
          <h3 className="font-['Poppins',sans-serif] font-semibold text-gray-800 text-sm mb-4">
            Produits les plus vendus
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PRODUITS_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nom"
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v)} mètres`, 'Volume']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="ventes" fill="#0F3D5E" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Smart Stock Locator */}
      <StockLocator onSelectForTransfer={(item) => setSelectedItemForTransfer(item)} />

      {/* Modal de transfert */}
      <TransferRequestModal
        item={selectedItemForTransfer}
        isOpen={Boolean(selectedItemForTransfer)}
        onClose={() => setSelectedItemForTransfer(null)}
      />
    </div>
  )
}

export default Dashboard
