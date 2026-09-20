import React, { useState, useEffect } from 'react';
import { X, Shield, User, Phone, Mail, Building2, Store } from 'lucide-react';
import type { Utilisateur, UserFormData } from './types';
import type { Boutique } from '../../data/useMockStore';
import CustomDropdownSelect from '../ui/CustomDropdownSelect';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: Utilisateur | null;
  boutiques: Boutique[];
  defaultBoutiqueId: string;
  onSave: (data: UserFormData) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  boutiques,
  defaultBoutiqueId,
  onSave,
}) => {
  const [form, setForm] = useState<UserFormData>({
    nom: '',
    telephone: '',
    email: '',
    role: 'boutiquier',
    boutique: defaultBoutiqueId || 'b1',
  });

  useEffect(() => {
    if (editingUser) {
      setForm({
        nom: editingUser.nom,
        telephone: editingUser.telephone || '',
        email: editingUser.email || '',
        role: editingUser.role === 'gerant' ? 'gerant' : 'boutiquier',
        boutique: editingUser.boutique || defaultBoutiqueId || 'b1',
      });
    } else {
      setForm({
        nom: '',
        telephone: '',
        email: '',
        role: 'boutiquier',
        boutique: defaultBoutiqueId || 'b1',
      });
    }
  }, [editingUser, isOpen, defaultBoutiqueId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.telephone.trim()) return;
    if (form.role === 'boutiquier' && !form.boutique) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-gray-900 text-lg">
              {editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Numéro obligatoire · Email optionnel · Choix du rôle
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Nom complet */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nom complet *
            </label>
            <input
              autoFocus
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              placeholder="Ex : Ousmane Diallo"
              className="w-full px-3.5 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400/30"
            />
          </div>

          {/* 2. Numéro de téléphone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Numéro de téléphone * <span className="text-blue-600 font-bold">(Obligatoire)</span>
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                placeholder="+221 77 123 45 67"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>

          {/* 3. Email */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Adresse Email
              </label>
              <span className="text-[11px] text-gray-400 font-medium">(Optionnel)</span>
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@afd-textile.sn (optionnel)"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
            </div>
          </div>

          {/* 4. Choix entre les deux Rôles */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Rôle & Niveau d'accès *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Badge Gérant */}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'gerant' }))}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 active:scale-95 ${
                  form.role === 'gerant'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      form.role === 'gerant'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <Shield size={16} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      form.role === 'gerant' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    Admin
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-gray-900">Gérant</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                    Indépendant / Superviseur global
                  </div>
                </div>
              </button>

              {/* Badge Boutiquier */}
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: 'boutiquier' }))}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 active:scale-95 ${
                  form.role === 'boutiquier'
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      form.role === 'boutiquier'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    <User size={16} />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      form.role === 'boutiquier' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    Vendeur
                  </span>
                </div>
                <div>
                  <div className="font-display font-bold text-xs text-gray-900">Boutiquier</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">
                    Rattaché à une boutique
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 5. Si rôle == Boutiquier */}
          {form.role === 'boutiquier' && (
            <div className="space-y-1.5 animate-scale-up">
              <CustomDropdownSelect
                label="Boutique assignée"
                menuTitle="Sélectionner la boutique d'affectation"
                value={form.boutique}
                onChange={(val) => setForm((f) => ({ ...f, boutique: val }))}
                options={boutiques.map((b) => ({
                  value: b.id,
                  label: b.nom,
                  sublabel: b.lieu,
                  badge: b.code || undefined,
                  icon: <Store size={16} />,
                }))}
                icon={<Building2 size={16} />}
              />
              <p className="text-[11px] text-gray-400 pl-0.5">
                Le boutiquier effectuera ses ventes et créances pour cette boutique uniquement.
              </p>
            </div>
          )}

          {/* Si rôle == Gérant */}
          {form.role === 'gerant' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-800">
              <Shield size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                En tant que <strong>Gérant</strong>, l'utilisateur a un accès global et peut basculer entre toutes les boutiques et l'entrepôt central.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!form.nom.trim() || !form.telephone.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            {editingUser ? 'Enregistrer les modifications' : 'Créer le compte utilisateur'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
