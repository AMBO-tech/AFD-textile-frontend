import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { InvitationResponse, UserItem } from '@/types/users';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { useInviteUserMutation, useUpdateUserMutation } from '../../hooks/queries/useUsersQuery';
import { getErrorMessage } from '../../services/api';
import { LIBELLE_ROLE, type RoleUtilisateur } from './types';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserFormModalProps {
  /** Absent : invitation d'un nouveau membre. */
  utilisateur?: UserItem | null;
  /** Emplacement pré-sélectionné (ajout depuis la fiche d'une boutique). */
  locationIdParDefaut?: string;
  onClose: () => void;
  onInvited?: (invitation: InvitationResponse) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ utilisateur, locationIdParDefaut, onClose, onInvited }) => {
  const edition = Boolean(utilisateur);
  const [nom, setNom] = useState(utilisateur?.nom ?? '');
  const [telephone, setTelephone] = useState(utilisateur?.telephone ?? '');
  const [email, setEmail] = useState(utilisateur?.email ?? '');
  const [role, setRole] = useState<RoleUtilisateur>(utilisateur?.role ?? 'BOUTIQUIER');
  const [locationId, setLocationId] = useState(utilisateur?.locationId ?? locationIdParDefaut ?? '');
  const [erreur, setErreur] = useState('');

  const { data: locRes } = useLocationsListQuery({ actif: true, limit: API_PAGE_MAX });
  const emplacements = locRes?.data ?? [];
  const { mutateAsync: inviter, isPending: invitation } = useInviteUserMutation();
  const { mutateAsync: modifier, isPending: modification } = useUpdateUserMutation();

  const problemes = [
    nom.trim().length < 2 && 'Nom',
    telephone.replace(/\D/g, '').length < 9 && 'Téléphone',
    email.trim() !== '' && !EMAIL_RE.test(email.trim()) && 'E-mail invalide',
    role === 'BOUTIQUIER' && !locationId && 'Boutique d’affectation',
  ].filter(Boolean) as string[];

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (problemes.length > 0) return;
    setErreur('');
    const donnees = {
      nom: nom.trim(),
      telephone: telephone.trim(),
      email: email.trim() || undefined,
      role,
      locationId: role === 'BOUTIQUIER' ? locationId : undefined,
    };
    try {
      if (utilisateur) {
        await modifier({ id: utilisateur.id, data: { ...donnees, locationId: role === 'BOUTIQUIER' ? locationId : null } });
        toast.success(`${donnees.nom} mis à jour.`);
        onClose();
      } else {
        const res = await inviter(donnees);
        onInvited?.(res);
        onClose();
      }
    } catch (error) {
      setErreur(getErrorMessage(error, edition ? 'La modification a échoué.' : 'L’invitation a échoué.'));
    }
  };

  const champ = 'w-full h-9 px-3 rounded-xl border border-gray-200 text-sm';
  const etiquette = 'block text-xs font-semibold text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <form onSubmit={enregistrer} className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900 text-base">{edition ? `Modifier ${utilisateur?.nom}` : 'Inviter un membre'}</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className={etiquette}>Nom complet</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} autoFocus className={champ} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={etiquette}>Téléphone</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} inputMode="tel" placeholder="+221 77 000 00 00" className={champ} />
          </div>
          <div>
            <label className={etiquette}>E-mail — facultatif</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" className={champ} />
          </div>
        </div>

        <div>
          <label className={etiquette}>Rôle</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(LIBELLE_ROLE) as RoleUtilisateur[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  role === r ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600'
                }`}
              >
                {LIBELLE_ROLE[r]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {role === 'OWNER'
              ? 'Accès complet : toutes les boutiques, le stock, les transferts et les membres.'
              : 'Vend et demande du stock pour sa boutique uniquement.'}
          </p>
        </div>

        {role === 'BOUTIQUIER' && (
          <div>
            <label className={etiquette}>Boutique d’affectation</label>
            <SelectField
              value={locationId}
              onChange={setLocationId}
              placeholder="Choisir la boutique"
              aria-label="Boutique d’affectation"
              options={optionsEmplacements(emplacements)}
            />
            {emplacements.length === 0 && (
              <p className="text-[11px] text-amber-700 mt-1">Aucune boutique active : créez-en une dans « Boutiques ».</p>
            )}
          </div>
        )}

        {!edition && (
          <p className="text-[11px] text-gray-400">
            Le membre reçoit un lien pour choisir son mot de passe. Vous pourrez aussi le copier ou l’envoyer par WhatsApp.
          </p>
        )}
        {problemes.length > 0 && <p className="text-[11px] text-gray-400">À compléter : {problemes.join(' • ')}</p>}
        {erreur && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" /> <span>{erreur}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={problemes.length > 0 || invitation || modification}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: '#0F3D5E' }}
        >
          {invitation || modification ? 'Enregistrement…' : edition ? 'Enregistrer' : 'Envoyer l’invitation'}
        </button>
      </form>
    </div>
  );
};

export default UserFormModal;
