import React from 'react';
import { MessageSquare, Boxes, Globe } from 'lucide-react';

interface DemandesTabsProps {
  activeTab: 'stocks' | 'demandes' | 'reseau';
  onTabChange: (tab: 'stocks' | 'demandes' | 'reseau') => void;
  role: 'gerant' | 'boutiquier';
  demandesEnAttenteCount: number;
  stocksCritiquesCount: number;
}

export const DemandesTabs: React.FC<DemandesTabsProps> = ({
  activeTab,
  onTabChange,
  role,
  demandesEnAttenteCount,
  stocksCritiquesCount,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTabChange('demandes')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          activeTab === 'demandes'
            ? 'text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
        }`}
        style={activeTab === 'demandes' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
      >
        <MessageSquare size={15} />
        <span>{role === 'gerant' ? 'Demandes à pourvoir' : 'Suivi des demandes'}</span>
        {demandesEnAttenteCount > 0 && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'demandes' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {demandesEnAttenteCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange('stocks')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          activeTab === 'stocks'
            ? 'text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
        }`}
        style={activeTab === 'stocks' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
      >
        <Boxes size={15} />
        <span>{role === 'gerant' ? 'Stocks critiques' : 'Stocks & Réappro'}</span>
        {stocksCritiquesCount > 0 && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'stocks' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'
            }`}
          >
            {stocksCritiquesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onTabChange('reseau')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          activeTab === 'reseau'
            ? 'text-white shadow-sm'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
        }`}
        style={activeTab === 'reseau' ? { background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' } : {}}
      >
        <Globe size={15} />
        <span>Disponibilités réseau</span>
      </button>
    </div>
  );
};

export default DemandesTabs;
