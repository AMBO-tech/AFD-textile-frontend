import { formatMontant } from '@/utils/format';
import React, { useMemo } from 'react';
import type { ClientDetailed, Creance } from '@/types/clients';
import { soldeClient } from './types';
import ClientDetailHeader from '../../features/clients/components/ClientDetailHeader';
import ClientDetailKpis from '../../features/clients/components/ClientDetailKpis';
import ClientCreancesList from '../../features/clients/components/ClientCreancesList';

interface ClientDetailModalProps {
  client: ClientDetailed | null;
  boutiqueNom?: string;
  onClose: () => void;
  onOpenNewDebt: () => void;
  onOpenPayment: (creance: Creance) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  boutiqueNom,
  onClose,
  onOpenNewDebt,
  onOpenPayment,
}) => {
  const boutiques: any[] = [];

  const activeBoutiqueNom = useMemo(() => {
    if (boutiqueNom) return boutiqueNom;
    if (!client) return 'Boutique AFD';
    const found = boutiques.find((b: any) => b.id === client.boutiqueId);
    return found ? found.nom : client.boutique || 'Boutique AFD';
  }, [boutiqueNom, client, boutiques]);

  const totalAchats = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce((acc: any, cr: any) => acc + cr.montantTotal, 0);
  }, [client]);

  const totalPaye = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce(
      (acc: any, cr: any) => acc + cr.paiements.reduce((pSum: any, p: any) => pSum + p.montant, 0),
      0
    );
  }, [client]);

  const solde = useMemo(() => {
    if (!client) return 0;
    return soldeClient(client);
  }, [client]);

  const tauxRecouvrement = totalAchats > 0 ? Math.min(100, Math.round((totalPaye / totalAchats) * 100)) : 100;
  const aDesDettes = solde > 0;

  if (!client) return null;

  const handleWhatsApp = () => {
    const cleanPhone = (client.telephone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      aDesDettes
        ? `Bonjour ${client.nom}, AFD Textile (${activeBoutiqueNom}) vous informe d'un solde restant de ${formatMontant(
            solde
          )} sur vos achats de tissus. Merci de nous contacter pour votre règlement.`
        : `Bonjour ${client.nom}, l'équipe AFD Textile (${activeBoutiqueNom}) vous remercie pour votre fidélité. Votre compte est parfaitement à jour.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        {/* 1. Entête élégante */}
        <ClientDetailHeader
          client={client}
          activeBoutiqueNom={activeBoutiqueNom}
          aDesDettes={aDesDettes}
          solde={solde}
          formatMontant={formatMontant}
          onClose={onClose}
          onOpenNewDebt={onOpenNewDebt}
          onWhatsApp={handleWhatsApp}
        />

        {/* 2. Tableau de bord financier */}
        <ClientDetailKpis
          totalAchats={totalAchats}
          totalPaye={totalPaye}
          solde={solde}
          tauxRecouvrement={tauxRecouvrement}
          aDesDettes={aDesDettes}
          formatMontant={formatMontant}
        />

        {/* 3. Corps scrollable : Dossiers de créances */}
        <ClientCreancesList
          client={client}
          formatMontant={formatMontant}
          onOpenNewDebt={onOpenNewDebt}
          onOpenPayment={onOpenPayment}
        />

        {/* 4. Pied de modale */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div className="text-xs text-gray-500">
            Client affilié : <strong className="text-gray-700">{activeBoutiqueNom}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
