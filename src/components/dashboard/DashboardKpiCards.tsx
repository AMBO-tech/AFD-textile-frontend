import React from 'react';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, CreditCard, AlertCircle } from 'lucide-react';
import { formatMontant } from '../../data/mock';

interface DashboardKpiCardsProps {
  role: 'gerant' | 'boutiquier' | 'vendeur' | 'admin' | string;
  ventesJour: number;
  ventesSemaine: number;
  nbVentes: number;
  stockTotal: number;
  creancesTotal: number;
  alertesCount: number;
  nbProduitsVendus?: number;
  stockFaibleCount?: number;
  produitsEnRuptureCount?: number;
  onNavigate?: (s: string) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  role,
  ventesJour,
  ventesSemaine,
  nbVentes,
  stockTotal,
  creancesTotal,
  nbProduitsVendus = 0,
  stockFaibleCount = 0,
  produitsEnRuptureCount = 0,
  onNavigate,
}) => {
  const isManager = role === 'gerant' || role === 'admin';

  if (isManager) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Ventes aujourd'hui</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {formatMontant(ventesJour)}
          </div>
          <div className="text-xs text-green-600 font-medium mt-0.5">
            {nbVentes} vente{nbVentes > 1 ? 's' : ''} validée{nbVentes > 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Ventes semaine</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {formatMontant(ventesSemaine)}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">7 derniers jours</div>
        </div>

        <div
          onClick={() => onNavigate?.('stock')}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Stock total</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Package size={16} className="text-amber-600" />
            </div>
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {stockTotal} <span className="text-sm font-normal text-gray-500">unités</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Réseau 3 boutiques</div>
        </div>

        <div
          onClick={() => onNavigate?.('clients')}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Créances clients</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <CreditCard size={16} className="text-red-500" />
            </div>
          </div>
          <div className="font-display font-bold text-red-600 text-lg sm:text-xl">
            {formatMontant(creancesTotal)}
          </div>
          <div className="text-xs text-red-400 mt-0.5">À recouvrer</div>
        </div>
      </div>
    );
  }

  // Rôle Boutiquier / Vendeur : Uniquement des métriques quantitatives (AUCUN montant FCFA / argent)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Nombre de produits vendus */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Produits vendus</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShoppingBag size={16} className="text-blue-600" />
          </div>
        </div>
        <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
          {nbProduitsVendus}
        </div>
        <div className="text-xs text-blue-600 font-medium mt-0.5">
          Unités sorties
        </div>
      </div>

      {/* 2. Nombre de ventes (count) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Nombre de ventes</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
        </div>
        <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
          {nbVentes}
        </div>
        <div className="text-xs text-emerald-600 font-medium mt-0.5">
          {nbVentes} transaction{nbVentes > 1 ? 's' : ''} enregistrée{nbVentes > 1 ? 's' : ''}
        </div>
      </div>

      {/* 3. Stock faible */}
      <div
        onClick={() => onNavigate?.('stock')}
        className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-colors ${
          stockFaibleCount > 0 ? 'border-amber-200 bg-amber-50/20 hover:bg-amber-50/40' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Stock faible</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
        </div>
        <div
          className={`font-display font-bold text-lg sm:text-xl ${
            stockFaibleCount > 0 ? 'text-amber-600' : 'text-gray-900'
          }`}
        >
          {stockFaibleCount}
        </div>
        <div className="text-xs text-amber-600 mt-0.5">Articles sous le seuil</div>
      </div>

      {/* 4. Produits en rupture */}
      <div
        onClick={() => onNavigate?.('stock')}
        className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-colors ${
          produitsEnRuptureCount > 0 ? 'border-rose-200 bg-rose-50/20 hover:bg-rose-50/40' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Produits en rupture</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <AlertCircle size={16} className="text-rose-600" />
          </div>
        </div>
        <div
          className={`font-display font-bold text-lg sm:text-xl ${
            produitsEnRuptureCount > 0 ? 'text-rose-600' : 'text-gray-900'
          }`}
        >
          {produitsEnRuptureCount}
        </div>
        <div className="text-xs text-rose-600 mt-0.5">Articles épuisés (0 stock)</div>
      </div>
    </div>
  );
};

export default DashboardKpiCards;
