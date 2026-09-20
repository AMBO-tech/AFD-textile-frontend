import React from 'react'
import { TrendingUp, ShoppingBag, Package, AlertTriangle, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardKpiResponseDto } from '@/types/analytics'

interface QuickMetricsGridProps {
  kpis?: DashboardKpiResponseDto | null
  isLoading?: boolean
  role?: 'gerant' | 'boutiquier' | 'ADMIN' | 'SELLER'
  onNavigate?: (route: string) => void
}

function formatCFA(montant: number | undefined | null): string {
  if (montant === undefined || montant === null) return '0 FCFA'
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export const QuickMetricsGrid: React.FC<QuickMetricsGridProps> = ({
  kpis,
  isLoading = false,
  role = 'gerant',
  onNavigate,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-32 mb-2" />
            <Skeleton className="h-3.5 w-20" />
          </Card>
        ))}
      </div>
    )
  }

  const isManager = role === 'gerant' || role === 'ADMIN'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. CA du Jour */}
      <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,61,94,0.04)] hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              {isManager ? "Chiffre d'affaires jour" : "Mes ventes du jour"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            </div>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">
            {formatCFA(kpis?.caFactureNet ?? 0)}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#22C55E] font-medium mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{kpis?.nombreVentes ?? 0} vente{(kpis?.nombreVentes ?? 0) > 1 ? 's' : ''} validée{(kpis?.nombreVentes ?? 0) > 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. CA Semaine / Encaissements */}
      <Card className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,61,94,0.04)] hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">CA encaissé</span>
            <div className="w-8 h-8 rounded-lg bg-[#1E88E5]/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#1E88E5]" />
            </div>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">
            {formatCFA(kpis?.caEncaisse ?? 0)}
          </div>
          <div className="text-xs text-[#1E88E5] font-medium mt-1">
            Taux recouv. {kpis?.tauxRecouvrementPct ?? 100}%
          </div>
        </CardContent>
      </Card>

      {/* 3. Stock disponible */}
      <Card
        onClick={() => onNavigate?.('stock')}
        className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,61,94,0.04)] hover:border-[#1E88E5]/30 cursor-pointer transition-all"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Stock total</span>
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#F59E0B]" />
            </div>
          </div>
          <div className="font-display font-bold text-slate-900 text-lg sm:text-xl">
            {kpis?.metresLineairesVendus ?? 0} <span className="text-xs font-normal text-slate-500">mètres</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Val. {formatCFA(kpis?.valeurStockDisponible ?? 0)}
          </div>
        </CardContent>
      </Card>

      {/* 4. Créances clients */}
      <Card
        onClick={() => onNavigate?.('clients')}
        className="rounded-2xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,61,94,0.04)] hover:border-[#EF4444]/30 cursor-pointer transition-all"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Créances clients</span>
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#EF4444]" />
            </div>
          </div>
          <div className="font-display font-bold text-[#EF4444] text-lg sm:text-xl">
            {formatCFA(kpis?.soldeCreancesEnAttente ?? 0)}
          </div>
          <div className="text-xs text-[#EF4444] mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>À recouvrer</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
