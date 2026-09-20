import React, { useState } from 'react';
import { X, ImagePlus, Camera, Trash2 } from 'lucide-react';

interface QuickCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cat: { nom: string; photo: string }) => void;
}

export const QuickCategoryModal: React.FC<QuickCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [nom, setNom] = useState('');
  const [photo, setPhoto] = useState('');

  if (!isOpen) return null;

  const handlePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPhoto(objectUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    const fallbackPhoto =
      photo.trim() ||
      'https://images.unsplash.com/photo-1552710307-537199cd41c0?w=600&q=80';
    onSubmit({ nom: nom.trim(), photo: fallbackPhoto });
    setNom('');
    setPhoto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <div className="font-display font-bold text-gray-900 text-base">
              Nouvelle Catégorie de Tissu
            </div>
            <div className="text-xs text-gray-400">
              Créer une nouvelle famille de tissus
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sélecteur de photo direct (Fichier / Caméra) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Photo d'illustration (optionnel)
            </label>
            {photo ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                <img src={photo} alt="Aperçu catégorie" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Camera size={14} />
                    <span>Remplacer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoFile}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1.5 w-full py-4 border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 rounded-xl cursor-pointer transition-all bg-gray-50/50">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ImagePlus size={18} />
                </div>
                <div className="text-xs font-semibold text-gray-700">
                  Ajouter une image d'illustration
                </div>
                <div className="text-[11px] text-gray-400">
                  Fichier ou photo appareil (optionnel)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoFile}
                />
              </label>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Une texture par défaut sera automatiquement attribuée si non renseignée.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom de la catégorie *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Soie Sauvage, Lin Décoratif..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            />
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
              disabled={!nom.trim()}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickCategoryModal;
