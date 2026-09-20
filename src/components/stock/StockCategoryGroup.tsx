import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { StockEnriched, Categorie, Boutique } from '../../data/useMockStore';
import StockItemCard from './StockItemCard';

interface StockCategoryGroupProps {
  categorie: Categorie;
  produits: StockEnriched[];
  isOuverte: boolean;
  onToggle: () => void;
  onEntreeRapide: (produit: StockEnriched) => void;
  onVenteRapide?: (produitId: string) => void;
  boutiques?: Boutique[];
  afficherEmplacement?: boolean;
}

export const StockCategoryGroup: React.FC<StockCategoryGroupProps> = ({
  categorie,
  produits,
  isOuverte,
  onToggle,
  onEntreeRapide,
  onVenteRapide,
  boutiques = [],
  afficherEmplacement = false,
}) => {
  const totalStockCat = produits.reduce((s, p) => s + p.quantite, 0);
  const alertesCat = produits.filter((p) => p.quantite <= p.seuil).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
      {/* En-tête de catégorie cliquable */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-gray-50/70 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
            <img
              src={categorie.photo}
              alt={categorie.nom}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-display font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              {categorie.nom}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                {produits.length} modèle{produits.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Total : {totalStockCat} unités
              {alertesCat > 0 && (
                <span className="text-amber-600 font-semibold ml-2">
                  • {alertesCat} alerte{alertesCat > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-1 text-gray-400">
          {isOuverte ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Liste des articles dans la catégorie */}
      {isOuverte && (
        <div className="p-3.5 space-y-2 border-t border-gray-100 bg-white">
          {produits.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Aucun modèle dans cette catégorie pour le filtre actif.
            </div>
          ) : (
            produits.map((prod) => {
              const bId = prod.boutiqueId || prod.boutique;
              const isEntrepot = bId === 'entrepot' || bId === 'b-ent';
              const nomEmp = isEntrepot
                ? 'Entrepôt Central'
                : (boutiques.find((b) => b.id === bId)?.nom || bId);

              return (
                <StockItemCard
                  key={prod.stockId || `${prod.id}_${bId}`}
                  produit={prod}
                  onEntreeRapide={onEntreeRapide}
                  onVenteRapide={onVenteRapide}
                  nomEmplacement={afficherEmplacement ? nomEmp : undefined}
                  typeEmplacement={isEntrepot ? 'entrepot' : 'boutique'}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StockCategoryGroup;
