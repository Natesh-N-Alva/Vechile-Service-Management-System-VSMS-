'use client';

import { cn } from '@/lib/utils';

interface PartReliabilityScoreProps {
  data?: any[];
}

export function PartReliabilityScore({ data = [] }: PartReliabilityScoreProps) {
  // Sort by reliability (using the capitalized 'reliability' from your SQL query)
  const sortedParts = [...data].sort((a, b) => b.reliability - a.reliability);

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Part Reliability Score</h3>
        <p className="text-sm text-muted-foreground">Live tracking based on your service records.</p>
      </div>

      <div className="space-y-4">
        {sortedParts.length > 0 ? (
          sortedParts.map((part) => {
            const rel = part.reliability || 0;
            const statusColor = rel >= 90 ? 'text-green-500' : rel >= 75 ? 'text-yellow-500' : 'text-red-500';
            const bgColor = rel >= 90 ? 'bg-green-500/10' : rel >= 75 ? 'bg-yellow-500/10' : 'bg-red-500/10';

            return (
              <div key={part.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{part.name}</span>
                  <span className={cn('text-sm font-bold', statusColor)}>
                    {rel}%
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', bgColor)}
                    style={{ width: `${rel}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Replaced {part.replacements} times across fleet
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground italic text-center py-10">No parts data available.</p>
        )}
      </div>
    </div>
  );
}