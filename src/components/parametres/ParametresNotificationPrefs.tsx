import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export const ParametresNotificationPrefs: React.FC = () => {
  const [notifStock, setNotifStock] = useState(true);
  const [notifDemandes, setNotifDemandes] = useState(true);
  const [notifCreances, setNotifCreances] = useState(true);

  const items = [
    {
      title: 'Alertes stock critique',
      desc: 'Être notifié quand un tissu passe sous le seuil minimal',
      checked: notifStock,
      toggle: () => setNotifStock(!notifStock),
    },
    {
      title: 'Demandes de réapprovisionnement',
      desc: 'Recevoir les validations et mises à jour de transferts',
      checked: notifDemandes,
      toggle: () => setNotifDemandes(!notifDemandes),
    },
    {
      title: 'Rappels de créances clients',
      desc: 'Alertes lors des échéances de règlement',
      checked: notifCreances,
      toggle: () => setNotifCreances(!notifCreances),
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-50">
        <Bell size={16} className="text-blue-600" />
        <h3 className="font-display font-bold text-gray-900 text-sm">Notifications & Alertes</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div>
              <div className="text-xs font-semibold text-gray-800">{item.title}</div>
              <div className="text-[11px] text-gray-400">{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={item.toggle}
              className="w-10 h-6 rounded-full transition-colors relative"
              style={{ background: item.checked ? '#1E88E5' : '#e5e7eb' }}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                  item.checked ? 'left-5' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParametresNotificationPrefs;
