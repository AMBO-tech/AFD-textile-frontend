import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Login } from '../../components/login';
import type { LoginCredentials } from '../../components/login/types';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useMockStore } from '../../data/useMockStore';
import { DEFAULT_BOUTIQUE_ID } from '../../data/mock';

/**
 * @component LoginPage
 * Page de connexion de l'application AFD Textile connectée à l'API NestJS avec fallback démo.
 */
export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuthUser();
  const { setSession } = useMockStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (
    role: 'gerant' | 'boutiquier',
    nom: string,
    boutiqueId?: string,
    credentials?: LoginCredentials
  ) => {
    if (credentials) {
      // 1. Authentification réelle via l'API NestJS
      await login(credentials);
      navigate('/');
      return;
    }

    // 2. Fallback démo
    setSession({
      role,
      nom,
      boutiqueId: boutiqueId || (role === 'boutiquier' ? DEFAULT_BOUTIQUE_ID : undefined),
    });
    navigate('/');
  };

  return <Login onLogin={handleLogin} />;
};

export default LoginPage;
