import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardTopProductsProps {
  data: { nom: string; ventes: number }[];
}

export const DashboardTopProducts: React.FC<DashboardTopProductsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-display font-bold text-gray-900 text-base">Top Produits</div>
          <div className="text-xs text-gray-400">Ventes en mètres / pièces ce mois</div>
        </div>
        <span className="text-xs text-gray-500 font-medium">Ce mois</span>
      </div>
      <div className="h-44 sm:h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="nom"
              type="category"
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false}
              tickLine={false}
              width={85}
            />
            <Tooltip
              formatter={(v: unknown) => [`${String(v)} unités vendues`, 'Volume']}
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="ventes" fill="#0F3D5E" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardTopProducts;
