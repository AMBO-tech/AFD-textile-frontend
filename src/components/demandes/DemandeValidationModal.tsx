import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Truck,
  Warehouse,
  Store,
  AlertTriangle,
  CheckCircle2,
  Package,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react';

import { CustomDropdownSelect } from '../ui/CustomDropdownSelect';

interface DemandeValidationModalProps {
  validation: { demande: Demande; action: 'acceptee' | 'refusee' } | null;
  boutiques: Boutique[];
  allStocks: StockEnriched[];
  getBoutiqueName: (id: string) => string;
  onClose: () => void;
  onConfirm: (params: {
    demandeId: string;
    action: 'acceptee' | 'refusee';
    sourceBoutiqueId?: string;
    quantite?: number;
    motifRefus?: string;
  }) => void;
}

export const DemandeValidationModal: React.FC<DemandeValidationModalProps> = ({
  validation,
  boutiques,
  allStocks,
  getBoutiqueName,
  onClose,
  onConfirm,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [qteTransfert, setQteTransfert] = useState<string>('');
  const [motifRefus, setMotifRefus] = useState<string>('Rupture de stock dans tout le réseau');

  // Recherche dynamique des points de stockage possédant le tissu demandé
  const sourcesDisponibles = useMemo(() => {
    if (!validation || validation.action !== 'acceptee') return [];
    const nomTissu = validation.demande.produit.toLowerCase().trim();

    // Filtre les stocks qui correspondent au tissu, hors boutique demandeuse
    const matches = allStocks.filter((s) => {
      const matchNom =
        s.nom.toLowerCase().trim() === nomTissu ||
        nomTissu.includes(s.nom.toLowerCase().trim()) ||
        s.nom.toLowerCase().trim().includes(nomTissu) ||
        s.produitId === validation.demande.produit ||
        s.id === validation.demande.produit;

      const isDemandeuse = s.boutiqueId === validation.demande.boutique_demande;
      return matchNom && !isDemandeuse && s.quantite > 0;
    });

    // Agréger par emplacement
    const locMap = new Map<
      string,
      { id: string; nom: string; lieu: string; quantite: number; unite: string; isEntrepot: boolean }
    >();

    for (const m of matches) {
      const bId = m.boutiqueId;
      const isEntrepot = bId === 'entrepot' || bId === 'b-ent';
      const bObj = boutiques.find((b) => b.id === bId);
      const nom = isEntrepot ? 'Entrepôt Central' : bObj?.nom || bId;
      const lieu = isEntrepot ? 'Stock central de réserve' : bObj?.lieu || 'Boutique locale';

      if (locMap.has(bId)) {
        locMap.get(bId)!.quantite += m.quantite;
      } else {
        locMap.set(bId, {
          id: bId,
          nom,
          lieu,
          quantite: m.quantite,
          unite: m.unite || validation.demande.unite || 'mètre',
          isEntrepot,
        });
      }
    }

    // Priorité : Entrepôt Central d'abord, puis plus grand stock disponible
    return Array.from(locMap.values()).sort((a, b) => {
      if (a.isEntrepot && !b.isEntrepot) return -1;
      if (!a.isEntrepot && b.isEntrepot) return 1;
      return b.quantite - a.quantite;
    });
  }, [validation, allStocks, boutiques]);

  // Initialisation à l'ouverture
  useEffect(() => {
    if (validation) {
      setQteTransfert(String(validation.demande.quantite));
      if (sourcesDisponibles.length > 0) {
        setSelectedSourceId(sourcesDisponibles[0].id);
      } else {
        setSelectedSourceId('');
      }
      setMotifRefus('Rupture de stock dans tout le réseau');
    }
  }, [validation, sourcesDisponibles]);

  if (!validation) return null;

  const { demande, action } = validation;
  const isAcceptee = action === 'acceptee';
  const qteNum = parseFloat(qteTransfert) || 0;
  const sourceSelectionnee = sourcesDisponibles.find((s) => s.id === selectedSourceId);
  const stockDispo = sourceSelectionnee ? sourceSelectionnee.quantite : 0;
  const isStockInsuffisant = isAcceptee && sourceSelectionnee && qteNum > stockDispo;
  const cannotSubmit =
    isAcceptee && (sourcesDisponibles.length === 0 || !selectedSourceId || qteNum <= 0 || isStockInsuffisant);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAcceptee) {
      if (cannotSubmit) return;
      onConfirm({
        demandeId: demande.id,
        action: 'acceptee',
        sourceBoutiqueId: selectedSourceId,
        quantite: qteNum,
      });
    } else {
      onConfirm({
        demandeId: demande.id,
        action: 'refusee',
        motifRefus,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up border border-gray-100">
        {/* En-tête modal */}
        <div className="px-5 pt-5 pb-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isAcceptee ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isAcceptee ? <Truck size={18} /> : <Ban size={18} />}
            </div>
            <div>
              <h2 className="font-display font-bold text-gray-900 text-sm">
                {isAcceptee ? "Valider et Expédier le Réassort" : "Refuser la Demande"}
              </h2>
              <p className="text-[11px] text-gray-500">
                {isAcceptee
                  ? "Choisissez la boutique ou l'entrepôt source d'où partira le stock"
                  : "Indiquez la raison du rejet"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Fiche récapitulative de la demande */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/70 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                  Article demandé
                </span>
                <div className="font-bold text-gray-900 text-sm">{demande.produit}</div>
              </div>
              {demande.priorite === 'haute' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  Urgent
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                  Normale
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-blue-100/50">
              <div>
                <span className="text-gray-500 text-[10px] block">Boutique destinataire :</span>
                <strong className="text-gray-900">{getBoutiqueName(demande.boutique_demande)}</strong>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Quantité souhaitée :</span>
                <strong className="text-blue-700">
                  {demande.quantite} {demande.unite || 'mètre(s)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Corps de la modale pour l'EXPÉDITION / ACCEPTATION */}
          {isAcceptee ? (
            <div className="space-y-3.5">
              {sourcesDisponibles.length > 0 ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Emplacement source de prélèvement *
                  </label>
                  <CustomDropdownSelect
                    label="Origine du transfert"
                    value={selectedSourceId}
                    onChange={setSelectedSourceId}
                    icon={<Warehouse size={15} />}
                    menuTitle="Points de stock avec disponibilité"
                    options={sourcesDisponibles.map((src) => ({
                      value: src.id,
                      label: src.nom,
                      sublabel: `${src.quantite} ${src.unite} disponibles en réserve (${src.lieu})`,
                      badge: src.quantite >= qteNum ? 'Disponible' : 'Partiel',
                      icon: src.isEntrepot ? (
                        <Warehouse size={14} className="text-amber-600" />
                      ) : (
                        <Store size={14} className="text-blue-500" />
                      ),
                    }))}
                  />
                  {sourceSelectionnee && (
                    <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-gray-500">
                      <span>Stock physique sur cet emplacement :</span>
                      <strong className={stockDispo < qteNum ? 'text-amber-600' : 'text-emerald-600'}>
                        {stockDispo} {sourceSelectionnee.unite}
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle size={15} className="shrink-0" />
                    Aucune disponibilité dans le réseau
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-600">
                    Ce tissu n'est disponible en stock ni à l'Entrepôt Central ni dans les autres boutiques.
                    Vous pouvez refuser cette demande ou procéder à un arrivage fournisseur.
                  </p>
                </div>
              )}

              {/* Quantité accordée et à expédier */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantité à expédier ({demande.unite || 'mètre'}) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    max={stockDispo > 0 ? stockDispo : undefined}
                    step="any"
                    required
                    value={qteTransfert}
                    onChange={(e) => setQteTransfert(e.target.value)}
                    disabled={sourcesDisponibles.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100/60 disabled:opacity-50"
                  />
                  {sourceSelectionnee && isStockInsuffisant && (
                    <button
                      type="button"
                      onClick={() => setQteTransfert(String(stockDispo))}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors shrink-0"
                    >
                      Ajuster ({stockDispo})
                    </button>
                  )}
                </div>

                {isStockInsuffisant && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    La quantité dépasse le stock disponible ({stockDispo} {sourceSelectionnee?.unite}).
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Corps de la modale pour le REFUS */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Motif du refus *
                </label>
                <CustomDropdownSelect
                  label="Motif du refus"
                  value={motifRefus}
                  onChange={setMotifRefus}
                  icon={<AlertCircle size={15} />}
                  menuTitle="Justification du refus"
                  options={[
                    {
                      value: 'Rupture de stock dans tout le réseau',
                      label: 'Rupture de stock dans tout le réseau',
                      sublabel: 'Aucun point de vente ne dispose de ce tissu',
                      badge: 'Rupture',
                    },
                    {
                      value: 'Stock réservé pour commande client prioritaire',
                      label: 'Stock réservé pour commande client',
                      sublabel: 'Les rouleaux restants sont bloqués pour un client',
                      badge: 'Réservé',
                    },
                    {
                      value: 'Quantité demandée disproportionnée',
                      label: 'Quantité demandée disproportionnée',
                      sublabel: 'Veuillez émettre une demande plus modeste',
                      badge: 'Quantité',
                    },
                    {
                      value: 'Arrivage fournisseur en cours d\'acheminement',
                      label: 'Arrivage fournisseur imminent',
                      sublabel: 'Attendre la livraison globale prévue dans la semaine',
                      badge: 'Attente',
                    },
                    {
                      value: 'Modèle en fin de série / arrêt de réassort',
                      label: 'Arrêt de réassort / fin de série',
                      sublabel: 'Ce modèle ne sera plus réapprovisionné',
                      badge: 'Catalogue',
                    },
                  ]}
                />
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={cannotSubmit}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                cannotSubmit ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
              }`}
              style={{
                background: isAcceptee
                  ? 'linear-gradient(135deg, #0F3D5E, #1E88E5)'
                  : '#DC2626',
              }}
            >
              {isAcceptee ? (
                <>
                  <Truck size={14} />
                  <span>Confirmer l'expédition</span>
                </>
              ) : (
                <>
                  <Ban size={14} />
                  <span>Confirmer le refus</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandeValidationModal;
