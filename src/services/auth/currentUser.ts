import API from '@/api/api'
import type { User } from '@/types/auth'

export const getCurrentUser = async (token?: string): Promise<User> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined
  const response = await API.get<User>('/auth/me', { headers })

  if (!response.data) {
    throw new Error('Réponse invalide du serveur lors de la récupération du profil.')
  }

  return response.data
}

export default getCurrentUser