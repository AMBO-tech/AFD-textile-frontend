import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { MenuSection } from './types';

interface ProfilMenuSectionProps {
  section: MenuSection;
}

export const ProfilMenuSection: React.FC<ProfilMenuSectionProps> = ({ section }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-50">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {section.section}
        </span>
      </div>
      {section.items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#EBF5FB' }}
            >
              <Icon size={15} color="#1E88E5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700">{item.label}</div>
              <div className="text-xs text-gray-400 truncate">{item.value}</div>
            </div>
            <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
};

export default ProfilMenuSection;
