import { useState } from 'react';
import { Bell, AlertTriangle, MessageSquare, CreditCard, CheckCircle, HardDrive, X, Check } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'stock_faible' | 'demande' | 'creance' | 'validation' | 'refus' | 'sauvegarde';
  message: string;
  date: string;
  lu: boolean;
}

const TYPE_CONFIG = {
  stock_faible: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', label: 'Stock critique' },
  demande: { icon: MessageSquare, color: '#1E88E5', bg: '#EBF5FB', label: 'Demande réappro' },
  creance: { icon: CreditCard, color: '#F59E0B', bg: '#FFFBEB', label: 'Créance' },
  validation: { icon: CheckCircle, color: '#22C55E', bg: '#F0FDF4', label: 'Validation transfert' },
  refus: { icon: X, color: '#EF4444', bg: '#FEF2F2', label: 'Refus transfert' },
  sauvegarde: { icon: HardDrive, color: '#22C55E', bg: '#F0FDF4', label: 'Sauvegarde système' },
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', type: 'stock_faible', message: 'Alerte stock: Bazin Riche Doré est inférieur au seuil d\'alerte (4 rouleaux restants à Plateau)', date: 'Il y a 25 min', lu: false },
  { id: 'n2', type: 'demande', message: 'Nouvelle demande de transfert #DEM-042 reçue depuis la boutique Cocody (20 yards Wax)', date: 'Il y a 1 heure', lu: false },
  { id: 'n3', type: 'creance', message: 'Rappel créance: Mme Awa Coulibaly a un solde débiteur de 45 000 F CFA arrivant à échéance', date: 'Il y a 3 heures', lu: false },
  { id: 'n4', type: 'validation', message: 'Demande de réapprovisionnement #DEM-040 validée par l\'entrepôt central', date: 'Hier à 17:40', lu: true },
  { id: 'n5', type: 'sauvegarde', message: 'Sauvegarde automatique du cloud effectuée avec succès (12.6 Mo)', date: 'Hier à 00:00', lu: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const nonLus = notifications.filter(n => !n.lu).length;

  const marquerTousLus = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const marquerLu = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Centre de Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {nonLus > 0 ? `${nonLus} notification(s) non lue(s)` : 'Toutes les alertes ont été lues'}
          </p>
        </div>
        {nonLus > 0 && (
          <button
            onClick={marquerTousLus}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1E88E5] hover:bg-blue-50 transition-colors border border-blue-100"
          >
            <Check size={14} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#F0FDF4' }}>
            <Bell size={28} color="#22C55E" />
          </div>
          <p className="font-bold text-gray-800 text-lg">Tout est à jour !</p>
          <p className="text-xs text-gray-400 mt-1">Aucune nouvelle alerte pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.validation;
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => marquerLu(n.id)}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border cursor-pointer transition-all ${
                  !n.lu ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: config.bg }}>
                    <Icon size={18} color={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: config.color }}>{config.label}</span>
                      {!n.lu && <span className="w-2 h-2 rounded-full bg-[#1E88E5]" />}
                    </div>
                    <p className="text-sm text-gray-800 font-medium mt-1 leading-snug">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
