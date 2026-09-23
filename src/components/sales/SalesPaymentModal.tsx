import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, CheckCircle2, ShoppingBag, ShoppingCart, User, ArrowRight } from 'lucide-react';
import type { LigneVente } from './types';
import { MODES_PAIEMENT } from './types';


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
  const [modePaiement, setModePaiement] = useState<string>('Espèces');
  const [nomClient, setNomClient] = useState<string>('');
  const [montantRecu, setMontantRecu] = useState<string>('');

  // Réinitialiser les champs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setModePaiement('Espèces');
      setNomClient('');
      setMontantRecu('');
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  // Calcul du montant total net selon la cible
  const totalNet =
    target.type === 'direct'
      ? target.ligne.produit.prix * target.ligne.qte -
        Math.min(target.ligne.remise, target.ligne.produit.prix * target.ligne.qte)
      : target.panier.reduce(
          (s, l) => s + l.produit.prix * l.qte - Math.min(l.remise, l.produit.prix * l.qte),
          0
        );

  const montantRecuNum = parseFloat(montantRecu) || 0;
  const monnaieARendre = modePaiement === 'Espèces' && montantRecuNum > 0 ? montantRecuNum - totalNet : 0;
  const isMontantInsuffisant = modePaiement === 'Espèces' && montantRecuNum > 0 && montantRecuNum < totalNet;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMontantInsuffisant) return;
    onConfirmPayment(nomClient.trim() || 'Passage', modePaiement);
  };

  const getModeIcon = (mode: string) => {
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
                Client bénéficiaire
              </span>
              <button
                type="button"
                onClick={() => setNomClient('')}
                className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
              >
                Client de passage
              </button>
            </label>
            <input
              type="text"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
              placeholder="Passage (Comptoir)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>

          {/* Sélection du mode de paiement */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Mode d'encaissement *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODES_PAIEMENT.map((m) => {
                const isSelected = modePaiement === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModePaiement(m)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="shrink-0">{getModeIcon(m)}</div>
                    <span className="truncate">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calcul de monnaie si Espèces */}
          {modePaiement === 'Espèces' && (
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-emerald-900">
                  Espèces reçues du client
                </label>
                <button
                  type="button"
                  onClick={() => setMontantRecu(totalNet.toString())}
                  className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                >
                  Montant exact
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
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Rendu de monnaie dynamique */}
              {montantRecuNum > 0 && (
                <div className="pt-1 flex items-center justify-between text-xs">
                  {monnaieARendre >= 0 ? (
                    <>
                      <span className="text-gray-600">Monnaie à rendre :</span>
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
