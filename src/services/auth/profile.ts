import API, { getErrorMessage } from '@/api/api';
import type { User } from '@/types/auth';

export interface UpdateProfileRequest {
  nom?: string;
  /** null (ou vide) : le compte n'a plus d'adresse e-mail. */
  email?: string | null;
}

/** Met à jour le nom et l'e-mail de l'utilisateur connecté. */
export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  try {
    const response = await API.patch<User>('/auth/profil', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Impossible d'enregistrer vos informations."));
  }
};

/** Change le mot de passe de la session en cours (l'ancien est vérifié par le serveur). */
export const changePassword = async (ancienMotDePasse: string, nouveauMotDePasse: string): Promise<void> => {
  try {
    await API.patch('/auth/change-password', { ancienMotDePasse, nouveauMotDePasse });
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Impossible de changer le mot de passe.'));
  }
};
