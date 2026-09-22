import React from 'react';
import { CreditCard, Receipt, AlertCircle, TrendingUp } from 'lucide-react';

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
  solde = 0,
  tauxRecouvrement,
  aDesDettes = false,
  formatMontant,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex-shrink-0">
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
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-gray-500">Solde Restant</span>
          <AlertCircle size={14} className={aDesDettes ? 'text-rose-500' : 'text-emerald-500'} />
        </div>
        <div
          className={`font-display font-bold text-sm sm:text-base ${
            aDesDettes ? 'text-rose-600 font-extrabold' : 'text-emerald-600'
          }`}
        >
          {formatMontant(solde)}
        </div>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex items-center justify-between text-blue-600 mb-1">
          <span className="text-[11px] font-medium">Recouvrement</span>
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
