import React, { useState } from 'react';
import { CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import type { ParametresProps } from './types';
import ParametresProfileHeader from './ParametresProfileHeader';
import ParametresPersonalInfo from './ParametresPersonalInfo';
import ParametresSecurityForm from './ParametresSecurityForm';
import ParametresNotificationPrefs from './ParametresNotificationPrefs';

export const Parametres: React.FC<ParametresProps> = ({
  nom = 'Amadou Diallo',
  role = 'gerant',
  boutiqueId = 'b1',
  onLogout,
}) => {
  const boutiques: any = [];
  const maBoutique = boutiques.find((b: any) => b.id === boutiqueId) || boutiques[0];

  const [userNom, setUserNom] = useState(nom);
  const [telephone, setTelephone] = useState(
    role === 'gerant' ? '+221 77 010 20 30' : '+221 77 314 25 36'
  );
  const [email, setEmail] = useState(
    role === 'gerant' ? 'amadou.diallo@afd-textile.sn' : 'ibrahima.sarr@afd-textile.sn'
  );

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveProfil = (info: { nom: string; telephone: string; email: string }) => {
    if (!info.telephone.trim()) {
      setErrorMsg('Le numéro de téléphone est obligatoire.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    setUserNom(info.nom);
    setTelephone(info.telephone);
    setEmail(info.email);

    setSuccessMsg('Informations personnelles enregistrées avec succès.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleChangePassword = (ancien: string, nouveau: string, confirm: string) => {
    setErrorMsg(null);
    if (!ancien) {
      setErrorMsg('Veuillez renseigner votre mot de passe actuel.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    if (nouveau.length < 6) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }
    if (nouveau !== confirm) {
      setErrorMsg('La confirmation ne correspond pas au nouveau mot de passe.');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    setSuccessMsg('Votre mot de passe a été mis à jour avec succès.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Paramètres & Profil</h1>
          <p className="text-sm text-gray-500">
            Gérez votre compte, vos coordonnées et votre mot de passe
          </p>
        </div>
      </div>

      {/* ── Toasts de succès et d'erreur ── */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-green-800 text-sm animate-fade-in shadow-sm">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-red-800 text-sm animate-fade-in shadow-sm">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ── Carte Profil En-tête ── */}
      <ParametresProfileHeader
        nom={userNom}
        role={role}
        telephone={telephone}
        boutique={maBoutique}
      />

      {/* ── Section 1 : Informations Personnelles ── */}
      <ParametresPersonalInfo
        nom={userNom}
        telephone={telephone}
        email={email}
        role={role}
        boutique={maBoutique}
        onSave={handleSaveProfil}
      />

      {/* ── Section 2 : Modification du Mot de Passe ── */}
      <ParametresSecurityForm onPasswordChange={handleChangePassword} />

      {/* ── Section 3 : Préférences de Notifications ── */}
      <ParametresNotificationPrefs />

      {/* ── Section 4 : Déconnexion ── */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
        >
          <LogOut size={16} />
          <span>Se déconnecter de l'application</span>
        </button>
      )}

      <p className="text-center text-xs text-gray-400 pt-1 pb-2">
        AFD Textile v1.0.0 · © 2026 Système de gestion textile
      </p>
    </div>
  );
};

export default Parametres;
