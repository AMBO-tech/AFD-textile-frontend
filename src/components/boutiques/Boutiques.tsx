import React, { useState } from 'react';
import { Plus, Store, Warehouse, MapPin, Phone, Users as UsersIcon, Pencil, Power, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Location } from '@/types/locations';
import { useLocationsListQuery, useToggleLocationStatusMutation } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';
import { Users } from '../users';
import LocationFormModal from './LocationFormModal';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

/** Boutiques et entrepôts : création, modification, activation, et membres rattachés. */
export const Boutiques: React.FC = () => {
  const [formulaire, setFormulaire] = useState<{ emplacement: Location | null } | null>(null);
  const [membresDe, setMembresDe] = useState<Location | null>(null);

  const { data: res, isLoading, isError, error } = useLocationsListQuery({ limit: API_PAGE_MAX });
  const emplacements = [...(res?.data ?? [])].sort(
    (a, b) => Number(b.actif) - Number(a.actif) || a.type.localeCompare(b.type) || a.nom.localeCompare(b.nom),
  );
  const { mutateAsync: basculer } = useToggleLocationStatusMutation();

  const basculerStatut = async (l: Location) => {
    if (l.actif && !window.confirm(`Désactiver « ${l.nom} » ? Il ne sera plus proposé pour les ventes, le stock et les transferts.`)) return;
    try {
      await basculer(l.id);
      toast.success(l.actif ? `« ${l.nom} » désactivé.` : `« ${l.nom} » réactivé.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Le changement de statut a échoué.'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Boutiques & entrepôts</h1>
            <p className="text-xs sm:text-sm text-gray-500">Vos emplacements de vente et de stockage, et leurs équipes</p>
          </div>
        </div>
        <button
          onClick={() => setFormulaire({ emplacement: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm self-start sm:self-auto"
          style={{ background: '#0F3D5E' }}
        >
          <Plus size={16} /> Nouvel emplacement
        </button>
      </div>

      {isError ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100 text-sm text-red-600">
          {getErrorMessage(error, 'Les emplacements n’ont pas pu être chargés.')}
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Chargement…</div>
      ) : emplacements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-2">
          <Warehouse size={32} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">
            Aucun emplacement : créez votre entrepôt et vos boutiques pour pouvoir mettre du stock et inviter vos boutiquiers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {emplacements.map((l) => {
            const Icone = l.type === 'ENTREPOT' ? Warehouse : Store;
            return (
              <div key={l.id} className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2 ${l.actif ? '' : 'opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Icone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{l.nom}</div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {l.type === 'ENTREPOT' ? 'Entrepôt' : 'Boutique'}
                      </span>
                      {!l.actif && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">Désactivé</span>}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 space-y-0.5">
                  {l.adresse && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} /> {l.adresse}
                    </div>
                  )}
                  {l.telephone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} /> {l.telephone}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <UsersIcon size={11} /> {l.nombreEmployes ?? 0} membre{(l.nombreEmployes ?? 0) > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1 pt-1 text-[11px] font-semibold">
                  <button onClick={() => setMembresDe(l)} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50">
                    <UsersIcon size={12} /> Membres
                  </button>
                  <button onClick={() => setFormulaire({ emplacement: l })} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-blue-700 hover:bg-blue-50">
                    <Pencil size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => basculerStatut(l)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${l.actif ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
                  >
                    <Power size={12} /> {l.actif ? 'Désactiver' : 'Réactiver'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formulaire && (
        <LocationFormModal key={formulaire.emplacement?.id ?? 'nouveau'} emplacement={formulaire.emplacement} onClose={() => setFormulaire(null)} />
      )}

      {membresDe && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-50 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <h3 className="font-display font-bold text-gray-900 text-base">Membres — {membresDe.nom}</h3>
              <button onClick={() => setMembresDe(null)} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <Users locationId={membresDe.id} integre />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boutiques;
