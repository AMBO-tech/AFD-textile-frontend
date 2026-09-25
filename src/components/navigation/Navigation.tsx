import React from 'react';
import {
  Home, Package, Archive, ShoppingCart, Users, MessageSquare,
  Bell, User, History, Settings, X, LogOut, ArrowLeftRight, Store
} from 'lucide-react';
import type { NavigationProps, NavTabItem } from './types';
import DesktopSidebar from './DesktopSidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

const TABS_BASE: readonly NavTabItem[] = [
  { id: 'accueil', label: 'Accueil', icon: Home },
  { id: 'ventes', label: 'Ventes', icon: ShoppingCart },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'stock', label: 'Stock', icon: Archive },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const BOTTOM_TABS_MOBILE: readonly NavTabItem[] = [
  { id: 'accueil', label: 'Dashboard', icon: Home },
  { id: 'ventes', label: 'Ventes', icon: ShoppingCart },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'stock', label: 'Stock', icon: Archive },
  { id: 'parametres', label: 'Paramètres', icon: User },
];

// Gérant : l'écran des demandes s'appelle « Transferts » (il les valide, il ne les émet pas).
const TABS_SIDEBAR_EXTRA: readonly NavTabItem[] = [
  { id: 'demandes', label: 'Transferts', icon: ArrowLeftRight },
  { id: 'produits', label: 'Produits', icon: Package },
];

const TABS_GERANT: readonly NavTabItem[] = [
  { id: 'boutiques', label: 'Boutiques', icon: Store },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  { id: 'historique', label: 'Historique', icon: History },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
];

export const Navigation: React.FC<NavigationProps> = ({
  role: rawRole,
  current,
  onNavigate,
  nom,
  onLogout,
  notifications,
  demandes,
  sidebarOpen,
  setSidebarOpen,
  boutique,
}) => {
  const role = (rawRole === 'OWNER' || rawRole?.toLowerCase() === 'gerant') ? 'gerant' : 'boutiquier';
  
  const sidebarPrincipalItems =
    role === 'gerant'
      ? [...TABS_BASE, ...TABS_SIDEBAR_EXTRA]
      : [...TABS_BASE, { id: 'demandes' as const, label: 'Demandes', icon: MessageSquare }];

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar
        boutique={boutique}
        role={role}
        current={current}
        onNavigate={onNavigate}
        nom={nom}
        onLogout={onLogout}
        principalItems={sidebarPrincipalItems}
        adminItems={TABS_GERANT}
        notifications={notifications}
        demandes={demandes}
      />

      {/* Mobile Header */}
      <MobileHeader boutique={boutique} onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 5h14M3 10h10M3 15h12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="16" cy="10" r="2.5" fill="#22C55E" stroke="white" strokeWidth="1" />
                  </svg>
                </div>
                <div>
                  <div className="font-display font-bold text-gray-900 text-sm">{boutique.nom}</div>
                  <div className="text-xs text-gray-500">{boutique.lieu}</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <div className="mb-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                  Principal
                </div>
                {sidebarPrincipalItems.map((tab) => {
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
                      onClick={() => {
                        onNavigate(tab.id);
                        setSidebarOpen(false);
                      }}
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
                  {TABS_GERANT.map((tab) => {
                    const Icon = tab.icon;
                    const active = current === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onNavigate(tab.id);
                          setSidebarOpen(false);
                        }}
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

            <div className="p-4 border-t border-gray-100">
              <div
                onClick={() => {
                  onNavigate('parametres');
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 mb-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #1E88E5, #0F3D5E)' }}
                >
                  {nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{nom}</div>
                  <div className="text-xs text-gray-500 capitalize">{role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={14} />
                Se déconnecter
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav current={current} onNavigate={onNavigate} items={BOTTOM_TABS_MOBILE} />
    </>
  );
};

export default Navigation;
