'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Ticket,
  FolderTree,
  MapPin,
  Lightbulb,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { User } from '@/lib/types';
import Image from 'next/image';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
  { icon: FolderTree, label: 'Categories', href: '/dashboard/categories' },
  { icon: MapPin, label: 'Locations', href: '/dashboard/locations' },
  { icon: Lightbulb, label: 'Expectations', href: '/dashboard/expectations' },
  { icon: Users, label: 'Contributors', href: '/dashboard/contributors' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/');
        return;
      }

      const response = await apiClient.getMe();
      
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        
        const isSuperAdmin = userData.roles.includes('super_admin');
        
        if (!isSuperAdmin) {
          localStorage.removeItem('access_token');
          alert('Access denied. Super admin privileges required.');
          router.push('/');
          return;
        }
        
        setAuthorized(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <Image
                      src="/balung_pisah.png" 
                      alt="Balung Pisah"
                      width={64} 
                      height={64}
                      priority 
                      className="object-contain"
                    />
                </div>
                <span className="text-xl font-bold text-gray-900">Balungpisah</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {user && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.account_id.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.account_id}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1"></div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 lg:px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
