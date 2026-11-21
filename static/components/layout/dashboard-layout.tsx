import { SidebarNav } from './sidebar-nav';
import { Topbar } from './topbar';
import { ShootingStars } from '@/components/common/shooting-stars';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <ShootingStars />
      <SidebarNav />
      <Topbar />
      <main className="md:ml-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
