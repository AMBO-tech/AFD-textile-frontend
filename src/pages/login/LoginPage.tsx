import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Login } from '../../components/login';
import { useMockStore } from '../../data/useMockStore';

export const LoginPage: React.FC = () => {
  const { session, setSession } = useMockStore();
  const navigate = useNavigate();

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = (role: 'gerant' | 'boutiquier', nom: string) => {
    setSession({
      role,
      nom,
      boutiqueId: role === 'boutiquier' ? 'b1' : undefined,
    });
    navigate('/');
  };

  return <Login onLogin={handleLogin} />;
};

export default LoginPage;
