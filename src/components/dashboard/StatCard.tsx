import { Card, CardContent } from '@/components/ui/card'
import { ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  valeur: string
  subtext?: string
  icon: LucideIcon
  colorBg: string
  colorText: string
  trend?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  valeur,
  subtext,
  icon: Icon,
  colorBg,
  colorText,
  trend,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      }`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <div className={`w-9 h-9 rounded-xl ${colorBg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${colorText}`} />
          </div>
        </div>

        <div className="font-display font-bold text-slate-900 text-xl sm:text-2xl tracking-tight">
          {valeur}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">{subtext}</span>
          {trend && (
            <span className="flex items-center gap-0.5 text-success font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
