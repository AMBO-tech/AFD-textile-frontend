import React, { useMemo } from 'react';
import { useMockStore, type ClientDetailed, type Creance } from '../../data/useMockStore';
import { soldeClient } from './types';
import { formatMontant } from '../../data/mock';
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
  const { boutiques } = useMockStore();

  const activeBoutiqueNom = useMemo(() => {
    if (boutiqueNom) return boutiqueNom;
    if (!client) return 'Boutique AFD';
    const found = boutiques.find((b) => b.id === client.boutiqueId);
    return found ? found.nom : client.boutique || 'Boutique AFD';
  }, [boutiqueNom, client, boutiques]);

  const totalAchats = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce((acc, cr) => acc + cr.montantTotal, 0);
  }, [client]);

  const totalPaye = useMemo(() => {
    if (!client) return 0;
    return client.creances.reduce(
      (acc, cr) => acc + cr.paiements.reduce((pSum, p) => pSum + p.montant, 0),
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
    const cleanPhone = client.telephone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${client.nom}, l'équipe AFD Textile (${activeBoutiqueNom}) vous remercie pour votre fidélité.`
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
          onClose={onClose}
          onOpenNewDebt={onOpenNewDebt}
          onWhatsApp={handleWhatsApp}
        />

        {/* 2. Tableau de bord des achats */}
        <ClientDetailKpis
          totalAchats={totalAchats}
          totalPaye={totalPaye}
          tauxRecouvrement={tauxRecouvrement}
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
