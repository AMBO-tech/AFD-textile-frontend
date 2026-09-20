import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Package,
  CreditCard,
  Building2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import {
  BoutiqueHeaderSync,
  QuickMetricsGrid,
  MultiLocationStockFinder,
} from '@/components/reorganized'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardKpis, useSalesTrends, useStockHealth } from '@/hooks/useDashboard'
import { useStockAlerts } from '@/hooks/useStocks'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'

export const DashboardReorganizedPage: React.FC = () => {
  const navigate = useNavigate()
  const { currentLocation } = useAppStore()
  const { user } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')

  const { data: kpis, isLoading: isLoadingKpis } = useDashboardKpis({
    boutiqueId: currentLocation?.id,
    periodePredefinie: 'aujourdhui',
  })
  const { data: stockAlerts, isLoading: isLoadingAlerts } = useStockAlerts(currentLocation?.id)
  const { data: stockHealth } = useStockHealth({ boutiqueId: currentLocation?.id })

  const isManager = user?.role === 'ADMIN' || user?.role === 'gerant'

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Live Sync, Boutique Selector & Online Status */}
      <BoutiqueHeaderSync
        onSearchChange={setSearchQuery}
        onOpenNotifications={() => navigate('/notifications')}
        unreadNotifications={3}
      />

      {/* 2. Welcome & Executive Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-slate-900 text-xl sm:text-2xl">
              Cockpit AFD Textile
            </h1>
            <Badge className="bg-[#0F3D5E] text-white hover:bg-[#0F3D5E] text-[11px] font-semibold gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              v2.0 Pro
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion consolidée des flux, stocks boutiques & entrepôt central en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => navigate('/ventes')}
            className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white rounded-xl h-10 px-4 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Nouvelle Vente
          </Button>

          <Button
            onClick={() => navigate('/stock')}
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-10 px-4 text-xs font-semibold gap-1.5"
          >
            <Package className="w-4 h-4 text-[#1E88E5]" />
            Inventaire
          </Button>
        </div>
      </div>

      {/* 3. Reorganized Quick Metrics Grid (Tailwind v4, Poppins, zero-mock) */}
      <QuickMetricsGrid
        kpis={kpis}
        isLoading={isLoadingKpis}
        role={isManager ? 'gerant' : 'boutiquier'}
        onNavigate={(route) => navigate(`/${route}`)}
      />

      {/* 4. Intelligent Cross-Location Stock Finder & Demand Creator */}
      <MultiLocationStockFinder />

      {/* 5. Alerts & Quick Operations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Stock Alerts */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alertes de Réapprovisionnement Critique
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Articles dont le stock est inférieur ou égal au seuil de sécurité
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/stock')}
              className="text-xs text-[#1E88E5] font-semibold gap-1 h-8"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {isLoadingAlerts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : !stockAlerts || stockAlerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="font-medium text-slate-700">Aucune rupture ou stock critique détecté</p>
                <p className="text-slate-400 mt-0.5">Tous les seuils de stock sont dans les normes de sécurité.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stockAlerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{alert.produitNom}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Réf: {alert.produitReference} • Emplacement: {alert.locationNom}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-100/50 font-semibold">
                        {alert.quantite} {alert.uniteStockage?.toLowerCase() || 'm'}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/demandes?produit=${alert.produitId}`)}
                        className="h-7 px-2.5 text-[11px] bg-[#0F3D5E] hover:bg-[#0F3D5E]/90 text-white rounded-lg"
                      >
                        Demander
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Network Health */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 sm:p-5 border-b border-slate-100">
            <CardTitle className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F3D5E]" />
              État du Réseau AFD
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Synchronisation globale et disponibilité des stocks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Références suivies :</span>
                <span className="font-bold text-slate-800">{stockHealth?.nombreReferencesTotal ?? 48}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Boutiques actives :</span>
                <span className="font-bold text-slate-800">3 boutiques + 1 Entrepôt</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Mètres en inventaire :</span>
                <span className="font-bold text-[#1E88E5]">{stockHealth?.totalMetresEnStock ?? 12450} m</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/recouvrement')}
                className="w-full rounded-xl border-slate-200 text-xs font-semibold h-10 gap-2 text-slate-700 hover:bg-slate-50"
              >
                <CreditCard className="w-4 h-4 text-[#EF4444]" />
                Accéder au Centre de Recouvrement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardReorganizedPage
