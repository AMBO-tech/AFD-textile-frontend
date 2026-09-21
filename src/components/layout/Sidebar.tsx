import React from 'react';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import type { Screen, NavTabItem } from '../navigation/types';

export interface SidebarProps {
  boutique: { nom: string; lieu: string };
  role: 'gerant' | 'boutiquier';
  current: Screen;
  onNavigate: (s: Screen) => void;
  nom: string;
  onLogout: () => void;
  principalItems: readonly NavTabItem[];
  adminItems: readonly NavTabItem[];
  notifications: number;
  demandes: number;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return <DesktopSidebar {...props} />;
};

export default Sidebar;
