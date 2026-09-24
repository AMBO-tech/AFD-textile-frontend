import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin } from 'lucide-react';


interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  boutiques: Boutique[];
  defaultBoutiqueId: string;
  role: 'gerant' | 'boutiquier';
  onSubmit: (client: { nom: string; telephone: string; adresse: string; boutiqueId: string }) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  boutiques,
  defaultBoutiqueId,
  role,
  onSubmit,
}) => {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [adresse, setAdresse] = useState('');
  const [boutiqueId, setBoutiqueId] = useState(defaultBoutiqueId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    onSubmit({
      nom: nom.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim() || 'Dakar',
      boutiqueId,
    });

    setNom('');
    setTelephone('+221 ');
    setAdresse('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div className="font-display font-bold text-gray-900 text-base">
              Nouveau Client
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Boutique d'enregistrement
              </label>
              <select
                value={boutiqueId}
                onChange={(e) => setBoutiqueId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500"
              >
                {boutiques.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nom} ({b.lieu})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95"
              style={{ background: '#0F3D5E' }}
            >
              Créer le compte client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;
