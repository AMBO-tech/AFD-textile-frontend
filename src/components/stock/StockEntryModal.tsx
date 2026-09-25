import { formatMontant } from '@/utils/format';
import React, { useMemo, useState } from 'react';
import { X, ChevronLeft, Search, Plus, PackagePlus, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Boutique } from '@/types/locations';
import type { Produit } from '@/types/products';
import { LIBELLES_UNITE } from '../../features/pos/pricing';
import { useProductsQuery, useCategoriesQuery } from '../../hooks/queries/useProductsQuery';
import { useExecuteMovementMutation } from '../../hooks/queries/useStocksQuery';
import { productsService } from '../../services/products.service';
import { getErrorMessage } from '../../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { PRODUCT_KEYS } from '../../hooks/queries/useProductsQuery';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

type Etape = 'categories' | 'produits' | 'config';

interface StockEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Entrepôt(s) et boutiques : destinations possibles d'un arrivage. */
  emplacements: Boutique[];
  onOpenCatalogue: () => void;
}

/**
 * Mise en stock (réservée au gérant) : catégorie → tissu du catalogue → emplacement et quantité.
 * POST /stocks/mouvements (ENTREE_MANUELLE) crée la ligne de stock si elle n'existe pas encore.
 */
export const StockEntryModal: React.FC<StockEntryModalProps> = ({ isOpen, onClose, emplacements, onOpenCatalogue }) => {
  const [etape, setEtape] = useState<Etape>('categories');
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [produit, setProduit] = useState<Produit | null>(null);
  const [search, setSearch] = useState('');
  const [emplacementId, setEmplacementId] = useState(emplacements[0]?.id ?? '');
  const [quantite, setQuantite] = useState('');
  const [prixVente, setPrixVente] = useState('');
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [erreur, setErreur] = useState('');

  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: catalogueRes, isLoading } = useProductsQuery({ limit: API_PAGE_MAX, statut: 'ACTIF' });
  const catalogue = useMemo(() => catalogueRes?.data ?? [], [catalogueRes]);
  const { mutateAsync: executeMovement, isPending } = useExecuteMovementMutation();

  if (!isOpen) return null;

  const nbParCategorie = (id: string) => catalogue.filter((p) => p.categorie?.id === id).length;
  const recherche = search.trim().toLowerCase();
  const produitsCategorie = catalogue.filter(
    (p) =>
      p.categorie?.id === categorieId &&
      (p.nom.toLowerCase().includes(recherche) || p.reference.toLowerCase().includes(recherche)),
  );

  const choisirProduit = (p: Produit) => {
    setProduit(p);
    setPrixVente(String(p.prixIndicatif));
    setQuantite('');
    setErreur('');
    setEtape('config');
  };

  const creerCategorie = async () => {
    const nom = nouvelleCategorie.trim();
    if (nom.length < 2) return;
    try {
      const code = nom.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase().slice(0, 50);
      await productsService.createCategory({ code, nom });
      await queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.categories() });
      setNouvelleCategorie('');
      toast.success(`Catégorie « ${nom} » créée.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'La catégorie n’a pas pu être créée.'));
    }
  };

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    const qte = parseFloat(quantite);
    const prix = parseFloat(prixVente);
    if (!produit || !emplacementId || !(qte > 0)) return;
    setErreur('');
    try {
      await executeMovement({
        produitId: produit.id,
        locationId: emplacementId,
        quantite: qte,
        type: 'ENTREE_MANUELLE',
        sens: 'ENTREE',
        uniteUtilisee: produit.uniteStockage,
        justification: `Arrivage : +${qte} ${LIBELLES_UNITE[produit.uniteStockage]}`,
        ...(prix > 0 ? { prixVente: prix } : {}),
      });
      const lieu = emplacements.find((l) => l.id === emplacementId)?.nom ?? 'l’emplacement';
      toast.success(`+${qte} ${LIBELLES_UNITE[produit.uniteStockage]} de ${produit.nom} à ${lieu}.`);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'La mise en stock a échoué.'));
    }
  };

  const retour = () => setEtape(etape === 'config' ? 'produits' : 'categories');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {etape !== 'categories' && (
              <button onClick={retour} className="p-1 text-gray-400 hover:text-gray-700" aria-label="Retour">
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <PackagePlus size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-gray-900 text-base">Mise en stock</h3>
              <p className="text-xs text-gray-500">
                {etape === 'categories' ? '1. Catégorie' : etape === 'produits' ? '2. Tissu' : `3. ${produit?.nom}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {etape === 'categories' && (
            <>
              {isLoading && <p className="text-xs text-gray-400">Chargement du catalogue…</p>}
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategorieId(c.id);
                      setSearch('');
                      setEtape('produits');
                    }}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 text-left"
                  >
                    <div className="font-semibold text-gray-900 text-sm">{c.nom}</div>
                    <div className="text-[11px] text-gray-400">
                      {nbParCategorie(c.id)} tissu{nbParCategorie(c.id) > 1 ? 's' : ''} au catalogue
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <input
                  value={nouvelleCategorie}
                  onChange={(e) => setNouvelleCategorie(e.target.value)}
                  placeholder="Nouvelle catégorie (ex : Brocart)"
                  className="flex-1 h-9 px-3 rounded-xl border border-gray-200 text-xs"
                />
                <button
                  onClick={creerCategorie}
                  disabled={nouvelleCategorie.trim().length < 2}
                  className="h-9 px-3 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus size={14} /> Créer
                </button>
              </div>
            </>
          )}

          {etape === 'produits' && (
            <>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un tissu ou une référence…"
                  className="w-full pl-9 pr-3 h-9 rounded-xl border border-gray-200 text-xs"
                />
              </div>
              {produitsCategorie.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Aucun tissu dans cette catégorie.</p>
              ) : (
                <div className="space-y-1.5">
                  {produitsCategorie.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => choisirProduit(p)}
                      className="w-full p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 flex items-center justify-between gap-3 text-left"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <img src={p.photoUrl} alt={p.nom} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-semibold text-gray-900 text-xs truncate">{p.nom}</span>
                          <span className="block text-[11px] text-gray-400">{p.reference}</span>
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-500 shrink-0">
                        {formatMontant(p.prixIndicatif)}/{LIBELLES_UNITE[p.uniteStockage]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={onOpenCatalogue}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                <ExternalLink size={13} /> Tissu absent ? L’ajouter au catalogue (Produits)
              </button>
            </>
          )}

          {etape === 'config' && produit && (
            <form onSubmit={valider} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Emplacement</label>
                <SelectField value={emplacementId} onChange={setEmplacementId} options={optionsEmplacements(emplacements)} aria-label="Emplacement" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Quantité reçue ({LIBELLES_UNITE[produit.uniteStockage]}s)
                  </label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    required
                    autoFocus
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prix de vente / {LIBELLES_UNITE[produit.uniteStockage]}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={prixVente}
                    onChange={(e) => setPrixVente(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Le prix s’applique à cet emplacement ; laissez le prix indicatif ({formatMontant(produit.prixIndicatif)}) si
                inchangé.
              </p>
              {erreur && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isPending || !(parseFloat(quantite) > 0)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                style={{ background: '#0F3D5E' }}
              >
                {isPending ? 'Enregistrement…' : 'Valider la mise en stock'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockEntryModal;
