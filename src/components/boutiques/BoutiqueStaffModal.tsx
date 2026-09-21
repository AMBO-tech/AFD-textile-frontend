import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Store,
  Warehouse,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BoutiqueWithStaff } from './types';
import type { UtilisateurItem } from '../../data/useMockStore';
import BoutiqueStaffItem from './BoutiqueStaffItem';

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
        {/* Entête de la modale */}
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
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
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
              >
                <UserPlus size={14} />
                <span>Affecter ou inviter un vendeur</span>
              </button>
            </div>
          ) : (
            boutique.personnel.map((u) => (
              <BoutiqueStaffItem
                key={u.id}
                user={u}
                copiedId={copiedId}
                onCopyInvite={handleCopyInvite}
                onWhatsApp={handleWhatsApp}
              />
            ))
          )}
        </div>

        {/* Pied de modale */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <button
            type="button"
            onClick={handleGoToUsers}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Gérer toute l'équipe dans Collaborateurs</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoutiqueStaffModal;
