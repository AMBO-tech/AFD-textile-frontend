import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Shield,
  User,
  Clock,
  Copy,
  Check,
  ArrowRight,
  UserPlus,
  Store,
  Warehouse,
  MapPin,
  MessageCircle,
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

  const isEntrepot = boutique.type === 'ENTREPOT';
  const Icon = isEntrepot ? Warehouse : Store;

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

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${name}, message de la direction AFD Textile concernant l'emplacement ${boutique.nom}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Entête épurée de la modale */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                style={{
                  background: isEntrepot
                    ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                    : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
                }}
              >
                <Icon size={22} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl truncate">
                    {boutique.nom}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isEntrepot
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}
                  >
                    {isEntrepot ? 'Entrepôt' : 'Boutique'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{boutique.lieu || boutique.adresse || 'Dakar'}</span>
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="font-medium text-gray-700">
                    {boutique.personnel.length} collaborateur{boutique.personnel.length > 1 ? 's' : ''} affecté{boutique.personnel.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Corps de la modale : Liste des collaborateurs */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3 bg-gray-50/40">
          {boutique.personnel.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl bg-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <UserPlus size={22} />
              </div>
              <p className="text-sm font-bold text-gray-900">Aucun collaborateur affecté</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Cet emplacement n'a aucun vendeur ou gérant assigné actuellement.
              </p>
              <button
                type="button"
                onClick={handleGoToUsers}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <UserPlus size={14} />
                <span>Affecter ou inviter un vendeur</span>
              </button>
            </div>
          ) : (
            boutique.personnel.map((u) => {
              const isGerant = u.role === 'gerant';
              return (
                <div
                  key={u.id}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs hover:border-blue-100 hover:shadow-sm transition-all"
                >
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

                    {/* Actions rapides à droite (Sans badge "Compte actif") */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {u.invitationToken && (
                        <button
                          type="button"
                          onClick={() => handleCopyInvite(u)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
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
                            onClick={() => handleWhatsApp(u.telephone, u.nom)}
                            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                            title="Contacter sur WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </button>
                          <a
                            href={`tel:${u.telephone}`}
                            className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
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
            })
          )}
        </div>

        {/* Pied de modale */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <button
            type="button"
            onClick={handleGoToUsers}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Gérer toute l'équipe dans Collaborateurs</span>
            <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoutiqueStaffModal;

