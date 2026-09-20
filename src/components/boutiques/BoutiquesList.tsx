import React from 'react';
import { Store, Warehouse, Users, Search, Plus } from 'lucide-react';
import type { BoutiqueFilter, BoutiqueWithStaff } from './types';
import BoutiqueCard from './BoutiqueCard';

interface BoutiquesListProps {
  boutiques: BoutiqueWithStaff[];
  search: string;
  onSearchChange: (val: string) => void;
  filtre: BoutiqueFilter;
  onFiltreChange: (f: BoutiqueFilter) => void;
  onOpenCreateModal: () => void;
  onEditBoutique: (b: BoutiqueWithStaff) => void;
  onToggleStatus: (id: string) => void;
  onViewStaff?: (b: BoutiqueWithStaff) => void;
}

export const BoutiquesList: React.FC<BoutiquesListProps> = ({
  boutiques,
  search,
  onSearchChange,
  filtre,
  onFiltreChange,
  onOpenCreateModal,
  onEditBoutique,
  onToggleStatus,
  onViewStaff,
}) => {
  const nbBoutiques = boutiques.filter((b) => b.type === 'BOUTIQUE').length;
  const nbEntrepots = boutiques.filter((b) => b.type === 'ENTREPOT').length;
  const totalPersonnel = boutiques.reduce((sum, b) => sum + b.personnel.length, 0);

  const boutiquesFiltrees = boutiques.filter((b) => {
    const matchFiltre = filtre === 'tous' || b.type === filtre;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      b.nom.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.lieu.toLowerCase().includes(q) ||
      (b.adresse && b.adresse.toLowerCase().includes(q)) ||
      (b.gerant && b.gerant.toLowerCase().includes(q));
    return matchFiltre && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* 1. Cartes de métriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Store size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{nbBoutiques}</div>
            <div className="text-xs text-gray-500 font-medium">Boutiques de vente</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Warehouse size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{nbEntrepots}</div>
            <div className="text-xs text-gray-500 font-medium">Entrepôts de stockage</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <Users size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalPersonnel}</div>
            <div className="text-xs text-gray-500 font-medium">Personnel affecté</div>
          </div>
        </div>
      </div>

      {/* 2. Barre d'outils (Recherche, Filtres, Bouton Créer) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par nom, code, ville, responsable..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Filtres par type */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => onFiltreChange('tous')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtre === 'tous'
                ? 'bg-[#0F3D5E] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous ({boutiques.length})
          </button>
          <button
            onClick={() => onFiltreChange('BOUTIQUE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtre === 'BOUTIQUE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Boutiques ({nbBoutiques})
          </button>
          <button
            onClick={() => onFiltreChange('ENTREPOT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filtre === 'ENTREPOT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Entrepôts ({nbEntrepots})
          </button>
        </div>

        {/* Bouton Créer */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={16} />
          <span>Nouvel emplacement</span>
        </button>
      </div>

      {/* 3. Liste des Boutiques */}
      {boutiquesFiltrees.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <Store size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600 font-semibold text-sm">Aucun emplacement trouvé</p>
          <p className="text-gray-400 text-xs mt-1">
            Modifiez vos termes de recherche ou ajoutez une nouvelle boutique.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {boutiquesFiltrees.map((b) => (
            <BoutiqueCard
              key={b.id}
              boutique={b}
              onEdit={onEditBoutique}
              onToggleStatus={onToggleStatus}
              onViewStaff={onViewStaff}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiquesList;
