import React from 'react';
import { LogOut } from 'lucide-react';
import type { ParametresProps } from './types';
import ParametresProfileHeader from './ParametresProfileHeader';
import ParametresPersonalInfo from './ParametresPersonalInfo';
import ParametresSecurityForm from './ParametresSecurityForm';
import ParametresNotificationPrefs from './ParametresNotificationPrefs';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';

export const Parametres: React.FC<ParametresProps> = ({
  nom,
  telephone,
  email,
  role,
  boutiqueId,
  onSaveProfil,
  onPasswordChange,
  onLogout,
}) => {
  const { data: locRes } = useLocationsListQuery();
  const boutique = (locRes?.data ?? []).find((b) => b.id === boutiqueId);
  const libelleBoutique = role === 'gerant' ? 'Toutes les boutiques (Gérant)' : (boutique?.nom ?? 'Boutique non renseignée');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">Paramètres & Profil</h1>
        <p className="text-sm text-gray-500">Gérez votre compte, vos coordonnées et votre mot de passe</p>
      </div>

      <ParametresProfileHeader nom={nom} role={role} telephone={telephone} boutique={libelleBoutique} />

      <ParametresPersonalInfo
        nom={nom}
        telephone={telephone}
        email={email ?? ''}
        boutique={libelleBoutique}
        onSave={onSaveProfil}
      />

      <ParametresSecurityForm onPasswordChange={onPasswordChange} />

      <ParametresNotificationPrefs />

      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
        >
          <LogOut size={16} />
          <span>Se déconnecter de l'application</span>
        </button>
      )}

      <p className="text-center text-xs text-gray-400 pt-1 pb-2">AFD Textile v1.0.0 · © 2026 Système de gestion textile</p>
    </div>
  );
};

export default Parametres;
