'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/api';
import { CheckCircle2, XCircle, Clock, Info, Hash, MapPin } from 'lucide-react';

export default function AdminSchedulePage() {
  const [tokens, setTokens] = useState<any[]>([]);
  
  // Interactive Approval State
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [assignTime, setAssignTime] = useState('10:00');
  const [adminMsg, setAdminMsg] = useState('');

  const fetchTokens = async () => {
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/tokens');
      const data = await res.json();
      if (!data.error) setTokens(data);
    } catch (err) { console.error("Failed to fetch tokens"); }
  };

  useEffect(() => { fetchTokens(); }, []);

  const submitUpdate = async (tokenId: number, newStatus: string) => {
    try {
      const res = await fetchWithAuth('http://127.0.0.1:5000/api/tokens', {
        method: 'PUT',
        body: JSON.stringify({ 
          Token_ID: tokenId, 
          Status: newStatus, 
          Admin_Message: newStatus === 'Rejected' ? 'We cannot accommodate this date.' : adminMsg,
          Assigned_Time: newStatus === 'Approved' ? assignTime : null
        })
      });
      if (res.ok) {
        setApprovingId(null);
        setAdminMsg('');
        fetchTokens();
      }
    } catch (err) { alert("Failed to update token."); }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Service Requests</h1>
        <p className="text-muted-foreground">Assign timings and approve customer booking requests.</p>
      </div>

      <div className="space-y-4">
        {tokens.map((t) => (
          <div key={t.Token_ID} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start gap-6">
            
            <div className="space-y-2 flex-1 w-full">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-sm font-black text-foreground bg-muted px-2 py-1 rounded">
                  <Hash size={14} className="text-accent"/> TKN-{t.Token_ID.toString().padStart(4, '0')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1
                  ${t.Status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 
                    t.Status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {t.Status === 'Pending' ? <Clock size={12}/> : t.Status === 'Approved' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                  {t.Status}
                </span>
                <span className="text-sm font-bold text-foreground ml-auto md:ml-0">{new Date(t.Requested_Date).toLocaleDateString()}</span>
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 ml-4 border border-border px-2 py-0.5 rounded-full">
                 <MapPin size={12} className="text-accent"/> {t.Service_Centre}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-semibold text-sm">{t.Owner_Name}</p>
                  <p className="text-xs text-muted-foreground">{t.Owner_Phone || 'No Phone'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="font-semibold text-sm">{t.Registration_Number}</p>
                  <p className="text-xs text-muted-foreground">{t.Brand}</p>
                </div>
              </div>

              <div className="pt-2 bg-muted/30 p-3 rounded-lg mt-2">
                <p className="text-sm font-bold text-accent flex items-center gap-1"><Info size={14}/> {t.Service_Type}</p>
                {t.User_Notes && <p className="text-sm text-foreground mt-1 italic">"{t.User_Notes}"</p>}
              </div>

              {/* DYNAMIC APPROVAL FORM */}
              {approvingId === t.Token_ID && (
                <div className="mt-4 p-4 border border-accent/30 bg-accent/5 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold">Assign Time</label>
                      <input type="time" required value={assignTime} onChange={(e) => setAssignTime(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-xs font-bold">Message / Instructions to User</label>
                      <input type="text" placeholder="e.g. Ask for John when you arrive." value={adminMsg} onChange={(e) => setAdminMsg(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-accent text-primary" onClick={() => submitUpdate(t.Token_ID, 'Approved')}>Confirm Approval</Button>
                    <Button size="sm" variant="ghost" onClick={() => setApprovingId(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row md:flex-col gap-2 w-full md:w-40 shrink-0">
              {t.Status === 'Pending' && approvingId !== t.Token_ID && (
                <>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => setApprovingId(t.Token_ID)}>Approve Slot</Button>
                  <Button className="flex-1" variant="destructive" onClick={() => submitUpdate(t.Token_ID, 'Rejected')}>Reject</Button>
                </>
              )}
              {t.Status === 'Approved' && (
                <div className="w-full text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                  <span className="block text-xs text-muted-foreground uppercase mb-1">Time Assigned</span>
                  <span className="font-black text-green-500 text-lg">{t.Assigned_Time}</span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}