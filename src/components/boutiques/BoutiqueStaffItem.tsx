import React from 'react';
import {
  Phone,
  Mail,
  Shield,
  User,
  Clock,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';
import type { UtilisateurItem } from '../../data/useMockStore';

interface BoutiqueStaffItemProps {
  user: UtilisateurItem;
  copiedId: string | null;
  onCopyInvite: (u: UtilisateurItem) => void;
  onWhatsApp: (phone: string, name: string) => void;
}

export const BoutiqueStaffItem: React.FC<BoutiqueStaffItemProps> = ({
  user: u,
  copiedId,
  onCopyInvite,
  onWhatsApp,
}) => {
  const isGerant = u.role === 'gerant';

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:border-blue-100 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar avec indicateur d'état subtil */}
          <div className="relative flex-shrink-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-xs"
              style={{
                background: isGerant
                  ? 'linear-gradient(135deg, #0F3D5E, #1E88E5)'
                  : 'linear-gradient(135deg, #1E88E5, #60A5FA)',
              }}
            >
              {u.nom
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            {/* Indicateur d'état compact */}
            {u.actif && !u.invitationToken && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"
                title="Compte actif"
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-gray-900 truncate">
                {u.nom}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isGerant
                    ? 'bg-blue-50 text-blue-800 border border-blue-100'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isGerant ? <Shield size={10} /> : <User size={10} />}
                {isGerant ? 'Gérant' : 'Boutiquier'}
              </span>
              {!u.actif && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                  Désactivé
                </span>
              )}
            </div>

            {/* Coordonnées & Dernière activité */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              {u.telephone && (
                <a
                  href={`tel:${u.telephone}`}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <Phone size={11} className="text-gray-400" />
                  <span>{u.telephone}</span>
                </a>
              )}
              {u.email && (
                <span className="hidden sm:inline-flex items-center gap-1 text-gray-400">
                  <Mail size={11} />
                  <span>{u.email}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Clock size={10} />
                <span>{u.derniereConnexion}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions rapides à droite */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {u.invitationToken && (
            <button
              type="button"
              onClick={() => onCopyInvite(u)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
              title="Copier le lien d'invitation direct"
            >
              {copiedId === u.id ? (
                <>
                  <Check size={12} className="text-green-600" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Lien d'activation</span>
                </>
              )}
            </button>
          )}

          {u.telephone && (
            <>
              <button
                type="button"
                onClick={() => onWhatsApp(u.telephone, u.nom)}
                className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Contacter sur WhatsApp"
              >
                <MessageCircle size={15} />
              </button>
              <a
                href={`tel:${u.telephone}`}
                className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Appeler"
              >
                <Phone size={14} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoutiqueStaffItem;
