import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface CustomDropdownSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (DropdownOption | string)[];
  icon?: React.ReactNode;
  placeholder?: string;
  menuTitle?: string;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export const CustomDropdownSelect: React.FC<CustomDropdownSelectProps> = ({
  label,
  value,
  onChange,
  options,
  icon,
  placeholder = 'Sélectionner...',
  menuTitle,
  className = 'w-full',
  dropdownClassName = 'w-full',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalisation des options (string -> DropdownOption)
  const normalizedOptions: DropdownOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Fermeture sur Échap
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
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Bouton Trigger (Même design que BoutiqueSelector) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border transition-all text-left bg-white ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'
        } ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icône du trigger (sélectionnée ou par défaut) */}
          {(selectedOption?.icon || icon) && (
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {selectedOption?.icon || icon}
            </div>
          )}

          <div className="min-w-0 pr-1">
            {label && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate block">
                  {label}
                </span>
                {selectedOption?.badge && (
                  <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-gray-100 text-gray-600">
                    {selectedOption.badge}
                  </span>
                )}
              </div>
            )}
            <div className="text-xs font-bold text-gray-900 truncate">
              {selectedOption?.label || placeholder}
            </div>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Menu Déroulant custom flottant */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 rounded-2xl bg-white border border-gray-100 shadow-xl z-50 overflow-hidden ${dropdownClassName}`}
          style={{ minWidth: '100%' }}
        >
          {menuTitle && (
            <div className="px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {menuTitle}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {normalizedOptions.length} options
              </span>
            </div>
          )}

          <div className="p-1.5 space-y-1 max-h-60 overflow-y-auto">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
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
                      {opt.icon || icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">
                          {opt.sublabel}
                        </div>
                      )}
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

export default CustomDropdownSelect;
