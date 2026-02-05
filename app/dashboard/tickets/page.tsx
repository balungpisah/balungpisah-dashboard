'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { AdminTicketDto } from '@/lib/types';
import {
  formatDate,
  getTicketStatusColor,
  getTicketStatusLabel,
  formatPercentage,
  formatNumber,
} from '@/lib/utils';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<AdminTicketDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 20;

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTickets({
        page,
        pageSize,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });

      if (response.success) {
        setTickets(response.data || []);
        setTotalPages(response.meta?.total_pages || 1);
        setTotalItems(response.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTickets();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">
            Monitor all citizen report tickets ({formatNumber(totalItems)} total)
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-11"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input min-w-[180px]"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </form>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Platform
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Confidence
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Retries
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Report
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        {ticket.reference_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize text-gray-600">{ticket.platform}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getTicketStatusColor(ticket.status)}`}>
                        {getTicketStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 max-w-[100px] flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-primary-600"
                            style={{ width: `${ticket.confidence_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatPercentage(ticket.confidence_score)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{ticket.retry_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.report_id ? (
                        <Link
                          href={`/dashboard/reports/${ticket.report_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          View Report
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(ticket.submitted_at)}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
