import React, { useState, useEffect } from 'react';
import { X, Edit2, Phone, MapPin, AlertCircle } from 'lucide-react';
import type { Client, UpdateClientDto } from '@/types/clients';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  /** Rejette avec un message lisible si l'API refuse : la fenêtre reste ouverte. */
  onSubmit: (id: string, updates: UpdateClientDto) => Promise<void>;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSubmit,
}) => {
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [erreur, setErreur] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setNom(client.nom || '');
      setTelephone(client.telephone || '');
      setAdresse(client.adresse || '');
      setErreur('');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || isSubmitting) return;
    setErreur('');
    setIsSubmitting(true);
    try {
      await onSubmit(client.id, {
        nom: nom.trim(),
        ...(telephone.trim() ? { telephone: telephone.trim() } : {}),
        ...(adresse.trim() ? { adresse: adresse.trim() } : {}),
      });
      onClose();
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Les modifications n'ont pas pu être enregistrées.");
    } finally {
      setIsSubmitting(false);
    }
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

          {erreur && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-sm hover:opacity-95 cursor-pointer disabled:opacity-60"
              style={{ background: '#0F3D5E' }}
            >
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
