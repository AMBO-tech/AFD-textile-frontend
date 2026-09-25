import React, { useState } from 'react';
import { X, Send, AlertCircle, Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestTransferMutation } from '../../hooks/queries/useStocksQuery';
import { useFabricOptions } from '../../hooks/useFabricOptions';
import { getErrorMessage } from '../../services/api';
import FabricPickerModal from '../ui/FabricPickerModal';
import FabricLinesList, { ligneInvalide, quantiteLigne, type FabricLine } from '../ui/FabricLinesList';

interface NewDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Boutique du demandeur : destination de la demande. */
  boutiqueId: string;
}

/**
 * Demande de réassort (boutiquier). Les tissus se choisissent en tuiles (catégorie puis tissu),
 * triés du moins au plus disponible dans SA boutique : aucune saisie libre, aucune erreur de référence.
 */
export const NewDemandeModal: React.FC<NewDemandeModalProps> = ({ isOpen, onClose, boutiqueId }) => {
  const [lignes, setLignes] = useState<FabricLine[]>([]);
  const [choix, setChoix] = useState(false);
  const [erreur, setErreur] = useState('');
  const { options, isLoading } = useFabricOptions(boutiqueId, isOpen);
  const { mutateAsync: requestTransfer, isPending } = useRequestTransferMutation();

  if (!isOpen) return null;

  const invalide = lignes.length === 0 || lignes.some((l) => ligneInvalide(l, false));

  const envoyer = async () => {
    if (invalide || isPending) return;
    setErreur('');
    try {
      const transfert = await requestTransfer({
        locationDestinationId: boutiqueId,
        lignes: lignes.map((l) => ({ produitId: l.option.produitId, quantite: quantiteLigne(l), unite: l.option.unite })),
      });
      toast.success(`Demande ${transfert.reference} envoyée au gérant.`);
      setLignes([]);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'La demande n’a pas pu être envoyée.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-50 w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">Nouvelle demande de stock</h3>
            <p className="text-xs text-gray-500">Le gérant choisira d’où prélever et validera.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {lignes.length > 0 && <FabricLinesList lignes={lignes} onChange={setLignes} libelleDispo="chez vous" />}
          <button
            onClick={() => setChoix(true)}
            disabled={isLoading}
            className="w-full py-5 rounded-2xl border-2 border-dashed border-blue-200 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Shirt size={22} />
            <span className="text-sm font-bold">{lignes.length === 0 ? 'Choisir un tissu' : 'Ajouter un autre tissu'}</span>
            <span className="text-[11px] text-blue-500">Catégorie puis tissu • les moins disponibles chez vous d’abord</span>
          </button>
          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <button
            onClick={envoyer}
            disabled={invalide || isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            <Send size={16} />
            {isPending ? 'Envoi…' : `Envoyer la demande${lignes.length ? ` (${lignes.length} tissu${lignes.length > 1 ? 's' : ''})` : ''}`}
          </button>
        </div>
      </div>

      {choix && (
        <FabricPickerModal
          titre="Quel tissu demander ?"
          options={options}
          tri="asc"
          inclureRuptures
          libelleDispo="chez vous"
          selectionnes={lignes.map((l) => l.option.produitId)}
          onClose={() => setChoix(false)}
          onChoisir={(o) => {
            if (!lignes.some((l) => l.option.produitId === o.produitId)) setLignes([...lignes, { option: o, quantite: '' }]);
            setChoix(false);
          }}
        />
      )}
    </div>
  );
};

export default NewDemandeModal;
