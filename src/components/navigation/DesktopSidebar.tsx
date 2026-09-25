import React from 'react';
import { LogOut } from 'lucide-react';
import type { Screen, NavTabItem } from './types';

interface DesktopSidebarProps {
  boutique: { nom: string; lieu: string };
  role: string;
  current: Screen;
  onNavigate: (s: Screen) => void;
  nom: string;
  onLogout: () => void;
  principalItems: readonly NavTabItem[];
  adminItems: readonly NavTabItem[];
  notifications: number;
  demandes: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  boutique,
  role,
  current,
  onNavigate,
  nom,
  onLogout,
  principalItems,
  adminItems,
  notifications,
  demandes,
}) => {
  return (
    <aside className="hidden lg:flex print:!hidden flex-col w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h10M3 15h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="16" cy="10" r="2.5" fill="#22C55E" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-gray-900 text-sm leading-tight">{boutique.nom}</div>
            <div className="text-xs text-gray-500 leading-tight">{boutique.lieu}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-4">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
            Principal
          </div>
          {principalItems.map((tab) => {
            const Icon = tab.icon;
            const active = current === tab.id;
            const badge =
              tab.id === 'notifications'
                ? notifications
                : tab.id === 'demandes'
                ? demandes
                : 0;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left ${
                  active
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { background: '#0F3D5E' } : {}}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
                <span className="flex-1">{tab.label}</span>
                {badge > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: active ? '#EF4444' : '#FEE2E2',
                      color: active ? '#fff' : '#DC2626',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {role === 'gerant' && (
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
              Administration
            </div>
            {adminItems.map((tab) => {
              const Icon = tab.icon;
              const active = current === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left ${
                    active
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={active ? { background: '#0F3D5E' } : {}}
                >
                  <Icon size={18} className={active ? 'text-white' : 'text-gray-400'} />
                  <span className="flex-1">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Card */}
      <div className="p-3 border-t border-gray-100">
        <div
          onClick={() => onNavigate('parametres')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all"
          title="Accéder aux Paramètres & Profil"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E88E5, #0F3D5E)' }}
          >
            {nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
              {nom}
            </div>
            <div className="text-xs text-gray-500 capitalize">{role}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogout();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
            title="Se déconnecter"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
