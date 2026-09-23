import { formatMontant } from '@/utils/format';
import React from 'react';
import { DollarSign, Banknote, Smartphone, CreditCard } from 'lucide-react';
import CustomDropdownSelect from '../../../components/ui/CustomDropdownSelect';

interface NewDebtDepositSectionProps {
  total: number;
  acompte: string;
  onChangeAcompte: (val: string) => void;
  modeAcompte: string;
  onChangeModeAcompte: (val: string) => void;
  acompteNum: number;
  soldeRestant: number;
  formatMontant: (n: number) => string;
}

const MODES_ACOMPTE = [
  { value: 'Espèces', label: 'Espèces (Cash)', icon: <Banknote size={15} /> },
  { value: 'Wave', label: 'Wave Mobile Money', icon: <Smartphone size={15} /> },
  { value: 'Orange Money', label: 'Orange Money (OM)', icon: <Smartphone size={15} /> },
  { value: 'Free Money', label: 'Free Money', icon: <Smartphone size={15} /> },
  { value: 'Carte bancaire', label: 'Carte Bancaire / TPE', icon: <CreditCard size={15} /> },
];

export const NewDebtDepositSection: React.FC<NewDebtDepositSectionProps> = ({
  total,
  acompte,
  onChangeAcompte,
  modeAcompte,
  onChangeModeAcompte,
  acompteNum,
  soldeRestant,
  formatMontant,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
        3. Acompte & Modalités de règlement
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Acompte versé immédiatement (FCFA)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max={total}
              step="500"
              value={acompte}
              onChange={(e) => onChangeAcompte(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
              FCFA
            </span>
          </div>
        </div>

        <div>
          <CustomDropdownSelect
            label="Mode de paiement de l'acompte"
            value={modeAcompte}
            onChange={onChangeModeAcompte}
            options={MODES_ACOMPTE}
            icon={<DollarSign size={15} />}
            menuTitle="Modes de versement"
          />
        </div>
      </div>

      {/* Résumé financier */}
      <div className="p-3 bg-white rounded-xl border border-gray-200/80 space-y-1 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Montant total de la commande :</span>
          <span className="font-bold text-gray-900">{formatMontant(total)}</span>
        </div>
        {acompteNum > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Acompte encaissé ({modeAcompte}) :</span>
            <span className="font-bold">-{formatMontant(acompteNum)}</span>
          </div>
        )}
        <div className="flex justify-between pt-1 border-t border-gray-100 text-sm font-display font-extrabold text-rose-600">
          <span>Créance restante à imputer au client :</span>
          <span>{formatMontant(soldeRestant)}</span>
        </div>
      </div>
    </div>
  );
};

export default NewDebtDepositSection;
