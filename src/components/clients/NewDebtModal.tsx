import { formatMontant } from '@/utils/format';
import React, { useMemo, useState } from 'react';
import { X, FileText, Trash2, AlertCircle, Shirt, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/clients';
import type { Boutique } from '@/types/locations';
import type { MoyenPaiement } from '@/types/enums';
import { cn } from '@/lib/utils';
import { MODES_PAIEMENT } from './types';
import {
  LIBELLES_UNITE,
  montantsLigne,
  quantiteEnStock,
  toPosProduit,
  totalPanier,
  unitesDisponibles,
  type LigneVente,
  type PosProduit,
} from '../../features/pos/pricing';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';
import { useCategoriesQuery } from '../../hooks/queries/useProductsQuery';
import { useCreateSaleMutation } from '../../hooks/queries/useSalesQuery';
import { getErrorMessage } from '../../services/api';
import SelectField from '../ui/SelectField';
import FabricImage from '../ui/FabricImage';
import FabricPickerModal from '../ui/FabricPickerModal';
import type { FabricOption } from '../ui/fabricOption';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  boutiques: Boutique[];
  /** Boutique imposée (boutiquier) ; sinon le gérant choisit. */
  boutiqueImposee?: string | null;
}

const depasseStock = (l: LigneVente) => (quantiteEnStock(l.qte, l.unite, l.produit) ?? 0) > l.produit.quantite;

/**
 * Vente à crédit rattachée au client : les tissus se choisissent en tuiles (catégorie puis tissu,
 * les plus disponibles d'abord), prix fixés par le serveur, acompte facultatif.
 */
