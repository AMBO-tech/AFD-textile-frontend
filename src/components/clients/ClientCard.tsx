import React from 'react';
import { MapPin, ShoppingBag, Edit2, Trash2, ChevronRight } from 'lucide-react';
import type { ClientDetailed } from '../../data/useMockStore';

interface ClientCardProps {
  client: ClientDetailed;
  boutiqueNom: string;
  onSelect: (client: ClientDetailed) => void;
  onEdit?: (client: ClientDetailed) => void;
  onDelete?: (client: ClientDetailed) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  boutiqueNom,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(client)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
          }}
        >
          {client.nom
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm truncate">{client.nom}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {boutiqueNom}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="text-gray-600 font-normal">
              Tél : {client.telephone || 'Non renseigné'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />
              {client.adresse || 'Adresse non renseignée'}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onSelect(client)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
          title="Consulter l'historique et les achats"
        >
          <ShoppingBag size={14} />
          <span>Voir achats</span>
        </button>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(client)}
            className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            title="Modifier le client"
          >
            <Edit2 size={14} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(client)}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Supprimer le client"
          >
            <Trash2 size={14} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelect(client)}
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ClientCard;
