import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import FabricImage from './FabricImage';
import { libelleQuantite, type FabricOption } from './fabricOption';

const couleurDispo = (q: number) => (q <= 0 ? 'bg-rose-600' : q < 10 ? 'bg-amber-500' : 'bg-emerald-600');

interface FabricTileProps {
  option: FabricOption;
  onClick: () => void;
  choisi?: boolean;
  libelleDispo?: string;
  /** Remplace la référence sous le nom (ex. l'emplacement). */
  sousTitre?: string;
}

/** Tuile carrée d'un tissu : la photo occupe 80 % de la hauteur, la disponibilité en pastille. */
export const FabricTile: React.FC<FabricTileProps> = ({ option: t, onClick, choisi = false, libelleDispo = 'dispo', sousTitre }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group relative aspect-square rounded-2xl bg-white border shadow-xs hover:shadow-md overflow-hidden flex flex-col text-left transition-all',
      choisi ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 hover:border-blue-200',
    )}
  >
    <div className="relative h-[80%] w-full overflow-hidden">
      <FabricImage src={t.photoUrl} nom={t.nom} className="group-hover:scale-105 transition-transform duration-300" />
      <span className={cn('absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow', couleurDispo(t.disponible))}>
        {libelleQuantite(t.disponible, t.unite)} {libelleDispo}
      </span>
      {choisi && (
        <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
          <Check size={14} />
        </span>
      )}
    </div>
    <div className="flex-1 px-2.5 flex flex-col justify-center min-h-0 leading-tight" title={`${t.nom} — ${sousTitre ?? t.reference}`}>
      <span className="font-semibold text-gray-900 text-[11px] sm:text-xs truncate">{t.nom}</span>
      <span className="text-[9px] sm:text-[10px] text-gray-400 truncate">{sousTitre ?? t.reference}</span>
    </div>
  </button>
);

export default FabricTile;
