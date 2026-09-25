import React from 'react';
import { CalendarRange, Layers, Download, Printer, RefreshCw } from 'lucide-react';
import type { Location } from '@/types/locations';
import type { FiltreRapport, PeriodeRapport } from '@/services/reports.service';
import { cn } from '@/lib/utils';
import SelectField from '../ui/SelectField';
import { optionsEmplacements } from '../ui/locationOptions';
import { PERIODES } from './types';

interface RapportsFiltersProps {
  filtre: FiltreRapport;
  onChange: (f: FiltreRapport) => void;
  boutiques: Location[];
  onExporter: () => void;
  onImprimer: () => void;
  onActualiser: () => void;
  exportPossible: boolean;
  actualisation: boolean;
}

const jourIso = (iso?: string) => (iso ? iso.slice(0, 10) : '');

/** Période (prédéfinie ou dates libres), boutique, et actions d'export. */
export const RapportsFilters: React.FC<RapportsFiltersProps> = ({
  filtre,
  onChange,
  boutiques,
  onExporter,
  onImprimer,
  onActualiser,
  exportPossible,
  actualisation,
}) => {
  const choisirPeriode = (periode: PeriodeRapport) =>
    onChange(periode === 'PERSONNALISE' ? { ...filtre, periode } : { periode, boutiqueId: filtre.boutiqueId });

  const choisirDate = (champ: 'dateDebut' | 'dateFin', valeur: string) => {
    if (!valeur) return onChange({ ...filtre, [champ]: undefined });
    const d = new Date(`${valeur}T00:00:00`);
    if (champ === 'dateFin') d.setHours(23, 59, 59, 999);
    onChange({ ...filtre, [champ]: d.toISOString() });
  };

  const champDate = 'h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:border-blue-500';

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-xs space-y-3 print:hidden">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {PERIODES.map((p) => (
          <button
            key={p.id}
            onClick={() => choisirPeriode(p.id)}
            className={cn(
              'whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border',
              filtre.periode === p.id ? 'bg-[#0F3D5E] text-white border-[#0F3D5E]' : 'bg-white text-gray-600 border-gray-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <SelectField
            label="Périmètre"
            value={filtre.boutiqueId ?? ''}
            onChange={(v) => onChange({ ...filtre, boutiqueId: v || undefined })}
            options={[
              { value: '', label: 'Tout le réseau', description: 'Toutes les boutiques', icon: <Layers size={16} /> },
              ...optionsEmplacements(boutiques),
            ]}
          />
          {filtre.periode === 'PERSONNALISE' && (
            <div className="sm:col-span-1 lg:col-span-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-1">
                <CalendarRange size={13} /> Du … au …
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={jourIso(filtre.dateDebut)}
                  max={jourIso(filtre.dateFin) || undefined}
                  onChange={(e) => choisirDate('dateDebut', e.target.value)}
                  className={cn(champDate, 'flex-1 min-w-0')}
                  aria-label="Date de début"
                />
                <span className="text-gray-400 text-xs">→</span>
                <input
                  type="date"
                  value={jourIso(filtre.dateFin)}
                  min={jourIso(filtre.dateDebut) || undefined}
                  onChange={(e) => choisirDate('dateFin', e.target.value)}
                  className={cn(champDate, 'flex-1 min-w-0')}
                  aria-label="Date de fin"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onActualiser}
            className="h-10 w-10 shrink-0 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            aria-label="Actualiser"
            title="Actualiser"
          >
            <RefreshCw size={15} className={actualisation ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onImprimer}
            disabled={!exportPossible}
            className="h-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer size={15} /> Imprimer / PDF
          </button>
          <button
            onClick={onExporter}
            disabled={!exportPossible}
            className="h-10 flex-1 md:flex-none flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold text-white disabled:opacity-50"
            style={{ background: '#16a34a' }}
          >
            <Download size={15} /> Exporter (Excel)
          </button>
        </div>
      </div>
    </div>
  );
};

export default RapportsFilters;
