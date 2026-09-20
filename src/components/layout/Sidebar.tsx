import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ventes', label: 'Point de Vente', icon: ShoppingBag },
  { to: '/inventaire', label: 'Inventaire & Stock', icon: Package },
  { to: '/clients', label: 'Clients & Créances', icon: Users },
]

export const Sidebar: React.FC = () => {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-[#0F3D5E] text-white flex flex-col justify-between shrink-0 min-h-screen border-r border-[#1E88E5]/20 shadow-xl">
      {/* Brand */}
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#1E88E5] font-display font-extrabold text-lg shadow-inner">
            AFD
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-white tracking-wide">AFD Textile</h1>
            <p className="text-[11px] text-slate-300 font-medium">Gestion Réseau Tissus</p>
          </div>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E88E5] text-white shadow-md shadow-[#1E88E5]/30 translate-x-1'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Architecture v2.0 Pro</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Mode anti-mock & temps réel activé</p>
        </div>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full text-slate-300 hover:text-white hover:bg-danger/20 text-xs font-semibold justify-start gap-3 rounded-xl h-10 px-4 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-danger" />
          <span>Déconnexion</span>
        </Button>
      </div>
    </aside>
  )
}
