import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, Search, Send, AlertCircle, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Location } from '@/types/locations';
import { useDirectTransferMutation } from '../../hooks/queries/useStocksQuery';
import { useFabricOptions } from '../../hooks/useFabricOptions';
import { getErrorMessage } from '../../services/api';
import SelectField from '../ui/SelectField';
import FabricTile from '../ui/FabricTile';
import FabricLinesList, { ligneInvalide, quantiteLigne, type FabricLine } from '../ui/FabricLinesList';
import { GRILLE_TUILES, trierParDisponibilite, type FabricOption } from '../ui/fabricOption';
import { optionsEmplacements } from '../ui/locationOptions';

interface DirectTransferPanelProps {
  emplacements: Location[];
  /** Départ pré-choisi (depuis la vue Stocks). */
  sourceInitiale?: string;
  onDone?: () => void;
}

/**
 * Transfert direct du gérant (sans demande) : départ, arrivée, puis les tissus du départ
 * en tuiles, triés du plus au moins disponible. L'exécution est atomique côté serveur.
 */
export const DirectTransferPanel: React.FC<DirectTransferPanelProps> = ({ emplacements, sourceInitiale, onDone }) => {
  const actifs = useMemo(() => emplacements.filter((l) => l.actif), [emplacements]);
  const [sourceId, setSourceId] = useState(() => sourceInitiale ?? actifs.find((l) => l.type === 'ENTREPOT')?.id ?? '');
  const [destinationId, setDestinationId] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [recherche, setRecherche] = useState('');
  const [lignes, setLignes] = useState<FabricLine[]>([]);
  const [erreur, setErreur] = useState('');

  // Les emplacements arrivent après le premier rendu : l'entrepôt devient le départ par défaut.
  useEffect(() => {
    if (!sourceId) {
      const entrepot = actifs.find((l) => l.type === 'ENTREPOT');
      if (entrepot) setSourceId(entrepot.id);
    }
  }, [actifs, sourceId]);

  const { options, isLoading } = useFabricOptions(sourceId || undefined);
  const { mutateAsync: transferer, isPending } = useDirectTransferMutation();

  const enStock = useMemo(() => options.filter((o) => o.disponible > 0), [options]);
  const categories = useMemo(
    () => [...new Map(enStock.map((o) => [o.categorieId, o.categorieNom])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [enStock],
  );
  const q = recherche.trim().toLowerCase();
  const tuiles = trierParDisponibilite(
    enStock.filter(
      (o) => (!categorieId || o.categorieId === categorieId) && (!q || `${o.nom} ${o.reference}`.toLowerCase().includes(q)),
    ),
    'desc',
  );

  const source = actifs.find((l) => l.id === sourceId);
  const destination = actifs.find((l) => l.id === destinationId);
  const invalide = !sourceId || !destinationId || lignes.length === 0 || lignes.some((l) => ligneInvalide(l, true));

  const changerSource = (id: string) => {
    setSourceId(id);
    setLignes([]);
    setCategorieId('');
    if (id === destinationId) setDestinationId('');
  };

  const inverser = () => {
    if (!sourceId || !destinationId) return;
    setSourceId(destinationId);
    setDestinationId(sourceId);
    setLignes([]);
  };

  const basculer = (o: FabricOption) =>
    setLignes((ls) =>
      ls.some((l) => l.option.produitId === o.produitId)
        ? ls.filter((l) => l.option.produitId !== o.produitId)
        : [...ls, { option: o, quantite: '' }],
    );

  const executer = async () => {
    if (invalide || isPending) return;
    setErreur('');
    try {
      const t = await transferer({
        locationSourceId: sourceId,
        locationDestinationId: destinationId,
        lignes: lignes.map((l) => ({ produitId: l.option.produitId, quantite: quantiteLigne(l), unite: l.option.unite })),
      });
      toast.success(`Transfert ${t.reference} effectué : ${source?.nom} → ${destination?.nom}.`);
      setLignes([]);
      onDone?.();
    } catch (e) {
      setErreur(getErrorMessage(e, 'Le transfert a échoué.'));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
      <div className="@container space-y-3 min-w-0">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs grid grid-cols-1 @xl:grid-cols-[1fr_auto_1fr] gap-2 @xl:gap-3 items-end">
          <SelectField label="Point de départ" value={sourceId} onChange={changerSource} options={optionsEmplacements(actifs)} placeholder="D’où part le tissu ?" />
          <button
            type="button"
            onClick={inverser}
            disabled={!sourceId || !destinationId}
            className="justify-self-center w-10 h-10 @xl:mb-0.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-blue-700 hover:border-blue-300 flex items-center justify-center disabled:opacity-40"
            aria-label="Inverser départ et arrivée"
            title="Inverser départ et arrivée"
          >
            <ArrowDownUp size={16} className="@xl:rotate-90" />
          </button>
          <SelectField
            label="Point d’arrivée"
            value={destinationId}
            onChange={setDestinationId}
            options={optionsEmplacements(actifs, sourceId)}
            placeholder="Où va le tissu ?"
            disabled={!sourceId}
          />
        </div>

        {!sourceId ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">
            Choisissez le point de départ pour voir ses tissus.
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">Chargement du stock…</div>
        ) : enStock.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 space-y-2">
            <PackageOpen size={28} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-500">Aucun tissu en stock à {source?.nom}.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={`Rechercher dans le stock de ${source?.nom}…`}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[['', 'Toutes'], ...categories].map(([id, nom]) => (
                <button
                  key={id || 'toutes'}
                  onClick={() => setCategorieId(id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    categorieId === id ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {nom}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">Touchez un tissu pour l’ajouter ou le retirer • les plus disponibles d’abord</p>
            <div className={GRILLE_TUILES}>
              {tuiles.map((o) => (
                <FabricTile
                  key={o.produitId}
                  option={o}
                  onClick={() => basculer(o)}
                  choisi={lignes.some((l) => l.option.produitId === o.produitId)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs xl:sticky xl:top-4 flex flex-col xl:max-h-[calc(100vh-120px)]">
        <div className="p-4 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-sm">Récapitulatif</div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 min-w-0">
            <span className="truncate font-semibold text-gray-700">{source?.nom ?? 'Départ ?'}</span>
            <ArrowRight size={12} className="shrink-0" />
            <span className="truncate font-semibold text-gray-700">{destination?.nom ?? 'Arrivée ?'}</span>
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-1">
          {lignes.length === 0 ? (
            <p className="py-6 text-center text-xs text-gray-400">Aucun tissu choisi.</p>
          ) : (
            <FabricLinesList lignes={lignes} onChange={setLignes} plafonnee libelleDispo="au départ" />
          )}
        </div>
        <div className="p-4 border-t border-gray-100 space-y-2">
          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
          <button
            onClick={executer}
            disabled={invalide || isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: '#16a34a' }}
          >
            <Send size={16} /> {isPending ? 'Transfert en cours…' : 'Effectuer le transfert'}
          </button>
          <p className="text-[10px] text-gray-400 text-center">Le stock est retiré au départ et ajouté à l’arrivée immédiatement.</p>
        </div>
      </div>
    </div>
  );
};

export default DirectTransferPanel;
