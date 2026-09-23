import { formatMontant } from '@/utils/format';
import React from 'react';

interface BceaoCashKeypadProps {
  montantRecu: string;
  totalNet: number;
  monnaieRendue: number;
  onSetMontantRecu: (val: string) => void;
  formatMontant: (n: number) => string;
}

export const BceaoCashKeypad: React.FC<BceaoCashKeypadProps> = ({
  montantRecu,
  totalNet,
  monnaieRendue,
  onSetMontantRecu,
  formatMontant,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-emerald-900">
          Espèces reçues du client
        </label>
        <button
          type="button"
          onClick={() => onSetMontantRecu(totalNet.toString())}
          className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
        >
          Montant exact ({formatMontant(totalNet)})
        </button>
      </div>

      {/* Boutons tactiles rapides de coupures FCFA (BCEAO officielles) */}
      <div className="grid grid-cols-5 gap-1.5">
        <button
          type="button"
          onClick={() => onSetMontantRecu(totalNet.toString())}
          className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          Exact
        </button>
        <button
          type="button"
          onClick={() => onSetMontantRecu("1000")}
          className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          1 000 F
        </button>
        <button
          type="button"
          onClick={() => onSetMontantRecu("2000")}
          className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          2 000 F
        </button>
        <button
          type="button"
          onClick={() => onSetMontantRecu("5000")}
          className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          5 000 F
        </button>
        <button
          type="button"
          onClick={() => onSetMontantRecu("10000")}
          className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          10 000 F
        </button>
      </div>

      <div className="relative">
        <input
          type="number"
          min="0"
          step="500"
          value={montantRecu}
          onChange={(e) => onSetMontantRecu(e.target.value)}
          placeholder={`Ex: ${formatMontant(Math.ceil(totalNet / 1000) * 1000)}`}
          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {montantRecu.trim() !== '' && (
        <div
          className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl font-bold ${
            monnaieRendue >= 0
              ? 'bg-emerald-100/70 text-emerald-900'
              : 'bg-red-100/70 text-red-700'
          }`}
        >
          <span>{monnaieRendue >= 0 ? 'Monnaie à rendre :' : 'Montant insuffisant :'}</span>
          <span className="text-sm font-display">{formatMontant(Math.abs(monnaieRendue))}</span>
        </div>
      )}
    </div>
  );
};

export default BceaoCashKeypad;
