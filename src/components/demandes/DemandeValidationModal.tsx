import React, { useState, useEffect, useMemo } from 'react';
import { X, Package, Clock } from 'lucide-react';
import type { Demande, Boutique, StockEnriched } from '../../data/useMockStore';
import DemandeAcceptForm from '../../features/demandes/components/DemandeAcceptForm';
import DemandeRefuseForm from '../../features/demandes/components/DemandeRefuseForm';

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

  const sourcesDisponibles = useMemo(() => {
    if (!validation || validation.action !== 'acceptee') return [];
    const nomTissu = validation.demande.produit.toLowerCase().trim();

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

    return matches.map((s) => {
      const b = boutiques.find((btq) => btq.id === s.boutiqueId);
      const isEntrepot = s.boutiqueId === 'entrepot' || s.boutiqueId === 'b-ent' || b?.type === 'ENTREPOT';
      return {
        sourceId: s.boutiqueId,
        nomSource: isEntrepot ? 'Entrepôt Central' : (b?.nom || s.boutiqueId),
        isEntrepot,
        qteDisponible: s.quantite,
        unite: s.unite || validation.demande.unite || 'm',
      };
    });
  }, [validation, allStocks, boutiques]);

  useEffect(() => {
    if (validation) {
      setQteTransfert(validation.demande.quantite.toString());
      setMotifRefus('Rupture de stock dans tout le réseau');

      if (validation.action === 'acceptee') {
        const entrepotSource = sourcesDisponibles.find((s) => s.isEntrepot && s.qteDisponible > 0);
        if (entrepotSource) {
          setSelectedSourceId(entrepotSource.sourceId);
        } else if (sourcesDisponibles.length > 0) {
          setSelectedSourceId(sourcesDisponibles[0].sourceId);
        } else {
          setSelectedSourceId('');
        }
      }
    }
  }, [validation, sourcesDisponibles]);

  if (!validation) return null;

  const { demande, action } = validation;
  const isAccept = action === 'acceptee';
  const stockSourceDispo = sourcesDisponibles.find((s) => s.sourceId === selectedSourceId)?.qteDisponible || 0;
  const isQteExcessive = isAccept && parseFloat(qteTransfert) > stockSourceDispo;

  const handleSubmitAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSourceId || isQteExcessive) return;

    onConfirm({
      demandeId: demande.id,
      action: 'acceptee',
      sourceBoutiqueId: selectedSourceId,
      quantite: parseFloat(qteTransfert) || demande.quantite,
    });
  };

  const handleSubmitRefuse = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      demandeId: demande.id,
      action: 'refusee',
      motifRefus: motifRefus.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* En-tête modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-base flex items-center gap-2">
              {isAccept ? 'Valider et initier le transfert' : 'Refuser la demande de réassort'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Demande #{demande.id} · Émise par <strong className="text-gray-700">{demande.demandeur}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Détails demande */}
        <div className="my-3 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <Package size={18} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-xs">{demande.produit}</div>
              <div className="text-[11px] text-gray-500">
                Destination : <strong className="text-gray-700">{getBoutiqueName(demande.boutique_demande)}</strong>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm text-gray-900">
              {demande.quantite} {demande.unite || 'm'}
            </div>
            <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
              <Clock size={10} />
              {demande.date}
            </div>
          </div>
        </div>

        {/* Corps formulaire selon action */}
        {isAccept ? (
          <DemandeAcceptForm
            demande={demande}
            sourcesDisponibles={sourcesDisponibles}
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSourceId}
            qteTransfert={qteTransfert}
            onChangeQte={setQteTransfert}
            stockSourceDispo={stockSourceDispo}
            isQteExcessive={isQteExcessive}
            onSubmit={handleSubmitAccept}
            onClose={onClose}
            getBoutiqueName={getBoutiqueName}
          />
        ) : (
          <DemandeRefuseForm
            demande={demande}
            motifRefus={motifRefus}
            onChangeMotif={setMotifRefus}
            onSubmit={handleSubmitRefuse}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default DemandeValidationModal;
