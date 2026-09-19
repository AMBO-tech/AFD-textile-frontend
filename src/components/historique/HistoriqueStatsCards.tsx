import React from 'react';
import { ShoppingCart, PackagePlus, ArrowLeftRight, CreditCard } from 'lucide-react';

interface HistoriqueStatsCardsProps {
  actionCounts: Record<string, number>;
}

export const HistoriqueStatsCards: React.FC<HistoriqueStatsCardsProps> = ({ actionCounts }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Ventes</span>
          <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <ShoppingCart size={13} />
          </div>
        </div>
        <div className="font-display font-bold text-lg text-gray-900 mt-1">
          {actionCounts.vente || 0}
        </div>
        <div className="text-[10px] text-gray-400">Actes de vente</div>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Mises en stock</span>
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <PackagePlus size={13} />
          </div>
        </div>
        <div className="font-display font-bold text-lg text-gray-900 mt-1">
          {actionCounts.stock || 0}
        </div>
        <div className="text-[10px] text-gray-400">Entrées de stock</div>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Transferts</span>
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ArrowLeftRight size={13} />
          </div>
        </div>
        <div className="font-display font-bold text-lg text-gray-900 mt-1">
          {actionCounts.transfert || 0}
        </div>
        <div className="text-[10px] text-gray-400">Mouvements inter-sites</div>
      </div>

      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Créances</span>
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <CreditCard size={13} />
          </div>
        </div>
        <div className="font-display font-bold text-lg text-gray-900 mt-1">
          {actionCounts.creance || 0}
        </div>
        <div className="text-[10px] text-gray-400">Suivi financier</div>
      </div>
    </div>
  );
};

export default HistoriqueStatsCards;
