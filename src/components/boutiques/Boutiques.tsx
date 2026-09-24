import React, { useState, useMemo } from 'react';

import type { BoutiqueFilter, BoutiqueFormData, BoutiqueWithStaff } from './types';
import BoutiquesList from './BoutiquesList';
import BoutiqueModal from './BoutiqueModal';
import BoutiqueStaffModal from './BoutiqueStaffModal';
import { CheckCircle2 } from 'lucide-react';
import {
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useToggleLocationStatusMutation,
} from '../../hooks/queries/useLocationsQuery';

export const Boutiques: React.FC = () => {
  const boutiques: any[] = [];
  const utilisateurs: any[] = [];
  const stocks: any[] = [];
  const addBoutique = (data: any) => {};
  const updateBoutique = (id: any, data: any) => {};
  const toggleBoutiqueActif = (id: any) => {};

  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState<BoutiqueFilter>('tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState<BoutiqueWithStaff | null>(null);
  const [staffModalBoutique, setStaffModalBoutique] = useState<BoutiqueWithStaff | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Construction des données enrichies (personnel + stock par boutique)
  const boutiquesWithStaff: BoutiqueWithStaff[] = useMemo(() => {
    return boutiques.map((b: any) => {
      const staff = utilisateurs.filter((u: any) => u.boutique === b.id);
      const nbStock = stocks.filter(
        (s: any) =>
          s.boutiqueId === b.id ||
          ((b.id === 'b-ent' || b.id === 'entrepot') &&
            (s.boutiqueId === 'b-ent' || s.boutiqueId === 'entrepot'))
      ).length;
      return {
        ...b,
        personnel: staff,
        nbArticlesStock: nbStock,
      };
    });
  }, [boutiques, utilisateurs, stocks]);

  const handleOpenCreate = () => {
    setEditingBoutique(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BoutiqueWithStaff) => {
    setEditingBoutique(b);
    setIsModalOpen(true);
  };

  const { mutate: createLocationApi } = useCreateLocationMutation();
  const { mutate: updateLocationApi } = useUpdateLocationMutation();
  const { mutate: toggleLocationApi } = useToggleLocationStatusMutation();

  const handleSave = (form: BoutiqueFormData) => {
    if (editingBoutique) {
      updateBoutique(editingBoutique.id, {
        code: form.code,
        nom: form.nom,
        type: form.type,
        lieu: form.lieu,
        adresse: form.adresse,
        telephone: form.telephone,
        gerant: form.gerant,
      });
      // Synchronisation API réelle
      updateLocationApi({
        id: editingBoutique.id,
        data: {
          nom: form.nom,
          type: form.type === 'ENTREPOT' ? 'ENTREPOT' : 'BOUTIQUE',
          adresse: form.adresse,
          telephone: form.telephone,
        },
      });
      setFeedbackMsg(`L'emplacement ${form.nom} a été mis à jour avec succès.`);
    } else {
      addBoutique({
        code: form.code,
        nom: form.nom,
        type: form.type,
        lieu: form.lieu || 'Dakar',
        adresse: form.adresse,
        telephone: form.telephone,
        gerant: form.gerant,
      });
      // Synchronisation API réelle
      createLocationApi({
        nom: form.nom,
        type: form.type === 'ENTREPOT' ? 'ENTREPOT' : 'BOUTIQUE',
        adresse: form.adresse || 'Dakar',
        telephone: form.telephone || '+221',
      });
      setFeedbackMsg(`L'emplacement ${form.nom} (${form.type}) a été créé avec succès.`);
    }

    setIsModalOpen(false);
    setEditingBoutique(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    toggleBoutiqueActif(id);
    toggleLocationApi(id);
    const target = boutiques.find((b: any) => b.id === id);
    if (target) {
      const statutTxt = target.actif ? 'désactivé' : 'activé';
      setFeedbackMsg(`L'emplacement ${target.nom} a été ${statutTxt}.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-5">
      {/* En-tête de la page */}
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">
          Gestion des Boutiques & Entrepôts
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Supervision des emplacements physiques, du personnel affecté et des stocks par point de vente
        </p>
      </div>

      {/* Message de notification / feedback */}
      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Liste principale */}
      <BoutiquesList
        boutiques={boutiquesWithStaff}
        search={search}
        onSearchChange={setSearch}
        filtre={filtre}
        onFiltreChange={setFiltre}
        onOpenCreateModal={handleOpenCreate}
        onEditBoutique={handleOpenEdit}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modal d'ajout / modification */}
      <BoutiqueModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBoutique(null);
        }}
        editingBoutique={editingBoutique}
        onSave={handleSave}
      />

      {/* Modal d'affichage des vendeurs / personnel */}
      <BoutiqueStaffModal
        isOpen={Boolean(staffModalBoutique)}
        onClose={() => setStaffModalBoutique(null)}
        boutique={staffModalBoutique}
      />
    </div>
  );
};

export default Boutiques;
