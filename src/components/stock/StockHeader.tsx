import React from 'react';
import { Package, AlertTriangle, Layers, Plus } from 'lucide-react';
import type { Produit } from '../../data/useMockStore';

interface StockHeaderProps {
  produits: Produit[];
  role: 'gerant' | 'boutiquier';
  onOpenMiseEnStock: () => void;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  produits,
  role,
  onOpenMiseEnStock,
}) => {
  const totalModeles = produits.length;
  const totalQuantite = produits.reduce((s, p) => s + p.quantite, 0);
  const alertesCount = produits.filter((p) => p.quantite <= p.seuil && p.quantite > 0).length;
  const ruptureCount = produits.filter((p) => p.quantite === 0).length;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">
            Gestion des Stocks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {role === 'gerant'
              ? 'Supervision globale des stocks, alertes et approvisionnements'
              : 'Inventaire et entrées de stock de votre boutique'}
          </p>
        </div>
        <button
          onClick={onOpenMiseEnStock}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition-all hover:opacity-95 self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={16} />
          Mise en stock
        </button>
      </div>

      {/* Cartes métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Modèles référencés</span>
            <Layers size={16} className="text-blue-600" />
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {totalModeles}
          </div>
          <span className="text-[11px] text-gray-400">Catalogue actif</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Volume total</span>
            <Package size={16} className="text-green-600" />
          </div>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl">
            {totalQuantite}
          </div>
          <span className="text-[11px] text-gray-400">Mètres & pièces</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Stock faible</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <div className={`font-display font-bold text-lg sm:text-xl ${alertesCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {alertesCount}
          </div>
          <span className="text-[11px] text-amber-600">Sous le seuil</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Ruptures</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className={`font-display font-bold text-lg sm:text-xl ${ruptureCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {ruptureCount}
          </div>
          <span className="text-[11px] text-red-500">À réapprovisionner</span>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
