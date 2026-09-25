import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import FabricImage from './FabricImage';
import { libelleQuantite, type FabricOption } from './fabricOption';

export interface FabricLine {
  option: FabricOption;
  /** Saisie brute (virgule acceptée). */
  quantite: string;
}

export const quantiteLigne = (l: FabricLine) => Number(l.quantite.replace(',', '.'));

/** Ligne invalide : quantité absente, nulle, ou au-delà du maximum autorisé. */
export const ligneInvalide = (l: FabricLine, plafonnee: boolean) => {
  const q = quantiteLigne(l);
  return !Number.isFinite(q) || q <= 0 || (plafonnee && q > l.option.disponible);
};

interface FabricLinesListProps {
  lignes: FabricLine[];
  onChange: (lignes: FabricLine[]) => void;
  /** La quantité ne peut pas dépasser le disponible (transfert depuis une source). */
  plafonnee?: boolean;
  libelleDispo?: string;
}

/** Tissus choisis, avec quantité ajustable (+/- ou saisie) et suppression. */
export const FabricLinesList: React.FC<FabricLinesListProps> = ({ lignes, onChange, plafonnee = false, libelleDispo = 'disponible' }) => {
  const maj = (produitId: string, quantite: string) =>
    onChange(lignes.map((l) => (l.option.produitId === produitId ? { ...l, quantite } : l)));
  const pas = (l: FabricLine, delta: number) => {
    const q = Math.max(0, (quantiteLigne(l) || 0) + delta);
    const borne = plafonnee ? Math.min(q, l.option.disponible) : q;
    maj(l.option.produitId, String(Math.round(borne * 100) / 100));
  };

  return (
    <div className="space-y-2">
      {lignes.map((l) => {
        const invalide = ligneInvalide(l, plafonnee);
        return (
          <div key={l.option.produitId} className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              <FabricImage src={l.option.photoUrl} nom={l.option.nom} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{l.option.nom}</div>
              <div className="text-[11px] text-gray-400 truncate">
                {l.option.reference} • {libelleQuantite(l.option.disponible, l.option.unite)} {libelleDispo}
              </div>
              {invalide && l.quantite !== '' && (
                <div className="text-[10px] text-rose-600 font-semibold">
                  {plafonnee && quantiteLigne(l) > l.option.disponible ? 'Au-delà du stock disponible' : 'Quantité invalide'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={() => pas(l, -1)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50" aria-label="Diminuer">
                <Minus size={14} />
              </button>
              <input
                value={l.quantite}
                onChange={(e) => maj(l.option.produitId, e.target.value)}
                inputMode="decimal"
                aria-label={`Quantité ${l.option.nom}`}
                className={cn(
                  'w-16 h-8 rounded-xl border text-center text-sm font-bold',
                  invalide && l.quantite !== '' ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-gray-200',
                )}
              />
              <button type="button" onClick={() => pas(l, 1)} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50" aria-label="Augmenter">
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(lignes.filter((x) => x.option.produitId !== l.option.produitId))}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                aria-label={`Retirer ${l.option.nom}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FabricLinesList;
