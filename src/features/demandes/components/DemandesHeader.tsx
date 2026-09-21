import React from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';

interface DemandesHeaderProps {
  role: 'gerant' | 'boutiquier';
  stocksCritiquesCount: number;
  demandesEnAttenteCount: number;
  boutiqueNom?: string;
  onOpenDemande: () => void;
  onNavigate?: (s: string) => void;
}

export const DemandesHeader: React.FC<DemandesHeaderProps> = ({
  role,
  stocksCritiquesCount,
  demandesEnAttenteCount,
  boutiqueNom,
  onOpenDemande,
  onNavigate,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-xl font-bold text-gray-900">
          {role === 'gerant' ? 'Validation des Réapprovisionnements' : 'Demandes de Réappro'}
        </h1>
        <p className="text-sm text-gray-500">
          {role === 'boutiquier' ? (
            <span>
              {stocksCritiquesCount} alerte{stocksCritiquesCount !== 1 ? 's' : ''} · {demandesEnAttenteCount} en attente · <strong className="text-gray-700">{boutiqueNom}</strong>
            </span>
          ) : (
            <span>
              {demandesEnAttenteCount} demande{demandesEnAttenteCount > 1 ? 's' : ''} en attente de décision · {stocksCritiquesCount} stock{stocksCritiquesCount > 1 ? 's' : ''} critique{stocksCritiquesCount > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {role === 'boutiquier' ? (
        <button
          onClick={onOpenDemande}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
        >
          <Plus size={16} /> Demande
        </button>
      ) : (
        <button
          onClick={() => onNavigate?.('entrepot')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #0F3D5E, #1E88E5)' }}
          title="Aller vers le module des transferts pour effectuer une expédition directe"
        >
          <ArrowLeftRight size={16} /> Nouveau transfert
        </button>
      )}
    </div>
  );
};

export default DemandesHeader;
