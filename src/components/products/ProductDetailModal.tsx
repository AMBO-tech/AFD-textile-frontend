import { formatMontant } from '@/utils/format';
import React from 'react';
import { X } from 'lucide-react';



interface ProductDetailModalProps {
  product: Produit | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  const isCritique = product.quantite <= product.seuil;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-gray-900">{product.nom}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          {product.photo && (
            <img
              src={product.photo}
              alt={product.nom}
              className="w-full h-40 object-cover rounded-xl mb-4"
            />
          )}
          <div className="space-y-3">
            {[
              ['Catégorie', product.categorie],
              ...(product.couleur ? [['Couleur', product.couleur]] : []),
              ['Prix de vente', formatMontant(product.prix)],
              ['Quantité disponible', `${product.quantite} ${product.unite}`],
              ['Nombre de pièces', product.pieces],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium text-gray-800">{v}</span>
              </div>
            ))}
            <div
              className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-sm font-medium ${
                isCritique ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
              }`}
            >
              {isCritique ? 'Stock critique' : 'Stock disponible'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
