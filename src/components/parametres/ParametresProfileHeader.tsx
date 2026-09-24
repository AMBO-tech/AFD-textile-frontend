import React from 'react';
import { Building2 } from 'lucide-react';


interface ParametresProfileHeaderProps {
  nom: string;
  role: 'gerant' | 'boutiquier';
  telephone: string;
  boutique: Boutique;
}

export const ParametresProfileHeader: React.FC<ParametresProfileHeaderProps> = ({
  nom,
  role,
  telephone,
  boutique,
}) => {
  const initials = nom
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
      >
        {initials}
      </div>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <h2 className="font-display font-bold text-gray-900 text-lg">{nom}</h2>
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
            style={{ background: role === 'gerant' ? '#0F3D5E' : '#1E88E5' }}
          >
            {role === 'gerant' ? '⭐ Gérant Principal' : '👤 Boutiquier'}
          </span>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Building2 size={12} className="text-blue-600" />
            {role === 'gerant' ? 'Superviseur Réseau' : boutique.nom}
          </span>
          <span>·</span>
          <span>{telephone}</span>
        </div>
      </div>
    </div>
  );
};

export default ParametresProfileHeader;
