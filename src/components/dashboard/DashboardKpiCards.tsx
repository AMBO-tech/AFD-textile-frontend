import React from 'react';
import { TrendingUp, ShoppingBag, Package, AlertTriangle, CreditCard, Clock } from 'lucide-react';

const formatMontant = (n: number) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);


interface DashboardKpiCardsProps {
  role: 'gerant' | 'boutiquier';
  ventesJour: number;
  ventesSemaine: number;
  nbVentes: number;
  stockTotal: number;
  creancesTotal: number;
  alertesCount: number;
  onNavigate?: (s: string) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  role,
  ventesJour,
  ventesSemaine,
  nbVentes,
  stockTotal,
  creancesTotal,
  alertesCount,
  onNavigate,
}) => {
  if (role === 'gerant') {
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

  // Rôle Boutiquier
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Mes ventes du jour</span>
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-green-600" />
          </div>
        </div>
        <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
          {formatMontant(ventesJour)}
        </div>
        <div className="text-xs text-green-600 font-medium mt-0.5">
          {nbVentes} vente{nbVentes > 1 ? 's' : ''} enregistrée{nbVentes > 1 ? 's' : ''}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Semaine en cours</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <ShoppingBag size={16} className="text-blue-600" />
          </div>
        </div>
        <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
          {formatMontant(ventesSemaine)}
        </div>
        <div className="text-xs text-blue-600 font-medium mt-0.5">Boutique Dakar</div>
      </div>

      <div
        onClick={() => onNavigate?.('stock')}
        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:border-gray-200 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Stock boutique</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Package size={16} className="text-amber-600" />
          </div>
        </div>
        <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
          {stockTotal} <span className="text-sm font-normal text-gray-500">unités</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">Disponibles</div>
      </div>

      <div
        onClick={() => onNavigate?.('stock')}
        className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-colors ${
          alertesCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Alertes stock</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
        </div>
        <div
          className={`font-display font-bold text-lg sm:text-xl ${
            alertesCount > 0 ? 'text-amber-600' : 'text-gray-900'
          }`}
        >
          {alertesCount}
        </div>
        <div className="text-xs text-amber-600 mt-0.5">Articles à réapprovisionner</div>
      </div>
    </div>
  );
};

export default DashboardKpiCards;
