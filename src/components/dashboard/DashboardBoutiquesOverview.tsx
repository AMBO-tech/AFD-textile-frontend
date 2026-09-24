import React from 'react';
import { Warehouse, ChevronRight } from 'lucide-react';

const formatMontant = (n: number) => new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

interface DashboardBoutiquesOverviewProps {
  boutiques: any[];
  produits: any[];
  ventes: any[];
  onNavigate?: (s: string) => void;
}

export const DashboardBoutiquesOverview: React.FC<DashboardBoutiquesOverviewProps> = ({
  boutiques,
  produits,
  ventes,
  onNavigate,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-bold text-gray-900 text-base">
            Performances par Boutique
          </div>
          <div className="text-xs text-gray-400">Réseau AFD Textile Sénégal</div>
        </div>
        <button
          onClick={() => onNavigate?.('stock')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          Tous les stocks <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {boutiques.map((b) => {
          const ventesBoutique = ventes
            .filter((v) => v.locationId === b.id && (v.statut === 'VALIDE' || v.statut === 'validée'))
            .reduce((s, v) => s + (v.montant || v.montantTotal || 0), 0);

          const stockBoutique = produits
            .filter((p) => p.locationId === b.id)
            .reduce((s, p) => s + p.quantite, 0);

          return (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Warehouse size={14} />
                </div>
                <div className="font-semibold text-gray-800 text-sm">{b.nom}</div>
              </div>
              <div className="text-xs text-gray-500 mb-3">{b.lieu}</div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Ventes :</span>
                  <span className="font-bold text-gray-900">{formatMontant(ventesBoutique)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Stock :</span>
                  <span className="font-bold text-blue-600">{stockBoutique} unités</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardBoutiquesOverview;
