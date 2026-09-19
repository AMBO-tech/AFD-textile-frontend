import React from 'react';
import {
  Store,
  Warehouse,
  MapPin,
  Phone,
  User,
  Users,
  Package,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { BoutiqueWithStaff } from './types';

interface BoutiqueCardProps {
  boutique: BoutiqueWithStaff;
  onEdit: (b: BoutiqueWithStaff) => void;
  onToggleStatus: (id: string) => void;
}

export const BoutiqueCard: React.FC<BoutiqueCardProps> = ({
  boutique,
  onEdit,
  onToggleStatus,
}) => {
  const isEntrepot = boutique.type === 'ENTREPOT';
  const Icon = isEntrepot ? Warehouse : Store;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all p-5 shadow-sm hover:shadow-md ${
        boutique.actif ? 'border-gray-100' : 'border-gray-200 opacity-75 bg-gray-50/50'
      }`}
    >
      {/* Entête Carte */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isEntrepot
                ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
            }}
          >
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-gray-900 text-base leading-tight">
                {boutique.nom}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold">
                {boutique.code}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isEntrepot
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isEntrepot ? 'Entrepôt central' : 'Boutique de vente'}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  boutique.actif
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {boutique.actif ? (
                  <>
                    <CheckCircle2 size={11} /> Actif
                  </>
                ) : (
                  <>
                    <XCircle size={11} /> Inactif
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Boutons actions rapides */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(boutique)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Modifier les détails"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onToggleStatus(boutique.id)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
              boutique.actif
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {boutique.actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      </div>

      {/* Coordonnées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 py-3 border-y border-gray-100 my-3">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{boutique.adresse || boutique.lieu}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400 flex-shrink-0" />
          <span>{boutique.telephone || 'Non renseigné'}</span>
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <User size={14} className="text-gray-400 flex-shrink-0" />
          <span>
            Responsable :{' '}
            <strong className="text-gray-800">{boutique.gerant || 'Non assigné'}</strong>
          </span>
        </div>
      </div>

      {/* Indicateurs Stock & Personnel */}
      <div className="flex items-center justify-between pt-1">
        {/* Personnel assigné */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500 font-medium">
            Personnel ({boutique.personnel.length}) :
          </span>
          {boutique.personnel.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Aucun boutiquier</span>
          ) : (
            <div className="flex -space-x-1.5 overflow-hidden">
              {boutique.personnel.map((p) => (
                <div
                  key={p.id}
                  title={`${p.nom} (${p.role})`}
                  className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                >
                  {p.nom.charAt(0)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Produits en stock */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg">
          <Package size={13} className="text-gray-500" />
          <span>{boutique.nbArticlesStock} modèles en stock</span>
        </div>
      </div>

      {/* Liste déroulée du personnel */}
      {boutique.personnel.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-gray-50 flex flex-wrap gap-1.5">
          {boutique.personnel.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 text-[11px] font-medium text-gray-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {u.nom}
              <span className="text-[10px] text-gray-400">({u.role})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiqueCard;
