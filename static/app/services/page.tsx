"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ServiceCard } from '@/components/services/service-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

export default function ServicesPage() {
  const router = useRouter();
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const loadServices = async () => {
      try {
        const response = await fetchWithAuth('http://127.0.0.1:5000/api/services');
        const data = await response.json();
        
        if (!data.error && Array.isArray(data)) {
          // Sort by date descending (latest first)
          const sorted = data.sort((a, b) => 
            new Date(b.Service_Date).getTime() - new Date(a.Service_Date).getTime()
          );
          setAllServices(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [router]);

  const totalCost = allServices.reduce((sum, s) => sum + (Number(s.Total_Cost) || 0), 0);
  const avgCost = allServices.length > 0 ? totalCost / allServices.length : 0;

  if (loading) return <div className="p-10 text-center animate-pulse">Fetching service records...</div>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Service History</h1>
          <p className="text-muted-foreground">Complete maintenance and repair records for all vehicles.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-primary gap-2">
          <Plus size={18} />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Services</p>
          <p className="text-3xl font-bold text-foreground">{allServices.length}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Spending</p>
          <p className="text-3xl font-bold text-accent">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Average Cost</p>
          <p className="text-3xl font-bold text-foreground">₹{Math.round(avgCost).toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-muted-foreground mb-2">Latest Service</p>
          <p className="text-3xl font-bold text-foreground">
            {allServices.length > 0 ? new Date(allServices[0].Service_Date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-semibold text-foreground">Service Timeline</h2>
          <span className="text-xs font-medium bg-accent/10 text-accent px-2 py-1 rounded-full">
            {allServices.length} records
          </span>
        </div>

        {allServices.length > 0 ? (
          <div className="space-y-3">
            {allServices.map((service) => (
              <ServiceCard
                key={service.Service_ID}
                service={service}
                // Note: Make sure your Flask JOIN includes Brand/Model if you want vehicleInfo
                vehicleInfo={`${service.Brand || ''} ${service.Model || 'Vehicle'}`}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-card border border-border">
            <p className="text-muted-foreground">No services recorded in the database yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}