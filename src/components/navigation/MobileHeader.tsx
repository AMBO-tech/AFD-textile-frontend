import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  boutique: { nom: string; lieu: string };
  onOpenSidebar: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ boutique, onOpenSidebar }) => {
  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center px-4 h-14">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h10M3 15h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16" cy="10" r="2.5" fill="#22C55E" stroke="white" strokeWidth="1" />
          </svg>
        </div>
        <div className="flex-1 ml-3">
          <div className="font-display font-bold text-gray-900 text-sm leading-tight">{boutique.nom}</div>
          <div className="text-xs text-gray-400 leading-tight">{boutique.lieu}</div>
        </div>
        <button
          onClick={onOpenSidebar}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-800"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
