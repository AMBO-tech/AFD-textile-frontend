import API, { getErrorMessage } from '@/api/api';
import axios from 'axios';
import type { LoginRequest, AuthResponse } from '@/types/auth';

export class NetworkError extends Error {
  constructor(message = 'Impossible de joindre le serveur. Vérifiez votre connexion.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const LOGIN = async (request: LoginRequest): Promise<AuthResponse> => {
  try {
    const payload = {
      identifier: request.identifier || request.email || '',
      motDePasse: request.motDePasse || request.password || '',
    };
    const response = await API.post<AuthResponse>('/auth/login', payload);
    const data = response.data;
    
    // Normalisation des champs pour compatibilité UI
    if (data.user) {
      data.user = {
        ...data.user,
        name: data.user.nom || data.user.name || '',
        boutiqueId: data.user.locationId || data.user.boutiqueId,
      };
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new NetworkError();
      }
      throw new Error(getErrorMessage(error, 'Identifiants invalides ou compte inactif.'));
    }
    throw new Error('Une erreur inattendue est survenue lors de la connexion.');
  }
};

export default LOGIN;
