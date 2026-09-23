import React from 'react';
import { X, Share2, Download, CheckCircle2 } from 'lucide-react';


/**
 * @interface PaymentReceiptData
 * Structure des informations nécessaires pour l'émission d'un reçu de paiement de créance.
 */
export interface PaymentReceiptData {
  receiptId: string;
  clientNom: string;
  clientTelephone: string;
  dossierRef: string;
  montantVerse: number;
  resteDuApres: number;
  modePaiement: string;
  datePaiement: string;
  heurePaiement: string;
  encaisseur: string;
  boutiqueNom: string;
}

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: PaymentReceiptData | null;
}

/**
 * @component PaymentReceiptModal
 * @description Quittance de paiement pour règlement de créance client.
 *
 * Actions disponibles :
 *  - Partage WhatsApp (message texte structuré)
 *  - Téléchargement du PDF officiel généré par le backend (GET /api/v1/payments/:id/receipt.pdf)
 *
 * ⚠️  Aucune impression thermique frontale — les PDF sont exclusivement
 *     générés côté backend et peuvent être joints aux messages de relance WhatsApp.
 */
export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData,
}) => {
  if (!isOpen || !receiptData) return null;

  const handleWhatsApp = () => {
    let cleanPhone = receiptData.clientTelephone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('221') && cleanPhone.length === 9) {
      cleanPhone = '221' + cleanPhone;
    }

    const message = [
      `*AFD TEXTILE - QUITTANCE DE PAIEMENT*`,
      `--------------------------------`,
      `📄 *Reçu N° :* ${receiptData.receiptId}`,
      `👤 *Client :* ${receiptData.clientNom}`,
      `🏪 *Boutique :* ${receiptData.boutiqueNom}`,
      `📅 *Date :* ${receiptData.datePaiement} à ${receiptData.heurePaiement}`,
      `--------------------------------`,
      `💰 *Montant Réglé :* ${formatMontant(receiptData.montantVerse)}`,
      `💳 *Mode :* ${receiptData.modePaiement}`,
      `📁 *Réf Dossier :* ${receiptData.dossierRef}`,
      `⚖️ *Reste dû sur dossier :* ${formatMontant(receiptData.resteDuApres)}`,
      `✍️ *Encaissé par :* ${receiptData.encaisseur}`,
      `--------------------------------`,
      `Merci pour votre fidélité chez AFD Textile !`,
    ].join('\n');

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPdf = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    window.open(`${apiBase}/payments/${receiptData.receiptId}/receipt.pdf`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm">
                Quittance de Règlement
              </h3>
              <p className="text-[11px] text-gray-500">Paiement enregistré avec succès</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corps du reçu */}
        <div className="p-5 font-mono text-xs text-gray-800 space-y-4">
          {/* En-tête entreprise */}
          <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-gray-200">
            <h2 className="font-display font-extrabold text-gray-900 text-base tracking-wider">
              AFD TEXTILE
            </h2>
            <p className="text-[11px] text-gray-500 font-sans">
              Commerce &amp; Demi-Gros de Tissus de Luxe
            </p>
            <p className="text-[10px] text-gray-400 font-sans">
              Dakar - Sénégal | Tél : +221 33 821 00 00
            </p>
            <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-sans text-[10px] font-bold">
              REÇU DE CRÉANCE
            </div>
          </div>

          {/* Métadonnées */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-500">Reçu N° :</span>
              <span className="font-bold text-gray-900">{receiptData.receiptId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date &amp; Heure :</span>
              <span>{receiptData.datePaiement} à {receiptData.heurePaiement}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Point de Vente :</span>
              <span className="font-medium text-gray-800">{receiptData.boutiqueNom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Caissier / Agent :</span>
              <span>{receiptData.encaisseur}</span>
            </div>
          </div>

          {/* Informations client */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-500">Client :</span>
              <span className="font-bold text-gray-900">{receiptData.clientNom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Téléphone :</span>
              <span>{receiptData.clientTelephone || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Dossier Créance :</span>
              <span className="font-medium text-gray-700">#{receiptData.dossierRef}</span>
            </div>
          </div>

          {/* Synthèse du versement */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">MONTANT VERSÉ :</span>
              <span className="text-base font-black text-emerald-700">
                {formatMontant(receiptData.montantVerse)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-800">
              <span>Mode de règlement :</span>
              <span className="font-bold">{receiptData.modePaiement}</span>
            </div>
          </div>

          {/* Reste à payer */}
          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex justify-between font-bold">
              <span className={receiptData.resteDuApres > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {receiptData.resteDuApres > 0 ? 'Reste à payer sur dossier :' : 'Statut du dossier :'}
              </span>
              <span className={receiptData.resteDuApres > 0 ? 'text-rose-600 font-extrabold' : 'text-emerald-600 font-extrabold'}>
                {receiptData.resteDuApres > 0 ? formatMontant(receiptData.resteDuApres) : 'SOLDE ENTIÈREMENT RÉGLÉ ✅'}
              </span>
            </div>
          </div>

          {/* Footer légal */}
          <div className="text-center pt-3 border-t border-dashed border-gray-200 text-[10px] text-gray-400 font-sans">
            <p>Conservez ce reçu pour tout échange ou réclamation.</p>
            <p className="mt-0.5">AFD Textile vous remercie de votre confiance.</p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 text-xs font-semibold transition-colors cursor-pointer"
              title="Génération PDF via GET /api/v1/payments/:id/receipt.pdf"
            >
              <Download size={14} />
              <span>PDF certifié</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <Share2 size={15} />
              <span>Envoyer WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
