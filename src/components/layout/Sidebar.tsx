import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  ShoppingCart,
  Archive,
  Users,
  Warehouse,
  History,
  Settings,
  ChevronRight,
  LogOut,
  Send,
  BarChart3,
  UserCheck,
  Bell,
  HardDrive,
  UserCircle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useLocationStore } from '@/stores/locationStore'

const PRINCIPAL_ITEMS = [
  { to: '/dashboard', label: 'Accueil', icon: Home },
  { to: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { to: '/inventaire', label: 'Stock & Catalogue', icon: Archive },
  { to: '/clients', label: 'Clients & Crédits', icon: Users },
  { to: '/demandes', label: 'Demandes', icon: Send },
]

const ADMIN_ITEMS = [
  { to: '/entrepot', label: 'Entrepôt Central', icon: Warehouse },
  { to: '/rapports', label: 'Rapports & Stats', icon: BarChart3 },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: UserCheck },
  { to: '/historique', label: 'Journal d\'Activité', icon: History },
  { to: '/sauvegardes', label: 'Sauvegardes', icon: HardDrive },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
]

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore()
  const { currentLocation } = useLocationStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isGerant = !user?.role || user?.role === 'gerant' || (user?.role as string) === 'ADMIN'

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-[#F8FAFC] border-r border-gray-100 h-screen fixed left-0 top-0 z-30 font-['Inter',sans-serif]">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5h14M3 10h10M3 15h12"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle
                cx="16"
                cy="10"
                r="2.5"
                fill="#22C55E"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-['Poppins',sans-serif] font-bold text-gray-900 text-sm leading-tight truncate">
              {currentLocation?.nom || 'AFD Textile'}
            </div>
            <div className="text-xs text-gray-500 leading-tight truncate">
              {currentLocation?.ville || 'Plateau, Abidjan'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Section Principal */}
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
            Principal
          </div>
          <div className="space-y-0.5">
            {PRINCIPAL_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-white shadow-sm text-[#0F3D5E]'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={isActive ? 'text-[#1E88E5]' : 'text-gray-400 group-hover:text-gray-600'}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight size={12} className="text-[#1E88E5]" />}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        </div>

        {/* Section Administration */}
        {isGerant && (
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
              Administration
            </div>
            <div className="space-y-0.5">
              {ADMIN_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-white shadow-sm text-[#0F3D5E]'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={16}
                          className={isActive ? 'text-[#1E88E5]' : 'text-gray-400 group-hover:text-gray-600'}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isActive && <ChevronRight size={12} className="text-[#1E88E5]" />}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-gray-100">
        <div
          onClick={() => navigate('/profil')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100/60 cursor-pointer group transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
            style={{ background: 'linear-gradient(135deg, #1E88E5, #0F3D5E)' }}
          >
            {(user?.name || 'Amadou Diallo')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {user?.name || 'Amadou Diallo'}
            </div>
            <div className="text-xs text-gray-500 capitalize truncate">
              {user?.role || 'gérant'}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleLogout()
            }}
            title="Déconnexion"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 cursor-pointer p-1"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
