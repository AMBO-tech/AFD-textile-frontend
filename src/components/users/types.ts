import type { UserItem } from '@/types/users';

export type RoleUtilisateur = UserItem['role'];

export const LIBELLE_ROLE: Record<RoleUtilisateur, string> = {
  OWNER: 'Gérant',
  BOUTIQUIER: 'Boutiquier',
};

/** Un compte invité n'a pas encore choisi son mot de passe. */
export const enAttenteActivation = (u: UserItem) => u.premiereConnexion;
