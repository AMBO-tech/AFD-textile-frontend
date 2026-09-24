import React, { useMemo, useState } from 'react';
import { X, Search, Send, Trash2, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { UniteStockage } from '@/types/enums';
import { LIBELLES_UNITE } from '../../features/pos/pricing';
import { useStockLevelsQuery, useRequestTransferMutation } from '../../hooks/queries/useStocksQuery';
import { useProductsQuery } from '../../hooks/queries/useProductsQuery';
import { getErrorMessage } from '../../services/api';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

interface ArticleDemandable {
  produitId: string;
  nom: string;
  reference: string;
  photo: string;
  unite: UniteStockage;
  /** Quantité disponible dans la boutique du demandeur (0 si jamais stocké). */
  disponible: number;
  enAlerte: boolean;
}

interface LigneDemande {
  article: ArticleDemandable;
  quantite: number;
}

interface NewDemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Boutique du demandeur : destination de la demande. */
  boutiqueId: string;
}

/**
 * Demande de réassort (boutiquier). Les tissus sont choisis dans le catalogue réel — aucune saisie
 * libre, donc aucune erreur de référence — et triés par disponibilité croissante dans SA boutique.
 */
export const NewDemandeModal: React.FC<NewDemandeModalProps> = ({ isOpen, onClose, boutiqueId }) => {
  const [search, setSearch] = useState('');
  const [lignes, setLignes] = useState<LigneDemande[]>([]);
  const [quantites, setQuantites] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState('');

  const { data: stockRes, isLoading: loadingStock } = useStockLevelsQuery(
    { locationId: boutiqueId, limit: API_PAGE_MAX },
    { enabled: isOpen },
  );
  const { data: catalogueRes, isLoading: loadingCatalogue } = useProductsQuery({ limit: API_PAGE_MAX, statut: 'ACTIF' });
  const { mutateAsync: requestTransfer, isPending } = useRequestTransferMutation();

  const articles = useMemo<ArticleDemandable[]>(() => {
    const stocks = stockRes?.data ?? [];
    const enBoutique = new Map(stocks.map((s) => [s.produitId, s]));
    return (catalogueRes?.data ?? [])
      .map((p) => {
        const s = enBoutique.get(p.id);
        return {
          produitId: p.id,
          nom: p.nom,
          reference: p.reference,
          photo: p.photoUrl,
          unite: p.uniteStockage,
          disponible: s?.quantite ?? 0,
          enAlerte: s ? s.estEnAlerte : true,
        };
      })
      .sort((a, b) => a.disponible - b.disponible || a.nom.localeCompare(b.nom));
  }, [stockRes, catalogueRes]);

  if (!isOpen) return null;

  const recherche = search.trim().toLowerCase();
  const dejaAjoutes = new Set(lignes.map((l) => l.article.produitId));
  const visibles = articles.filter(
    (a) =>
      !dejaAjoutes.has(a.produitId) &&
      (!recherche || a.nom.toLowerCase().includes(recherche) || a.reference.toLowerCase().includes(recherche)),
  );

  const ajouter = (a: ArticleDemandable) => {
    const qte = parseFloat(quantites[a.produitId] ?? '');
    if (!(qte > 0)) {
      setErreur(`Indiquez la quantité souhaitée pour ${a.nom}.`);
      return;
    }
    setErreur('');
    setLignes((prev) => [...prev, { article: a, quantite: qte }]);
  };

  const envoyer = async () => {
    if (lignes.length === 0 || isPending) return;
    setErreur('');
    try {
      const transfert = await requestTransfer({
        locationDestinationId: boutiqueId,
        lignes: lignes.map((l) => ({ produitId: l.article.produitId, quantite: l.quantite, unite: l.article.unite })),
      });
      toast.success(`Demande ${transfert.reference} envoyée au gérant.`);
      setLignes([]);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, "La demande n'a pas pu être envoyée."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-gray-900 text-base">Nouvelle demande de stock</h3>
            <p className="text-xs text-gray-500">Tissus classés du moins disponible au plus disponible dans votre boutique</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {lignes.length > 0 && (
            <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Ma demande</div>
              {lignes.map((l) => (
                <div key={l.article.produitId} className="flex items-center justify-between text-xs">
                  <span className="truncate">
                    {l.article.nom} — {l.quantite} {LIBELLES_UNITE[l.article.unite]}
                  </span>
                  <button
                    onClick={() => setLignes((prev) => prev.filter((x) => x.article.produitId !== l.article.produitId))}
                    className="text-gray-400 hover:text-rose-600 shrink-0"
                    aria-label="Retirer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un tissu ou une référence…"
              className="w-full pl-9 pr-3 h-9 rounded-xl border border-gray-200 text-xs"
            />
          </div>

          {loadingStock || loadingCatalogue ? (
            <p className="text-xs text-gray-400 text-center py-6">Chargement…</p>
          ) : (
            <div className="space-y-1.5">
              {visibles.map((a) => (
                <div key={a.produitId} className="p-2.5 rounded-xl border border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={a.photo} alt={a.nom} className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{a.nom}</div>
                      <div className={`text-[11px] ${a.enAlerte ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                        {a.disponible} {LIBELLES_UNITE[a.unite]} en boutique
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={quantites[a.produitId] ?? ''}
                      onChange={(e) => setQuantites((q) => ({ ...q, [a.produitId]: e.target.value }))}
                      placeholder="Qté"
                      className="w-16 h-8 px-2 rounded-lg border border-gray-200 text-xs"
                      aria-label={`Quantité de ${a.nom}`}
                    />
                    <button
                      onClick={() => ajouter(a)}
                      className="h-8 w-8 rounded-lg text-white flex items-center justify-center"
                      style={{ background: '#0F3D5E' }}
                      aria-label={`Ajouter ${a.nom}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {visibles.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Aucun tissu trouvé.</p>}
            </div>
          )}

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={envoyer}
            disabled={lignes.length === 0 || isPending}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            <Send size={14} />
            {isPending ? 'Envoi…' : `Envoyer la demande (${lignes.length} tissu${lignes.length > 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDemandeModal;
