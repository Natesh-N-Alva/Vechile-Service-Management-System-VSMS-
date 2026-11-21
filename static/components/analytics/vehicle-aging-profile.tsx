'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { vehicleHealthData } from '@/lib/dummy-data';
import { TrendingUp } from 'lucide-react';

export function VehicleAgingProfile() {
  const currentHealth = vehicleHealthData[vehicleHealthData.length - 1]?.health || 0;
  const startingHealth = vehicleHealthData[0]?.health || 0;
  const healthImprovement = currentHealth - startingHealth;

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Vehicle Aging Profile</h3>
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 dark:text-green-400 text-xs font-medium">
            Improving
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Monitor vehicle health score trends and maintenance impact.</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={vehicleHealthData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <ReferenceLine y={80} stroke="var(--accent)" strokeDasharray="5 5" label="Target Health" />
          <Line
            type="monotone"
            dataKey="health"
            stroke="var(--chart-4)"
            strokeWidth={3}
            dot={{ fill: 'var(--chart-4)', r: 4 }}
            activeDot={{ r: 6 }}
            name="Vehicle Health %"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current Health</p>
          <p className="text-2xl font-bold text-accent">{currentHealth}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Starting Health</p>
          <p className="text-2xl font-bold text-foreground">{startingHealth}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Improvement</p>
          <p className="text-2xl font-bold text-green-500 dark:text-green-400 flex items-center gap-1">
            +{healthImprovement}%
            <TrendingUp size={18} />
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">✓ Excellent Progress</p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          Your proactive maintenance has improved the vehicle health by {healthImprovement}% over the past year. Continue regular servicing to maintain this trajectory.
        </p>
      </div>
    </div>
  );
}
