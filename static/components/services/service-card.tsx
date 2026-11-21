'use client';

import { Calendar, Gauge, Wrench, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonGlow } from '@/components/common/neon-glow';

interface ServiceCardProps {
  service: any; 
  vehicleInfo?: string;
}

const serviceTypeColors: Record<string, { bg: string; text: string }> = {
  maintenance: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  repair: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  inspection: { bg: 'bg-green-500/10', text: 'text-green-500' },
  cleaning: { bg: 'bg-cyan-500/10', text: 'text-cyan-500' },
  default: { bg: 'bg-accent/10', text: 'text-accent' }
};

export function ServiceCard({ service, vehicleInfo }: ServiceCardProps) {
  const typeKey = (service.Service_Type || 'maintenance').toLowerCase();
  const colors = serviceTypeColors[typeKey] || serviceTypeColors.default;

  return (
    <NeonGlow color="cyan" intensity="low" pulse={true}>
      <div className={cn('p-5 rounded-lg border border-border hover:border-accent/50 transition-all duration-300', colors.bg)}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className={cn('text-xs font-semibold uppercase tracking-wide', colors.text)}>
                {service.Service_Type}
              </p>
              <h4 className="text-sm font-semibold text-foreground mt-1">{service.Service_Center}</h4>
              {vehicleInfo && <p className="text-xs text-muted-foreground mt-1">{vehicleInfo}</p>}
            </div>
            <p className="text-lg font-bold text-foreground">₹{service.Total_Cost.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={14} />
              {new Date(service.Service_Date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge size={14} />
              {(service.Odometer_Reading || 0).toLocaleString()} km
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wrench size={14} />
              ID: {service.Service_ID}
            </div>
          </div>

          {/* ITEMZIED PARTS SECTION */}
          {service.parts && service.parts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                <Settings size={12} className="text-accent"/> Parts Replaced
              </p>
              <div className="space-y-2">
                {service.parts.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-medium">{p.Quantity}x</span> {p.Part_Name}
                    </span>
                    <span className="font-mono text-muted-foreground">₹{(p.Part_Cost * p.Quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </NeonGlow>
  );
}