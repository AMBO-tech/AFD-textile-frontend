import React from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../hooks/queries/useNotificationsQuery';
import NotificationCard from './NotificationCard';

/**
 * @component Notifications
 * @description Page / panneau de notifications connecté à l'API réelle.
 * Remplace l'ancien composant basé sur useMockStore().
 *
 * @api GET    /api/v1/notifications          — liste paginée
 * @api PATCH  /api/v1/notifications/:id/lire — marquer une notif comme lue
 * @api PATCH  /api/v1/notifications/tout-lire — marquer toutes comme lues
 */
export const Notifications: React.FC = () => {
  const { data, isLoading, isError } = useNotificationsQuery({ limit: 50 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const notifications = data?.data ?? [];
  const nonLus = data?.nonLuesTotal ?? 0;

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? '...' : `${nonLus} non lu${nonLus !== 1 ? 'es' : 'e'}`}
          </p>
        </div>
        {nonLus > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={14} />
            <span>Tout marquer lu</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 rounded-2xl p-4 text-sm text-red-600 border border-red-100">
          Impossible de charger les notifications. Vérifiez votre connexion.
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
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
            onClick={() => !n.lu && handleMarkRead(n.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Notifications;
