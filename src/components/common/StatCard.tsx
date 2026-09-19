import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg = '#EEF4FF',
  iconColor = '#1E88E5',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-100' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500">{label}</span>
          <div className="font-display font-bold text-gray-900 text-lg sm:text-xl mt-0.5">
            {value}
          </div>
          {subtext && <div className="text-xs text-gray-400 mt-0.5">{subtext}</div>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
