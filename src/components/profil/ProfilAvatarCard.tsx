import React from 'react';

interface ProfilAvatarCardProps {
  nom: string;
  role: 'gerant' | 'boutiquier';
}

export const ProfilAvatarCard: React.FC<ProfilAvatarCardProps> = ({ nom, role }) => {
  const initials = nom
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
      >
        {initials}
      </div>
      <h2 className="font-display font-bold text-gray-900 text-lg">{nom}</h2>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="text-xs font-medium px-3 py-1 rounded-full text-white"
          style={{ background: role === 'gerant' ? '#0F3D5E' : '#1E88E5' }}
        >
          {role === 'gerant' ? '⭐ Gérant' : '👤 Boutiquier'}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">AFD Textile · Plateau</p>
    </div>
  );
};

export default ProfilAvatarCard;
