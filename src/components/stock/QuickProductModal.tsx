import React, { useState } from 'react';
import { X, ImagePlus, Camera, Trash2, Layers, Tag } from 'lucide-react';
import { CustomDropdownSelect } from '../ui/CustomDropdownSelect';

interface QuickProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { nom: string; photo?: string }[];
  defaultCategory?: string | null;
  onSubmit: (prod: { nom: string; categorie: string; couleur: string; photo: string; motif?: string }) => void;
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
  const [motif, setMotif] = useState('');
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

    // Si aucune photo n'est fournie, on utilise la photo de la catégorie ou un placeholder textile élégant
    const catObj = categories.find((c) => c.nom === categorie);
    const fallbackPhoto =
      photo.trim() ||
      catObj?.photo ||
      'https://images.unsplash.com/photo-1655682614757-a9a33fa45c93?w=600&q=80';

    onSubmit({
      nom: nom.trim(),
      categorie,
      couleur: couleur.trim() || 'Standard',
      motif: motif.trim() || undefined,
      photo: fallbackPhoto,
    });

    setNom('');
    setCouleur('');
    setMotif('');
    setPhoto('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <div className="font-display font-bold text-gray-900 text-base">
              Nouveau Modèle de Tissu
            </div>
            <div className="text-xs text-gray-400">
              Enregistrement dans le catalogue central
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
              Photo du tissu (optionnel)
            </label>
            {photo ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                <img src={photo} alt="Aperçu tissu" className="w-full h-full object-cover" />
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
                  Sélectionner ou prendre une photo
                </div>
                <div className="text-[11px] text-gray-400">
                  Depuis votre téléphone ou ordinateur (JPG, PNG)
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
              Si aucune photo n'est fournie, une photo illustrative de la catégorie sera appliquée automatiquement.
            </p>
          </div>

          <div>
            <CustomDropdownSelect
              label="Catégorie de tissu"
              value={categorie}
              onChange={setCategorie}
              icon={<Layers size={15} />}
              menuTitle="Catégories de tissu"
              options={categories.map((c) => ({
                value: c.nom,
                label: c.nom,
                icon: <Tag size={14} className="text-blue-500" />,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom commercial du modèle *
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

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Couleur dominante
              </label>
              <input
                type="text"
                value={couleur}
                onChange={(e) => setCouleur(e.target.value)}
                placeholder="Ex: Bleu Roi, Blanc..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motif textile
              </label>
              <input
                type="text"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex: Floral, Uni, Brodé..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
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
              disabled={!nom.trim()}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              Enregistrer le modèle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickProductModal;
