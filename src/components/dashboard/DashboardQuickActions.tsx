import React from 'react';
import { ShoppingCart, Package, UserPlus, ArrowLeftRight, BarChart2 } from 'lucide-react';

interface DashboardQuickActionsProps {
  role: 'gerant' | 'boutiquier';
  onNavigate?: (s: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ role, onNavigate }) => {
  return (
    <div className="mb-6">
      <div className="font-display font-bold text-gray-900 text-base mb-3.5">
        Actions Rapides
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigate?.('ventes')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
        >
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
            <ShoppingCart size={24} />
          </div>
          <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
            Nouvelle Vente
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('stock')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-amber-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
        >
          <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
            <Package size={24} />
          </div>
          <span className="text-sm font-semibold text-gray-800 group-hover:text-amber-700 transition-colors">
            Gérer Stock
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('clients')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
            <UserPlus size={24} />
          </div>
          <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
            Nouveau Client
          </span>
        </button>

        {role === 'gerant' ? (
          <button
            type="button"
            onClick={() => onNavigate?.('rapports')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
          >
            <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
              <BarChart2 size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              Voir Rapports
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate?.('demandes')}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center"
          >
            <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
              <ArrowLeftRight size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
              Demander Stock
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
