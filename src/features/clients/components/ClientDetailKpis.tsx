import React from 'react';
import { CreditCard, Receipt, TrendingUp } from 'lucide-react';

interface ClientDetailKpisProps {
  totalAchats: number;
  totalPaye: number;
  solde?: number;
  tauxRecouvrement: number;
  aDesDettes?: boolean;
  formatMontant: (n: number) => string;
}

export const ClientDetailKpis: React.FC<ClientDetailKpisProps> = ({
  totalAchats,
  totalPaye,
  tauxRecouvrement,
  formatMontant,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex-shrink-0">
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between text-gray-400 mb-1">
          <span className="text-[11px] font-medium">Total Achats</span>
          <CreditCard size={14} className="text-gray-400" />
        </div>
        <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
          {formatMontant(totalAchats)}
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between text-emerald-600 mb-1">
          <span className="text-[11px] font-medium">Montant Réglé</span>
          <Receipt size={14} />
        </div>
        <div className="font-display font-bold text-emerald-600 text-sm sm:text-base">
          {formatMontant(totalPaye)}
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between text-blue-600 mb-1">
          <span className="text-[11px] font-medium">Taux de Règlement</span>
          <TrendingUp size={14} />
        </div>
        <div className="font-display font-bold text-blue-600 text-sm sm:text-base">
          {tauxRecouvrement}%
        </div>
      </div>
    </div>
  );
};

export default ClientDetailKpis;
