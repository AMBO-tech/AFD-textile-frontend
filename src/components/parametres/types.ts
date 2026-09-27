export interface ParametresProps {
  nom: string;
  telephone: string;
  /** null : aucune adresse enregistrée, le champ reste vide. */
  email: string | null;
  role: 'gerant' | 'boutiquier';
  boutiqueId?: string | null;
  onSaveProfil: (info: UserPersonalInfo) => Promise<void>;
  onPasswordChange: (ancien: string, nouveau: string) => Promise<void>;
  onLogout?: () => void;
}

export interface UserPersonalInfo {
  nom: string;
  email: string;
}
