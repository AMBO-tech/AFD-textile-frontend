

export type Utilisateur = UtilisateurItem;

export interface UserFormData {
  nom: string;
  telephone: string;
  email: string;
  role: 'gerant' | 'boutiquier';
  boutique: string;
}

export type UserRoleFilter = 'tous' | 'gerant' | 'boutiquier';
