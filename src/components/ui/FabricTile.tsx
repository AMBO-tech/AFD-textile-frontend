import React from 'react';
import { Check } from 'lucide-react';
import FabricImage from './FabricImage';
import SquareCard, { Pastille } from './SquareCard';
import { libelleQuantite, type FabricOption } from './fabricOption';

const couleurDispo = (q: number) => (q <= 0 ? 'bg-rose-600 text-white' : q < 10 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white');

interface FabricTileProps {
  option: FabricOption;
  onClick: () => void;
  choisi?: boolean;
  libelleDispo?: string;
  /** Remplace la référence en pastille (ex. l'emplacement). */
  sousTitre?: string;
}

/** Tuile carrée d'un tissu : photo sur 88 %, disponibilité en haut, référence ou emplacement en bas. */
export const FabricTile: React.FC<FabricTileProps> = ({ option: t, onClick, choisi = false, libelleDispo = 'dispo', sousTitre }) => (
  <SquareCard
    onClick={onClick}
    choisi={choisi}
    titre={t.nom}
    infobulle={`${t.nom} — ${sousTitre ?? t.reference}`}
    visuel={<FabricImage src={t.photoUrl} nom={t.nom} />}
    hautGauche={
      choisi ? (
        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
          <Check size={14} />
        </span>
      ) : undefined
    }
    hautDroite={
      <Pastille className={couleurDispo(t.disponible)}>
        {libelleQuantite(t.disponible, t.unite)} {libelleDispo}
      </Pastille>
    }
    basGauche={<Pastille>{sousTitre ?? t.reference}</Pastille>}
  />
);

export default FabricTile;
