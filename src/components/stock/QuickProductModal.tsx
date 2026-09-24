import React, { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';

interface QuickProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { nom: string }[];
  defaultCategory?: string | null;
  onSubmit: (prod: { nom: string; categorie: string; couleur: string; photo: string }) => void;
}

export const QuickProductModal: React.FC<QuickProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategory,
  onSubmit,
}) => {
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState(defaultCategory || categories[0]?.nom || 'Wax');
  const [couleur, setCouleur] = useState('');
  const [photo, setPhoto] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    const fallbackPhoto =
      photo.trim() ||
      'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93?w=600&q=80';

    onSubmit({
      nom: nom.trim(),
      categorie,
      couleur: couleur.trim() || 'Standard',
      photo: fallbackPhoto,
    });

    setNom('');
    setCouleur('');
    setPhoto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="font-display font-bold text-gray-900 text-base">
            Nouveau Modèle de Tissu
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Catégorie de rattachement *
            </label>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c.nom} value={c.nom}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom commercial du tissu *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Bazin Riche Getzner Imperial"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Motif / Couleur dominante
            </label>
            <input
              type="text"
              value={couleur}
              onChange={(e) => setCouleur(e.target.value)}
              placeholder="Ex: Bleu Roi & Argent, Multicolore..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL Photo du tissu (optionnel)
            </label>
            <div className="relative">
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
              <ImagePlus size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 transition-all"
              style={{ background: '#0F3D5E' }}
            >
              Créer le modèle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickProductModal;
