import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Categorie } from '@/types/products';
import { useCreateCategoryMutation } from '../../hooks/queries/useProductsQuery';
import { getErrorMessage } from '../../services/api';
import { codeCategorie } from './types';

interface NewCategoryModalProps {
  onClose: () => void;
  onCreated?: (categorie: Categorie) => void;
}

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({ onClose, onCreated }) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [erreur, setErreur] = useState('');
  const { mutateAsync: create, isPending } = useCreateCategoryMutation();

  const nomValide = nom.trim().length >= 2 && codeCategorie(nom).length >= 2;

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomValide) return;
    setErreur('');
    try {
      const categorie = await create({
        code: codeCategorie(nom),
        nom: nom.trim(),
        description: description.trim() || undefined,
      });
      toast.success(`Catégorie « ${categorie.nom} » créée.`);
      onCreated?.(categorie);
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'La catégorie n’a pas pu être créée.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <form onSubmit={enregistrer} className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900 text-base">Nouvelle catégorie</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoFocus
            placeholder="ex. Bazin riche"
            className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description (facultatif)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm"
          />
        </div>
        {erreur && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={!nomValide || isPending}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: '#0F3D5E' }}
        >
          {isPending ? 'Création…' : 'Créer la catégorie'}
        </button>
      </form>
    </div>
  );
};

export default NewCategoryModal;
