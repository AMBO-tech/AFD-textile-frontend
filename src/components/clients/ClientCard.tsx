import React from 'react';
import { Phone, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import type { ClientDetailed } from '../../data/useMockStore';
import { soldeClient } from './types';
import { formatMontant } from '../../data/mock';

interface ClientCardProps {
  client: ClientDetailed;
  boutiqueNom: string;
  onSelect: (client: ClientDetailed) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  boutiqueNom,
  onSelect,
}) => {
  const solde = soldeClient(client);
  const aDesDettes = solde > 0;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = client.telephone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${client.nom}, AFD Textile vous informe d'un solde restant de ${formatMontant(
        solde
      )} sur vos achats de tissus. Merci de nous contacter pour votre règlement.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${client.telephone}`;
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0">
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm truncate">{client.nom}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {boutiqueNom}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />
              {client.telephone}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />
              {client.adresse}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
        <div className="text-left sm:text-right">
          <div
            className={`font-display font-bold text-sm sm:text-base ${
              aDesDettes ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {aDesDettes ? formatMontant(solde) : 'À jour (0 FCFA)'}
          </div>
          <div className="text-[10px] text-gray-400">
            {client.creances.length} dossier{client.creances.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {aDesDettes && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              title="Envoyer un rappel WhatsApp"
            >
              <MessageCircle size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCall}
            className="p-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            title="Appeler le client"
          >
            <Phone size={16} />
          </button>

          <button
            type="button"
            onClick={() => onSelect(client)}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
