import React from 'react';
import { Store } from 'lucide-react';
import type { BoutiqueRapport } from '@/services/reports.service';
import { formatMontant } from '@/utils/format';
import { CARTE, nombre, pourcent } from './types';

interface RapportsBoutiquesProps {
  boutiques: BoutiqueRapport[];
  total: number;
  /** Touche une boutique : le rapport se restreint à elle. */
  onChoisir: (boutiqueId: string) => void;
}

/** Comparatif des boutiques sur la période : tableau sur grand écran, cartes sur téléphone. */
export const RapportsBoutiques: React.FC<RapportsBoutiquesProps> = ({ boutiques, total, onChoisir }) => {
  const triees = [...boutiques].sort((a, b) => b.chiffreAffaires - a.chiffreAffaires);
  return (
    <div className={CARTE}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-base">Performance par boutique</h2>
          <p className="text-xs text-gray-400">Touchez une boutique pour filtrer le rapport sur elle</p>
        </div>
        <span className="text-xs text-gray-500">
          Réseau : <b className="text-gray-900">{formatMontant(total)}</b>
        </span>
      </div>
      {triees.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Aucune vente sur cette période.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3 font-semibold">Boutique</th>
                  <th className="py-2 px-3 font-semibold text-right">Chiffre d’affaires</th>
                  <th className="py-2 px-3 font-semibold text-right">Encaissé</th>
                  <th className="py-2 px-3 font-semibold text-right">Créances</th>
                  <th className="py-2 px-3 font-semibold text-right">Ventes</th>
                  <th className="py-2 px-3 font-semibold text-right">Panier moyen</th>
                  <th className="py-2 pl-3 font-semibold w-40">Part du réseau</th>
                </tr>
              </thead>
              <tbody>
                {triees.map((b) => (
                  <tr key={b.boutiqueId} onClick={() => onChoisir(b.boutiqueId)} className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-gray-900">{b.boutiqueNom}</div>
                      {b.boutiqueAdresse && <div className="text-[11px] text-gray-400">{b.boutiqueAdresse}</div>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900 whitespace-nowrap">{formatMontant(b.chiffreAffaires)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 whitespace-nowrap">{formatMontant(b.montantEncaisse)}</td>
                    <td className="py-2.5 px-3 text-right text-violet-700 whitespace-nowrap">{formatMontant(b.soldeCreances)}</td>
                    <td className="py-2.5 px-3 text-right">{nombre(b.nombreVentes)}</td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">{formatMontant(b.panierMoyen)}</td>
                    <td className="py-2.5 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[#0F3D5E]" style={{ width: `${Math.min(100, b.partCaPourcentage)}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 w-12 text-right">{pourcent(b.partCaPourcentage)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-2">
            {triees.map((b) => (
              <button key={b.boutiqueId} onClick={() => onChoisir(b.boutiqueId)} className="w-full text-left p-3 rounded-xl border border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-900 text-sm">
                    <Store size={14} className="text-blue-700" /> {b.boutiqueNom}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{formatMontant(b.chiffreAffaires)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0F3D5E]" style={{ width: `${Math.min(100, b.partCaPourcentage)}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] text-gray-500">
                  <span>Encaissé {formatMontant(b.montantEncaisse)}</span>
                  <span>Créances {formatMontant(b.soldeCreances)}</span>
                  <span className="text-right">{nombre(b.nombreVentes)} ventes</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RapportsBoutiques;
