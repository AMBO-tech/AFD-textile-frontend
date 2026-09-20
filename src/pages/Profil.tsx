import { User, Phone, Mail, Building2, Shield, LogOut, ChevronRight, Bell, Moon, Globe } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const { user, logout } = useAuthStore();
  const { currentStore } = useLocationStore();
  const navigate = useNavigate();

  const nom = user?.name || 'Amadou Diallo';
  const email = user?.email || 'amadou.diallo@afd-textile.ci';
  const role = user?.role === 'ADMIN' || user?.role === 'gerant' ? 'Gérant' : 'Boutiquier';
  const initials = nom.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuSections = [
    {
      section: 'Informations du Compte',
      items: [
        { icon: User, label: 'Nom complet', value: nom },
        { icon: Mail, label: 'Adresse Email', value: email },
        { icon: Phone, label: 'Téléphone', value: '+225 07 12 34 56 78' },
      ]
    },
    {
      section: 'Affectation & Droits',
      items: [
        { icon: Building2, label: 'Boutique assignée', value: currentStore?.nom || 'AFD Textile - Plateau' },
        { icon: Shield, label: 'Rôle dans le système', value: role },
      ]
    },
    {
      section: 'Préférences Personnelles',
      items: [
        { icon: Bell, label: 'Notifications Push', value: 'Activées' },
        { icon: Globe, label: 'Langue de l\'interface', value: 'Français (Côte d\'Ivoire)' },
      ]
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Mon Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Détails de session et informations personnelles</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          {initials}
        </div>
        <h2 className="font-display font-bold text-gray-900 text-xl">{nom}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full text-white shadow-sm"
            style={{ background: role === 'Gérant' ? '#0F3D5E' : '#1E88E5' }}
          >
            {role === 'Gérant' ? '👑 Gérant AFD' : '🛍️ Boutiquier'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{currentStore?.nom || 'AFD Textile - Plateau'}</p>
      </div>

      {/* Sections de détails */}
      {menuSections.map(section => (
        <div key={section.section} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            <span className="text-xs font-bold text-[#0F3D5E] uppercase tracking-wider">{section.section}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="w-full flex items-center gap-3.5 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EBF5FB' }}>
                    <Icon size={16} color="#1E88E5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">{item.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
      >
        <LogOut size={18} /> Se déconnecter de l'application
      </button>

      <p className="text-center text-xs text-gray-400 pb-4">AFD Textile v1.2 · Antigravity Cloud</p>
    </div>
  );
}
