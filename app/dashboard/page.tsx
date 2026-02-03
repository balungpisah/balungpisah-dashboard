'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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
import {
  formatNumber,
  formatDate,
  getStatusColor,
  getStatusLabel,
  truncate,
} from '@/lib/utils';
import IndonesiaMap, { MapPoint } from '@/components/IndonesiaMap';

const STATUSES = [
  { key: 'draft',       label: 'Draft',       color: '#94a3b8' },  // slate-400
  { key: 'pending',     label: 'Pending',     color: '#f59e0b' },  // amber-500
  { key: 'verified',    label: 'Verified',    color: '#3b82f6' },  // blue-500
  { key: 'in_progress', label: 'In Progress', color: '#8b5cf6' },  // violet-500
  { key: 'resolved',    label: 'Resolved',    color: '#10b981' },  // emerald-500
  { key: 'rejected',    label: 'Rejected',    color: '#ef4444' },  // red-500
];

const STATUS_COLOR_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s.color]));

interface MapDataResponse {
  success: boolean;
  data?: {
    points: {
      id: string;
      lat: number;
      lon: number;
      status: string;
      category_color?: string;
    }[];
  };
}

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
      next.has(key) ? next.delete(key) : next.add(key);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Balungpisah Admin Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Reports</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.total_reports || 0)}</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-orange-600 text-white animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <AlertTriangle className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-yellow-100 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.pending_count || 0)}</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <TrendingDown className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-green-100 text-sm mb-1">Resolved</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.resolved_count || 0)}</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-1">This Week</p>
          <p className="text-3xl font-bold">{formatNumber(summary?.reports_this_week || 0)}</p>
          <p className="text-xs text-purple-100 mt-1">
            {formatNumber(summary?.reports_this_month || 0)} this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Locations</h3>
            <span className="text-xs text-gray-400">{mapPoints.length} pin{mapPoints.length !== 1 ? 's' : ''}</span>
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
                  className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 border transition-all duration-150
                    ${active
                      ? 'bg-white border-gray-200 text-gray-700 shadow-sm'
                      : 'bg-gray-100 border-transparent text-gray-400'
                    }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Categories</h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Types Distribution</h3>
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <Link
            href="/dashboard/reports"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentReports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent reports</p>
          ) : (
            recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1">{report.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {truncate(report.description, 150)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${getStatusColor(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                      {report.categories.map((cat) => (
                        <span
                          key={cat.category_id}
                          className="badge bg-gray-100 text-gray-700"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
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