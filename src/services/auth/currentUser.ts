import API from '@/api/api';
import type { User } from '@/types/auth';

export const getCurrentUser = async (token?: string): Promise<User> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await API.get<{ user?: User } | User>('/auth/me', { headers });

  if (!response.data) {
    throw new Error('Réponse invalide du serveur lors de la récupération du profil.');
  }

  const user = 'user' in response.data && response.data.user ? response.data.user : (response.data as User);
  
  // Normalisation des champs pour compatibilité UI
  return {
    ...user,
    name: user.nom || user.name || '',
    boutiqueId: user.locationId || user.boutiqueId,
  };
};

export default getCurrentUser;
