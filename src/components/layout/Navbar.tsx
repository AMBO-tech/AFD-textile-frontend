import React from 'react';
import { MobileHeader } from '../navigation/MobileHeader';

export interface NavbarProps {
  boutique: { nom: string; lieu: string };
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ boutique, onOpenSidebar }) => {
  return <MobileHeader boutique={boutique} onOpenSidebar={onOpenSidebar} />;
};

export default Navbar;
