import React from 'react';
import { Pencil, Power, Send, Phone, Mail, Store } from 'lucide-react';
import type { UserItem } from '@/types/users';
import { LIBELLE_ROLE, enAttenteActivation } from './types';

interface UserCardProps {
  utilisateur: UserItem;
  /** Le compte connecté ne peut pas se désactiver lui-même. */
  estMoi: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onResend: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ utilisateur: u, estMoi, onEdit, onToggle, onResend }) => {
  const enAttente = enAttenteActivation(u);
  const initiales = u.nom
    .split(/\s+/)
    .map((m) => m[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2 ${u.actif ? '' : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0">{initiales}</div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-sm truncate">
            {u.nom} {estMoi && <span className="text-[10px] text-gray-400">(vous)</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{LIBELLE_ROLE[u.role]}</span>
            {!u.actif && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">Désactivé</span>}
            {u.actif && enAttente && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Invitation en attente</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-[11px] text-gray-500 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Phone size={11} /> {u.telephone}
        </div>
        {u.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail size={11} /> {u.email}
          </div>
        )}
        {u.location && (
          <div className="flex items-center gap-1.5">
            <Store size={11} /> {u.location.nom}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-1 pt-1 text-[11px] font-semibold">
        {u.actif && enAttente && (
          <button onClick={onResend} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50">
            <Send size={12} /> Renvoyer l’invitation
          </button>
        )}
        <button onClick={onEdit} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-blue-700 hover:bg-blue-50">
          <Pencil size={12} /> Modifier
        </button>
        {!estMoi && (
          <button
            onClick={onToggle}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg ${u.actif ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'}`}
          >
            <Power size={12} /> {u.actif ? 'Désactiver' : 'Réactiver'}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
