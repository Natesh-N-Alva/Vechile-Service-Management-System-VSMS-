'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { drivingHabitsData } from '@/lib/dummy-data';
import { AlertCircle } from 'lucide-react';

export function DrivingHabitInference() {
  const colors = ['#14b8a6', '#06b6d4', '#0891b2'];

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Driving Habit Analysis</h3>
        <p className="text-sm text-muted-foreground">Understand your driving patterns and vehicle impact.</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={drivingHabitsData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="percentage"
          >
            {colors.map((color, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-3 pt-6 border-t border-border">
        <p className="text-sm font-medium text-foreground">Driving Pattern Breakdown</p>
        {drivingHabitsData.map((habit) => (
          <div key={habit.habit} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm text-foreground">{habit.habit}</span>
            <span className="text-sm font-semibold text-accent">{habit.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Recommendation</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Your high city driving (65%) suggests more frequent brake maintenance. Schedule an inspection every 3 months.
          </p>
        </div>
      </div>
    </div>
  );
}
