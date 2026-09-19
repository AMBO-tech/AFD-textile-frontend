import React from 'react';
import { Edit2, UserX, UserCheck, Shield, User, Phone, Mail, Building2 } from 'lucide-react';
import type { Utilisateur } from './types';
import type { Boutique } from '../../data/useMockStore';

interface UserCardProps {
  user: Utilisateur;
  boutiques: Boutique[];
  onEdit: (user: Utilisateur) => void;
  onToggleActif: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  boutiques,
  onEdit,
  onToggleActif,
}) => {
  const boutiqueObj = boutiques.find((b) => b.id === user.boutique);
  const isGerant = user.role === 'gerant';

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
        !user.actif ? 'opacity-60 border-gray-100' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Avatar Initiales */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-xs"
          style={{
            background: isGerant
              ? 'linear-gradient(135deg, #0F3D5E, #1E88E5)'
              : 'linear-gradient(135deg, #1E88E5, #60A5FA)',
          }}
        >
          {user.nom
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)}
        </div>

        {/* Infos utilisateur */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{user.nom}</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                isGerant
                  ? 'bg-blue-50 text-blue-800 border border-blue-100'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              }`}
            >
              {isGerant ? <Shield size={11} /> : <User size={11} />}
              {isGerant ? 'Gérant (Admin)' : 'Boutiquier'}
            </span>
            {!user.actif && (
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                Désactivé
              </span>
            )}
          </div>

          {/* Numéro & Email */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
            {user.telephone && (
              <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                <Phone size={11} className="text-gray-400" />
                {user.telephone}
              </span>
            )}
            {user.email && (
              <span className="inline-flex items-center gap-1 text-gray-400">
                <Mail size={11} />
                {user.email}
              </span>
            )}
          </div>

          {/* Boutique assignée ou rôle global */}
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
            <Building2 size={11} className="text-blue-500" />
            <span>
              {isGerant
                ? 'Superviseur Réseau (Toutes les boutiques)'
                : boutiqueObj
                ? boutiqueObj.nom
                : 'Boutique non assignée'}
            </span>
            <span>·</span>
            <span className="text-gray-400">Dernière activité : {user.derniereConnexion}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onEdit(user)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
            title="Modifier l'utilisateur"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onToggleActif(user.id)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-gray-100 ${
              user.actif
                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={user.actif ? 'Désactiver le compte' : 'Activer le compte'}
          >
            {user.actif ? <UserX size={14} /> : <UserCheck size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
