import React, { useEffect, useState } from 'react';
import { UserPlus, Search, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { InvitationResponse, UserItem } from '@/types/users';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUsersListQuery, useToggleUserStatusMutation, useResendInviteMutation } from '../../hooks/queries/useUsersQuery';
import { getErrorMessage } from '../../services/api';
import UserCard from './UserCard';
import UserFormModal from './UserFormModal';
import InvitationLinkModal from './InvitationLinkModal';
import { LIBELLE_ROLE, type RoleUtilisateur } from './types';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;
const DELAI_RECHERCHE_MS = 300;

interface UsersProps {
  /** Restreint la liste aux membres d'un emplacement (fiche boutique). */
  locationId?: string;
  /** Masque l'en-tête de page (affichage dans une fenêtre). */
  integre?: boolean;
}

/** Membres de l'équipe : invitation, modification, désactivation (réservé au gérant). */
export const Users: React.FC<UsersProps> = ({ locationId, integre = false }) => {
  const moi = useAuthStore((s) => s.user);
  const [saisie, setSaisie] = useState('');
  const [recherche, setRecherche] = useState('');
  const [role, setRole] = useState<RoleUtilisateur | ''>('');
  const [formulaire, setFormulaire] = useState<{ utilisateur: UserItem | null } | null>(null);
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setRecherche(saisie.trim()), DELAI_RECHERCHE_MS);
    return () => clearTimeout(t);
  }, [saisie]);

  const { data: res, isLoading, isError, error } = useUsersListQuery({
    search: recherche || undefined,
    role: role || undefined,
    locationId,
    limit: API_PAGE_MAX,
  });
  const utilisateurs = res?.data ?? [];
  const { mutateAsync: basculer } = useToggleUserStatusMutation();
  const { mutateAsync: renvoyer } = useResendInviteMutation();

  const basculerStatut = async (u: UserItem) => {
    if (u.actif && !window.confirm(`Désactiver ${u.nom} ? Il ne pourra plus se connecter.`)) return;
    try {
      await basculer(u.id);
      toast.success(u.actif ? `${u.nom} désactivé.` : `${u.nom} réactivé.`);
    } catch (e) {
      toast.error(getErrorMessage(e, 'Le changement de statut a échoué.'));
    }
  };

  const renvoyerInvitation = async (u: UserItem) => {
    try {
      setInvitation(await renvoyer(u.id));
    } catch (e) {
      toast.error(getErrorMessage(e, 'L’invitation n’a pas pu être renvoyée.'));
    }
  };

  return (
    <div className="space-y-4">
      {integre ? (
        <div className="flex justify-end">
          <button
            onClick={() => setFormulaire({ utilisateur: null })}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs text-white"
            style={{ background: '#0F3D5E' }}
          >
            <UserPlus size={15} /> Ajouter un membre
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <UsersIcon size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Utilisateurs</h1>
              <p className="text-xs sm:text-sm text-gray-500">Invitez les gérants et les boutiquiers, gérez leurs accès</p>
            </div>
          </div>
          <button
            onClick={() => setFormulaire({ utilisateur: null })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm self-start sm:self-auto"
            style={{ background: '#0F3D5E' }}
          >
            <UserPlus size={16} /> Inviter un membre
          </button>
        </div>
      )}

      {!integre && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Rechercher un nom, un téléphone, un e-mail…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </div>
          <div className="flex gap-1 p-1 bg-gray-100/90 rounded-xl">
            {([['', 'Tous'], ['OWNER', LIBELLE_ROLE.OWNER + 's'], ['BOUTIQUIER', LIBELLE_ROLE.BOUTIQUIER + 's']] as const).map(([id, label]) => (
              <button
                key={id || 'tous'}
                onClick={() => setRole(id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${role === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isError ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100 text-sm text-red-600">
          {getErrorMessage(error, 'La liste des membres n’a pas pu être chargée.')}
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">Chargement…</div>
      ) : utilisateurs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">
          {locationId ? 'Aucun membre rattaché à cet emplacement.' : 'Aucun membre ne correspond.'}
        </div>
      ) : (
        <div className={`grid gap-3 ${integre ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {utilisateurs.map((u) => (
            <UserCard
              key={u.id}
              utilisateur={u}
              estMoi={u.id === moi?.id}
              onEdit={() => setFormulaire({ utilisateur: u })}
              onToggle={() => basculerStatut(u)}
              onResend={() => renvoyerInvitation(u)}
            />
          ))}
        </div>
      )}

      {formulaire && (
        <UserFormModal
          key={formulaire.utilisateur?.id ?? 'nouveau'}
          utilisateur={formulaire.utilisateur}
          locationIdParDefaut={locationId}
          onClose={() => setFormulaire(null)}
          onInvited={setInvitation}
        />
      )}
      {invitation && <InvitationLinkModal invitation={invitation} onClose={() => setInvitation(null)} />}
    </div>
  );
};

export default Users;
