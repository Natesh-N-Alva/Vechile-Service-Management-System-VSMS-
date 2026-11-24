'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AddServiceForm } from '@/components/forms/add-service-form';

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const fetchServices = async () => {
    try {
      const sRes = await fetchWithAuth('/api/services');
      const data = await sRes.json();
      if (!data.error) {
        const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.Service_Date).getTime() - new Date(a.Service_Date).getTime()) : [];
        setServices(sorted);
      }
    } catch (err) { console.error("Failed to fetch services"); }
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role !== 'Admin') { router.push('/dashboard'); return; }
    fetchServices();
  }, [router]);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  const openEditModal = (service: any) => {
    setIsEditing(true);
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm("Delete this service record? This will also delete any associated replaced parts.")) return;
    try {
      const res = await fetchWithAuth('/api/services', {
        method: 'DELETE', body: JSON.stringify({ Service_ID: serviceId })
      });
      if (res.ok) fetchServices(); 
      else alert(`Failed to delete`);
    } catch (err) { alert("Error connecting to server."); }
  };

  const filteredServices = services.filter((s) => 
    s.Service_Center?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.Service_Type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Manage Services</h1>
          <p className="text-muted-foreground">Add and track maintenance logs.</p>
        </div>
        <Button onClick={openAddModal} className="bg-accent hover:bg-accent/90 text-primary gap-2">
          <Plus size={18} /> Add Service
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder="Search services by center or type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Center/Desc</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Odometer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Cost</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredServices.map((s) => (
              <tr key={s.Service_ID} className="hover:bg-muted/30">
                <td className="px-6 py-4 text-sm">{new Date(s.Service_Date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">{s.Vehicle_ID}</td>
                <td className="px-6 py-4 text-sm font-medium text-accent">{s.Service_Type}</td>
                <td className="px-6 py-4 text-sm">{s.Service_Center}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{s.Odometer_Reading?.toLocaleString()} km</td>
                <td className="px-6 py-4 text-sm font-bold">₹{s.Total_Cost}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(s)} className="text-blue-500"><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.Service_ID)} className="text-red-600"><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service Record' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <AddServiceForm 
            key={selectedService ? selectedService.Service_ID : 'new'}
            isEditing={isEditing}
            initialData={selectedService}
            onSuccess={() => { setIsDialogOpen(false); fetchServices(); }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}