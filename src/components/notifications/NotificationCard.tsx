import React from 'react';
import {
  AlertTriangle, MessageSquare, CreditCard, CheckCircle, Store, X
} from 'lucide-react';
import type { Notification } from './types';

interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const TYPE_CONFIG = {
  stock_faible: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', label: 'Stock critique' },
  STOCK_FAIBLE: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', label: 'Stock critique' },
  demande: { icon: MessageSquare, color: '#1E88E5', bg: '#EBF5FB', label: 'Demande' },
  DEMANDE_TRANSFERT: { icon: MessageSquare, color: '#1E88E5', bg: '#EBF5FB', label: 'Demande' },
  creance: { icon: CreditCard, color: '#F59E0B', bg: '#FFFBEB', label: 'Créance' },
  CREANCE: { icon: CreditCard, color: '#F59E0B', bg: '#FFFBEB', label: 'Créance' },
  validation: { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', label: 'Validation' },
  VALIDATION: { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', label: 'Validation' },
  refus: { icon: X, color: '#EF4444', bg: '#FEF2F2', label: 'Refus' },
  boutique: { icon: Store, color: '#0F3D5E', bg: '#EFF6FF', label: 'Boutique' },
  SYSTEME: { icon: Store, color: '#0F3D5E', bg: '#EFF6FF', label: 'Système' },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
}) => {
  const config =
    TYPE_CONFIG[notification.type as keyof typeof TYPE_CONFIG] ??
    TYPE_CONFIG.validation;
  const Icon = config.icon;

  const formattedDate = notification.createdAt
    ? new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(notification.createdAt))
    : '';

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
              {notification.titre || config.label}
            </span>
            {!notification.lu && (
              <span className="w-2 h-2 rounded-full" style={{ background: '#1E88E5' }} />
            )}
          </div>
          <p className="text-sm text-gray-800 mt-0.5 leading-snug">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

