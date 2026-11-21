import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 neon-pulse',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-accent" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% {trend.isPositive ? 'increase' : 'decrease'}
          </p>
        </div>
      )}
    </div>
  );
}
