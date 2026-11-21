'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Shield, Bell, Moon, LogOut } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ vehicles: 0, services: 0, spending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get user profile from session storage
    const storedUser = JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);

    // 2. Fetch live fleet summary from API
    const fetchStats = async () => {
      try {
        const analyticsRes = await fetchWithAuth('http://127.0.0.1:5000/api/analytics');
        const analyticsData = await analyticsRes.json();
        
        const servicesRes = await fetchWithAuth('http://127.0.0.1:5000/api/services');
        const servicesData = await servicesRes.json();

        setStats({
          vehicles: analyticsData.total_vehicles || 0,
          services: Array.isArray(servicesData) ? servicesData.length : 0,
          spending: analyticsData.total_revenue || 0
        });
      } catch (err) {
        console.error("Failed to load profile stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.clear(); // Wipe the JWT token and user profile
    router.push('/login');  // Kick back to login
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh] text-accent animate-pulse">
          Loading Profile...
        </div>
      </DashboardLayout>
    );
  }

  // Generate a dynamic avatar based on the user's name
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.Name}`;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and application settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Account Information</h2>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
              <img
                src={avatarUrl}
                alt={user.Name}
                className="w-16 h-16 rounded-full border-4 border-accent bg-accent/10"
              />
              <div>
                <h3 className="text-xl font-semibold text-foreground">{user.Name}</h3>
                <p className="text-sm text-accent font-medium">{user.Role === 'Admin' ? 'System Administrator' : 'Standard Member'}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {user.User_ID}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                  <p className="text-sm font-medium text-foreground">{user.Email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium text-foreground">{user.Phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                <Shield className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Account Access Level</p>
                  <p className="text-sm font-medium text-foreground">{user.Role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Service reminders and alerts</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border cursor-pointer accent-accent" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce eye strain in low light</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border cursor-pointer accent-accent" />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">Danger Zone</h2>
            <Button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 text-white gap-2 transition-all">
              <LogOut size={18} />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Subscription */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-cyan-400/5 border border-accent/20">
            <h3 className="font-semibold text-foreground mb-4">Subscription</h3>
            <p className="text-2xl font-bold text-accent mb-2">Pro Access</p>
            <p className="text-xs text-muted-foreground mb-4">
              You are currently utilizing full system privileges.
            </p>
            <Button className="w-full bg-accent hover:bg-accent/90 text-primary">
              View Plan Details
            </Button>
          </div>

          {/* Real-time Fleet Summary */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-4">Fleet Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Vehicles</span>
                <span className="text-sm font-semibold text-foreground">{stats.vehicles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Services Logged</span>
                <span className="text-sm font-semibold text-foreground">{stats.services}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between">
                <span className="text-sm text-muted-foreground">Total Spending</span>
                <span className="text-sm font-semibold text-accent">₹{stats.spending.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-semibold text-foreground mb-4">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is here to assist you with any questions.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}