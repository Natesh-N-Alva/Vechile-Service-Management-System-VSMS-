'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddVehicleForm } from '@/components/forms/add-vehicle-form';

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Edit States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const fetchVehicles = async () => {
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/vehicles');
      const data = await res.json();
      if (!data.error) setVehicles(data);
    } catch (err) {
      console.error("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role !== 'Admin') { router.push('/dashboard'); return; }
    fetchVehicles();
  }, [router]);

  // Open modal for a New vehicle
  const openAddModal = () => {
    setIsEditing(false);
    setSelectedVehicle(null);
    setIsDialogOpen(true);
  };

  // Open modal to Edit an existing vehicle
  const openEditModal = (vehicle: any) => {
    setIsEditing(true);
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const handleDelete = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle? This will also wipe its entire service history.")) return;
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/vehicles', {
        method: 'DELETE', body: JSON.stringify({ Vehicle_ID: vehicleId })
      });
      if (res.ok) fetchVehicles(); 
      else alert(`Failed to delete`);
    } catch (err) { alert("Error connecting to server."); }
  };

  const filteredVehicles = vehicles.filter((v) => 
    v.Brand?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.Registration_Number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Manage Vehicles</h1>
          <p className="text-muted-foreground">Assign and manage vehicles in the fleet.</p>
        </div>
        <Button onClick={openAddModal} className="bg-accent hover:bg-accent/90 text-primary gap-2">
          <Plus size={18} /> Add Vehicle
        </Button>
      </div>

      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search vehicles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Reg Number</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Brand/Model</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Owner ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fuel/Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredVehicles.map((v) => (
              <tr key={v.Vehicle_ID} className="hover:bg-muted/30">
                <td className="px-6 py-4 text-sm font-medium">{v.Registration_Number}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{v.Brand} {v.Model}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{v.User_ID}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{v.Fuel_Type} ({v.Vehicle_Type})</td>
                <td className="px-6 py-4 text-right">
                  {/* EDIT BUTTON WIRED UP HERE */}
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(v)} className="text-blue-500"><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(v.Vehicle_ID)} className="text-red-600"><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle></DialogHeader>
          <AddVehicleForm 
            key={selectedVehicle ? selectedVehicle.Vehicle_ID : 'new'} // Forces form to refresh with new data
            isEditing={isEditing}
            initialData={selectedVehicle}
            onSuccess={() => { setIsDialogOpen(false); fetchVehicles(); }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}