import React from 'react';
import { cn } from '@/lib/utils';

/** Part de la hauteur réservée au visuel ; le reste porte le nom sur une ligne. */
const PART_VISUEL = 'h-[88%]';

interface SquareCardProps {
  /** Visuel plein cadre (photo, mosaïque, vignette de repli). */
  visuel: React.ReactNode;
  titre: string;
  /** Texte complet au survol (le titre est tronqué sur une ligne). */
  infobulle?: string;
  hautGauche?: React.ReactNode;
  hautDroite?: React.ReactNode;
  basGauche?: React.ReactNode;
  basDroite?: React.ReactNode;
  choisi?: boolean;
  estompe?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Pastille lisible posée sur une photo (fond sombre translucide ou couleur d'état). */
export const Pastille: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold leading-4 shadow whitespace-nowrap max-w-full truncate', className ?? 'bg-black/55 text-white backdrop-blur-sm')}>
    {children}
  </span>
);

/**
 * Carte carrée des tissus et catégories : le visuel occupe 88 % de la hauteur, le nom le bas
 * de la carte, et les informations secondaires sont des pastilles aux coins du visuel.
 */
export const SquareCard: React.FC<SquareCardProps> = ({
  visuel,
  titre,
  infobulle,
  hautGauche,
  hautDroite,
  basGauche,
  basDroite,
  choisi = false,
  estompe = false,
  onClick,
  className,
}) => {
  const contenu = (
    <>
      <div className={cn('relative w-full overflow-hidden bg-gray-100', PART_VISUEL)}>
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">{visuel}</div>
        {(hautGauche || hautDroite) && (
          <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
            <span className="min-w-0">{hautGauche}</span>
            <span className="min-w-0 flex justify-end">{hautDroite}</span>
          </div>
        )}
        {(basGauche || basDroite) && (
          <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-1">
            <span className="min-w-0 flex">{basGauche}</span>
            <span className="min-w-0 flex justify-end">{basDroite}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 px-2.5 flex items-center">
        <span className="w-full truncate font-semibold text-gray-900 text-[11px] sm:text-xs leading-none">{titre}</span>
      </div>
    </>
  );

  const classes = cn(
    'group relative aspect-square w-full rounded-2xl bg-white border shadow-xs overflow-hidden flex flex-col text-left transition-all',
    choisi ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100',
    onClick && 'hover:shadow-md hover:border-blue-200 cursor-pointer',
    estompe && 'opacity-60',
    className,
  );

  return onClick ? (
    <button type="button" onClick={onClick} title={infobulle ?? titre} className={classes}>
      {contenu}
    </button>
  ) : (
    <div title={infobulle ?? titre} className={classes}>
      {contenu}
    </div>
  );
};

export default SquareCard;
