'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.data) {
        localStorage.setItem('access_token', response.data.access_token);

        const meResponse = await apiClient.getMe();

        if (meResponse.success && meResponse.data) {
          const isSuperAdmin = meResponse.data.roles.includes('super_admin');

          if (!isSuperAdmin) {
            localStorage.removeItem('access_token');
            setError('Access denied. Super admin privileges required to access this dashboard.');
            setLoading(false);
            return;
          }

          router.push('/dashboard');
        } else {
          setError('Failed to verify user permissions');
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosErr.response?.data?.message || 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="align-center mx-auto mb-4 h-20 w-20 rounded-2xl">
            <Image
              src="/balung_pisah.png"
              alt="Balung Pisah"
              width={64}
              height={64}
              priority
              className="object-contain"
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Balungpisah Admin</h1>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="input pl-11"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input pl-11"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Only users with super admin privileges can access this
              dashboard.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          © 2024 Balungpisah. All rights reserved.
        </p>
      </div>
    </div>
  );
}
