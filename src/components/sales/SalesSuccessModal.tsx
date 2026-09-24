import { formatMontant } from '@/utils/format';
import React from 'react';
import { CheckCircle, Printer } from 'lucide-react';


interface SalesSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  montant: number;
  paiement: string;
  client: string;
  reference?: string;
}

export const SalesSuccessModal: React.FC<SalesSuccessModalProps> = ({
  isOpen,
  onClose,
  montant,
  paiement,
  client,
  reference,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">
          <CheckCircle size={32} />
        </div>

        <div>
          <div className="font-display font-bold text-gray-900 text-xl">Vente Validée !</div>
          <div className="text-xs text-gray-500 mt-1">
            L'encaissement a été enregistré et le stock mis à jour
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 text-left space-y-1.5 text-xs">
          {reference && (
            <div className="flex justify-between">
              <span className="text-gray-400">Facture :</span>
              <span className="font-semibold text-gray-800">{reference}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Client :</span>
            <span className="font-semibold text-gray-800">{client || 'Passage'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Règlement :</span>
            <span className="font-semibold text-gray-800">{paiement}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span className="font-bold text-gray-900">Montant de la vente :</span>
            <span className="font-bold text-green-700">{formatMontant(montant)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
          >
            <Printer size={15} />
            Imprimer le reçu de caisse
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm hover:opacity-95"
            style={{ background: '#0F3D5E' }}
          >
            Nouvelle vente
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesSuccessModal;
