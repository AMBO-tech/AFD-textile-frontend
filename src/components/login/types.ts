export type LoginVue = 'login' | 'telephone' | 'code' | 'nouveau_mdp';

export interface LoginCredentials {
  identifier: string;
  motDePasse: string;
}

export interface LoginProps {
  onLogin: (
    role: 'gerant' | 'boutiquier',
    nom: string,
    boutiqueId?: string,
    credentials?: LoginCredentials
  ) => Promise<void> | void;
}
