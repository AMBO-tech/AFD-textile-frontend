export type LoginVue = 'login' | 'telephone' | 'code' | 'nouveau_mdp';

export interface DemoCompte {
  id: string;
  pwd: string;
  role: 'gerant' | 'boutiquier';
  nom: string;
}

export interface LoginProps {
  onLogin: (role: 'gerant' | 'boutiquier', nom: string) => void;
}
