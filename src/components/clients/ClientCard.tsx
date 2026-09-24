import { formatMontant } from '@/utils/format';
import React from 'react';
import { MapPin, ShoppingBag, Edit2, Trash2, MessageCircle, ChevronRight } from 'lucide-react';
import type { Client } from '@/types/clients';
import { soldeClient } from './types';

interface ClientCardProps {
  client: Client;
  onSelect: (client: Client) => void;


}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onSelect,
}) => {
  const solde = soldeClient(client);
  const aDesDettes = solde > 0;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.telephone) return;
    const cleanPhone = client.telephone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${client.nom}, AFD Textile vous informe d'un solde restant de ${solde} sur vos achats de tissus. Merci de nous contacter pour votre règlement.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold text-white text-sm flex-shrink-0"
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
            <span className="font-semibold text-gray-900 text-sm truncate">{client.nom}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="text-gray-600 font-normal">
              Tél : {client.telephone || 'Non renseigné'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />
              {client.adresse || 'Adresse non renseignée'}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-left sm:text-right">
          <div
            className={`font-display font-bold text-sm sm:text-base ${
              aDesDettes ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {aDesDettes ? formatMontant(solde) : 'À jour (0 FCFA)'}
          </div>
          <div className="text-[10px] text-gray-400">
            {client.nombreFacturesImpayees ?? 0} facture{(client.nombreFacturesImpayees ?? 0) > 1 ? 's' : ''} impayée{(client.nombreFacturesImpayees ?? 0) > 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {aDesDettes && client.telephone && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              title="Envoyer une relance WhatsApp"
            >
              <MessageCircle size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onSelect(client)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            title="Consulter l'historique et les achats"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">Voir achats</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect(client)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
