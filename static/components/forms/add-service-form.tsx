'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { Wrench, Plus, Trash2, Activity } from 'lucide-react';

interface AddServiceFormProps {
  initialData?: any;
  isEditing?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddServiceForm({ initialData, isEditing = false, onSuccess, onCancel }: AddServiceFormProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [catalogParts, setCatalogParts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
    Service_ID: initialData?.Service_ID || '',
    Vehicle_ID: initialData?.Vehicle_ID || '', 
    Service_Date: initialData?.Service_Date ? new Date(initialData.Service_Date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
    Service_Type: initialData?.Service_Type || 'Maintenance', 
    Service_Center: initialData?.Service_Center || '', 
    Odometer_Reading: initialData?.Odometer_Reading || '',
    Total_Cost: initialData?.Total_Cost || '',
    Condition_Status: 'Excellent',
    parts: [] as { Part_ID: string, Quantity: number, Part_Cost: string }[]
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const vRes = await fetchWithAuth('/api/vehicles');
        setVehicles(await vRes.json());
        const pRes = await fetchWithAuth('/api/parts');
        setCatalogParts(await pRes.json());
      } catch (err) { console.error("Fetch failed"); }
    };
    if (!isEditing) loadData(); 
  }, [isEditing]);

  const addPartRow = () => setFormData({ ...formData, parts: [...formData.parts, { Part_ID: '', Quantity: 1, Part_Cost: '' }]});
  const updatePart = (index: number, field: string, value: string | number) => {
    const newParts = [...formData.parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setFormData({ ...formData, parts: newParts });
  };
  const removePart = (index: number) => setFormData({ ...formData, parts: formData.parts.filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Vehicle_ID && !isEditing) return setError('Select a vehicle.');
    
    setIsLoading(true);
    const safePayload = {
      ...formData,
      Vehicle_ID: parseInt(formData.Vehicle_ID as string) || 0,
      Odometer_Reading: parseInt(formData.Odometer_Reading as string) || 0,
      Total_Cost: parseFloat(formData.Total_Cost as string) || 0,
      parts: formData.parts.filter(p => p.Part_ID !== '') 
    };

    try {
      const res = await fetchWithAuth('/api/services', {
        method: isEditing ? 'PUT' : 'POST', 
        body: JSON.stringify(safePayload)
      });
      if (res.ok) onSuccess();
      else setError((await res.json()).error);
    } catch (err) { setError('Connection failed.'); } 
    finally { setIsLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}

      {!isEditing && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Target Vehicle</label>
          <select value={formData.Vehicle_ID} onChange={(e) => setFormData({ ...formData, Vehicle_ID: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none" required>
            <option value="" disabled>Select target vehicle...</option>
            {vehicles.map((v) => <option key={v.Vehicle_ID} value={v.Vehicle_ID}>{v.Registration_Number} — {v.Brand}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Service Date</label>
          <input type="date" value={formData.Service_Date} onChange={(e) => setFormData({ ...formData, Service_Date: e.target.value })} disabled={isEditing} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:dark:invert" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Service Type</label>
          <select value={formData.Service_Type} onChange={(e) => setFormData({ ...formData, Service_Type: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none">
            <option value="Maintenance">Maintenance</option>
            <option value="Repair">Repair</option>
            <option value="Inspection">Inspection</option>
            <option value="Cleaning">Cleaning</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground ml-1">Service Center / Garage Name</label>
        <input type="text" placeholder="Service Center Name" value={formData.Service_Center} onChange={(e) => setFormData({ ...formData, Service_Center: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none" required />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Odometer (km)</label>
          <input type="number" placeholder="Odometer (km)" value={formData.Odometer_Reading} onChange={(e) => setFormData({ ...formData, Odometer_Reading: e.target.value })} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Grand Total Cost (₹)</label>
          <input type="number" step="0.01" placeholder="Total Cost (₹)" value={formData.Total_Cost} onChange={(e) => setFormData({ ...formData, Total_Cost: e.target.value })} className="w-full px-3 py-2 bg-muted border border-accent/50 rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="p-3 mt-2 bg-accent/5 border border-accent/20 rounded-lg space-y-1">
            <label className="text-xs font-bold text-accent ml-1 uppercase flex items-center gap-1"><Activity size={14} /> Update Post-Service Vehicle Health</label>
            <select value={formData.Condition_Status} onChange={(e) => setFormData({ ...formData, Condition_Status: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none">
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Parts Replaced</p>
              <Button type="button" variant="outline" size="sm" onClick={addPartRow} className="h-8 gap-1"><Plus size={14}/> Add Part</Button>
            </div>
            <div className="space-y-3">
              {formData.parts.map((part, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <select value={part.Part_ID} onChange={(e) => updatePart(index, 'Part_ID', e.target.value)} className="flex-1 px-3 py-2 text-sm bg-muted border border-border rounded-lg outline-none">
                    <option value="" disabled>Select Part...</option>
                    {catalogParts.map(p => <option key={p.Part_ID} value={p.Part_ID}>{p.Part_Name}</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={part.Quantity} onChange={(e) => updatePart(index, 'Quantity', parseInt(e.target.value))} className="w-20 px-3 py-2 text-sm bg-muted border border-border rounded-lg outline-none" />
                  <input type="number" step="0.01" placeholder="Cost (₹)" value={part.Part_Cost} onChange={(e) => updatePart(index, 'Part_Cost', e.target.value)} className="w-24 px-3 py-2 text-sm bg-muted border border-border rounded-lg outline-none" />
                  <Button type="button" variant="ghost" onClick={() => removePart(index)} className="px-2 text-red-500"><Trash2 size={16}/></Button>
                </div>
              ))}
              {formData.parts.length === 0 && <p className="text-xs text-muted-foreground italic">No parts replaced during this service.</p>}
            </div>
          </div>
        </>
      )}

      {isEditing && (
        <p className="text-xs text-muted-foreground italic text-center py-2 bg-muted rounded-lg border border-border">Note: To modify attached parts or assigned vehicles, please delete and re-log the service.</p>
      )}

      <div className="flex justify-end pt-4 gap-2 border-t border-border mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-accent text-primary gap-2" disabled={isLoading}><Wrench size={16} />{isLoading ? 'Saving...' : isEditing ? 'Update Service' : 'Log Record'}</Button>
      </div>
    </form>
  );
}