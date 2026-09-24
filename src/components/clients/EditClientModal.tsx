import React, { useState, useEffect } from 'react';
import { X, Edit2, Phone, MapPin, Store } from 'lucide-react';

import { CustomDropdownSelect } from '../ui/CustomDropdownSelect';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientDetailed | null;
  boutiques: Boutique[];
  role: 'gerant' | 'boutiquier';
  onSubmit: (id: string, updates: { nom: string; telephone: string; adresse: string; boutiqueId: string }) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  boutiques,
  role,
  onSubmit,
}) => {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [boutiqueId, setBoutiqueId] = useState('');

  useEffect(() => {
    if (client) {
      setNom(client.nom || '');
      setTelephone(client.telephone || '');
      setAdresse(client.adresse || '');
      setBoutiqueId(client.boutiqueId || 'b1');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    onSubmit(client.id, {
      nom: nom.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim() || 'Dakar',
      boutiqueId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Edit2 size={18} />
            </div>
            <div>
              <div className="font-display font-bold text-gray-900 text-base">
                Modifier le Client
              </div>
              <div className="text-[11px] text-gray-400">
                Mise à jour des coordonnées
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom complet ou raison sociale *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Aïda Diop ou Atelier Couture Fatou"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Numéro de téléphone (avec indicatif) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
              <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Adresse / Quartier
            </label>
            <div className="relative">
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Ex: Dakar, Médina rue 6"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              />
              <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {role === 'gerant' && (
            <div>
              <CustomDropdownSelect
                label="Boutique d'affectation"
                value={boutiqueId}
                onChange={setBoutiqueId}
                icon={<Store size={15} />}
                menuTitle="Boutique d'affectation"
                options={boutiques.map((b) => ({
                  value: b.id,
                  label: b.nom,
                  sublabel: b.lieu,
                  icon: <Store size={14} />,
                }))}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 cursor-pointer"
              style={{ background: '#0F3D5E' }}
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
