"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddVehicleForm } from '@/components/forms/add-vehicle-form';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchVehicles = async () => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:5000/api/vehicles');
      const data = await response.json();
      if (!data.error) {
        setVehicles(data);
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchVehicles();
  }, [router]);

  const totalMileage = vehicles.reduce((acc, v) => acc + (Number(v.Mileage) || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh] text-accent animate-pulse">
          Loading Fleet...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Vehicles</h1>
          <p className="text-muted-foreground">Manage and monitor your real-time vehicle fleet.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-accent hover:bg-accent/90 text-primary gap-2">
          <Plus size={18} />
          Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Vehicles</p>
          <p className="text-3xl font-bold text-foreground">{vehicles.length}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">Fleet Mileage</p>
          <p className="text-3xl font-bold text-foreground">
            {totalMileage.toLocaleString()} km
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full text-center p-12 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
            No vehicles registered in your account yet.
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.Vehicle_ID} vehicle={vehicle} />
          ))
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register New Vehicle</DialogTitle></DialogHeader>
          {/* Drop in the modular form here. It will automatically hide the User_ID field because this user is not an Admin! */}
          <AddVehicleForm 
            onSuccess={() => {
              setIsDialogOpen(false);
              fetchVehicles(); // Refresh the grid automatically on success
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}