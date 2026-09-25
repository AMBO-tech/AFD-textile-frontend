import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { InvitationResponse } from '@/types/users';

interface InvitationLinkModalProps {
  invitation: InvitationResponse;
  onClose: () => void;
}

const formatExpiration = (iso: string) => new Date(iso).toLocaleString('fr-SN', { dateStyle: 'medium', timeStyle: 'short' });

/** Lien d'activation d'un compte invité : à transmettre si le SMS / l'e-mail n'est pas arrivé. */
export const InvitationLinkModal: React.FC<InvitationLinkModalProps> = ({ invitation, onClose }) => {
  const [copie, setCopie] = useState(false);
  const { user, activationUrl, expiresAt, notificationSent } = invitation;

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(activationUrl);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      window.prompt('Copiez le lien :', activationUrl);
    }
  };

  const whatsapp = `https://wa.me/${user.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Bonjour ${user.nom}, voici votre lien pour activer votre compte AFD Textile : ${activationUrl}`,
  )}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900 text-base">Invitation envoyée à {user.nom}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
            notificationSent ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {notificationSent ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="shrink-0 mt-0.5" />}
          <span>
            {notificationSent
              ? `Le lien a été envoyé par SMS${user.email ? ' / e-mail' : ''}. Vous pouvez aussi le transmettre vous-même.`
              : 'Le SMS n’a pas pu partir : transmettez ce lien vous-même.'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-700 break-all">{activationUrl}</div>
        <p className="text-[11px] text-gray-400">Valable jusqu’au {formatExpiration(expiresAt)}.</p>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={copier} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50">
            {copie ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} {copie ? 'Copié' : 'Copier le lien'}
          </button>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: '#16a34a' }}
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default InvitationLinkModal;
