'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { IndianRupee, CalendarCheck, Users, CarFront, Settings, BarChart2, TrendingDown } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [role, setRole] = useState('User');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User Dashboard Toggles
  const [graphMode, setGraphMode] = useState<'cost' | 'count'>('cost');
  const [spendingView, setSpendingView] = useState<'all' | 'individual'>('all');
  const [graphVehicleId, setGraphVehicleId] = useState('all');

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (!user.Role) {
      router.push('/login');
      return;
    }
    setRole(user.Role);

    const fetchAnalytics = async () => {
      try {
        const res = await fetchWithAuth('/api/analytics');
        const data = await res.json();
        if (!data.error) setStats(data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  // ==========================================
  // BULLETPROOF CHRONOLOGICAL SORTING
  // ==========================================
  const processedGraphData = useMemo(() => {
    if (!stats?.monthly_data) return [];
    
    if (graphVehicleId === 'all') {
      const grouped = stats.monthly_data.reduce((acc: any, curr: any) => {
        // FORCE STRINGS TO INTEGERS FOR SAFE MATH
        const y = parseInt(curr.y, 10);
        const m = parseInt(curr.m, 10);
        const key = `${y}-${m}`;
        
        if (!acc[key]) {
          acc[key] = { 
            month_name: curr.month_name, 
            m: m, 
            y: y, 
            cost: 0, 
            service_count: 0 
          };
        }
        acc[key].cost += parseFloat(curr.cost || 0);
        acc[key].service_count += parseInt(curr.service_count || 0, 10);
        return acc;
      }, {});
      
      // STRICT SORT: Year first, then Month
      return Object.values(grouped).sort((a: any, b: any) => {
        if (a.y !== b.y) return a.y - b.y; 
        return a.m - b.m;                  
      });
      
    } else {
      return stats.monthly_data
        .filter((d: any) => d.Vehicle_ID.toString() === graphVehicleId)
        .map((d: any) => ({
          ...d,
          m: parseInt(d.m, 10),
          y: parseInt(d.y, 10),
          cost: parseFloat(d.cost || 0),
          service_count: parseInt(d.service_count || 0, 10)
        }))
        // STRICT SORT: Year first, then Month
        .sort((a: any, b: any) => {
          if (a.y !== b.y) return a.y - b.y;
          return a.m - b.m;
        });
    }
  }, [stats?.monthly_data, graphVehicleId]);

  // Calculate max values safely
  const maxGraphCost = Math.max(...(processedGraphData.map((d: any) => d.cost) || [1]), 1);
  const maxGraphCount = Math.max(...(processedGraphData.map((d: any) => d.service_count) || [1]), 1);

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh] text-accent animate-pulse">Loading Analytics...</div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // VIEW 1: ADMIN ANALYTICS
  // ==========================================
  if (role === 'Admin') {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">System Analytics</h1>
          <p className="text-muted-foreground">High-level overview of garage performance and revenue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/30 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><IndianRupee size={120} /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/20 rounded-lg text-accent"><IndianRupee size={24} /></div>
              <p className="font-semibold text-foreground">Platform Commission</p>
            </div>
            <p className="text-4xl font-bold text-accent mt-4">
              ₹{stats.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">10% cut of lifetime service revenue</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><CalendarCheck size={120} /></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CalendarCheck size={24} /></div>
              <p className="font-semibold text-foreground">Services Done This Month</p>
            </div>
            <p className="text-4xl font-bold text-foreground mt-4">{stats.monthly_services}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Registered Users</p>
              <p className="text-2xl font-bold text-foreground">{stats.total_users}</p>
            </div>
            <Users size={32} className="text-muted-foreground opacity-50" />
          </div>
          <div className="p-6 rounded-xl bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Fleet Vehicles</p>
              <p className="text-2xl font-bold text-foreground">{stats.total_vehicles}</p>
            </div>
            <CarFront size={32} className="text-muted-foreground opacity-50" />
          </div>
        </div>
        
        {stats.partReliabilityData && stats.partReliabilityData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-accent" size={20} />
              <h2 className="text-xl font-bold text-foreground">Most Frequently Replaced Parts</h2>
            </div>
            <div className="space-y-4">
              {stats.partReliabilityData.map((part: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div>
                    <p className="font-semibold text-foreground">{part.name}</p>
                    <p className="text-xs text-muted-foreground">Standard Life: {part.reliability.toLocaleString()} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{part.replacements}</p>
                    <p className="text-xs text-muted-foreground">Replacements</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ==========================================
  // VIEW 2: REGULAR USER ANALYTICS
  // ==========================================
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Analytics</h1>
        <p className="text-muted-foreground">Track your vehicle maintenance spending and service history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2 p-6 rounded-xl bg-card border border-border relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Maintenance Cost</p>
              <p className="text-3xl font-bold text-accent">
                ₹{spendingView === 'all' 
                  ? stats.total_revenue.toLocaleString() 
                  : <span className="text-xl">Select vehicle below</span>}
              </p>
            </div>
            <div className="flex bg-muted rounded-lg p-1">
              <button onClick={() => setSpendingView('all')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${spendingView === 'all' ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}>All Vehicles</button>
              <button onClick={() => setSpendingView('individual')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${spendingView === 'individual' ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}>Individual</button>
            </div>
          </div>

          {spendingView === 'individual' && (
            <div className="space-y-3 mt-4 border-t border-border pt-4">
              {stats.vehicle_breakdown?.map((v: any) => (
                <div key={v.Vehicle_ID} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{v.Registration_Number}</p>
                    <p className="text-xs text-muted-foreground">{v.Brand} {v.Model}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{v.total_spent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{v.service_count} services</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30">
          <div className="flex items-center gap-2 mb-4 text-blue-500">
            <Settings size={20} />
            <h3 className="font-semibold text-foreground">Parts Replaced</h3>
          </div>
          <p className="text-5xl font-black text-foreground mb-2">{stats.parts_count}</p>
          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total spent on parts</p>
            <p className="text-xl font-bold text-blue-500">₹{stats.parts_cost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {stats.cost_leaks && stats.cost_leaks.length > 0 && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20 mb-8">
          <div className="flex items-center gap-2 mb-6 text-red-500">
            <TrendingDown size={20} />
            <h2 className="text-lg font-bold text-foreground">Major Cost Leaks (Parts)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.cost_leaks.map((leak: any, i: number) => {
              const percentage = stats.parts_cost > 0 ? ((leak.total_spent / stats.parts_cost) * 100).toFixed(1) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-background/80 rounded-lg border border-red-500/10 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50"></div>
                  <div>
                    <span className="font-semibold block text-foreground">{leak.name}</span>
                    <span className="text-xs text-muted-foreground">{percentage}% of parts budget</span>
                  </div>
                  <span className="text-red-500 font-bold text-lg">₹{leak.total_spent.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- INTERACTIVE GRAPH SECTION --- */}
      <div className="p-6 rounded-xl bg-card border border-border mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <BarChart2 className="text-accent" />
            <h2 className="text-lg font-bold text-foreground">Service History Graph</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={graphVehicleId} 
              onChange={(e) => setGraphVehicleId(e.target.value)}
              className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent/50"
            >
              <option value="all">Compare All Vehicles</option>
              {stats.vehicle_breakdown?.map((v: any) => (
                <option key={v.Vehicle_ID} value={v.Vehicle_ID.toString()}>
                  {v.Registration_Number} ({v.Brand})
                </option>
              ))}
            </select>

            <div className="flex bg-muted rounded-lg p-1">
              <button onClick={() => setGraphMode('cost')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${graphMode === 'cost' ? 'bg-accent text-primary shadow' : 'text-muted-foreground hover:text-foreground'}`}>Money Spent</button>
              <button onClick={() => setGraphMode('count')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${graphMode === 'count' ? 'bg-accent text-primary shadow' : 'text-muted-foreground hover:text-foreground'}`}>Service Count</button>
            </div>
          </div>
        </div>

        {processedGraphData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm italic">
            No service history available to graph.
          </div>
        ) : (
          <div className="h-56 flex items-end gap-2 md:gap-6 pt-6">
            {processedGraphData.map((data: any, i: number) => {
              const value = graphMode === 'cost' ? data.cost : data.service_count;
              const max = graphMode === 'cost' ? maxGraphCost : maxGraphCount;
              const heightPercent = max > 0 ? (value / max) * 100 : 0;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative h-full">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                    {graphMode === 'cost' ? `₹${value.toLocaleString()}` : `${value} Services`}
                  </div>
                  
                  <div className="w-full flex-1 bg-muted rounded-t-sm overflow-hidden relative">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-accent transition-all duration-700 ease-out rounded-t-sm" 
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  
                  {/* UPDATED: Added Year format to label (e.g., JAN '24) */}
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase text-center mt-2 leading-tight">
                    {data.month_name.substring(0, 3)}
                    <span className="block opacity-60">'{data.y.toString().substring(2)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}