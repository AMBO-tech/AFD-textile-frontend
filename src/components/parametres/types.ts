export interface ParametresProps {
  nom?: string;
  role?: 'gerant' | 'boutiquier';
  boutiqueId?: string;
  onLogout?: () => void;
}

export interface UserPersonalInfo {
  nom: string;
  telephone: string;
  email: string;
}
