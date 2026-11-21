'use client';

import { Gauge, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeonGlow } from '@/components/common/neon-glow';

// Updated interface to match your MariaDB columns
interface VehicleCardProps {
  vehicle: {
    Vehicle_ID: number;
    User_ID: number;
    Registration_Number: string;
    Brand: string;
    Model: string;
    Purchase_Date: string;
    Fuel_Type: string;
    Condition_Status?: string; // From our ALTER TABLE earlier
    Mileage?: number;          // Ensure this is in your SELECT query
  };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  // Logic for health/condition based on the new Condition_Status column
  const condition = vehicle.Condition_Status || 'Excellent';
  const healthColor = 
    condition === 'Excellent' ? 'text-green-500' : 
    condition === 'Good' ? 'text-yellow-500' : 
    'text-red-500';

  return (
    <NeonGlow color="teal" intensity="medium" pulse={true}>
      <div className="p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-300 group cursor-pointer h-full">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-accent uppercase tracking-wide">
                {vehicle.Fuel_Type}
              </p>
              <h3 className="text-xl font-semibold text-foreground mt-1">
                {/* Extracting year from Purchase_Date string */}
                {new Date(vehicle.Purchase_Date).getFullYear()} {vehicle.Brand} {vehicle.Model}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono uppercase">
                {vehicle.Registration_Number}
              </p>
            </div>
            <div className={cn('text-sm font-bold px-2 py-1 rounded bg-background border border-border', healthColor)}>
              {condition}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
            <div className="text-center border-r border-border">
              <p className="text-xs text-muted-foreground mb-1">Mileage</p>
              <p className="font-semibold text-foreground flex items-center justify-center gap-1">
                <Gauge size={14} className="text-accent" />
                {(vehicle.Mileage || 0).toLocaleString()} km
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Purchased</p>
              <p className="font-semibold text-foreground flex items-center justify-center gap-1">
                <Calendar size={14} className="text-accent" />
                {new Date(vehicle.Purchase_Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* ID Indicator */}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase">Internal ID: {vehicle.Vehicle_ID}</p>
            <div className="text-[10px] py-0.5 px-2 rounded-full bg-accent/10 text-accent border border-accent/20">
              Active
            </div>
          </div>
        </div>
      </div>
    </NeonGlow>
  );
}