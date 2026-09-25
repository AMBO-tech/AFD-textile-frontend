import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Location } from '@/types/locations';
import type { LocationType } from '@/types/enums';
import { useCreateLocationMutation, useUpdateLocationMutation } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';
import { TYPES_EMPLACEMENT } from './types';

interface LocationFormModalProps {
  emplacement?: Location | null;
  onClose: () => void;
}

/** Création ou modification d'une boutique / d'un entrepôt (réservé au gérant). */
export const LocationFormModal: React.FC<LocationFormModalProps> = ({ emplacement, onClose }) => {
  const edition = Boolean(emplacement);
  const [type, setType] = useState<LocationType>(emplacement?.type ?? 'BOUTIQUE');
  const [nom, setNom] = useState(emplacement?.nom ?? '');
  const [adresse, setAdresse] = useState(emplacement?.adresse ?? '');
  const [telephone, setTelephone] = useState(emplacement?.telephone ?? '');
  const [erreur, setErreur] = useState('');
  const { mutateAsync: creer, isPending: creation } = useCreateLocationMutation();
  const { mutateAsync: modifier, isPending: modification } = useUpdateLocationMutation();

  const nomValide = nom.trim().length >= 2;

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomValide) return;
    setErreur('');
    const donnees = {
      type,
      nom: nom.trim(),
      adresse: adresse.trim() || undefined,
      telephone: telephone.trim() || undefined,
    };
    try {
      if (emplacement) {
        await modifier({ id: emplacement.id, data: donnees });
        toast.success(`« ${donnees.nom} » mis à jour.`);
      } else {
        await creer(donnees);
        toast.success(`${type === 'ENTREPOT' ? 'Entrepôt' : 'Boutique'} « ${donnees.nom} » créé${type === 'BOUTIQUE' ? 'e' : ''}.`);
      }
      onClose();
    } catch (error) {
      setErreur(getErrorMessage(error, 'L’enregistrement a échoué.'));
    }
  };

  const champ = 'w-full h-9 px-3 rounded-xl border border-gray-200 text-sm';
  const etiquette = 'block text-xs font-semibold text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <form onSubmit={enregistrer} className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900 text-base">{edition ? `Modifier ${emplacement?.nom}` : 'Nouvel emplacement'}</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className={etiquette}>Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {TYPES_EMPLACEMENT.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  type === t.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{TYPES_EMPLACEMENT.find((t) => t.id === type)?.aide}</p>
        </div>
        <div>
          <label className={etiquette}>Nom</label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoFocus
            placeholder={type === 'ENTREPOT' ? 'ex. Entrepôt central Bel-Air' : 'ex. Boutique Sandaga'}
            className={champ}
          />
        </div>
        <div>
          <label className={etiquette}>Adresse — facultatif</label>
          <input value={adresse} onChange={(e) => setAdresse(e.target.value)} className={champ} />
        </div>
        <div>
          <label className={etiquette}>Téléphone — facultatif</label>
          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} inputMode="tel" className={champ} />
        </div>

        {erreur && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={!nomValide || creation || modification}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: '#0F3D5E' }}
        >
          {creation || modification ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Créer'}
        </button>
      </form>
    </div>
  );
};

export default LocationFormModal;
