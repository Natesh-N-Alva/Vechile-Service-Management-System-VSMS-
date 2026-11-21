'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ADDED CalendarRange to the imports
import { LayoutDashboard, Gauge, Wrench, TrendingUp, User, Users, Menu, X, ShieldAlert, CalendarRange } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/logo';

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // 1. Set safe default states
  const [userRole, setUserRole] = useState('User');
  const [isMounted, setIsMounted] = useState(false);

  // 2. Wait for the component to mount in the browser before reading session storage
  useEffect(() => {
    setIsMounted(true);
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || '{}');
    if (user.Role) {
      setUserRole(user.Role);
    }
  }, []);

  const userLinks = [
    { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'My Vehicles', icon: Gauge },
    { href: '/dashboard/schedule', label: 'Book Service', icon: CalendarRange }, // NEW LINK
    { href: '/services', label: 'Service History', icon: Wrench },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Panel', icon: ShieldAlert },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/vehicles', label: 'Manage Vehicles', icon: Gauge },
    { href: '/admin/schedule', label: 'Service Requests', icon: CalendarRange }, // NEW LINK
    { href: '/admin/services', label: 'Log Services', icon: Wrench },
    { href: '/analytics', label: 'System Analytics', icon: TrendingUp },
  ];

  const navItems = userRole === 'Admin' ? adminLinks : userLinks;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-40 md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors" aria-label="Toggle menu">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={cn('fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-all duration-300 flex flex-col z-30', 'md:translate-x-0', isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="p-6 border-b border-border">
          {/* Only render dynamic links if mounted to prevent Hydration errors */}
          {isMounted && <Logo href={userRole === 'Admin' ? '/admin' : '/dashboard'} size="lg" showText={true} />}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* 3. Hide the links for a split millisecond to ensure perfect server matching */}
          {isMounted && navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/dashboard' || item.href === '/admin' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
              
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                className={cn('flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200', isActive ? 'bg-accent text-primary font-medium shadow-lg shadow-accent/20' : 'text-foreground hover:bg-accent/10')}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border text-center">
          {isMounted && <p className="text-xs font-bold text-accent mb-1">{userRole} Mode</p>}
          <p className="text-xs text-muted-foreground">VehicleFlow Pro v1.0</p>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}