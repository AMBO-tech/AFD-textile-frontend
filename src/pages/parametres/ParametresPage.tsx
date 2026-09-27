import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../stores/useAuthStore';
import { Parametres, type UserPersonalInfo } from '../../components/parametres';
import { getCurrentUser } from '../../services/auth/currentUser';
import { changePassword, updateProfile } from '../../services/auth/profile';
import { deconnecter } from '../../services/api';

export const ParametresPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  // Le profil mémorisé à la connexion peut dater : on relit l'e-mail réel du compte.
  useEffect(() => {
    getCurrentUser()
      .then((frais) => {
        const actuel = useAuthStore.getState().user;
        if (actuel) setUser({ ...actuel, ...frais });
      })
      .catch(() => {
        // Hors ligne : le profil mémorisé reste affiché.
      });
  }, [setUser]);

  if (!user) return null;

  const role = user.role === 'OWNER' || user.role === 'gerant' ? 'gerant' : 'boutiquier';

  const enregistrerProfil = async (info: UserPersonalInfo) => {
    try {
      const maj = await updateProfile({ nom: info.nom, email: info.email || null });
      setUser({ ...user, nom: maj.nom, name: maj.nom, email: maj.email ?? null });
      toast.success('Informations enregistrées.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'enregistrer vos informations.");
    }
  };

  const changerMotDePasse = async (ancien: string, nouveau: string) => {
    try {
      await changePassword(ancien, nouveau);
      toast.success('Mot de passe mis à jour.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de changer le mot de passe.');
      throw error;
    }
  };

  const seDeconnecter = async () => {
    await deconnecter();
    navigate('/login');
  };

  return (
    <Parametres
      nom={user.nom}
      telephone={user.telephone}
      email={user.email ?? null}
      role={role}
      boutiqueId={user.locationId ?? user.boutiqueId}
      onSaveProfil={enregistrerProfil}
      onPasswordChange={changerMotDePasse}
      onLogout={seDeconnecter}
    />
  );
};

export default ParametresPage;
