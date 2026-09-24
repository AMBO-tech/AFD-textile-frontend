import { formatMontant } from '@/utils/format';
import React, { useState, useEffect, useDeferredValue } from 'react';
import { X, CreditCard, Banknote, CheckCircle2, ShoppingBag, ShoppingCart, User, AlertCircle } from 'lucide-react';
import type { LigneVente, ModePaiementPos, PaymentChoice } from './types';
import { MODES_PAIEMENT } from './types';
import { LIBELLES_UNITE, montantsLigne, prixParUnite, totalPanier } from '../../features/pos/pricing';
import { useClientsListQuery } from '../../hooks/queries/useClientsQuery';

export type PaymentTarget =
  | { type: 'direct'; ligne: LigneVente }
  | { type: 'cart'; panier: LigneVente[] };

interface SalesPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PaymentTarget | null;
  /** Rejette avec un message lisible si la vente est refusée : la fenêtre reste alors ouverte. */
  onConfirmPayment: (choice: PaymentChoice) => Promise<void>;
}

const NB_CLIENTS_SUGGERES = 6;
/** Fiche technique créée par l'API pour les encaissements sans client : jamais proposée au vendeur. */
const CLIENT_SYSTEME = 'Client Comptoir Anonyme';

const getModeIcon = (mode: ModePaiementPos) => {
  switch (mode) {
    case 'Espèces':
      return <Banknote size={16} className="text-emerald-600" />;
    case 'Wave':
      return <span className="w-4 h-4 rounded-full bg-sky-500 text-[9px] font-black text-white flex items-center justify-center">W</span>;
    case 'Orange Money':
      return <span className="w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-white flex items-center justify-center">OM</span>;
    case 'Free Money':
      return <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center">F</span>;
    default:
      return <CreditCard size={16} className="text-blue-600" />;
  }
};

export const SalesPaymentModal: React.FC<SalesPaymentModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirmPayment,
}) => {
  const [modePaiement, setModePaiement] = useState<ModePaiementPos>('Espèces');
  const [client, setClient] = useState<{ id: string; nom: string } | null>(null);
  const [rechercheClient, setRechercheClient] = useState('');
  const [montantRecu, setMontantRecu] = useState('');
  const [erreur, setErreur] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recherche = useDeferredValue(rechercheClient.trim());
  const { data: clientsData } = useClientsListQuery({
    ...(recherche ? { search: recherche } : {}),
    limit: NB_CLIENTS_SUGGERES,
  });
  const suggestions = (clientsData?.data ?? []).filter((c) => c.nom !== CLIENT_SYSTEME);

  // Réinitialiser les champs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setModePaiement('Espèces');
      setClient(null);
      setRechercheClient('');
      setMontantRecu('');
      setErreur('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  const lignes = target.type === 'direct' ? [target.ligne] : target.panier;
  const totalNet = totalPanier(lignes);

  const montantRecuNum = parseFloat(montantRecu) || 0;
  const monnaieARendre = modePaiement === 'Espèces' && montantRecuNum > 0 ? montantRecuNum - totalNet : 0;
  const isMontantInsuffisant = modePaiement === 'Espèces' && montantRecuNum > 0 && montantRecuNum < totalNet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMontantInsuffisant || isSubmitting) return;
    setErreur('');
    setIsSubmitting(true);
    try {
      await onConfirmPayment({ mode: modePaiement, clientId: client?.id ?? null, clientNom: client?.nom ?? '' });
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "La vente n'a pas pu être enregistrée.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              {target.type === 'direct' ? <ShoppingBag size={18} /> : <ShoppingCart size={18} />}
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-base">Règlement & Encaissement</h3>
              <p className="text-xs text-gray-500">
                {target.type === 'direct' ? 'Vente directe (1 article)' : `Vente groupée (${lignes.length} articles)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Récapitulatif de la commande */}
          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-200/60 pb-1.5">
              <span>Articles ({lignes.length})</span>
              <span className="font-bold text-gray-800">{formatMontant(totalNet)}</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
              {lignes.map((l, idx) => (
                <div key={idx} className="flex justify-between text-[11px] text-gray-700">
                  <span className="truncate pr-2">
                    {l.produit.nom} ({l.qte} {LIBELLES_UNITE[l.unite]} à {formatMontant(prixParUnite(l.unite, l.produit))})
                  </span>
                  <span className="font-medium shrink-0">{formatMontant(montantsLigne(l).net)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <User size={13} className="text-gray-400" />
              Client (facultatif)
            </label>
            {client ? (
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 text-xs font-semibold text-blue-900">
                <span className="truncate">{client.nom}</span>
                <button
                  type="button"
                  onClick={() => setClient(null)}
                  className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                >
                  Changer
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={rechercheClient}
                  onChange={(e) => setRechercheClient(e.target.value)}
                  placeholder="Rechercher un client (nom ou téléphone)…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
                />
                <div className="mt-1.5 max-h-32 overflow-y-auto space-y-1">
                  {suggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClient({ id: c.id, nom: c.nom })}
                      className="w-full flex justify-between px-3 py-1.5 rounded-lg text-left text-[11px] hover:bg-gray-50 cursor-pointer"
                    >
                      <span className="font-semibold text-gray-800 truncate">{c.nom}</span>
                      <span className="text-gray-400 shrink-0 pl-2">{c.telephone}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Sans sélection : client de passage. Les ventes à crédit se font depuis la fiche client.
                </p>
              </>
            )}
          </div>

          {/* Sélection du mode de paiement */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Mode d'encaissement *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODES_PAIEMENT.map(({ label }) => {
                const isSelected = modePaiement === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setModePaiement(label)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="shrink-0">{getModeIcon(label)}</div>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calcul de monnaie si Espèces */}
          {modePaiement === 'Espèces' && (
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-900">Espèces reçues du client</label>
                <button
                  type="button"
                  onClick={() => setMontantRecu(totalNet.toString())}
                  className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Montant exact
                </button>
              </div>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="numeric"
                value={montantRecu}
                onChange={(e) => setMontantRecu(e.target.value)}
                placeholder={`Ex: ${formatMontant(Math.ceil(totalNet / 1000) * 1000)}`}
                className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
              />
              {montantRecuNum > 0 && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  {monnaieARendre >= 0 ? (
                    <>
                      <span className="text-gray-600">Monnaie à rendre :</span>
                      <span className="font-extrabold text-emerald-700 text-sm">{formatMontant(monnaieARendre)}</span>
                    </>
                  ) : (
                    <span className="text-rose-600 font-semibold text-[11px]">
                      Montant insuffisant (manque {formatMontant(Math.abs(monnaieARendre))})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Total final */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-500 block">
                Total net à encaisser
              </span>
              <span className="text-[10px] text-gray-400">{modePaiement}</span>
            </div>
            <div className="font-display font-extrabold text-xl text-blue-900">{formatMontant(totalNet)}</div>
          </div>

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={isMontantInsuffisant || isSubmitting}
              className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: '#0F3D5E' }}
            >
              <CheckCircle2 size={16} />
              <span>
                {isSubmitting ? 'Enregistrement…' : "Valider l'encaissement"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPaymentModal;
