'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface CostLeakAnalyzerProps {
  data?: any[];
}

export function CostLeakAnalyzer({ data = [] }: CostLeakAnalyzerProps) {
  const avgCost = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + (Number(d.cost) || 0), 0) / data.length) 
    : 0;
  
  const highestCost = data.length > 0 ? Math.max(...data.map(d => Number(d.cost) || 0)) : 0;
  const leakRate = avgCost > 0 ? Math.round(((highestCost - avgCost) / avgCost) * 100) : 0;

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Cost Trend Analyzer</h3>
          <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
            Live Data
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Monthly maintenance spending patterns.</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#888888" fontSize={12} />
          <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `₹${value}`} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
          <Area type="monotone" dataKey="cost" stroke="#14b8a6" fillOpacity={1} fill="url(#colorCost)" />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Average Monthly Cost</p>
          <p className="text-2xl font-bold text-accent">₹{avgCost.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Peak Anomaly</p>
          <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
            {leakRate}% <AlertTriangle size={18} />
          </p>
        </div>
      </div>
    </div>
  );
}