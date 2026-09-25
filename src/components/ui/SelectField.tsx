import React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Radix interdit la valeur vide : on la remplace par une sentinelle le temps de l'échange. */
const VALEUR_VIDE = '__vide__';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  /** Icône affichée dans le déclencheur quand l'option choisie n'en a pas. */
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'md' | 'sm';
  'aria-label'?: string;
}

/**
 * Liste déroulante de l'application : déclencheur arrondi avec icône et description,
 * menu flottant (portail, au-dessus des fenêtres), navigation clavier et recherche par frappe.
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Choisir…',
  label,
  icon,
  disabled,
  className,
  size = 'md',
  'aria-label': ariaLabel,
}) => {
  const choisie = options.find((o) => o.value === value);
  const versRadix = (v: string) => (v === '' ? VALEUR_VIDE : v);

  return (
    <div className={cn('w-full', className)}>
      {label && <span className="block text-xs font-semibold text-gray-700 mb-1">{label}</span>}
      <SelectPrimitive.Root
        value={choisie ? versRadix(choisie.value) : undefined}
        onValueChange={(v) => onChange(v === VALEUR_VIDE ? '' : v)}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          aria-label={ariaLabel ?? label}
          className={cn(
            'group w-full flex items-center gap-2.5 rounded-2xl border bg-white text-left transition-all outline-none',
            'border-gray-200 hover:border-blue-300 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100',
            'data-[state=open]:border-blue-500 data-[state=open]:ring-4 data-[state=open]:ring-blue-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            size === 'md' ? 'h-12 px-3' : 'h-10 px-2.5',
          )}
        >
          {(choisie?.icon ?? icon) && (
            <span
              className={cn(
                'shrink-0 flex items-center justify-center rounded-xl bg-blue-50 text-blue-700',
                size === 'md' ? 'w-8 h-8' : 'w-6 h-6',
              )}
            >
              {choisie?.icon ?? icon}
            </span>
          )}
          <span className="flex-1 min-w-0">
            {choisie ? (
              <>
                <span className={cn('block truncate font-semibold text-gray-900', size === 'md' ? 'text-sm' : 'text-xs')}>
                  {choisie.label}
                </span>
                {choisie.description && size === 'md' && (
                  <span className="block truncate text-[11px] text-gray-400">{choisie.description}</span>
                )}
              </>
            ) : (
              <span className={cn('block truncate text-gray-400', size === 'md' ? 'text-sm' : 'text-xs')}>{placeholder}</span>
            )}
          </span>
          <ChevronDown size={16} className="shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className={cn(
              'z-[200] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl',
              'min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)]',
              'max-h-[min(var(--radix-select-content-available-height),360px)]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            )}
          >
            <SelectPrimitive.Viewport className="p-1.5">
              {options.map((o) => (
                <SelectPrimitive.Item
                  key={o.value || VALEUR_VIDE}
                  value={versRadix(o.value)}
                  disabled={o.disabled}
                  className={cn(
                    'relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 pr-8 cursor-pointer select-none outline-none',
                    'data-[highlighted]:bg-blue-50 data-[state=checked]:bg-blue-50/60',
                    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                  )}
                >
                  {o.icon && (
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                      {o.icon}
                    </span>
                  )}
                  <span className="min-w-0">
                    <SelectPrimitive.ItemText>
                      <span className="block truncate text-sm font-semibold text-gray-900">{o.label}</span>
                    </SelectPrimitive.ItemText>
                    {o.description && <span className="block truncate text-[11px] text-gray-400">{o.description}</span>}
                  </span>
                  <SelectPrimitive.ItemIndicator className="absolute right-2.5 text-blue-600">
                    <Check size={16} />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
              {options.length === 0 && <div className="px-3 py-4 text-center text-xs text-gray-400">Aucun choix disponible</div>}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
};

export default SelectField;
