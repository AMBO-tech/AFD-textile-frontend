import { formatMontant } from '../../../utils/format';
import React from 'react';
import { Trash2 } from 'lucide-react';
import type { LigneProduitCreance } from '../../../types/clients';

interface NewDebtArticlesListProps {
  lignes: LigneProduitCreance[];
  onSupprimerLigne: (index: number) => void;
  formatMontant: (n: number) => string;
}

export const NewDebtArticlesList: React.FC<NewDebtArticlesListProps> = ({
  lignes,
  onSupprimerLigne,
  formatMontant,
}) => {
  if (lignes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
        2. Articles inclus dans la commande ({lignes.length})
      </div>
      <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white shadow-2xs">
        {lignes.map((l, idx) => (
          <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50/80 transition-colors">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-gray-900 truncate">{l.nom}</div>
              <div className="text-gray-500 text-[11px] mt-0.5">
                {l.quantite} {l.unite} × {formatMontant(l.prixUnitaire)}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="font-display font-bold text-gray-900 text-sm">
                {formatMontant(l.quantite * l.prixUnitaire)}
              </div>
              <button
                type="button"
                onClick={() => onSupprimerLigne(idx)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Retirer cet article"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewDebtArticlesList;
