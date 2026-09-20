import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, RotateCcw, Calendar, Store } from 'lucide-react';
import type { Vente, Boutique } from '../../data/useMockStore';
import { formatMontant } from '../../data/mock';

type PeriodeFiltre = 'tous' | 'jour' | 'semaine' | 'mois' | 'annee';

interface SalesHistoryTableProps {
  ventes: Vente[];
  onCancelClick: (vente: Vente) => void;
  role: 'gerant' | 'boutiquier';
  boutiques?: Boutique[];
  boutiqueActive?: string;
}

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({
  ventes,
  onCancelClick,
  role,
  boutiques = [],
  boutiqueActive = 'tous',
}) => {
  const [periode, setPeriode] = useState<PeriodeFiltre>('tous');

  // Filtrage temporel dynamique
  const ventesFiltreesPeriode = useMemo(() => {
    if (periode === 'tous') return ventes;

    const todayIso = new Date().toISOString().split('T')[0];
    const latestDateStr = ventes.reduce((max, v) => (v.date > max ? v.date : max), todayIso);
    const refDate = new Date(latestDateStr);

    return ventes.filter((v) => {
      const vDate = new Date(v.date);
      if (isNaN(vDate.getTime())) return true;

      if (periode === 'jour') {
        return v.date === todayIso || v.date === latestDateStr;
      }

      if (periode === 'semaine') {
        const diffDays = (refDate.getTime() - vDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (periode === 'mois') {
        return (
          vDate.getFullYear() === refDate.getFullYear() &&
          vDate.getMonth() === refDate.getMonth()
        );
      }

      if (periode === 'annee') {
        return vDate.getFullYear() === refDate.getFullYear();
      }

      return true;
    });
  }, [ventes, periode]);

  // Totaux financiers de la sélection active
  const stats = useMemo(() => {
    const valides = ventesFiltreesPeriode.filter((v) => v.statut === 'validée');
    const annulees = ventesFiltreesPeriode.filter((v) => v.statut === 'annulée');
    const totalMontant = valides.reduce((sum, v) => sum + v.montant, 0);

    return {
      totalMontant,
      nbValides: valides.length,
      nbAnnulees: annulees.length,
    };
  }, [ventesFiltreesPeriode]);

  const getBoutiqueNom = (bId: string) => {
    const b = boutiques.find((item) => item.id === bId);
    if (!b) return bId;
    return b.nom.replace('AFD Textile ', '');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-0">
      {/* En-tête du tableau avec titre */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="font-display font-bold text-gray-900 text-sm sm:text-base">
            Dernières Ventes Enregistrées
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {ventesFiltreesPeriode.length} sur {ventes.length}
          </span>
        </div>
      </div>

      {/* Ligne Filtres Temporels (Gauche) & Total Financier (Droite) */}
      <div className="p-3 sm:p-4 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* À gauche : Filtres par période */}
        <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl self-start sm:self-auto">
          {([
            { id: 'tous', label: 'Tous' },
            { id: 'jour', label: 'Jour' },
            { id: 'semaine', label: 'Semaine' },
            { id: 'mois', label: 'Mois' },
            { id: 'annee', label: 'Année' },
          ] as const).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriode(p.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                periode === p.id
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* À droite : Total des ventes calculé */}
        <div className="flex items-center gap-3 sm:text-right self-end sm:self-auto">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Total {periode !== 'tous' ? `(${periode})` : 'sélection'}
            </div>
            <div className="font-display font-bold text-sm sm:text-base text-gray-900 leading-tight">
              {formatMontant(stats.totalMontant)}
            </div>
          </div>
          <div className="pl-3 border-l border-gray-200 text-left">
            <div className="text-[10px] text-gray-500 font-semibold">
              {stats.nbValides} vente{stats.nbValides > 1 ? 's' : ''}
            </div>
            {stats.nbAnnulees > 0 && (
              <div className="text-[10px] text-red-500 font-semibold">
                {stats.nbAnnulees} annulée{stats.nbAnnulees > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liste des ventes */}
      <div className="divide-y divide-gray-50 overflow-x-auto">
        {ventesFiltreesPeriode.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Aucune vente trouvée pour cette sélection temporelle.
          </div>
        ) : (
          ventesFiltreesPeriode.map((v) => {
            const isAnnulee = v.statut === 'annulée';

            return (
              <div
                key={v.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isAnnulee ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {isAnnulee ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-xs truncate">
                        {v.produit}
                      </span>
                      {/* Badge Boutique si rôle gérant ou vue réseau */}
                      {(role === 'gerant' || boutiqueActive === 'tous') && v.boutique && (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                          <Store size={10} />
                          {getBoutiqueNom(v.boutique)}
                        </span>
                      )}
                      {isAnnulee && (
                        <span className="text-[10px] font-bold text-red-500 uppercase">
                          (Annulée)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Client : <span className="font-medium text-gray-700">{v.client}</span> •{' '}
                      {v.quantite} {v.unite} • {v.date} {v.heure}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Vendeur : {v.vendeur} • Règl. : {v.paiement}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-display font-bold text-xs sm:text-sm ${
                        isAnnulee ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                    >
                      {formatMontant(v.montant)}
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {v.typeVente}
                    </span>
                  </div>

                  {!isAnnulee && (
                    <button
                      type="button"
                      onClick={() => onCancelClick(v)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Annuler cette vente"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SalesHistoryTable;
