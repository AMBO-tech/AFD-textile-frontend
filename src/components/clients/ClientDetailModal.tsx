import { formatMontant } from '@/utils/format';
import React from 'react';
import { X, FileText, CreditCard, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import type { Client } from '@/types/clients';
import { soldeClient } from './types';
import { useClientDebtsQuery } from '../../hooks/queries/useClientsQuery';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenNewDebt: () => void;
  onOpenPayment: () => void;
  onEdit: () => void;
  onArchive: () => void;
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-SN');

/** Fiche client : factures impayées et règlements, lus depuis /clients/:id/creances. */
export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenNewDebt,
  onOpenPayment,
  onEdit,
  onArchive,
}) => {
  const { data: releve, isLoading } = useClientDebtsQuery(client?.id ?? '');

  if (!client) return null;

  const solde = releve?.totalSoldeDu ?? soldeClient(client);
  const factures = releve?.facturesImpayees ?? [];
  const reglements = releve?.historiqueEncaissements ?? [];

  const handleWhatsApp = () => {
    const cleanPhone = (client.telephone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour ${client.nom}, AFD Textile vous informe d'un solde restant de ${formatMontant(solde)} sur vos achats de tissus. Merci de nous contacter pour votre règlement.`,
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-gray-900 text-lg truncate">{client.nom}</h3>
            <p className="text-xs text-gray-500">
              {client.telephone || 'Téléphone non renseigné'}
              {client.adresse ? ` • ${client.adresse}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Modifier">
              <Pencil size={16} />
            </button>
            <button onClick={onArchive} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50" title="Archiver">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-gray-500">Solde restant dû</div>
              <div className={`font-display font-extrabold text-xl ${solde > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatMontant(solde)}
              </div>
              <div className="text-[11px] text-gray-500">
                {factures.length} facture{factures.length > 1 ? 's' : ''} impayée{factures.length > 1 ? 's' : ''}
              </div>
            </div>
            {solde > 0 && client.telephone && (
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              >
                <MessageCircle size={14} /> Relancer
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenNewDebt}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FileText size={15} /> Nouvelle vente à crédit
            </button>
            <button
              onClick={onOpenPayment}
              disabled={solde <= 0}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: '#0F3D5E' }}
            >
              <CreditCard size={15} /> Encaisser un règlement
            </button>
          </div>

          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Factures impayées</h4>
            {isLoading ? (
              <p className="text-xs text-gray-400">Chargement…</p>
            ) : factures.length === 0 ? (
              <p className="text-xs text-gray-400">Aucune facture en attente de règlement.</p>
            ) : (
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
                {factures.map((f) => (
                  <div key={f.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">{f.referenceFacture}</div>
                      <div className="text-gray-400">
                        {formatDate(f.createdAt)} • {f.boutiqueNom}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-amber-700">{formatMontant(f.soldeDu)}</div>
                      <div className="text-[10px] text-gray-400">sur {formatMontant(f.montantTotal)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Derniers règlements</h4>
            {reglements.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun règlement enregistré.</p>
            ) : (
              <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
                {reglements.map((r) => (
                  <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-gray-900">{r.referenceRecu}</div>
                      <div className="text-gray-400">
                        {formatDate(r.dateEncaissement)} • {r.modePaiement.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="font-bold text-emerald-700">{formatMontant(r.montantTotal)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal;