export const NewDebtModal: React.FC<NewDebtModalProps> = ({ isOpen, onClose, client, boutiques, boutiqueImposee }) => {
  const [boutiqueId, setBoutiqueId] = useState<string>(boutiqueImposee ?? boutiques[0]?.id ?? '');
  const [lignes, setLignes] = useState<LigneVente[]>([]);
  const [choix, setChoix] = useState(false);
  const [acompte, setAcompte] = useState('');
  const [modeAcompte, setModeAcompte] = useState<MoyenPaiement>(MODES_PAIEMENT[0].api);
  const [erreur, setErreur] = useState('');

  const { data: stockRes } = useStockLevelsQuery(
    boutiqueId ? { locationId: boutiqueId, limit: API_PAGE_MAX } : undefined,
    { enabled: isOpen && Boolean(boutiqueId) },
  );
  const { data: categories = [] } = useCategoriesQuery();
  const produits = useMemo(() => (stockRes?.data ?? []).map(toPosProduit).filter((p) => p.quantite > 0), [stockRes]);
  const parProduit = useMemo(() => new Map(produits.map((p) => [p.produitId, p])), [produits]);
  const options = useMemo<FabricOption[]>(() => {
    const noms = new Map(categories.map((c) => [c.id, c.nom]));
    return produits.map((p) => ({
      produitId: p.produitId,
      nom: p.nom,
      reference: p.reference,
      categorieId: p.categorieId || 'sans-categorie',
      categorieNom: noms.get(p.categorieId) ?? 'Sans catégorie',
      photoUrl: p.photo,
      disponible: p.quantite,
      unite: p.unite === 'YARD' ? 'METRE' : p.unite,
      prix: p.prix,
    }));
  }, [produits, categories]);
  const { mutateAsync: createSale, isPending } = useCreateSaleMutation();

  if (!isOpen) return null;

  const total = totalPanier(lignes);
  const acompteNum = parseFloat(acompte) || 0;
  const lignesInvalides = lignes.some((l) => l.qte <= 0 || depasseStock(l));

  const changerBoutique = (id: string) => {
    setBoutiqueId(id);
    setLignes([]); // les prix dépendent de la boutique
  };

  const majLigne = (produitId: string, maj: Partial<LigneVente>) =>
    setLignes((ls) => ls.map((l) => (l.produit.produitId === produitId ? { ...l, ...maj } : l)));

  const ajouter = (produit: PosProduit) => {
    if (!lignes.some((l) => l.produit.produitId === produit.produitId)) {
      setLignes([...lignes, { produit, qte: 1, unite: produit.unite, remise: 0 }]);
    }
    setChoix(false);
  };

  const handleSubmit = async () => {
    if (lignes.length === 0 || !boutiqueId || lignesInvalides) return;
    if (acompteNum >= total) {
      setErreur("L'acompte doit être inférieur au total (sinon, enregistrez une vente comptant en caisse).");
      return;
    }
    setErreur('');
    try {
      const vente = await createSale({
        boutiqueId,
        clientId: client.id,
        lignes: lignes.map((l) => ({ produitId: l.produit.produitId, quantite: l.qte, uniteSaisie: l.unite })),
        ...(acompteNum > 0 ? { paiementInitial: { montant: acompteNum, modePaiement: modeAcompte } } : {}),
        idempotencyKey: crypto.randomUUID(),
      });
      toast.success(`Vente à crédit ${vente.referenceFacture} enregistrée : ${formatMontant(vente.soldeDu)} restant dû.`);
      setLignes([]);
      setAcompte('');
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, "La vente à crédit n'a pas pu être enregistrée."));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-50 w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-base">Vente à crédit</h3>
              <p className="text-xs text-gray-500">{client.nom}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {!boutiqueImposee && (
            <SelectField label="Boutique" value={boutiqueId} onChange={changerBoutique} options={optionsEmplacements(boutiques)} />
          )}

          {lignes.map((l) => {
            const trop = depasseStock(l);
            return (
              <div key={l.produit.produitId} className="p-2.5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <FabricImage src={l.produit.photo} nom={l.produit.nom} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{l.produit.nom}</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {formatMontant(l.produit.prix)} / {LIBELLES_UNITE[l.produit.unite]} • {l.produit.quantite} {LIBELLES_UNITE[l.produit.unite]} en stock
                    </div>
                    {trop && <div className="text-[10px] font-semibold text-rose-600">Au-delà du stock disponible</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-gray-900">{formatMontant(montantsLigne(l).net)}</div>
                    <button
                      onClick={() => setLignes((ls) => ls.filter((x) => x.produit.produitId !== l.produit.produitId))}
                      className="mt-1 text-gray-400 hover:text-rose-600"
                      aria-label={`Retirer ${l.produit.nom}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => majLigne(l.produit.produitId, { qte: Math.max(0, l.qte - 1) })} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600" aria-label="Diminuer">
                      <Minus size={14} />
                    </button>
                    <input
                      value={l.qte}
                      onChange={(e) => majLigne(l.produit.produitId, { qte: Math.max(0, parseFloat(e.target.value.replace(',', '.')) || 0) })}
                      inputMode="decimal"
                      aria-label="Quantité"
                      className={cn('w-16 h-8 rounded-xl border text-center text-sm font-bold', trop ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200')}
                    />
                    <button onClick={() => majLigne(l.produit.produitId, { qte: l.qte + 1 })} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600" aria-label="Augmenter">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex gap-1 p-0.5 bg-gray-100 rounded-xl">
                    {unitesDisponibles(l.produit).map((u) => (
                      <button
                        key={u}
                        onClick={() => majLigne(l.produit.produitId, { unite: u })}
                        className={cn('px-2.5 py-1 rounded-lg text-[11px] font-semibold', l.unite === u ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')}
                      >
                        {LIBELLES_UNITE[u]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setChoix(true)}
            disabled={!boutiqueId}
            className="w-full py-5 rounded-2xl border-2 border-dashed border-violet-200 bg-white text-violet-700 hover:bg-violet-50 hover:border-violet-300 flex flex-col items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Shirt size={22} />
            <span className="text-sm font-bold">{lignes.length === 0 ? 'Choisir un tissu' : 'Ajouter un autre tissu'}</span>
            <span className="text-[11px] text-violet-500">Catégorie puis tissu • les plus disponibles d’abord</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Acompte versé (facultatif)</label>
              <input
                inputMode="numeric"
                value={acompte}
                onChange={(e) => setAcompte(e.target.value)}
                placeholder="0"
                className="w-full h-11 px-3 rounded-2xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <SelectField
              label="Mode de l'acompte"
              value={modeAcompte}
              onChange={(v) => setModeAcompte(v as MoyenPaiement)}
              options={MODES_PAIEMENT.map((m) => ({ value: m.api, label: m.label }))}
              disabled={acompteNum <= 0}
            />
          </div>

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Montant porté au compte du client</span>
            <span className="font-display font-extrabold text-lg text-violet-900">{formatMontant(Math.max(0, total - acompteNum))}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={lignes.length === 0 || lignesInvalides || isPending}
            className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer la vente à crédit'}
          </button>
        </div>
      </div>

      {choix && (
        <FabricPickerModal
          titre="Quel tissu pour ce client ?"
          options={options}
          tri="desc"
          selectionnes={lignes.map((l) => l.produit.produitId)}
          onClose={() => setChoix(false)}
          onChoisir={(o) => {
            const p = parProduit.get(o.produitId);
            if (p) ajouter(p);
          }}
        />
      )}
    </div>
  );
};

export default NewDebtModal;
