import React from 'react';
import {
  AlertTriangle, MessageSquare, CreditCard, CheckCircle, HardDrive, X
} from 'lucide-react';
import type { Notification } from './types';

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const TYPE_CONFIG = {
  stock_faible: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', label: 'Stock critique' },
  demande: { icon: MessageSquare, color: '#1E88E5', bg: '#EBF5FB', label: 'Demande' },
  creance: { icon: CreditCard, color: '#F59E0B', bg: '#FFFBEB', label: 'Créance' },
  validation: { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', label: 'Validation' },
  refus: { icon: X, color: '#EF4444', bg: '#FEF2F2', label: 'Refus' },
  sauvegarde: { icon: HardDrive, color: '#22C55E', bg: '#F0FDF4', label: 'Sauvegarde' },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
}) => {
  const config =
    TYPE_CONFIG[notification.type as keyof typeof TYPE_CONFIG] ??
    TYPE_CONFIG.validation;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-all cursor-pointer ${
        !notification.lu ? 'border-blue-100' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg }}
        >
          <Icon size={16} color={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: config.color }}>
              {config.label}
            </span>
            {!notification.lu && (
              <span className="w-2 h-2 rounded-full" style={{ background: '#1E88E5' }} />
            )}
          </div>
          <p className="text-sm text-gray-800 mt-0.5 leading-snug">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">{(notification as any).date}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
