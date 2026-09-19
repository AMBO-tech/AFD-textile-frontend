import React, { useState } from 'react';
import {
  X,
  Users,
  Phone,
  Mail,
  Shield,
  User,
  Clock,
  Copy,
  Check,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BoutiqueWithStaff } from './types';
import type { UtilisateurItem } from '../../data/useMockStore';

interface BoutiqueStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  boutique: BoutiqueWithStaff | null;
}

export const BoutiqueStaffModal: React.FC<BoutiqueStaffModalProps> = ({
  isOpen,
  onClose,
  boutique,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !boutique) return null;

  const handleCopyInvite = (user: UtilisateurItem) => {
    if (!user.invitationToken) return;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.afd-textile.sn';
    const link = `${baseUrl}/activer-compte?token=${user.invitationToken}`;
    navigator.clipboard.writeText(link);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGoToUsers = () => {
    onClose();
    navigate('/utilisateurs');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Entête de la modale */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-base">
                Équipe & Vendeurs — {boutique.nom}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {boutique.personnel.length} membre{boutique.personnel.length > 1 ? 's' : ''} affecté{boutique.personnel.length > 1 ? 's' : ''} à ce point de vente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {boutique.personnel.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Aucun vendeur affecté</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Cette boutique n'a pas encore de boutiquier assigné. Vous pouvez en inviter un depuis l'espace Collaborateurs.
              </p>
              <button
                onClick={handleGoToUsers}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <UserPlus size={14} />
                <span>Affecter un vendeur</span>
              </button>
            </div>
          ) : (
            boutique.personnel.map((u) => {
              const isGerant = u.role === 'gerant';
              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-blue-100 hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar initiales */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900 truncate">
                            {u.nom}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isGerant
                                ? 'bg-blue-50 text-blue-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {isGerant ? <Shield size={10} /> : <User size={10} />}
                            {isGerant ? 'Gérant' : 'Boutiquier'}
                          </span>
                        </div>

                        {/* Téléphone & Email */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {u.telephone && (
                            <a
                              href={`tel:${u.telephone}`}
                              className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
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
                        </div>
                      </div>
                    </div>

                    {/* Statut & Copie lien */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {u.invitationToken ? (
                        <button
                          onClick={() => handleCopyInvite(u)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                          title="Copier le lien d'invitation direct"
                        >
                          {copiedId === u.id ? (
                            <>
                              <Check size={12} className="text-green-600" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Lien activation</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                          Compte actif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ligne d'activité */}
                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {u.derniereConnexion}
                    </span>
                    {!u.actif && (
                      <span className="text-red-500 font-semibold">Accès désactivé</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
          <button
            type="button"
            onClick={handleGoToUsers}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Gérer tous les collaborateurs</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoutiqueStaffModal;
