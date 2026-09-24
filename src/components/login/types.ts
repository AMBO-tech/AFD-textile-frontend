/** Longueur du code envoyé par SMS / e-mail (imposée par l'API). */
export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

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
