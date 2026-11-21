'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell, // Imported Cell to use dynamic colors
} from 'recharts';

export function ServiceFrequencyChart({ data }: { data: any[] }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Service Type Distribution</h3>
        <p className="text-sm text-muted-foreground">Breakdown of service types performed</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {/* Replaced serviceFrequencyData with the 'data' prop */}
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="type" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <Legend />
          <Bar dataKey="count" name="Number of Services" radius={[8, 8, 0, 0]}>
            {/* Maps over our data to apply the specific colors calculated in page.tsx */}
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || 'var(--chart-1)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}