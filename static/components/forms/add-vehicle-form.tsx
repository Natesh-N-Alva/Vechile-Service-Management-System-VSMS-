'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { CarFront } from 'lucide-react';

interface AddVehicleFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddVehicleForm({ initialData, isEditing = false, onSuccess, onCancel }: AddVehicleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [userRole, setUserRole] = useState('User');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role) setUserRole(user.Role);
  }, []);
  
  // Pre-fill the form if we are editing an existing vehicle
  const [formData, setFormData] = useState({
    Vehicle_ID: initialData?.Vehicle_ID || '',
    User_ID: initialData?.User_ID || '', 
    Registration_Number: initialData?.Registration_Number || '',
    Brand: initialData?.Brand || '',
    Model: initialData?.Model || '',
    Purchase_Date: initialData?.Purchase_Date ? new Date(initialData.Purchase_Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    Fuel_Type: initialData?.Fuel_Type || 'Petrol',
    Mileage: initialData?.Mileage || '',
    Vehicle_Type: initialData?.Vehicle_Type || 'Car'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (userRole === 'Admin' && !isEditing && !formData.User_ID) {
      setError('Admins must specify an Owner User ID.');
      setIsLoading(false);
      return;
    }

    const safePayload = {
      ...formData,
      Mileage: parseInt(formData.Mileage as string) || 0
    };

    try {
      // Use PUT if editing, POST if adding new
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/vehicles', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(safePayload)
      });
      
      const data = await res.json();
      if (res.ok) onSuccess(); 
      else setError(data.error || 'Failed to save vehicle');
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}

      {/* Hide owner assignment during edits so it doesn't get accidentally changed */}
      {isMounted && userRole === 'Admin' && !isEditing && (
        <div className="space-y-1 mb-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
          <label className="text-xs font-bold text-accent ml-1 uppercase">Assign to Owner (User ID)</label>
          <input type="number" value={formData.User_ID} onChange={(e) => setFormData({ ...formData, User_ID: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Registration Number</label>
        <input type="text" value={formData.Registration_Number} onChange={(e) => setFormData({ ...formData, Registration_Number: e.target.value.toUpperCase() })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Brand</label>
          <input type="text" value={formData.Brand} onChange={(e) => setFormData({ ...formData, Brand: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Model</label>
          <input type="text" value={formData.Model} onChange={(e) => setFormData({ ...formData, Model: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Vehicle Type</label>
          <select value={formData.Vehicle_Type} onChange={(e) => setFormData({ ...formData, Vehicle_Type: e.target.value })} disabled={isEditing} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none disabled:opacity-50">
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Purchase Date</label>
          <input type="date" value={formData.Purchase_Date} onChange={(e) => setFormData({ ...formData, Purchase_Date: e.target.value })} disabled={isEditing} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:dark:invert" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Current Mileage (km)</label>
          <input type="number" value={formData.Mileage} onChange={(e) => setFormData({ ...formData, Mileage: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Fuel Type</label>
          <select value={formData.Fuel_Type} onChange={(e) => setFormData({ ...formData, Fuel_Type: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent">
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-2 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" className="bg-accent text-primary gap-2" disabled={isLoading}>
          <CarFront size={16} />{isLoading ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
}