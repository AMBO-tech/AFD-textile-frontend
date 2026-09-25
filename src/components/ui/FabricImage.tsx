import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const TEINTES = ['#0F3D5E', '#1E88E5', '#7C3AED', '#DB2777', '#EA580C', '#059669', '#0891B2', '#CA8A04'];

const teinte = (texte: string) => TEINTES[[...texte].reduce((s, c) => s + c.charCodeAt(0), 0) % TEINTES.length];

interface FabricImageProps {
  src?: string | null;
  nom: string;
  className?: string;
}

/** Photo d'un tissu ; sans photo (ou lien cassé), une vignette colorée avec les initiales. */
export const FabricImage: React.FC<FabricImageProps> = ({ src, nom, className }) => {
  const [cassee, setCassee] = useState(false);
  if (src && !cassee) {
    return <img src={src} alt={nom} loading="lazy" onError={() => setCassee(true)} className={cn('w-full h-full object-cover', className)} />;
  }
  const couleur = teinte(nom);
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .map((m) => m[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn('w-full h-full flex items-center justify-center font-display font-bold text-white', className)}
      style={{
        background: `linear-gradient(135deg, ${couleur}, ${couleur}B3), repeating-linear-gradient(45deg, #ffffff22 0 6px, transparent 6px 12px)`,
        backgroundBlendMode: 'overlay',
      }}
      aria-label={nom}
    >
      <span className="text-2xl drop-shadow-sm">{initiales || '?'}</span>
    </div>
  );
};

export default FabricImage;
