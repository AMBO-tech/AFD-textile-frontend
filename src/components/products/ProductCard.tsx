import React from 'react';
import { Pencil, Archive } from 'lucide-react';
import type { Produit } from '@/types/products';
import { formatMontant } from '@/utils/format';
import FabricImage from '../ui/FabricImage';
import SquareCard, { Pastille } from '../ui/SquareCard';
import { LIBELLE_UNITE_STOCKAGE } from './types';

interface ProductCardProps {
  produit: Produit;
  gerant: boolean;
  onEdit: () => void;
  onArchive: () => void;
}

/** Carte carrée d'un tissu du catalogue : photo sur 88 %, prix et catégorie en pastilles, actions dessous. */
export const ProductCard: React.FC<ProductCardProps> = ({ produit, gerant, onEdit, onArchive }) => {
  const archive = produit.statut === 'INACTIF';
  const unite = LIBELLE_UNITE_STOCKAGE[produit.uniteStockage];
  const details = [
    produit.reference,
    produit.categorie?.nom,
    produit.couleur,
    produit.prixMinimum != null ? `min. ${formatMontant(produit.prixMinimum)}` : null,
    produit.uniteStockage === 'ROULEAU' && produit.longueurRouleauMetres != null ? `${produit.longueurRouleauMetres} m par rouleau` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-1.5">
      <SquareCard
        titre={produit.nom}
        infobulle={`${produit.nom} — ${details.join(' • ')}`}
        estompe={archive}
        visuel={<FabricImage src={produit.photoUrl} nom={produit.nom} />}
        hautGauche={produit.categorie?.nom ? <Pastille>{produit.categorie.nom}</Pastille> : undefined}
        hautDroite={
          <Pastille className="bg-white/90 text-gray-900">
            {formatMontant(produit.prixIndicatif)} / {unite}
          </Pastille>
        }
        basGauche={<Pastille>{produit.reference}</Pastille>}
        basDroite={archive ? <Pastille className="bg-gray-700 text-white">Archivé</Pastille> : undefined}
      />
      {gerant && !archive && (
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
          <button onClick={onEdit} className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white border border-gray-100 text-blue-700 hover:bg-blue-50">
            <Pencil size={12} /> Modifier
          </button>
          <button onClick={onArchive} className="flex items-center justify-center gap-1 py-1.5 rounded-xl bg-white border border-gray-100 text-rose-600 hover:bg-rose-50">
            <Archive size={12} /> Archiver
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
