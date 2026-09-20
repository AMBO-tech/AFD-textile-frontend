import React from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';

const PIE_DATA = [
  { name: 'Wax', value: 38, color: '#1E88E5' },
  { name: 'Bazin', value: 24, color: '#0F3D5E' },
  { name: 'Ankara', value: 18, color: '#22C55E' },
  { name: 'Satin', value: 12, color: '#F59E0B' },
  { name: 'Autres', value: 8, color: '#9ca3af' },
];

export const RapportsCategoryPieChart: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="font-display font-semibold text-gray-800 text-sm mb-4">
        Répartition par catégorie
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={PIE_DATA}
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={35}
            dataKey="value"
            stroke="none"
          >
            {PIE_DATA.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => (
              <span style={{ fontSize: 11, color: '#6b7280' }}>{v}</span>
            )}
          />
          <Tooltip
            formatter={(v) => [Number(v) + '%', 'Part']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RapportsCategoryPieChart;
