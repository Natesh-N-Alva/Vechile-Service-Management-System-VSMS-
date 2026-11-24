'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Users, Gauge, Wrench, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    total_users: 0,
    total_vehicles: 0,
    total_revenue: 0,
    total_services: 0
  });

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const analyticsRes = await fetchWithAuth('/api/analytics');
        const analyticsData = await analyticsRes.json();
        
        const servicesRes = await fetchWithAuth('/api/services');
        const servicesData = await servicesRes.json();

        if (!analyticsData.error) {
          setStats({
            total_users: analyticsData.total_users,
            total_vehicles: analyticsData.total_vehicles,
            total_revenue: analyticsData.total_revenue,
            total_services: Array.isArray(servicesData) ? servicesData.length : 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };

    fetchStats();
  }, [router]);

  const adminCards = [
    {
      title: 'Manage Users', description: 'Add, edit, and remove user accounts',
      icon: Users, href: '/admin/users', stat: stats.total_users, label: 'Active Users', color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Manage Vehicles', description: 'Oversee all vehicles in the system',
      icon: Gauge, href: '/admin/vehicles', stat: stats.total_vehicles, label: 'Total Vehicles', color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Manage Services', description: 'Control service records and maintenance',
      icon: Wrench, href: '/admin/services', stat: stats.total_services, label: 'Total Services', color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Analytics', description: 'View system statistics and reports',
      icon: BarChart3, href: '/analytics', stat: `₹${stats.total_revenue.toLocaleString()}`, label: 'Total Earning', color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage all system data and user accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div className="h-full p-6 rounded-xl bg-card border border-border hover:border-accent/50 transition-all duration-200 hover:shadow-lg cursor-pointer group">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <div className="pt-4 border-t border-border">
                  <p className="text-3xl font-bold text-accent mb-1">{card.stat}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/users"><Button variant="outline" className="w-full">Add User</Button></Link>
          <Link href="/admin/vehicles"><Button variant="outline" className="w-full">Add Vehicle</Button></Link>
          <Link href="/admin/services"><Button variant="outline" className="w-full">Add Service</Button></Link>
          <Link href="/analytics"><Button variant="outline" className="w-full">View Analytics</Button></Link>
        </div>
      </div>
    </DashboardLayout>
  );
}