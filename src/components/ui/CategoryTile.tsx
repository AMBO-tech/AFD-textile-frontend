import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import FabricImage from './FabricImage';
import SquareCard, { Pastille } from './SquareCard';

interface CategoryTileProps {
  nom: string;
  /** Tissus de la catégorie servant de couverture (4 au plus sont affichés). */
  couvertures: { id: string; nom: string; photoUrl?: string | null }[];
  /** Ex. « 3 tissus • 120 en stock ». */
  detail: string;
  onClick: () => void;
}

/** Tuile carrée d'une catégorie : mosaïque des photos de ses tissus sur 88 %, le nom en bas. */
export const CategoryTile: React.FC<CategoryTileProps> = ({ nom, couvertures, detail, onClick }) => {
  const vues = couvertures.slice(0, 4);
  return (
    <SquareCard
      onClick={onClick}
      titre={nom}
      infobulle={`${nom} — ${detail}`}
      visuel={
        vues.length === 0 ? (
          <FabricImage nom={nom} />
        ) : (
          <div
            className={cn(
              'w-full h-full grid gap-px bg-white',
              vues.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
              vues.length > 2 ? 'grid-rows-2' : 'grid-rows-1',
            )}
          >
            {vues.map((t, i) => (
              <div key={t.id} className={cn('h-full min-h-0 overflow-hidden', vues.length === 3 && i === 0 && 'row-span-2')}>
                <FabricImage src={t.photoUrl} nom={t.nom} />
              </div>
            ))}
          </div>
        )
      }
      basGauche={
        <Pastille>
          <span className="inline-flex items-center gap-1">
            <Layers size={10} /> {detail}
          </span>
        </Pastille>
      }
    />
  );
};

export default CategoryTile;
