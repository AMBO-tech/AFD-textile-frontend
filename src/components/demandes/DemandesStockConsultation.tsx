import React, { useState } from 'react';
import { Search, Building2, Warehouse, Send } from 'lucide-react';
import type { Produit, Boutique } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

interface DemandesStockConsultationProps {
  produits: Produit[];
  boutiques: Boutique[];
  boutiqueCouranteId: string;
  onCreerDemande: (produit: Produit) => void;
}

export const DemandesStockConsultation: React.FC<DemandesStockConsultationProps> = ({
  produits,
  boutiques,
  boutiqueCouranteId,
  onCreerDemande,
}) => {
  const [search, setSearch] = useState('');
  const [filtreEmplacement, setFiltreEmplacement] = useState<string>('tous');

  const getNomBoutique = (id: string) => {
    if (id === 'entrepot') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom || id;
  };

  // On filtre pour afficher les stocks des AUTRES boutiques ou entrepôt
  const prodsReseau = produits.filter((p) => {
    if (p.boutique === boutiqueCouranteId) return false;
    if (filtreEmplacement !== 'tous' && p.boutique !== filtreEmplacement) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nom.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q) ||
        p.couleur.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Barre de recherche et filtre d'emplacement tiers */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un tissu disponible dans le réseau..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={filtreEmplacement}
            onChange={(e) => setFiltreEmplacement(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-500"
          >
            <option value="tous">Tout le réseau tiers</option>
            <option value="entrepot">Entrepôt Central</option>
            {boutiques
              .filter((b) => b.id !== boutiqueCouranteId)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Liste des disponibilités */}
      <div className="space-y-2">
        {prodsReseau.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm text-xs text-gray-400">
            Aucun article correspondant disponible dans les autres emplacements.
          </div>
        ) : (
          prodsReseau.map((prod) => (
            <div
              key={prod.id}
              className="p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 shadow-xs flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-xs truncate">{prod.nom}</div>
                  <div className="text-[11px] text-gray-500">{prod.categorie} • {prod.couleur}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Building2 size={11} />
                    <span>Emplacement : <span className="font-semibold text-gray-700">{getNomBoutique(prod.boutique)}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="font-bold text-blue-700 text-xs sm:text-sm">
                    {prod.quantite} {prod.unite}
                  </div>
                  <div className="text-[10px] text-gray-400">disponibles</div>
                </div>

                <button
                  type="button"
                  onClick={() => onCreerDemande(prod)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                >
                  <Send size={12} />
                  <span className="hidden sm:inline">Demander</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DemandesStockConsultation;
