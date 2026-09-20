import React from 'react';
import { TrendingUp, CreditCard } from 'lucide-react';
import { formatMontant } from '../../data/mock';

interface RapportsKpiCardsProps {
  ca?: number;
  benefice?: number;
  creances?: number;
}

export const RapportsKpiCards: React.FC<RapportsKpiCardsProps> = ({
  ca = 1678000,
  benefice = 420000,
  creances = 577500,
}) => {
  const kpis = [
    {
      label: "Chiffre d'affaires",
      value: formatMontant(ca),
      icon: TrendingUp,
      color: '#1E88E5',
      bg: '#EBF5FB',
      delta: '+12%',
    },
    {
      label: 'Bénéfice estimé',
      value: formatMontant(benefice),
      icon: TrendingUp,
      color: '#0F3D5E',
      bg: '#EBF0F5',
      delta: '+5%',
    },
    {
      label: 'Créances totales',
      value: formatMontant(creances),
      icon: CreditCard,
      color: '#EF4444',
      bg: '#FEF2F2',
      delta: '-3%',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {kpis.map((k, i) => {
        const Icon = k.icon;
        const positive = k.delta.startsWith('+');
        return (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: k.bg }}
              >
                <Icon size={15} color={k.color} />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}
              >
                {k.delta}
              </span>
            </div>
            <div className="font-display font-bold text-sm text-gray-900 leading-tight">
              {k.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default RapportsKpiCards;
