import { formatMontant } from '../../../utils/format';
import React from 'react';
import { ShoppingCart, ShoppingBag, Clock, Store } from 'lucide-react';
import { BoutiqueSelector } from '../../../components/sales/BoutiqueSelector';
import type { Boutique } from '../../../types/locations';

interface SalesHeaderProps {
  role: string;
  boutiques: Boutique[];
  boutiqueActive: string;
  onSelectBoutique: (id: string) => void;
  panierLength: number;
  totalPanier: number;
  formatMontant: (n: number) => string;
  onOpenPanier: () => void;
  tab: 'vente' | 'historique';
  onTabChange: (t: 'vente' | 'historique') => void;
  ventesCount: number;
}

export const SalesHeader: React.FC<SalesHeaderProps> = ({
  role,
  boutiques,
  boutiqueActive,
  onSelectBoutique,
  panierLength,
  totalPanier,
  formatMontant,
  onOpenPanier,
  tab,
  onTabChange,
  ventesCount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
      {/* Ligne 1 : Titre + Badge statut + Bouton Panier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
              Point de Vente
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Caisse active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Enregistrement des ventes comptant et commandes à crédit
          </p>
        </div>

        {/* Bouton Panier */}
        <button
          type="button"
          onClick={onOpenPanier}
          className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-95 transition-all self-start sm:self-auto cursor-pointer"
          style={{ background: '#0F3D5E' }}
        >
          <ShoppingCart size={16} />
          <span>Panier ({panierLength})</span>
          {totalPanier > 0 && (
            <span className="ml-1 pl-2.5 border-l border-white/20 font-extrabold text-amber-300">
              {formatMontant(totalPanier)}
            </span>
          )}
        </button>
      </div>

      {/* Ligne 2 : Sélecteur de Boutique pour Gérant OU Indicateur Boutiquier + Onglets Vente / Historique */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
        {/* Sélecteur de point de vente */}
        {role === 'gerant' ? (
          <BoutiqueSelector
            boutiques={boutiques.filter((b) => b.type === 'BOUTIQUE')}
            selectedId={boutiqueActive}
            
            onSelect={onSelectBoutique}
          />
        ) : (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Store size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Boutique locale
              </span>
              <span className="text-xs font-bold text-gray-800">
                {boutiques.find((b) => b.id === boutiqueActive)?.nom || 'Boutique locale'}
              </span>
            </div>
          </div>
        )}

        {/* Onglets Vente / Historique */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTabChange('vente')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'vente'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={14} className={tab === 'vente' ? 'text-blue-600' : 'text-gray-400'} />
            <span>Nouvelle vente</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('historique')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === 'historique'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock size={14} className={tab === 'historique' ? 'text-blue-600' : 'text-gray-400'} />
            <span>Historique ({ventesCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesHeader;
