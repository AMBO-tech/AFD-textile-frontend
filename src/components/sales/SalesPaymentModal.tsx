import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, ShoppingBag, ShoppingCart, User, Banknote, Smartphone, FileText } from 'lucide-react';
import type { LigneVente } from './types';
import { formatMontant } from '../../data/mock';
import { useMockStore } from '../../data/useMockStore';
import CustomDropdownSelect, { type DropdownOption } from '../ui/CustomDropdownSelect';

const OPTIONS_PAIEMENT: DropdownOption[] = [
  {
    value: 'Espèces',
    label: 'Espèces (Cash)',
    sublabel: 'Règlement physique avec calcul de monnaie',
    badge: 'CASH',
    icon: <Banknote size={16} />,
  },
  {
    value: 'Wave',
    label: 'Wave Mobile Money',
    sublabel: 'Paiement sans frais par QR code / numéro',
    badge: 'WAVE',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Orange Money',
    label: 'Orange Money (OM)',
    sublabel: "Transfert d'argent mobile instantané",
    badge: 'OM',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Free Money',
    label: 'Free Money',
    sublabel: 'Portefeuille électronique Free Sénégal',
    badge: 'FREE',
    icon: <Smartphone size={16} />,
  },
  {
    value: 'Carte bancaire',
    label: 'Carte Bancaire / TPE',
    sublabel: 'Terminal bancaire Visa, Mastercard, GIM',
    badge: 'TPE',
    icon: <CreditCard size={16} />,
  },
  {
    value: 'Vente à crédit',
    label: 'Vente à crédit / Compte client',
    sublabel: 'Enregistrement en créance sur la fiche du client',
    badge: 'CRÉDIT',
    icon: <FileText size={16} />,
  },
];

export type PaymentTarget =
  | { type: 'direct'; ligne: LigneVente }
  | { type: 'cart'; panier: LigneVente[] };

interface SalesPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PaymentTarget | null;
  onConfirmPayment: (clientNom: string, modePaiement: string) => void;
}

