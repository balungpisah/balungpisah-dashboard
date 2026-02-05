'use client';

import { useEffect, useState, useCallback } from 'react';
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const checkAuth = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
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
          } fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10">
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
                className="text-gray-500 hover:text-gray-700 lg:hidden"
              >
                <X className="h-6 w-6" />
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
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {user && (
              <div className="border-t border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 font-semibold text-white">
                    {user.account_id.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{user.account_id}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-700"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1"></div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="container mx-auto px-4 py-8 lg:px-6">{children}</div>
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
