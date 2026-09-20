import React, { useState } from 'react';
import { Search, Building2, Warehouse, Send, Store, ArrowLeftRight } from 'lucide-react';
import type { StockEnriched, Boutique } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';
import { CustomDropdownSelect } from '../ui/CustomDropdownSelect';

interface DemandesStockConsultationProps {
  produits: StockEnriched[];
  boutiques: Boutique[];
  boutiqueCouranteId: string;
  onCreerDemande: (produit: StockEnriched) => void;
  role?: 'gerant' | 'boutiquier';
  onNavigate?: (s: string) => void;
}

export const DemandesStockConsultation: React.FC<DemandesStockConsultationProps> = ({
  produits,
  boutiques,
  boutiqueCouranteId,
  onCreerDemande,
  role = 'boutiquier',
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [filtreEmplacement, setFiltreEmplacement] = useState<string>('tous');

  const getNomBoutique = (id: string) => {
    if (id === 'entrepot' || id === 'b-ent') return 'Entrepôt Central';
    return boutiques.find((b) => b.id === id)?.nom || id;
  };

  // On filtre pour afficher les stocks des AUTRES boutiques ou entrepôt
  const prodsReseau = produits.filter((p) => {
    const pLoc = p.boutiqueId || p.boutique;
    if (pLoc === boutiqueCouranteId) return false;
    if (filtreEmplacement !== 'tous' && pLoc !== filtreEmplacement) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.nom.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q) ||
        Boolean(p.couleur && p.couleur.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Barre de recherche et filtre d'emplacement tiers */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un tissu disponible dans le réseau..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100/60"
          />
        </div>

        <div className="w-full sm:w-64 shrink-0">
          <CustomDropdownSelect
            label="Disponibilités"
            value={filtreEmplacement}
            onChange={setFiltreEmplacement}
            icon={<Building2 size={15} />}
            menuTitle="Filtrer par source"
            options={[
              {
                value: 'tous',
                label: 'Tout le réseau tiers',
                sublabel: 'Boutiques et entrepôt central',
                icon: <Building2 size={14} className="text-blue-600" />,
                badge: 'Global',
              },
              {
                value: 'entrepot',
                label: 'Entrepôt Central',
                sublabel: 'Stock de gros et réserve principale',
                icon: <Warehouse size={14} className="text-amber-600" />,
                badge: 'Entrepôt',
              },
              ...boutiques
                .filter((b) => b.id !== boutiqueCouranteId)
                .map((b) => ({
                  value: b.id,
                  label: b.nom,
                  sublabel: b.lieu,
                  icon: <Store size={14} className="text-blue-500" />,
                  badge: 'Boutique',
                })),
            ]}
          />
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
              key={prod.stockId || prod.id}
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
                    <span>Emplacement : <span className="font-semibold text-gray-700">{getNomBoutique(prod.boutiqueId || prod.boutique || '')}</span></span>
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

                {role === 'gerant' ? (
                  <button
                    type="button"
                    onClick={() => onNavigate?.('entrepot')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors cursor-pointer"
                    title="Aller vers le module des transferts pour expédier ce tissu"
                  >
                    <ArrowLeftRight size={12} />
                    <span className="hidden sm:inline">Transférer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCreerDemande(prod)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Send size={12} />
                    <span className="hidden sm:inline">Demander</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DemandesStockConsultation;
