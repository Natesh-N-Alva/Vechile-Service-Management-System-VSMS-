'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { CostTrendChart } from '@/components/dashboard/cost-trend-chart';
import { ServiceFrequencyChart } from '@/components/dashboard/service-frequency-chart';
import { AlertsPanel } from '@/components/dashboard/alerts-panel';
import { Gauge, Wrench, DollarSign } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api'; 

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalServicesCount, setTotalServicesCount] = useState(0);
  
  const [stats, setStats] = useState({ 
    total_users: 0, 
    total_vehicles: 0, 
    total_revenue: 0,
    partReliabilityData: [] 
  });
  
  const [serviceFrequencyData, setServiceFrequencyData] = useState<any[]>([]);
  const [costTrendData, setCostTrendData] = useState<any[]>([]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    const token = sessionStorage.getItem('authToken');

    if (!storedUser || !token) {
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(storedUser);
    setCurrentUser(userObj);

    const loadDashboardData = async () => {
      try {
        const statsRes = await fetchWithAuth('http://127.0.0.1:5000/api/analytics');
        const statsData = await statsRes.json();
        if (!statsData.error) setStats(statsData);

        const servicesRes = await fetchWithAuth('http://127.0.0.1:5000/api/services');
        const servicesData = await servicesRes.json();

        if (!servicesData.error && Array.isArray(servicesData)) {
          setTotalServicesCount(servicesData.length);
          processChartData(servicesData);
        }
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const processChartData = (services: any[]) => {
    // 1. Process Service Type Frequency (Pie/Donut Chart)
    const typeCounts = services.reduce((acc: any, svc: any) => {
      const type = svc.Service_Type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const formattedFrequency = Object.keys(typeCounts).map((type, index) => {
      const colors = ['#14b8a6', '#06b6d4', '#0891b2', '#0d9488'];
      return { type, count: typeCounts[type], fill: colors[index % colors.length] };
    });
    setServiceFrequencyData(formattedFrequency);

    // 2. Process Monthly Costs (Line Chart) - FIXED STRICT SORTING
    const monthlyCosts = services.reduce((acc: any, svc: any) => {
      if (!svc.Service_Date) return acc;
      
      // Parse the date to get strict numerical values
      const date = new Date(svc.Service_Date);
      const y = date.getFullYear();
      const m = date.getMonth(); // 0 to 11
      const key = `${y}-${m}`;

      if (!acc[key]) {
        acc[key] = { 
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }), 
          y: y,
          m: m,
          cost: 0, 
          services: 0 
        };
      }
      acc[key].cost += Number(svc.Total_Cost || 0);
      acc[key].services += 1;
      return acc;
    }, {});

    // Sort strictly: Year ascending, then Month ascending
    const sortedCostData = Object.values(monthlyCosts).sort((a: any, b: any) => {
      if (a.y !== b.y) return a.y - b.y; // Sort by Year first
      return a.m - b.m;                  // Then sort by Month
    });

    setCostTrendData(sortedCostData);
  };

  if (loading || !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh] text-lg font-semibold text-accent animate-pulse">
          Loading Dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <strong className="text-accent">{currentUser.Name}</strong>!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 slide-in">
        <StatCard title="Total Vehicles" value={stats.total_vehicles} description="Active in fleet" icon={Gauge} />
        <StatCard title="Total Services" value={totalServicesCount} description="Records logged" icon={Wrench} />
        <StatCard title="Total Spending" value={`₹${stats.total_revenue?.toLocaleString() || 0}`} description="Cumulative cost" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 slide-in">
        <CostTrendChart data={costTrendData} />
        <ServiceFrequencyChart data={serviceFrequencyData} />
      </div>

      <AlertsPanel />
    </DashboardLayout>
  );
}