'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { CalendarRange, Clock, CheckCircle2, XCircle, Hash, MapPin } from 'lucide-react';

export default function UserSchedulePage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  
  // ADDED: Service_Centre with 'Udupi' as default
  const [formData, setFormData] = useState({ 
    Vehicle_ID: '', Requested_Date: '', Service_Type: 'Maintenance', User_Notes: '', Service_Centre: 'Udupi'
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      const vRes = await fetchWithAuth('http://127.0.0.1:5000/api/vehicles');
      setVehicles(await vRes.json());
      const tRes = await fetchWithAuth('http://127.0.0.1:5000/api/tokens');
      setTokens(await tRes.json());
    } catch (err) { console.error("Failed to fetch data"); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/tokens', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormData({ Vehicle_ID: '', Requested_Date: '', Service_Type: 'Maintenance', User_Notes: '', Service_Centre: 'Udupi' });
        loadData(); 
      } else {
        setError(data.error);
      }
    } catch (err) { setError("Connection failed."); } 
    finally { setIsLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Book a Service</h1>
        <p className="text-muted-foreground">Request a maintenance slot and describe your issue.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="p-6 bg-card border border-border rounded-xl space-y-4 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <CalendarRange size={24} />
              <h2 className="text-xl font-bold text-foreground">New Request</h2>
            </div>
            
            {error && <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Select Vehicle</label>
              <select required value={formData.Vehicle_ID} onChange={(e) => setFormData({...formData, Vehicle_ID: e.target.value})} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none">
                <option value="" disabled>Choose...</option>
                {vehicles.map(v => <option key={v.Vehicle_ID} value={v.Vehicle_ID}>{v.Registration_Number} - {v.Brand}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Service Centre</label>
              <select required value={formData.Service_Centre} onChange={(e) => setFormData({...formData, Service_Centre: e.target.value})} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none">
                <option value="Udupi">Udupi (Main Branch)</option>
                <option value="Mangaluru">Mangaluru</option>
                <option value="Manipal">Manipal</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Preferred Date</label>
                <input required type="date" min={today} value={formData.Requested_Date} onChange={(e) => setFormData({...formData, Requested_Date: e.target.value})} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none [&::-webkit-calendar-picker-indicator]:dark:invert" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1">Service Type</label>
                <select value={formData.Service_Type} onChange={(e) => setFormData({...formData, Service_Type: e.target.value})} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none">
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1">Additional Notes</label>
              <textarea placeholder="e.g., Squeaking noise..." value={formData.User_Notes} onChange={(e) => setFormData({...formData, User_Notes: e.target.value})} className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none min-h-[80px] resize-none"/>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-accent text-primary font-bold mt-4">
              {isLoading ? 'Sending...' : 'Request Slot'}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="p-6 bg-card border border-border rounded-xl shadow-sm h-full">
            <h2 className="text-xl font-bold text-foreground mb-6">My Service Tokens</h2>
            
            <div className="space-y-4">
              {tokens.map(t => (
                <div key={t.Token_ID} className="p-5 border border-border/50 bg-muted/20 rounded-lg flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden">
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.Status === 'Approved' ? 'bg-green-500' : t.Status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />

                  <div className="space-y-2 flex-1 pl-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-black text-primary bg-accent px-2 py-0.5 rounded">
                        <Hash size={12}/> TKN-{t.Token_ID.toString().padStart(4, '0')}
                      </span>
                      <span className="text-sm font-medium text-accent border border-accent/20 px-2 rounded-full">{t.Service_Type}</span>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0 bg-background border border-border px-2 py-0.5 rounded-full"><MapPin size={12} className="text-accent"/> {t.Service_Centre}</span>
                    </div>

                    <p className="font-bold text-foreground text-lg pt-1">{t.Registration_Number} <span className="text-sm font-normal text-muted-foreground">({t.Brand})</span></p>
                    
                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-sm pt-2">
                      <p><span className="text-muted-foreground">Date:</span> {new Date(t.Requested_Date).toLocaleDateString()}</p>
                      {t.Assigned_Time && <p><span className="text-muted-foreground">Time Slot:</span> <strong className="text-foreground">{t.Assigned_Time}</strong></p>}
                    </div>

                    {t.Admin_Message && <p className="text-sm text-foreground mt-3 bg-card border border-border px-3 py-2 rounded-lg"><strong className="text-accent">Garage Note:</strong> {t.Admin_Message}</p>}
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1
                      ${t.Status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 
                        t.Status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.Status === 'Pending' ? <Clock size={12}/> : t.Status === 'Approved' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      {t.Status}
                    </span>
                  </div>
                </div>
              ))}

              {tokens.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">You have no active service requests.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}