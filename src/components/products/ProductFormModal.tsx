import React, { useRef, useState } from 'react';
import { X, AlertCircle, ImagePlus, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Produit, CreateProduitDto } from '@/types/products';
import type { UniteStockage } from '@/types/enums';
import {
  useCategoriesQuery,
  useUnitesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from '../../hooks/queries/useProductsQuery';
import { mediaService } from '../../services/media.service';
import { getErrorMessage } from '../../services/api';
import NewCategoryModal from './NewCategoryModal';
import { UNITES_STOCKAGE } from './types';
import SelectField from '../ui/SelectField';

const PHOTO_MAX_OCTETS = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ProductFormModalProps {
  produit?: Produit | null;
  categorieParDefaut?: string;
  onClose: () => void;
}

const versNombre = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(',', '.')));

/** Création ou modification d'un tissu du catalogue (réservé au gérant). */
export const ProductFormModal: React.FC<ProductFormModalProps> = ({ produit, categorieParDefaut, onClose }) => {
  const edition = Boolean(produit);
  const [reference, setReference] = useState(produit?.reference ?? '');
  const [nom, setNom] = useState(produit?.nom ?? '');
  const [categorieId, setCategorieId] = useState(produit?.categorie?.id ?? categorieParDefaut ?? '');
  const [uniteStockage, setUniteStockage] = useState<UniteStockage>(produit?.uniteStockage ?? 'METRE');
  const [prixIndicatif, setPrixIndicatif] = useState(produit ? String(produit.prixIndicatif) : '');
  const [prixMinimum, setPrixMinimum] = useState(produit?.prixMinimum != null ? String(produit.prixMinimum) : '');
  const [longueurRouleau, setLongueurRouleau] = useState(
    produit?.longueurRouleauMetres != null ? String(produit.longueurRouleauMetres) : '',
  );
  const [poidsAuMetre, setPoidsAuMetre] = useState(produit?.poidsAuMetreKg != null ? String(produit.poidsAuMetreKg) : '');
  const [couleur, setCouleur] = useState(produit?.couleur ?? '');
  const [motif, setMotif] = useState(produit?.motif ?? '');
  const [photoUrl, setPhotoUrl] = useState(produit?.photoUrl ?? '');
  const [photoApercu, setPhotoApercu] = useState(produit?.photoUrl ?? '');
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [showCategorie, setShowCategorie] = useState(false);
  const [erreur, setErreur] = useState('');
  const fichierRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useCategoriesQuery();
  const { data: unites = [] } = useUnitesQuery();
  const { mutateAsync: creer, isPending: creation } = useCreateProductMutation();
  const { mutateAsync: modifier, isPending: modification } = useUpdateProductMutation();

  const unitePrincipale = unites.find((u) => u.code === uniteStockage);
  const prix = versNombre(prixIndicatif);
  const plancher = versNombre(prixMinimum);
  const longueur = versNombre(longueurRouleau);
  const poids = versNombre(poidsAuMetre);

  const problemes = [
    reference.trim().length < 2 && 'Référence (2 caractères minimum)',
    nom.trim().length < 2 && 'Nom (2 caractères minimum)',
    !categorieId && 'Catégorie',
    !unitePrincipale && 'Unité introuvable côté serveur',
    (prix === undefined || Number.isNaN(prix) || prix < 0) && 'Prix de vente indicatif',
    plancher !== undefined && prix !== undefined && plancher > prix && 'Le prix minimum dépasse le prix indicatif',
    uniteStockage === 'ROULEAU' && !(longueur && longueur > 0) && 'Longueur d’un rouleau',
    uniteStockage === 'KG' && !(poids && poids > 0) && 'Poids au mètre',
    !photoUrl && 'Photo du tissu',
  ].filter(Boolean) as string[];

  const choisirPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;
    if (!PHOTO_TYPES.includes(fichier.type)) {
      setErreur('Photo : formats acceptés JPEG, PNG ou WebP.');
      return;
    }
    if (fichier.size > PHOTO_MAX_OCTETS) {
      setErreur('Photo : 5 Mo maximum.');
      return;
    }
    setErreur('');
    setPhotoApercu(URL.createObjectURL(fichier));
    setEnvoiPhoto(true);
    try {
      const { url } = await mediaService.uploadTissuPhoto(fichier);
      setPhotoUrl(url);
    } catch (error) {
      setPhotoUrl('');
      setPhotoApercu(produit?.photoUrl ?? '');
      setErreur(getErrorMessage(error, 'La photo n’a pas pu être envoyée.'));
    } finally {
      setEnvoiPhoto(false);
    }
  };

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problemes.length > 0 || !unitePrincipale || prix === undefined) return;
    setErreur('');
    const donnees: CreateProduitDto = {
      reference: reference.trim(),
      nom: nom.trim(),
      categorieId,
      uniteStockage,
      unitePrincipaleId: unitePrincipale.id,
      prixIndicatif: prix,
      prixMinimum: plancher,
      longueurRouleauMetres: uniteStockage === 'ROULEAU' ? longueur : undefined,
      poidsAuMetreKg: poids,
      couleur: couleur.trim() || undefined,
      motif: motif.trim() || undefined,
      photoUrl,
    };
    try {
      if (produit) {
        await modifier({ id: produit.id, data: donnees });
        toast.success(`« ${donnees.nom} » mis à jour.`);
      } else {
        await creer(donnees);
        toast.success(`« ${donnees.nom} » ajouté au catalogue.`);
      }
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'L’enregistrement a échoué.'));
    }
  };

  const champ = 'w-full h-9 px-3 rounded-xl border border-gray-200 text-sm';
  const etiquette = 'block text-xs font-semibold text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={enregistrer}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-900 text-base">
            {edition ? `Modifier ${produit?.reference}` : 'Nouveau tissu'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fichierRef.current?.click()}
              className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 flex items-center justify-center overflow-hidden bg-gray-50 relative"
            >
              {photoApercu ? (
                <img src={photoApercu} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-[10px] text-gray-400">
                  <ImagePlus size={20} /> Photo
                </span>
              )}
              {envoiPhoto && (
                <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-gray-500" />
                </span>
              )}
            </button>
            <input ref={fichierRef} type="file" accept={PHOTO_TYPES.join(',')} className="hidden" onChange={choisirPhoto} />
            <div className="flex-1 space-y-3">
              <div>
                <label className={etiquette}>Référence</label>
                <input value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="ex. BAZ-GETZ-01" className={champ} />
              </div>
              <div>
                <label className={etiquette}>Nom du tissu</label>
                <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex. Getzner Super Magnum" className={champ} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">Catégorie</label>
              <button type="button" onClick={() => setShowCategorie(true)} className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                <Plus size={12} /> Nouvelle catégorie
              </button>
            </div>
            <SelectField
              value={categorieId}
              onChange={setCategorieId}
              placeholder="Choisir une catégorie"
              aria-label="Catégorie"
              options={categories.filter((c) => c.actif !== false).map((c) => ({ value: c.id, label: c.nom, description: c.description ?? undefined }))}
            />
          </div>

          <div>
            <label className={etiquette}>Gestion du stock</label>
            <div className="grid grid-cols-3 gap-1.5">
              {UNITES_STOCKAGE.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUniteStockage(u.id)}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    uniteStockage === u.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{UNITES_STOCKAGE.find((u) => u.id === uniteStockage)?.aide}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {uniteStockage === 'ROULEAU' && (
              <div>
                <label className={etiquette}>Longueur d’un rouleau (m)</label>
                <input inputMode="decimal" value={longueurRouleau} onChange={(e) => setLongueurRouleau(e.target.value)} className={champ} />
              </div>
            )}
            <div>
              <label className={etiquette}>Poids au mètre (kg){uniteStockage === 'KG' ? '' : ' — facultatif'}</label>
              <input inputMode="decimal" value={poidsAuMetre} onChange={(e) => setPoidsAuMetre(e.target.value)} className={champ} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiquette}>Prix indicatif (F CFA / {uniteStockage === 'KG' ? 'kg' : uniteStockage === 'ROULEAU' ? 'rouleau' : 'mètre'})</label>
              <input inputMode="numeric" value={prixIndicatif} onChange={(e) => setPrixIndicatif(e.target.value)} className={champ} />
            </div>
            <div>
              <label className={etiquette}>Prix minimum — facultatif</label>
              <input inputMode="numeric" value={prixMinimum} onChange={(e) => setPrixMinimum(e.target.value)} className={champ} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiquette}>Couleur — facultatif</label>
              <input value={couleur} onChange={(e) => setCouleur(e.target.value)} className={champ} />
            </div>
            <div>
              <label className={etiquette}>Motif — facultatif</label>
              <input value={motif} onChange={(e) => setMotif(e.target.value)} className={champ} />
            </div>
          </div>

          {problemes.length > 0 && (
            <p className="text-[11px] text-gray-400">À compléter : {problemes.join(' • ')}</p>
          )}
          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={problemes.length > 0 || envoiPhoto || creation || modification}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
            style={{ background: '#0F3D5E' }}
          >
            {creation || modification ? 'Enregistrement…' : edition ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
          </button>
        </div>
      </form>

      {showCategorie && (
        <NewCategoryModal onClose={() => setShowCategorie(false)} onCreated={(c) => setCategorieId(c.id)} />
      )}
    </div>
  );
};

export default ProductFormModal;
