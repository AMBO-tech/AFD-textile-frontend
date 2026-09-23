import React from 'react';
import { AlertTriangle, ChevronRight, ShoppingCart } from 'lucide-react';


interface DashboardStockAlertsProps {
  alerts: Produit[];
  onNavigate?: (s: string) => void;
  onVenteDirecte?: (produitId: string) => void;
}

export const DashboardStockAlerts: React.FC<DashboardStockAlertsProps> = ({
  alerts,
  onNavigate,
  onVenteDirecte,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div>
            <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
              Alertes stock critique
            </div>
            <div className="text-xs text-amber-600 font-medium">
              {alerts.length} article{alerts.length > 1 ? 's' : ''} sous le seuil d'alerte
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('stock')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          Voir tout <ChevronRight size={14} />
        </button>
      </div>

      <div className="divide-y divide-gray-50">
        {alerts.slice(0, 3).map((prod) => (
          <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={prod.photo} alt={prod.nom} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{prod.nom}</div>
                <div className="text-xs text-gray-400">
                  {prod.categorie} • {prod.couleur}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {prod.quantite} {prod.unite} restant{prod.quantite > 1 ? 's' : ''}
              </span>
              {onVenteDirecte && (
                <button
                  onClick={() => onVenteDirecte(prod.id)}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Vendre directement"
                >
                  <ShoppingCart size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStockAlerts;
