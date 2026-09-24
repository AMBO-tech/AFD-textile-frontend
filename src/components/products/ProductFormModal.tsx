import React, { useState, useEffect } from 'react';
import { X, ImagePlus } from 'lucide-react';


interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Produit | null;
  categories: Categorie[];
  defaultCategory?: string;
  onSave: (data: {
    nom: string;
    categorie: string;
    couleur: string;
    photo: string;
  }) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  defaultCategory = '',
  onSave,
}) => {
  const [form, setForm] = useState({
    nom: '',
    categorie: defaultCategory,
    couleur: '',
    photo: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        nom: editingProduct.nom,
        categorie: editingProduct.categorie,
        couleur: editingProduct.couleur || '',
        photo: editingProduct.photo || '',
      });
    } else {
      setForm({
        nom: '',
        categorie: defaultCategory,
        couleur: '',
        photo: '',
      });
    }
  }, [editingProduct, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, photo: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.categorie) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-display font-bold text-gray-900">
            {editingProduct ? 'Modifier le modèle de tissu' : 'Nouveau modèle de tissu'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Photo (recommandé)
            </label>
            <label
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors"
              style={{ background: form.photo ? 'transparent' : '#f9fafb' }}
            >
              {form.photo ? (
                <img
                  src={form.photo}
                  alt=""
                  className="w-full h-28 object-cover rounded-xl"
                />
              ) : (
                <>
                  <ImagePlus size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-400">Ajouter une photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nom du tissu *
            </label>
            <input
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              placeholder="Ex: Wax Holland Premium"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Catégorie *
            </label>
            <select
              value={form.categorie}
              onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((c) => (
                <option key={c.nom} value={c.nom}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Couleur <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              value={form.couleur}
              onChange={(e) => setForm((f) => ({ ...f, couleur: e.target.value }))}
              placeholder="Ex: Bleu ciel, Multicolore…"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
            💡 <strong>Rappel :</strong> Le prix, la quantité et l'unité sont fixés lors de la{' '}
            <strong>mise en stock</strong> dans chaque boutique ou à l'entrepôt.
          </div>

          <button
            type="submit"
            disabled={!form.nom.trim() || !form.categorie}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm mt-2 disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            {editingProduct
              ? 'Enregistrer les modifications'
              : 'Ajouter le tissu au catalogue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
