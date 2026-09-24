import React, { useMemo, useState } from 'react';
import { Plus, ArrowLeftRight, MessageSquare, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Transfert } from '@/types/stocks';
import type { TransfertStatus } from '@/types/enums';
import NewDemandeModal from './NewDemandeModal';
import ValidateTransferModal from './ValidateTransferModal';
import { useTransfersQuery, useCancelTransferMutation } from '../../hooks/queries/useStocksQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

const STATUTS: { id: TransfertStatus; label: string; className: string }[] = [
  { id: 'DEMANDE', label: 'À traiter', className: 'bg-amber-50 text-amber-700' },
  { id: 'EN_TRANSIT', label: 'En transit', className: 'bg-blue-50 text-blue-700' },
  { id: 'VALIDE', label: 'Validés', className: 'bg-emerald-50 text-emerald-700' },
  { id: 'ANNULE', label: 'Refusés / annulés', className: 'bg-gray-100 text-gray-600' },
];

const formatDate = (iso: string) => new Date(iso).toLocaleString('fr-SN', { dateStyle: 'short', timeStyle: 'short' });

interface DemandesProps {
  role: string;
  /** Boutique du boutiquier (destination de ses demandes). */
  boutiqueId?: string | null;
}

/**
 * Gérant : « Transferts » — il traite (valide / refuse) les demandes, il n'en émet pas.
 * Boutiquier : « Demandes » — il demande du stock pour sa boutique et suit ses demandes.
 */
export const Demandes: React.FC<DemandesProps> = ({ role, boutiqueId }) => {
  const isGerant = role === 'OWNER' || role?.toLowerCase() === 'gerant';
  const [statut, setStatut] = useState<TransfertStatus>('DEMANDE');
  const [showNew, setShowNew] = useState(false);
  const [aTraiter, setATraiter] = useState<Transfert | null>(null);

  const { data: transfersRes, isLoading } = useTransfersQuery({ statut, limit: API_PAGE_MAX });
  const transferts = transfersRes?.data ?? [];
  const { data: locRes } = useLocationsListQuery();
  const emplacements = useMemo(() => locRes?.data ?? [], [locRes]);
  const { mutateAsync: cancel } = useCancelTransferMutation();

  const retirerDemande = async (t: Transfert) => {
    try {
      await cancel({ id: t.id, motif: 'Demande retirée par le demandeur' });
      toast.success(`Demande ${t.reference} retirée.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Le retrait a échoué.'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            {isGerant ? <ArrowLeftRight size={20} /> : <MessageSquare size={20} />}
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">{isGerant ? 'Transferts' : 'Demandes'}</h1>
            <p className="text-xs sm:text-sm text-gray-500">
              {isGerant
                ? 'Validez ou refusez les demandes de stock des boutiques'
                : 'Demandez du stock pour votre boutique et suivez vos demandes'}
            </p>
          </div>
        </div>
        {!isGerant && boutiqueId && (
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm self-start sm:self-auto"
            style={{ background: '#0F3D5E' }}
          >
            <Plus size={16} /> Nouvelle demande
          </button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto p-1 bg-gray-100/90 rounded-xl">
        {STATUTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatut(s.id)}
            className={`flex-1 whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statut === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Chargement…</div>
      ) : transferts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">
          Aucun transfert dans cette liste.
        </div>
      ) : (
        <div className="space-y-2.5">
          {transferts.map((t) => {
            const badge = STATUTS.find((s) => s.id === t.statut);
            const traitable = isGerant && (t.statut === 'DEMANDE' || t.statut === 'EN_TRANSIT');
            const retirable = !isGerant && t.statut === 'DEMANDE';
            return (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{t.reference}</div>
                    <div className="text-[11px] text-gray-400">
                      {formatDate(t.createdAt)} • {t.demandeurNom} • {t.locationSourceNom ?? 'Source à choisir'} → {t.locationDestinationNom}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge?.className}`}>{badge?.label}</span>
                </div>
                <div className="text-xs text-gray-700">
                  {t.lignes.map((l) => `${l.produitNom} (${l.quantite} ${l.unite.toLowerCase()})`).join(' • ')}
                </div>
                {t.motifAnnulation && <div className="text-[11px] text-gray-500">Motif : {t.motifAnnulation}</div>}
                {(traitable || retirable) && (
                  <div className="flex justify-end pt-1">
                    {traitable && (
                      <button
                        onClick={() => setATraiter(t)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                        style={{ background: '#0F3D5E' }}
                      >
                        Traiter la demande
                      </button>
                    )}
                    {retirable && (
                      <button
                        onClick={() => retirerDemande(t)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <XCircle size={14} /> Retirer ma demande
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isGerant && boutiqueId && showNew && (
        <NewDemandeModal isOpen onClose={() => setShowNew(false)} boutiqueId={boutiqueId} />
      )}
      {isGerant && aTraiter && (
        <ValidateTransferModal
          key={aTraiter.id}
          transfert={aTraiter}
          emplacements={emplacements}
          onClose={() => setATraiter(null)}
        />
      )}
    </div>
  );
};

export default Demandes;
