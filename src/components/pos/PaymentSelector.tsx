import React from 'react'
import { Banknote, Smartphone, CreditCard, Wallet } from 'lucide-react'
import type { MoyenPaiement } from '@/types/api'

interface PaymentSelectorProps {
  value: MoyenPaiement
  onChange: (method: MoyenPaiement) => void
}

const PAYMENT_METHODS: Array<{ id: MoyenPaiement; label: string; icon: React.ElementType; color: string }> = [
  { id: 'ESPECES', label: 'Espèces', icon: Banknote, color: 'text-emerald-600' },
  { id: 'WAVE', label: 'Wave', icon: Smartphone, color: 'text-sky-500' },
  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: Smartphone, color: 'text-amber-500' },
  { id: 'VIREMENT', label: 'Virement / CB', icon: CreditCard, color: 'text-indigo-600' },
  { id: 'AUTRE', label: 'Autre / Crédit', icon: Wallet, color: 'text-slate-600' },
]

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-700 block">Mode de règlement</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PAYMENT_METHODS.map((m) => {
          const Icon = m.icon
          const isSelected = value === m.id

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary text-white shadow-xs font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : m.color}`} />
              <span className="text-xs">{m.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
