import React, { useMemo, useState } from 'react';
import { Plus, ArrowLeftRight, MessageSquare, XCircle, Inbox, Send, Boxes, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Transfert } from '@/types/stocks';
import type { TransfertStatus } from '@/types/enums';
import { cn } from '@/lib/utils';
import NewDemandeModal from './NewDemandeModal';
import ValidateTransferModal from './ValidateTransferModal';
import DirectTransferPanel from './DirectTransferPanel';
import StockAvailabilityPanel from './StockAvailabilityPanel';
import { useTransfersQuery, useCancelTransferMutation } from '../../hooks/queries/useStocksQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

const STATUTS: { id: TransfertStatus; label: string; className: string }[] = [
  { id: 'DEMANDE', label: 'À traiter', className: 'bg-amber-50 text-amber-700' },
  { id: 'EN_TRANSIT', label: 'En transit', className: 'bg-blue-50 text-blue-700' },
  { id: 'VALIDE', label: 'Effectués', className: 'bg-emerald-50 text-emerald-700' },
  { id: 'ANNULE', label: 'Refusés / annulés', className: 'bg-gray-100 text-gray-600' },
];

type Vue = 'demandes' | 'nouveau' | 'stocks';

const VUES: { id: Vue; label: string; description: string; icon: typeof Inbox }[] = [
  { id: 'demandes', label: 'Demandes & historique', description: 'Valider ou refuser', icon: Inbox },
  { id: 'nouveau', label: 'Nouveau transfert', description: 'Sans attendre de demande', icon: Send },
  { id: 'stocks', label: 'Stocks', description: 'Par disponibilité', icon: Boxes },
];

const formatDate = (iso: string) => new Date(iso).toLocaleString('fr-SN', { dateStyle: 'short', timeStyle: 'short' });

interface DemandesProps {
  role: string;
  /** Boutique du boutiquier (destination de ses demandes). */
  boutiqueId?: string | null;
}

/**
 * Gérant : « Transferts » — traite les demandes, effectue des transferts directs (entrepôt ↔ boutiques,
 * boutique ↔ boutique) et consulte le stock par disponibilité.
 * Boutiquier : « Demandes » — demande du stock pour sa boutique et suit ses demandes.
 */
export const Demandes: React.FC<DemandesProps> = ({ role, boutiqueId }) => {
  const isGerant = role === 'OWNER' || role?.toLowerCase() === 'gerant';
  const [vue, setVue] = useState<Vue>('demandes');
  const [sourceInitiale, setSourceInitiale] = useState<string | undefined>();
  const [statut, setStatut] = useState<TransfertStatus>('DEMANDE');
  const [showNew, setShowNew] = useState(false);
  const [aTraiter, setATraiter] = useState<Transfert | null>(null);

  const { data: transfersRes, isLoading } = useTransfersQuery({ statut, limit: API_PAGE_MAX });
  const transferts = transfersRes?.data ?? [];
  const { data: enAttenteRes } = useTransfersQuery({ statut: 'DEMANDE', limit: 1 });
  const enAttente = enAttenteRes?.total ?? enAttenteRes?.meta?.total ?? 0;
  const { data: locRes } = useLocationsListQuery({ limit: API_PAGE_MAX });
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

  const ouvrirTransfert = (locationId?: string) => {
    setSourceInitiale(locationId);
    setVue('nouveau');
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
                ? 'Déplacez le stock entre entrepôts et boutiques, traitez les demandes'
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

      {isGerant && (
        <div className="grid grid-cols-3 gap-2">
          {VUES.map((v) => {
            const Icone = v.icon;
            const actif = vue === v.id;
            return (
              <button
                key={v.id}
                onClick={() => (v.id === 'nouveau' ? ouvrirTransfert(undefined) : setVue(v.id))}
                className={cn(
                  'relative flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 p-3 rounded-2xl border text-center sm:text-left transition-all',
                  actif ? 'bg-[#0F3D5E] border-[#0F3D5E] text-white shadow-md' : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200',
                )}
              >
                <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', actif ? 'bg-white/15' : 'bg-blue-50 text-blue-700')}>
                  <Icone size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs sm:text-sm font-bold leading-tight">{v.label}</span>
                  <span className={cn('hidden sm:block text-[11px]', actif ? 'text-white/70' : 'text-gray-400')}>{v.description}</span>
                </span>
                {v.id === 'demandes' && enAttente > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {enAttente}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isGerant && vue === 'nouveau' && (
        <DirectTransferPanel
          key={sourceInitiale ?? 'defaut'}
          emplacements={emplacements}
          sourceInitiale={sourceInitiale}
          onDone={() => {
            setStatut('VALIDE');
            setVue('demandes');
          }}
        />
      )}
      {isGerant && vue === 'stocks' && <StockAvailabilityPanel emplacements={emplacements} onTransferer={ouvrirTransfert} />}

      {(!isGerant || vue === 'demandes') && (
        <>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
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
                          {formatDate(t.createdAt)} • {t.demandeurNom}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-0.5 min-w-0">
                          <span className="truncate">{t.locationSourceNom ?? 'Source à choisir'}</span>
                          <ArrowRight size={12} className="shrink-0 text-gray-300" />
                          <span className="truncate font-semibold">{t.locationDestinationNom}</span>
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
                          <button onClick={() => setATraiter(t)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#0F3D5E' }}>
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
        </>
      )}

      {!isGerant && boutiqueId && showNew && <NewDemandeModal isOpen onClose={() => setShowNew(false)} boutiqueId={boutiqueId} />}
      {isGerant && aTraiter && (
        <ValidateTransferModal key={aTraiter.id} transfert={aTraiter} emplacements={emplacements} onClose={() => setATraiter(null)} />
      )}
    </div>
  );
};

export default Demandes;
