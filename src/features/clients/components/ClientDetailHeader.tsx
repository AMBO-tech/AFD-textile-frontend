import React from 'react';
import { X, MapPin, Store, MessageCircle, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import type { ClientDetailed } from '../../../data/useMockStore';

interface ClientDetailHeaderProps {
  client: ClientDetailed;
  activeBoutiqueNom: string;
  aDesDettes?: boolean;
  solde?: number;
  formatMontant?: (n: number) => string;
  onClose: () => void;
  onOpenNewDebt: () => void;
  onCall?: () => void;
  onWhatsApp: () => void;
}

export const ClientDetailHeader: React.FC<ClientDetailHeaderProps> = ({
  client,
  activeBoutiqueNom,
  aDesDettes = false,
  solde = 0,
  formatMontant,
  onClose,
  onOpenNewDebt,
  onWhatsApp,
}) => {
  return (
    <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar avec initiales */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-white text-base shadow-sm flex-shrink-0"
            style={{
              background: aDesDettes
                ? 'linear-gradient(135deg, #EF4444, #F97316)'
                : 'linear-gradient(135deg, #0F3D5E, #1E88E5)',
            }}
          >
            {client.nom
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-gray-900 text-lg sm:text-xl truncate">
                {client.nom}
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  aDesDettes
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {aDesDettes ? (
                  <>
                    <AlertCircle size={12} />
                    <span>Créance : {formatMontant ? formatMontant(solde) : `${solde} FCFA`}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} />
                    <span>Compte à jour</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              <span className="text-gray-600 font-normal">
                Tél : {client.telephone || 'Sans téléphone'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-gray-400" />
                {client.adresse || 'Adresse non renseignée'}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <Store size={12} />
                {activeBoutiqueNom}
              </span>
            </div>
          </div>
        </div>

        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Actions rapides contact et nouvelle commande */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
        {client.telephone && (
          <button
            onClick={onWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200/60 transition-colors cursor-pointer"
          >
            <MessageCircle size={14} className="text-emerald-600" />
            <span>Message WhatsApp</span>
          </button>
        )}

        <button
          onClick={onOpenNewDebt}
          className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
          style={{ background: '#0F3D5E' }}
        >
          <Plus size={14} />
          <span>Nouvelle vente à crédit</span>
        </button>
      </div>
    </div>
  );
};

export default ClientDetailHeader;
