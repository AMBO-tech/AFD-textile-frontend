import React from 'react';
import { ShoppingCart, Package, UserPlus, ArrowLeftRight, BarChart2 } from 'lucide-react';

interface DashboardQuickActionsProps {
  role: 'gerant' | 'boutiquier';
  onNavigate?: (s: string) => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({ role, onNavigate }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="font-display font-bold text-gray-900 text-base mb-3">
        Actions Rapides
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigate?.('ventes')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50/60 hover:bg-blue-50 text-blue-700 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <ShoppingCart size={18} />
          </div>
          <span className="text-xs font-semibold">Nouvelle Vente</span>
        </button>

        <button
          onClick={() => onNavigate?.('stock')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-50/60 hover:bg-amber-50 text-amber-800 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm">
            <Package size={18} />
          </div>
          <span className="text-xs font-semibold">Gérer Stock</span>
        </button>

        <button
          onClick={() => onNavigate?.('clients')}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-50/60 hover:bg-green-50 text-green-700 transition-colors text-center"
        >
          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-sm">
            <UserPlus size={18} />
          </div>
          <span className="text-xs font-semibold">Nouveau Client</span>
        </button>

        {role === 'gerant' ? (
          <button
            onClick={() => onNavigate?.('rapports')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-50/60 hover:bg-purple-50 text-purple-700 transition-colors text-center"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <BarChart2 size={18} />
            </div>
            <span className="text-xs font-semibold">Voir Rapports</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate?.('demandes')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-50/60 hover:bg-purple-50 text-purple-700 transition-colors text-center"
          >
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
              <ArrowLeftRight size={18} />
            </div>
            <span className="text-xs font-semibold">Demander Stock</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardQuickActions;
