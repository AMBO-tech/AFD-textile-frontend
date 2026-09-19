import React from 'react';
import { Users } from '../../components/users';
import { useMockStore } from '../../data/useMockStore';

export const UsersPage: React.FC = () => {
  const { session, boutiques } = useMockStore();

  const boutiqueId = session?.boutiqueId || boutiques[0]?.id || 'b1';

  return <Users boutiqueId={boutiqueId} />;
};

export default UsersPage;
