'use client';

import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Accept alerts as a prop, default to an empty array
export function AlertsPanel({ alerts = [] }: { alerts?: any[] }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">Important notifications and updates</p>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
           <div className="p-4 rounded-lg border border-border bg-background text-center text-muted-foreground">
             <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
             <p>All systems operational. No new alerts.</p>
           </div>
        ) : (
          alerts.map((alert) => {
            const Icon = alert.type === 'warning' ? AlertCircle : alert.type === 'success' ? CheckCircle : Info;
            const bgColor = alert.type === 'warning' ? 'bg-orange-500/10' : alert.type === 'success' ? 'bg-green-500/10' : 'bg-blue-500/10';
            const borderColor = alert.type === 'warning' ? 'border-orange-500/30' : alert.type === 'success' ? 'border-green-500/30' : 'border-blue-500/30';
            const iconColor = alert.type === 'warning' ? 'text-orange-500 dark:text-orange-400' : alert.type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-blue-500 dark:text-blue-400';

            return (
              <div key={alert.id} className={cn('p-4 rounded-lg border flex gap-3 items-start', bgColor, borderColor)}>
                <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}