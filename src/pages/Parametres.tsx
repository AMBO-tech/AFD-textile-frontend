import { useState } from 'react';
import { Settings, Bell, Store, Globe, ChevronRight, ShieldCheck, Database, Sliders } from 'lucide-react';
import { useLocationStore } from '../stores/locationStore';

interface ToggleItem {
  id: string;
  label: string;
  sub: string;
  on: boolean;
}

export default function Parametres() {
  const { stores, currentStore } = useLocationStore();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    alert_stock: true,
    notif_demande: true,
    notif_creance: true,
    sync_auto: true,
    print_ticket_auto: false,
  });

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F3D5E]">Paramètres du Système</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration des boutiques, notifications et préférences de l'application</p>
      </div>

      {/* Boutiques */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
          <Store size={18} className="text-[#1E88E5]" />
          <span className="text-xs font-bold text-[#0F3D5E] uppercase tracking-wider">Réseau des Boutiques AFD</span>
        </div>
        <div className="divide-y divide-gray-100">
          {stores.map((store) => (
            <div key={store.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/80 transition-colors">
              <div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {store.nom}
                  {store.type === 'ENTREPOT' && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                      Dépôt Central
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {store.adresse || 'Abidjan, Côte d\'Ivoire'} · {store.telephone || '+225 27 20 00 00'}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications & Alertes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
          <Bell size={18} className="text-[#1E88E5]" />
          <span className="text-xs font-bold text-[#0F3D5E] uppercase tracking-wider">Alertes & Notifications</span>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { key: 'alert_stock', label: 'Alertes stock critique', sub: 'Notifier quand le stock d\'un tissu passe sous le seuil' },
            { key: 'notif_demande', label: 'Nouvelles demandes de réapprovisionnement', sub: 'Alerter instantanément le gérant lors d\'une demande' },
            { key: 'notif_creance', label: 'Créances en retard', sub: 'Rappels automatiques pour les créances échues' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between px-5 py-4">
              <div className="pr-4">
                <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(item.key)}
                className="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
                style={{ background: toggles[item.key] ? '#1E88E5' : '#E2E8F0' }}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                    toggles[item.key] ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Matériel & Caisse */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
          <Sliders size={18} className="text-[#1E88E5]" />
          <span className="text-xs font-bold text-[#0F3D5E] uppercase tracking-wider">Caisse & Impression</span>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-gray-800">Impression ticket automatique</div>
              <div className="text-xs text-gray-400 mt-0.5">Déclencher l'impression du ticket thermique dès validation de paiement</div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('print_ticket_auto')}
              className="w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0"
              style={{ background: toggles['print_ticket_auto'] ? '#1E88E5' : '#E2E8F0' }}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                  toggles['print_ticket_auto'] ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pt-2 pb-6">AFD Textile Platform v1.2 · Propulsé par Antigravity</p>
    </div>
  );
}
