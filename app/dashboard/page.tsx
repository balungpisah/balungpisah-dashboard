'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import {
  DashboardSummary,
  DashboardReport,
  CategoryReportSummary,
  TagReportSummary,
} from '@/lib/types';
import { formatNumber, formatDate, getStatusColor, getStatusLabel, truncate } from '@/lib/utils';
import IndonesiaMap, { MapPoint } from '@/components/IndonesiaMap';

const STATUSES = [
  { key: 'draft', label: 'Draft', color: '#94a3b8' }, // slate-400
  { key: 'pending', label: 'Pending', color: '#f59e0b' }, // amber-500
  { key: 'verified', label: 'Verified', color: '#3b82f6' }, // blue-500
  { key: 'in_progress', label: 'In Progress', color: '#8b5cf6' }, // violet-500
  { key: 'resolved', label: 'Resolved', color: '#10b981' }, // emerald-500
  { key: 'rejected', label: 'Rejected', color: '#ef4444' }, // red-500
];

const STATUS_COLOR_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s.color]));

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentReports, setRecentReports] = useState<DashboardReport[]>([]);
  const [categories, setCategories] = useState<CategoryReportSummary[]>([]);
  const [tags, setTags] = useState<TagReportSummary[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(
    () => new Set(STATUSES.map((s) => s.key))
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [summaryRes, reportsRes, categoriesRes, tagsRes, mapRes] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getRecentReports(7, 5),
        apiClient.getReportsByCategory(undefined, 1, 10),
        apiClient.getReportsByTag(undefined, 1, 10),
        apiClient.getMapMarkers(),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (reportsRes.success) setRecentReports(reportsRes.data.reports || []);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
      if (tagsRes.success) setTags(tagsRes.data.tags || []);
      if (mapRes.success && mapRes.data?.points) {
        setMapPoints(mapRes.data.points);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (key: string) => {
    setVisibleStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mapPoints.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [mapPoints]);

  const handlePointClick = (point: MapPoint) => {
    window.location.href = `/dashboard/reports/${point.id}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const tagChartData = tags.map((tag) => ({
    name: tag.label,
    count: tag.report_count,
  }));

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Balungpisah Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card animate-slide-up bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <FileText className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-75" />
          </div>
          <p className="mb-1 text-sm text-blue-100">Total Reports</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.total_reports || 0)}</p>
        </div>

        <div
          className="card animate-slide-up bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <Clock className="h-6 w-6" />
            </div>
            <AlertTriangle className="h-5 w-5 opacity-75" />
          </div>
          <p className="mb-1 text-sm text-yellow-100">Pending</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.pending_count || 0)}</p>
        </div>

        <div
          className="card animate-slide-up bg-gradient-to-br from-green-500 to-emerald-600 text-white"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <TrendingDown className="h-5 w-5 opacity-75" />
          </div>
          <p className="mb-1 text-sm text-green-100">Resolved</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.resolved_count || 0)}</p>
        </div>

        <div
          className="card animate-slide-up bg-gradient-to-br from-purple-500 to-pink-600 text-white"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-white/20 p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm text-purple-100">This Week</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.reports_this_week || 0)}</p>
          <p className="mt-1 text-xs text-purple-100">
            {formatNumber(summary?.reports_this_month || 0)} this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Report Locations</h3>
            <span className="text-xs text-gray-400">
              {mapPoints.length} pin{mapPoints.length !== 1 ? 's' : ''}
            </span>
          </div>

          <IndonesiaMap
            points={mapPoints}
            visibleStatuses={visibleStatuses}
            statusColors={STATUS_COLOR_MAP}
            onPointClick={handlePointClick}
          />

          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
            {STATUSES.map((s) => {
              const active = visibleStatuses.has(s.key);
              const count = statusCounts[s.key] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={s.key}
                  onClick={() => toggleStatus(s.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                    active
                      ? 'border-gray-200 bg-white text-gray-700 shadow-sm'
                      : 'border-transparent bg-gray-100 text-gray-400'
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: active ? s.color : '#cbd5e1' }}
                  />
                  {s.label}
                  <span className={`ml-0.5 ${active ? 'text-gray-500' : 'text-gray-300'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="report_count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Report Types Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tagChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card animate-slide-up" style={{ animationDelay: '0.7s' }}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentReports.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No recent reports</p>
          ) : (
            recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="mb-1 font-medium text-gray-900">{report.title}</h4>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                      {truncate(report.description, 150)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.categories.map((cat) => (
                        <span key={cat.category_id} className="badge bg-gray-100 text-gray-700">
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500">{formatDate(report.created_at)}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
