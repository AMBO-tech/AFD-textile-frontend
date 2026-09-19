import React from 'react';
import {
  User, Phone, Mail, Building2, Shield, LogOut, Bell, Moon, Globe
} from 'lucide-react';
import type { ProfilProps, MenuSection } from './types';
import ProfilAvatarCard from './ProfilAvatarCard';
import ProfilMenuSection from './ProfilMenuSection';

export const Profil: React.FC<ProfilProps> = ({ nom, role, onLogout }) => {
  const menuSections: MenuSection[] = [
    {
      section: 'Compte',
      items: [
        { icon: User, label: 'Informations personnelles', value: nom },
        { icon: Mail, label: 'Email', value: 'amadou.diallo@afd-textile.sn' },
        { icon: Phone, label: 'Téléphone', value: '+221 77 010 20 30' },
      ],
    },
    {
      section: 'Application',
      items: [
        { icon: Bell, label: 'Notifications', value: 'Activées' },
        { icon: Moon, label: 'Mode sombre', value: 'Désactivé' },
        { icon: Globe, label: 'Langue', value: 'Français' },
      ],
    },
    {
      section: 'Boutique',
      items: [
        { icon: Building2, label: 'Boutique', value: 'AFD Textile - Dakar' },
        { icon: Shield, label: 'Rôle', value: role === 'gerant' ? 'Gérant' : 'Boutiquier' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold text-gray-900">Mon profil</h1>

      {/* Avatar card */}
      <ProfilAvatarCard nom={nom} role={role} />

      {/* Settings sections */}
      {menuSections.map((sec) => (
        <ProfilMenuSection key={sec.section} section={sec} />
      ))}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition-colors shadow-sm"
      >
        <LogOut size={16} /> Se déconnecter
      </button>

      <p className="text-center text-xs text-gray-400 pb-2">AFD Textile v1.0.0 · © 2026</p>
    </div>
  );
};

export default Profil;
