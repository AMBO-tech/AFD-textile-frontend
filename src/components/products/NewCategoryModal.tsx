import React, { useState } from 'react';
import { X, ImagePlus } from 'lucide-react';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: { nom: string; photo: string }) => void;
}

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formCat, setFormCat] = useState({ nom: '', photo: '' });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formCat.nom.trim()) return;
    onSave({ nom: formCat.nom.trim(), photo: formCat.photo });
    setFormCat({ nom: '', photo: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-gray-900">Nouvelle catégorie</h2>
          <button onClick={onClose} className="text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
            {formCat.photo ? (
              <img src={formCat.photo} alt="" className="w-full h-24 object-cover rounded-xl" />
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
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFormCat((fc) => ({ ...fc, photo: URL.createObjectURL(f) }));
              }}
            />
          </label>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nom de la catégorie *
            </label>
            <input
              value={formCat.nom}
              onChange={(e) => setFormCat((fc) => ({ ...fc, nom: e.target.value }))}
              placeholder="Ex: Wax"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!formCat.nom.trim()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            Créer la catégorie
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewCategoryModal;
