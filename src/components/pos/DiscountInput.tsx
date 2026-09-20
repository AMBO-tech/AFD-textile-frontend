import React from 'react'
import { Percent } from 'lucide-react'

interface DiscountInputProps {
  discountPct: number
  onChange: (pct: number) => void
}

export const DiscountInput: React.FC<DiscountInputProps> = ({ discountPct, onChange }) => {
  const presets = [0, 5, 10, 15, 20]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 flex items-center gap-1 font-medium">
          <Percent className="w-3.5 h-3.5 text-slate-400" />
          Remise commerciale accordée :
        </span>
        <span className="font-bold text-primary">{discountPct}%</span>
      </div>

      <div className="flex items-center gap-1.5">
        {presets.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => onChange(pct)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              discountPct === pct
                ? 'bg-primary-light text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {pct === 0 ? 'Aucune' : `${pct}%`}
          </button>
        ))}
      </div>
    </div>
  )
}
