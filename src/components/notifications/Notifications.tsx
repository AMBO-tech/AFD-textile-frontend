import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useMockStore } from '../../data/useMockStore';
import NotificationCard from './NotificationCard';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useMockStore();

  const nonLus = notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {nonLus} non lu{nonLus !== 1 ? 'es' : 'e'}
          </p>
        </div>
        {nonLus > 0 && (
          <button
            onClick={markAllAllNotificationsRead => markAllNotificationsRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            <CheckCheck size={14} />
            <span>Tout marquer lu</span>
          </button>
        )}
      </div>

      {nonLus === 0 && notifications.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#F0FDF4' }}
          >
            <Bell size={24} color="#22C55E" />
          </div>
          <p className="font-medium text-gray-700">Tout est à jour !</p>
          <p className="text-xs text-gray-400 mt-1">Aucune nouvelle notification</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onClick={() => markNotificationRead(n.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Notifications;
