import React from 'react';
import type { Screen, NavTabItem } from './types';

interface MobileBottomNavProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
  items: readonly NavTabItem[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ current, onNavigate, items }) => {
  return (
    <nav
      className="lg:hidden print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center gap-1 transition-colors relative"
            >
              <div
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                  active ? 'bg-blue-50' : ''
                }`}
              >
                <Icon
                  size={20}
                  style={{ color: active ? '#0F3D5E' : '#9CA3AF' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? '#0F3D5E' : '#9CA3AF', fontWeight: active ? 700 : 500 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
