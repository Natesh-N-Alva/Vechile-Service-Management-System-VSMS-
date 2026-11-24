'use client';

import { Bell, Settings, LogOut, ChevronDown, User as UserIcon, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

export function Topbar() {
  const router = useRouter();
  
  // State
  const [currentUser, setCurrentUser] = useState({ Name: 'Loading...', Role: 'User' });
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Dropdown toggles
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Refs for click-away listeners
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // 1. Fetch User Data & Notifications on Load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      
      // Fetch dynamic alerts from Flask
      const loadNotifications = async () => {
        try {
          const res = await fetchWithAuth('/api/notifications');
          const data = await res.json();
          if (!data.error) setNotifications(data);
        } catch (err) {
          console.error("Failed to load notifications");
        }
      };
      loadNotifications();
    }
  }, []);

  // 2. Click-away listener to close both dropdowns smoothly
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. The Secure Logout Function
  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('loggedInUser');
    router.push('/login');
  };

  // 4. Helper for notification icons
  const getNotifIcon = (type: string) => {
    if (type === 'success') return <CheckCircle2 size={16} className="text-green-500" />;
    if (type === 'warning') return <AlertCircle size={16} className="text-amber-500" />;
    return <Info size={16} className="text-blue-500" />;
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-20">
      <div className="flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* --- DYNAMIC NOTIFICATIONS --- */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false); // Close profile if open
            }}
            className="relative p-2 hover:bg-accent/10 rounded-lg transition-colors group text-muted-foreground hover:text-foreground"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <p className="font-semibold text-foreground">Notifications</p>
                <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full font-bold">
                  {notifications.length} New
                </span>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up!</div>
                ) : (
                  notifications.map((notif, index) => (
                    <div key={index} className="p-4 border-b border-border/50 hover:bg-muted/50 transition-colors flex gap-3 items-start">
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-2 uppercase font-medium">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Settings */}
        <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors hidden sm:block text-muted-foreground hover:text-foreground">
          <Settings size={20} />
        </button>

        {/* --- USER PROFILE & DROPDOWN --- */}
        <div className="relative border-l border-border pl-4" ref={profileRef}>
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false); // Close notifs if open
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left focus:outline-none"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.Name}`}
              alt={currentUser.Name}
              className="w-8 h-8 rounded-full bg-accent/20"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">{currentUser.Name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.Role}</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground hidden sm:block" />
          </button>

          {/* The Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                My Profile
              </button>

              <div className="h-px bg-border my-2"></div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}