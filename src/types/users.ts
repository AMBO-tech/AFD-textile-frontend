export interface UserLocation {
  id: string;
  nom: string;
  type: string;
}

export interface UserItem {
  id: string;
  nom: string;
  telephone: string;
  email?: string | null;
  role: 'OWNER' | 'BOUTIQUIER';
  locationId?: string | null;
  location?: UserLocation | null;
  premiereConnexion: boolean;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InviteUserRequest {
  nom: string;
  telephone: string;
  email?: string;
  role: 'OWNER' | 'BOUTIQUIER';
  locationId?: string;
}

export interface InvitationResponse {
  user: UserItem;
  token: string;
  activationUrl: string;
  expiresAt: string;
  notificationSent: boolean;
}

export interface UpdateUserRequest {
  nom?: string;
  telephone?: string;
  email?: string;
  role?: 'OWNER' | 'BOUTIQUIER';
  locationId?: string;
}
