'use client';

import { useEffect, useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight, Eye, Mail, Building } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { AdminContributorDto } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<AdminContributorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const pageSize = 20;

  useEffect(() => {
    loadContributors();
  }, [page, typeFilter]);

  const loadContributors = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getContributors({
        page,
        pageSize,
        search: searchTerm || undefined,
        submissionType: typeFilter || undefined,
      });

      if (response.success) {
        setContributors(response.data || []);
        setTotalPages(response.meta?.total_pages || 1);
        setTotalItems(response.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadContributors();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contributors</h1>
          <p className="text-gray-600">
            Manage contributor registrations ({formatNumber(totalItems)} total)
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-11"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="input min-w-[180px]"
          >
            <option value="">All Types</option>
            <option value="personal">Personal</option>
            <option value="organization">Organization</option>
          </select>
        </form>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : contributors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No contributors found
                  </td>
                </tr>
              ) : (
                contributors.map((contributor) => (
                  <tr key={contributor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {contributor.name || 'Anonymous'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        contributor.submission_type === 'organization' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {contributor.submission_type === 'organization' ? 'Organization' : 'Personal'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {contributor.email ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {contributor.email}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {contributor.organization_name ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="w-4 h-4" />
                          {contributor.organization_name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contributor.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(contributor.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
