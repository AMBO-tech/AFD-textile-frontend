export interface ProfilProps {
  nom: string;
  role: 'gerant' | 'boutiquier';
  onLogout: () => void;
}

export interface MenuItem {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  label: string;
  value: string;
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}
