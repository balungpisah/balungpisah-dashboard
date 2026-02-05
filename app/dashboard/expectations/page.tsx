'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Mail, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { AdminExpectationDto } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function ExpectationsPage() {
  const [expectations, setExpectations] = useState<AdminExpectationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadExpectations = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        pageSize: PAGE_SIZE,
        search: searchTerm || undefined,
        hasEmail: emailFilter === 'yes' ? true : emailFilter === 'no' ? false : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sort: sortOrder,
      };

      console.log('Fetching expectations with params:', params);

      const response = await apiClient.getExpectations(params);

      console.log('API Response:', {
        success: response.success,
        dataLength: response.data?.length,
        meta: response.meta,
      });

      if (response.success) {
        const data = response.data || [];
        const total = response.meta?.total || 0;
        const pages = Math.ceil(total / PAGE_SIZE);

        console.log('Setting state:', {
          dataCount: data.length,
          total,
          pages,
          currentPage: page,
        });

        setExpectations(data);
        setTotalItems(total);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error('Failed to load expectations:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, emailFilter, fromDate, toDate, sortOrder]);

  useEffect(() => {
    loadExpectations();
  }, [loadExpectations]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadExpectations();
  };

  const handleReset = () => {
    setSearchTerm('');
    setEmailFilter('');
    setFromDate('');
    setToDate('');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Expectations</h1>
          <p className="text-gray-600">
            User expectations from landing page ({formatNumber(totalItems)} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in name or expectation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-11"
                />
              </div>
            </div>

            {/* Email Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Status</label>
              <select
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-full"
              >
                <option value="">All Submissions</option>
                <option value="yes">With Email</option>
                <option value="no">Without Email</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as 'desc' | 'asc');
                  setPage(1);
                }}
                className="input w-full"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  className="input w-full pl-11"
                />
              </div>
            </div>

            {/* To Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  className="input w-full pl-11"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Expectation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : expectations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No expectations found
                  </td>
                </tr>
              ) : (
                expectations.map((expectation) => (
                  <tr key={expectation.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{expectation.name || 'Anonymous'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {expectation.email ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {expectation.email}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 text-sm text-gray-900">
                        {expectation.expectation}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(expectation.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && expectations.length > 0 && totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalItems)} of{' '}
                {formatNumber(totalItems)} results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
