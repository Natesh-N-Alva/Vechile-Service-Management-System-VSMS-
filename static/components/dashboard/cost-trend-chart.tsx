'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function CostTrendChart({ data }: { data: any[] }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Maintenance Cost Trend</h3>
        <p className="text-sm text-muted-foreground">Monthly spending over the last 12 months</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {/* Replaced costTrendData with the 'data' prop */}
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
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
          <Line
            type="monotone"
            dataKey="cost"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ fill: 'var(--chart-1)', r: 4 }}
            activeDot={{ r: 6 }}
            name="Maintenance Cost (₹)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}