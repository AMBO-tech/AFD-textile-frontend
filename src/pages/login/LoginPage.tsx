import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Login } from '../../components/login';
import type { LoginProps } from '../../components/login/types';
import { useAuthUser } from '../../hooks/useAuthUser';


/**
 * @component LoginPage
 * Page de connexion de l'application AFD Textile connectée à l'API NestJS.
 */
export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuthUser();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin: LoginProps['onLogin'] = async (_role, _nom, _boutiqueId, credentials) => {
    if (!credentials) return;
    await login(credentials);
    navigate('/');
  };

  return <Login onLogin={handleLogin} />;
};

export default LoginPage;
