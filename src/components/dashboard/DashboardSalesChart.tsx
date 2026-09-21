import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatMontant } from '../../data/mock';

interface DashboardSalesChartProps {
  data: { jour: string; montant: number }[];
}

export const DashboardSalesChart: React.FC<DashboardSalesChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-bold text-gray-900 text-base">
            Évolution des ventes
          </div>
          <div className="text-xs text-gray-400">7 derniers jours (FCFA)</div>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          Cette semaine
        </div>
      </div>
      <div className="h-48 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="jour" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              formatter={(v: unknown) => [
                formatMontant(typeof v === 'number' ? v : Number(v) || 0),
                'Ventes',
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="montant"
              stroke="#1E88E5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMontant)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardSalesChart;
