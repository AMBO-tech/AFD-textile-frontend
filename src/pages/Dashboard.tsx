import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Package, CreditCard, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/StatCard'
import { NetworkStatus } from '@/components/dashboard/NetworkStatus'
import { CriticalAlerts } from '@/components/dashboard/CriticalAlerts'
import { StockLocator } from '@/components/inventory/StockLocator'
import { TransferRequestModal } from '@/components/inventory/TransferRequestModal'
import { useDashboardKpis } from '@/hooks/useDashboard'
import { useStockAlerts } from '@/hooks/useStocks'
import { useLocationStore } from '@/stores/locationStore'
import type { StockLevel } from '@/types/api'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { currentLocation } = useLocationStore()
  const { data: kpis } = useDashboardKpis(currentLocation.id)
  const { data: alerts, isLoading: loadingAlerts } = useStockAlerts(currentLocation.id)

  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState<StockLevel | null>(null)

  return (
    <div className="space-y-6 pb-8 font-inter">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-poppins font-bold text-[24px] text-[#0F3D5E] leading-tight">
              Cockpit Exécutif AFD Textile
            </h1>
            <Badge className="bg-[#0F3D5E] text-white text-[11px] font-semibold gap-1 rounded-full px-3 py-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Réseau Connecté
            </Badge>
          </div>
          <p className="font-inter text-[14px] text-gray-500 mt-1">
            Supervision consolidée des encaissements, stocks disponibles et créances en souffrance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/ventes')}
            className="bg-success hover:bg-success/90 text-white rounded-xl h-11 px-5 text-xs font-semibold gap-2 shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Nouvelle Vente
          </Button>

          <Button
            onClick={() => navigate('/inventaire')}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl h-11 px-5 text-xs font-semibold gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4 text-[#1E88E5]" />
            Inventaire
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Chiffre d'Affaires Jour"
          valeur={`${(kpis?.caJour ?? 1250000).toLocaleString('fr-FR')} FCFA`}
          subtext="Ventes validées en boutique"
          icon={TrendingUp}
          colorBg="bg-emerald-50"
          colorText="text-emerald-600"
          trend="+14.2%"
        />

        <StatCard
          label="Chiffre d'Affaires Semaine"
          valeur={`${(kpis?.caSemaine ?? 8450000).toLocaleString('fr-FR')} FCFA`}
          subtext="7 derniers jours glissants"
          icon={ShoppingBag}
          colorBg="bg-blue-50"
          colorText="text-blue-600"
        />

        <StatCard
          label="Stock Réseau Disponible"
          valeur={`${(kpis?.stockTotal ?? 18400).toLocaleString('fr-FR')} m`}
          subtext="Toutes boutiques & entrepôt"
          icon={Package}
          colorBg="bg-amber-50"
          colorText="text-amber-600"
          onClick={() => navigate('/inventaire')}
        />

        <StatCard
          label="Créances Clients Dues"
          valeur={`${(kpis?.creancesTotal ?? 1620000).toLocaleString('fr-FR')} FCFA`}
          subtext="À recouvrer urgemment"
          icon={CreditCard}
          colorBg="bg-red-50"
          colorText="text-red-600"
          onClick={() => navigate('/clients')}
        />
      </div>

      {/* Smart Stock Locator */}
      <StockLocator onSelectForTransfer={(item) => setSelectedItemForTransfer(item)} />

      {/* 2 Columns: Critical Stock Alerts & Network Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CriticalAlerts
            alerts={alerts || []}
            isLoading={loadingAlerts}
            onRequestReassort={(item) => setSelectedItemForTransfer(item)}
            onViewAll={() => navigate('/inventaire')}
          />
        </div>

        <div className="lg:col-span-5">
          <NetworkStatus />
        </div>
      </div>

      {/* Transfer Request Modal */}
      <TransferRequestModal
        item={selectedItemForTransfer}
        isOpen={Boolean(selectedItemForTransfer)}
        onClose={() => setSelectedItemForTransfer(null)}
      />
    </div>
  )
}

export default Dashboard
