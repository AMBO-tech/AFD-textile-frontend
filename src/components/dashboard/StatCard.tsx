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
      className={`rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all font-inter p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${colorBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${colorText}`} />
        </div>
      </div>

      <div className="font-poppins font-bold text-[#0F3D5E] text-2xl tracking-tight">
        {valeur}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
        <span className="text-gray-500 font-medium">{subtext}</span>
        {trend && (
          <span className="flex items-center gap-0.5 text-success font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {trend}
          </span>
        )}
      </div>
    </Card>
  )
}