export const SalesPaymentModal: React.FC<SalesPaymentModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirmPayment,
}) => {
  const { clients } = useMockStore();
  const [modePaiement, setModePaiement] = useState<string>('Espèces');
  const [nomClient, setNomClient] = useState<string>('');
  const [montantRecu, setMontantRecu] = useState<string>('');

  // Calcul du montant total net selon la cible
  const totalNet =
    target?.type === 'direct'
      ? target.ligne.produit.prix * target.ligne.qte -
        Math.min(target.ligne.remise, target.ligne.produit.prix * target.ligne.qte)
      : (target?.panier || []).reduce(
          (s, l) => s + l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
          0
        );

  // Réinitialiser les champs à l'ouverture et pré-remplir avec le montant exact
  useEffect(() => {
    if (isOpen && target) {
      setModePaiement('Espèces');
      setNomClient('');
      setMontantRecu(totalNet.toString());
    }
  }, [isOpen, target, totalNet]);

  if (!isOpen || !target) return null;

  const montantRecuNum = parseFloat(montantRecu) || 0;
  const monnaieARendre = modePaiement === 'Espèces' && montantRecuNum > 0 ? montantRecuNum - totalNet : 0;
  const isMontantInsuffisant = modePaiement === 'Espèces' && (montantRecuNum <= 0 || montantRecuNum < totalNet);
  const isCreditSansClient = modePaiement === 'Vente à crédit' && !nomClient.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMontantInsuffisant || isCreditSansClient) return;
    onConfirmPayment(nomClient.trim() || 'Passage', modePaiement);
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
              <h3 className="font-display font-bold text-gray-900 text-base">
                Règlement & Encaissement
              </h3>
              <p className="text-xs text-gray-500">
                {target.type === 'direct' ? 'Vente directe (1 article)' : `Vente groupée (${target.panier.length} articles)`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Récapitulatif de la commande */}
          {target.type === 'direct' ? (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-200 shrink-0">
                <img
                  src={target.ligne.produit.photo}
                  alt={target.ligne.produit.nom}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-xs truncate">
                  {target.ligne.produit.nom}
                </div>
                <div className="text-[11px] text-gray-500">
                  {target.ligne.qte} {target.ligne.unite} à {formatMontant(target.ligne.produit.prix)}/{target.ligne.unite}
                </div>
                {target.ligne.remise > 0 && (
                  <div className="text-[11px] text-emerald-600 font-medium">
                    Remise : -{formatMontant(target.ligne.remise)}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Total net</span>
                <span className="font-display font-extrabold text-blue-900 text-sm">
                  {formatMontant(totalNet)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-200/60 pb-1.5">
                <span>Panier ({target.panier.length} lignes)</span>
                <span className="font-bold text-gray-800">{formatMontant(totalNet)}</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                {target.panier.map((l, idx) => {
                  const ligneNet = l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte);
                  return (
                    <div key={idx} className="flex justify-between text-[11px] text-gray-700">
                      <span className="truncate pr-2">
                        {l.produit.nom} ({l.qte} {l.unite})
                      </span>
                      <span className="font-medium shrink-0">{formatMontant(ligneNet)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Client bénéficiaire */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <User size={13} className="text-gray-400" />
                Client bénéficiaire {modePaiement === 'Vente à crédit' && <span className="text-rose-600 font-bold">* (Obligatoire pour crédit)</span>}
              </span>
              {modePaiement !== 'Vente à crédit' && (
                <button
                  type="button"
                  onClick={() => setNomClient('')}
                  className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                >
                  Client de passage
                </button>
              )}
            </label>
            <input
              type="text"
              list="clients-comptoir-list"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              placeholder={modePaiement === 'Vente à crédit' ? "Rechercher ou saisir le client (ex: Cheikh Ndiaye)..." : "Passage (Comptoir)"}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none bg-white transition-all ${
                modePaiement === 'Vente à crédit' && !nomClient.trim()
                  ? 'border-amber-400 focus:border-amber-500 ring-2 ring-amber-100'
                  : 'border-gray-200 focus:border-blue-500'
              }`}
            />
            <datalist id="clients-comptoir-list">
              {clients.map((c) => (
                <option key={c.id} value={c.nom}>
                  {c.nom} ({c.telephone || 'Sans tel'})
                </option>
              ))}
            </datalist>
            {modePaiement === 'Vente à crédit' && (
              <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                ⚠️ Une créance de {formatMontant(totalNet)} sera inscrite sur la fiche de ce client.
              </p>
            )}
          </div>

          {/* Sélection du mode de paiement (Même design que BoutiqueSelector) */}
          <div>
            <CustomDropdownSelect
              label="Mode de règlement"
              menuTitle="Modes de paiement acceptés"
              value={modePaiement}
              onChange={setModePaiement}
              options={OPTIONS_PAIEMENT}
              icon={<CreditCard size={16} />}
            />
          </div>

          {/* Calcul de monnaie si Espèces avec touches rapides FCFA */}
          {modePaiement === 'Espèces' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-900">
                  Espèces reçues du client
                </label>
                <button
                  type="button"
                  onClick={() => setMontantRecu(totalNet.toString())}
                  className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Montant exact ({formatMontant(totalNet)})
                </button>
              </div>

              {/* Boutons tactiles rapides de coupures FCFA (BCEAO officielles) */}
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMontantRecu(totalNet.toString())}
                  className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  Exact
                </button>
                <button
                  type="button"
                  onClick={() => setMontantRecu("1000")}
                  className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  1 000 F
                </button>
                <button
                  type="button"
                  onClick={() => setMontantRecu("2000")}
                  className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  2 000 F
                </button>
                <button
                  type="button"
                  onClick={() => setMontantRecu("5000")}
                  className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  5 000 F
                </button>
                <button
                  type="button"
                  onClick={() => setMontantRecu("10000")}
                  className="px-1.5 py-2 rounded-xl bg-white border border-emerald-200 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  10 000 F
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={montantRecu}
                  onChange={(e) => setMontantRecu(e.target.value)}
                  placeholder={`Ex: ${formatMontant(Math.ceil(totalNet / 1000) * 1000)}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Rendu de monnaie dynamique */}
              {montantRecuNum > 0 && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  {monnaieARendre >= 0 ? (
                    <>
                      <span className="text-gray-600 font-medium">Monnaie à rendre :</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatMontant(monnaieARendre)}
                      </span>
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
              <span className="text-[11px] text-gray-500 block">Total net à encaisser</span>
              <span className="text-[10px] text-gray-400">{modePaiement}</span>
            </div>
            <div className="font-display font-extrabold text-xl text-blue-900">
              {formatMontant(totalNet)}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={isMontantInsuffisant}
              className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: '#0F3D5E' }}
            >
              <CheckCircle2 size={16} />
              <span>Valider l'encaissement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesPaymentModal;
