import type { LucideIcon } from 'lucide-react';

export type Screen =
  | 'accueil' | 'produits' | 'stock' | 'ventes' | 'clients' | 'demandes'
  | 'notifications' | 'profil' | 'dashboard_admin' | 'utilisateurs'
  | 'entrepot' | 'rapports' | 'historique' | 'sauvegardes' | 'parametres';

export interface NavTabItem {
  id: Screen;
  label: string;
  icon: LucideIcon;
}

export interface NavigationProps {
  role: 'gerant' | 'boutiquier';
  current: Screen;
  onNavigate: (s: Screen) => void;
  nom: string;
  onLogout: () => void;
  notifications: number;
  demandes: number;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  boutique: { nom: string; lieu: string };
  isOnline?: boolean;
}
