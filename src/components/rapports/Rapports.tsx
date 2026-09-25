import React, { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import type { FiltreRapport } from '@/services/reports.service';
import { useReport } from '../../hooks/queries/useReportsQuery';
import { useLocationsListQuery } from '../../hooks/queries/useLocationsQuery';
import { getErrorMessage } from '../../services/api';
import RapportsFilters from './RapportsFilters';
import RapportsKpiCards from './RapportsKpiCards';
import RapportsTrendChart from './RapportsTrendChart';
import RapportsBoutiques from './RapportsBoutiques';
import RapportsVentesDetail from './RapportsVentesDetail';
import RapportsCreancesStock from './RapportsCreancesStock';
import { nomFichier, rapportEnCsv, telecharger } from './rapportsExport';
import { libellePeriode } from './types';

/** Plafond imposé par l'API sur les listes paginées. */
const API_PAGE_MAX = 100;

const dateCourte = (iso: string) => new Date(iso).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * Rapports du gérant : chiffres globaux du réseau ou d'une boutique sur une période,
 * comparés à la période précédente, avec export Excel (CSV) et impression / PDF.
 */
export const Rapports: React.FC = () => {
  const [filtre, setFiltre] = useState<FiltreRapport>({ periode: 'CE_MOIS' });
  const r = useReport(filtre);
  const { data: locRes } = useLocationsListQuery({ limit: API_PAGE_MAX });
  const boutiques = useMemo(() => (locRes?.data ?? []).filter((l) => l.type === 'BOUTIQUE'), [locRes]);
  const perimetre = boutiques.find((b) => b.id === filtre.boutiqueId)?.nom ?? 'Tout le réseau';
  const entete = { periode: libellePeriode(filtre.periode), perimetre };

  const exporter = () => {
    if (!r.kpis) return;
    telecharger(
      nomFichier(entete),
      rapportEnCsv(
        {
          kpis: r.kpis,
          tendance: r.tendance,
          tissus: r.tissus?.produits,
          categories: r.categories?.categories,
          boutiques: filtre.boutiqueId ? undefined : r.boutiques?.boutiques,
          creances: r.creances,
          stock: r.stock,
        },
        entete,
      ),
    );
    toast.success('Rapport exporté : ouvrez le fichier avec Excel.');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center print:hidden">
          <BarChart3 size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-gray-900 text-xl sm:text-2xl">Rapports — {perimetre}</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {entete.periode}
            {r.kpis && ` : du ${dateCourte(r.kpis.periode.dateDebut)} au ${dateCourte(r.kpis.periode.dateFin)} • comparé à la période précédente`}
          </p>
        </div>
      </div>

      <RapportsFilters
        filtre={filtre}
        onChange={setFiltre}
        boutiques={boutiques}
        onExporter={exporter}
        onImprimer={() => window.print()}
        onActualiser={r.refetch}
        exportPossible={Boolean(r.kpis)}
        actualisation={r.isFetching}
      />

      {!r.pret ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 text-sm text-gray-400">
          Choisissez la date de début et la date de fin.
        </div>
      ) : r.erreur ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100 text-sm text-red-600">
          {getErrorMessage(r.erreur, 'Le rapport n’a pas pu être calculé.')}
        </div>
      ) : r.isLoading || !r.kpis ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 text-sm text-gray-400">Calcul du rapport…</div>
      ) : (
        <>
          <RapportsKpiCards kpis={r.kpis} />
          {r.tendance && <RapportsTrendChart tendance={r.tendance} />}
          {!filtre.boutiqueId && r.boutiques && (
            <RapportsBoutiques
              boutiques={r.boutiques.boutiques}
              total={r.boutiques.totalCaReseau}
              onChoisir={(boutiqueId) => setFiltre({ ...filtre, boutiqueId })}
            />
          )}
          <RapportsVentesDetail tissus={r.tissus?.produits ?? []} categories={r.categories?.categories ?? []} />
          {r.creances && r.stock && <RapportsCreancesStock creances={r.creances} stock={r.stock} />}
          <p className="hidden print:block text-[10px] text-gray-400">Rapport AFD Textile généré le {new Date().toLocaleString('fr-SN')}</p>
        </>
      )}
    </div>
  );
};

export default Rapports;
