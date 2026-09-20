import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Login } from '../../components/login';
import { useMockStore } from '../../data/useMockStore';

/**
 * @component LoginPage
 * Page de connexion de l'application AFD Textile.
 * 
 * @api POST /api/v1/auth/login
 * @payload { emailOrPhone: string, password: string }
 * @response { token: string, user: { id: string, nom: string, email: string, role: 'gerant' | 'boutiquier', boutiqueId?: string } }
 * 
 * @integration_notes
 * Lors de la phase d'intégration avec le serveur réel :
 * - Remplacer le mock par `useAuth()` ou `useLoginMutation()` via TanStack Query.
 * - Le JWT d'authentification sera persisté en cookie sécurisé HttpOnly (recommandé) ou dans `useAuthStore`.
 * - L'affectation de la boutique (`boutiqueId`) ne sera plus statique mais découle des autorisations attribuées dans la table `users_boutiques`.
 */
export const LoginPage: React.FC = () => {
  const { session, setSession } = useMockStore();
  const navigate = useNavigate();

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (role: 'gerant' | 'boutiquier', nom: string, boutiqueId?: string) => {
    setSession({
      role,
      nom,
      boutiqueId: boutiqueId || (role === 'boutiquier' ? 'b1' : undefined),
    });
    navigate('/');
  };

  return <Login onLogin={handleLogin} />;
};

export default LoginPage;
