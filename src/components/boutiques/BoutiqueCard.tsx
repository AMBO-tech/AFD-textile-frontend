import React from 'react';
import {
  Store,
  Warehouse,
  MapPin,
  Phone,
  User,
  Edit2,
  CheckCircle2,
  XCircle,
  Users,
  Package,
} from 'lucide-react';
import type { BoutiqueWithStaff } from './types';

interface BoutiqueCardProps {
  boutique: BoutiqueWithStaff;
  onEdit: (b: BoutiqueWithStaff) => void;
  onToggleStatus: (id: string) => void;
  onViewStaff?: (b: BoutiqueWithStaff) => void;
}

export const BoutiqueCard: React.FC<BoutiqueCardProps> = ({
  boutique,
  onEdit,
  onToggleStatus,
  onViewStaff,
}) => {
  const isEntrepot = boutique.type === 'ENTREPOT';
  const Icon = isEntrepot ? Warehouse : Store;

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all hover:border-blue-100 hover:shadow-md ${
        !boutique.actif ? 'opacity-60 border-gray-100 bg-gray-50/40' : 'border-gray-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Section Gauche : Icône + Informations principales */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-xs"
            style={{
              background: isEntrepot
                ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
            }}
          >
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">{boutique.nom}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold">
                {boutique.code}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isEntrepot ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                }`}
              >
                {isEntrepot ? 'Entrepôt' : 'Boutique'}
              </span>
              {!boutique.actif && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                  Désactivé
                </span>
              )}
            </div>

            {/* Coordonnées en une seule ligne compacte */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-gray-600">
                <MapPin size={12} className="text-gray-400" />
                {boutique.lieu || boutique.adresse}
              </span>
              {boutique.telephone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" />
                  {boutique.telephone}
                </span>
              )}
              {boutique.gerant && (
                <span className="inline-flex items-center gap-1 text-gray-400">
                  <User size={12} />
                  Gérant : <strong className="text-gray-700 font-medium">{boutique.gerant}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section Droite : Métriques discrètes & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-right">
            <button
              type="button"
              onClick={() => onViewStaff?.(boutique)}
              className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-blue-100"
              title="Cliquer pour afficher la modale des vendeurs"
            >
              <Users size={13} className="text-gray-400 group-hover:text-blue-600" />
              <span>
                <strong className="text-gray-900 group-hover:text-blue-600">{boutique.personnel.length}</strong>{' '}
                <span className="text-gray-500 group-hover:text-blue-600 underline underline-offset-2">
                  vendeur{boutique.personnel.length > 1 ? 's' : ''}
                </span>
              </span>
            </button>
            <span className="text-gray-200">·</span>
            <div className="flex items-center gap-1.5 text-xs text-gray-700 px-2 py-1">
              <Package size={13} className="text-gray-400" />
              <span>
                <strong className="text-gray-900">{boutique.nbArticlesStock}</strong>{' '}
                <span className="text-gray-500">en stock</span>
              </span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onEdit(boutique)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
              title="Modifier les informations"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onToggleStatus(boutique.id)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-gray-100 ${
                boutique.actif
                  ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={boutique.actif ? 'Désactiver' : 'Activer'}
            >
              {boutique.actif ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoutiqueCard;
