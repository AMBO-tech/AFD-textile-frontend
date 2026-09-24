import { formatMontant } from '@/utils/format';
import React, { useMemo, useState } from 'react';
import { X, FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Client } from '@/types/clients';
import type { Boutique } from '@/types/locations';
import type { MoyenPaiement } from '@/types/enums';
import { MODES_PAIEMENT } from './types';
import {
  LIBELLES_UNITE,
  montantsLigne,
  quantiteEnStock,
  toPosProduit,
  totalPanier,
  unitesDisponibles,
  type LigneVente,
  type UniteVente,
} from '../../features/pos/pricing';
import { useStockLevelsQuery } from '../../hooks/queries/useStocksQuery';
import { useCreateSaleMutation } from '../../hooks/queries/useSalesQuery';
import { getErrorMessage } from '../../services/api';

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

/**
 * Vente à crédit rattachée au client : POST /ventes avec clientId (prix fixés par le serveur),
 * acompte facultatif. La créance apparaît ensuite dans la fiche client et le tableau de bord.
 */
export const NewDebtModal: React.FC<NewDebtModalProps> = ({ isOpen, onClose, client, boutiques, boutiqueImposee }) => {
  const [boutiqueId, setBoutiqueId] = useState<string>(boutiqueImposee ?? boutiques[0]?.id ?? '');
  const [lignes, setLignes] = useState<LigneVente[]>([]);
  const [produitId, setProduitId] = useState('');
  const [qte, setQte] = useState(1);
  const [unite, setUnite] = useState<UniteVente | ''>('');
  const [acompte, setAcompte] = useState('');
  const [modeAcompte, setModeAcompte] = useState<MoyenPaiement>(MODES_PAIEMENT[0].api);
  const [erreur, setErreur] = useState('');

  const { data: stockRes } = useStockLevelsQuery(
    boutiqueId ? { locationId: boutiqueId, limit: API_PAGE_MAX } : undefined,
    { enabled: isOpen && Boolean(boutiqueId) },
  );
  const produits = useMemo(
    () => (stockRes?.data ?? []).map(toPosProduit).filter((p) => p.quantite > 0).sort((a, b) => a.nom.localeCompare(b.nom)),
    [stockRes],
  );
  const { mutateAsync: createSale, isPending } = useCreateSaleMutation();

  if (!isOpen) return null;

  const produit = produits.find((p) => p.id === produitId) ?? null;
  const uniteChoisie: UniteVente | null = unite || produit?.unite || null;
  const total = totalPanier(lignes);
  const acompteNum = parseFloat(acompte) || 0;

  const changerBoutique = (id: string) => {
    setBoutiqueId(id);
    setLignes([]); // les prix dépendent de la boutique
    setProduitId('');
  };

  const ajouterLigne = () => {
    if (!produit || !uniteChoisie || qte <= 0) return;
    if ((quantiteEnStock(qte, uniteChoisie, produit) ?? 0) > produit.quantite) {
      setErreur(`Stock insuffisant pour ${produit.nom} (${produit.quantite} ${LIBELLES_UNITE[produit.unite]}).`);
      return;
    }
    setErreur('');
    setLignes((prev) => [...prev, { produit, qte, unite: uniteChoisie, remise: 0 }]);
    setProduitId('');
    setQte(1);
    setUnite('');
  };

  const handleSubmit = async () => {
    if (lignes.length === 0 || !boutiqueId) return;
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
        ...(acompteNum > 0
          ? { paiementInitial: { montant: acompteNum, modePaiement: modeAcompte } }
          : {}),
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
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

        <div className="p-5 overflow-y-auto space-y-4">
          {!boutiqueImposee && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Boutique</label>
              <select
                value={boutiqueId}
                onChange={(e) => changerBoutique(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-blue-500"
              >
                {boutiques.map((b) => (
                  <option key={b.id} value={b.id}>{b.nom}</option>
                ))}
              </select>
            </div>
          )}

          <div className="p-3 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-2">
            <select
              value={produitId}
              onChange={(e) => {
                setProduitId(e.target.value);
                setUnite('');
              }}
              className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Choisir un tissu en stock…</option>
              {produits.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} — {formatMontant(p.prix)}/{LIBELLES_UNITE[p.unite]} ({p.quantite} en stock)
                </option>
              ))}
            </select>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="number"
                min="0.1"
                step="any"
                value={qte}
                onChange={(e) => setQte(Math.max(0, parseFloat(e.target.value) || 0))}
                className="h-9 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                aria-label="Quantité"
              />
              <select
                value={uniteChoisie ?? ''}
                onChange={(e) => setUnite(e.target.value as UniteVente)}
                disabled={!produit}
                className="h-9 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                aria-label="Unité"
              >
                {(produit ? unitesDisponibles(produit) : []).map((u) => (
                  <option key={u} value={u}>{LIBELLES_UNITE[u]}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={ajouterLigne}
                disabled={!produit}
                className="h-9 px-3 rounded-xl text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1"
                style={{ background: '#0F3D5E' }}
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {lignes.length > 0 && (
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
              {lignes.map((l, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between text-xs gap-2">
                  <span className="truncate">
                    {l.produit.nom} ({l.qte} {LIBELLES_UNITE[l.unite]})
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold">{formatMontant(montantsLigne(l).net)}</span>
                    <button onClick={() => setLignes((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Acompte versé (facultatif)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={acompte}
                onChange={(e) => setAcompte(e.target.value)}
                placeholder="0"
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mode de l'acompte</label>
              <select
                value={modeAcompte}
                onChange={(e) => setModeAcompte(e.target.value as MoyenPaiement)}
                disabled={acompteNum <= 0}
                className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
              >
                {MODES_PAIEMENT.map((m) => (
                  <option key={m.api} value={m.api}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-center justify-between text-xs">
            <span className="text-gray-600">Montant porté au compte du client</span>
            <span className="font-display font-extrabold text-lg text-violet-900">
              {formatMontant(Math.max(0, total - acompteNum))}
            </span>
          </div>

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={lignes.length === 0 || isPending}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer la vente à crédit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDebtModal;
