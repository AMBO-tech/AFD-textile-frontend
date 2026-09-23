import { useAuthStore } from '../../stores/useAuthStore';
import React from 'react';
import { Users } from '../../components/users';

export const UsersPage: React.FC = () => {
  const user = useAuthStore((s: any) => s.user); const session = user;
const boutiques: any = [];

  const boutiqueId = session?.boutiqueId || boutiques[0]?.id || 'b1';

  return <Users boutiqueId={boutiqueId} />;
};

export default UsersPage;
