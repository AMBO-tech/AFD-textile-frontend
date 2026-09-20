import React, { useState, useRef, useEffect } from 'react';
import { Store, ChevronDown, Check, MapPin, Building2 } from 'lucide-react';
import type { Boutique } from '../../data/useMockStore';

interface BoutiqueSelectorProps {
  boutiques: Boutique[];
  selectedId: string;
  onSelect: (id: string) => void;
  allowAll?: boolean;
}

export const BoutiqueSelector: React.FC<BoutiqueSelectorProps> = ({
  boutiques,
  selectedId,
  onSelect,
  allowAll = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBoutique =
    selectedId === 'tous'
      ? {
          id: 'tous',
          code: 'GLOBAL',
          nom: 'Toutes les boutiques (Réseau)',
          type: 'BOUTIQUE' as const,
          lieu: 'Réseau AFD Textile',
          adresse: '',
          telephone: '',
          gerant: 'Tous',
          actif: true,
        }
      : boutiques.find((b) => b.id === selectedId) || boutiques[0];

  // Fermeture au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fermeture avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Bouton Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all text-left bg-white cursor-pointer ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-2xs'
        }`}
        title="Changer de boutique"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Store size={16} />
        </div>

        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Point de vente
            </span>
            {selectedBoutique?.code && (
              <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-gray-100 text-gray-600">
                {selectedBoutique.code}
              </span>
            )}
          </div>
          <div className="text-xs font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[210px]">
            {selectedBoutique?.nom || 'Sélectionner une boutique'}
          </div>
        </div>

        <ChevronDown
          size={15}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Menu Déroulant custom */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-2xl bg-white border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Changer de boutique
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {boutiques.length} points de vente
            </span>
          </div>

          <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
            {allowAll && (
              <button
                type="button"
                onClick={() => {
                  onSelect('tous');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  selectedId === 'tous'
                    ? 'bg-blue-50/80 text-blue-900 font-semibold'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedId === 'tous'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}
                  >
                    <Building2 size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">
                      Toutes les boutiques (Réseau)
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Vue consolidée multi-boutiques
                    </div>
                  </div>
                </div>

                {selectedId === 'tous' && (
                  <div className="shrink-0 pl-2 text-blue-600">
                    <Check size={16} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            )}

            {boutiques.map((b) => {
              const isSelected = b.id === selectedBoutique?.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelect(b.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 font-semibold'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}
                    >
                      <Store size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {b.nom}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="shrink-0 text-gray-400" />
                        <span className="truncate">{b.lieu}</span>
                        {b.code && (
                          <span className="text-[9px] font-mono text-gray-400 ml-1">
                            • {b.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="shrink-0 pl-2 text-blue-600">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoutiqueSelector;
