import React from 'react';

interface RoleBadgeProps {
  role: 'gerant' | 'boutiquier';
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const isGerant = role === 'gerant';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClasses}`}
      style={{
        background: isGerant ? '#EEF4FF' : '#F0FDF4',
        color: isGerant ? '#1E88E5' : '#16A34A',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isGerant ? '#1E88E5' : '#22C55E' }}
      />
      {isGerant ? 'Gérant' : 'Boutiquier'}
    </span>
  );
};

export default RoleBadge;
