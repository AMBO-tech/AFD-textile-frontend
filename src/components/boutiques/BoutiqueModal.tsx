import React, { useState, useEffect } from 'react';
import { X, Store, Warehouse, MapPin, Phone, User, Hash } from 'lucide-react';
import type { BoutiqueFormData, BoutiqueWithStaff } from './types';

interface BoutiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBoutique: BoutiqueWithStaff | null;
  onSave: (data: BoutiqueFormData) => void;
}

export const BoutiqueModal: React.FC<BoutiqueModalProps> = ({
  isOpen,
  onClose,
  editingBoutique,
  onSave,
}) => {
  const [form, setForm] = useState<BoutiqueFormData>({
    code: '',
    nom: '',
    type: 'BOUTIQUE',
    lieu: '',
    adresse: '',
    telephone: '',
    gerant: '',
  });

  useEffect(() => {
    if (editingBoutique) {
      setForm({
        code: editingBoutique.code,
        nom: editingBoutique.nom,
        type: editingBoutique.type,
        lieu: editingBoutique.lieu,
        adresse: editingBoutique.adresse,
        telephone: editingBoutique.telephone,
        gerant: editingBoutique.gerant,
      });
    } else {
      setForm({
        code: `BKT-${Math.floor(100 + Math.random() * 900)}`,
        nom: '',
        type: 'BOUTIQUE',
        lieu: '',
        adresse: '',
        telephone: '',
        gerant: '',
      });
    }
  }, [editingBoutique, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.code.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">
              {editingBoutique ? "Modifier l'emplacement" : 'Nouvel emplacement (Boutique / Entrepôt)'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Gestion du réseau physique de vente et de stockage
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* 1. Type d'emplacement */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Type d'emplacement *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'BOUTIQUE' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.type === 'BOUTIQUE'
                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Store size={18} className={form.type === 'BOUTIQUE' ? 'text-blue-600' : 'text-gray-400'} />
                <span>Boutique de vente</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: 'ENTREPOT' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  form.type === 'ENTREPOT'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Warehouse size={18} className={form.type === 'ENTREPOT' ? 'text-purple-600' : 'text-gray-400'} />
                <span>Entrepôt central</span>
              </button>
            </div>
          </div>

          {/* 2. Code & Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Code *
              </label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="BKT-01"
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Nom de la boutique / entrepôt *
              </label>
              <input
                autoFocus
                required
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="Ex : AFD Textile Pikine"
                className="w-full px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>

          {/* 3. Ville & Adresse */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Ville / Zone
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.lieu}
                  onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))}
                  placeholder="Ex : Dakar - Plateau"
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Téléphone contact
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  placeholder="+221 33 821 00 11"
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
            </div>
          </div>

          {/* 4. Adresse physique détaillée */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Adresse physique complète
            </label>
            <input
              value={form.adresse}
              onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
              placeholder="Ex : Marché Sandaga, Allée 4, Dakar"
              className="w-full px-3.5 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          {/* 5. Gérant / Responsable assigné */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Responsable / Gérant assigné
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.gerant}
                onChange={(e) => setForm((f) => ({ ...f, gerant: e.target.value }))}
                placeholder="Ex : Moussa Diop"
                className="w-full pl-8 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
            >
              {editingBoutique ? 'Enregistrer les modifications' : 'Créer l’emplacement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BoutiqueModal;
