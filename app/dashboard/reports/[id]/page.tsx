'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, FileText, Save, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ReportDetail, ReportStatus } from '@/lib/types';
import {
  formatDateTime,
  formatRelativeTime,
  getStatusColor,
  getStatusLabel,
  getSeverityColor,
  getSeverityLabel,
} from '@/lib/utils';

const statusOptions: ReportStatus[] = [
  'draft',
  'pending',
  'verified',
  'in_progress',
  'resolved',
  'rejected',
];

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus>('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (params.id) {
      loadReport(params.id as string);
    }
  }, [params.id]);

  const loadReport = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getReport(id);

      if (response.success && response.data) {
        setReport(response.data);
        setNewStatus(response.data.status);
        setResolutionNotes(response.data.resolution_notes || '');
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!report) return;

    try {
      setUpdating(true);
      const response = await apiClient.updateReportStatus(
        report.id,
        newStatus,
        resolutionNotes || undefined
      );

      if (response.success) {
        await loadReport(report.id);
        alert('Status updated successfully!');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">Report not found</p>
        <Link href="/dashboard/reports" className="btn-primary">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/reports"
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{report.title}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${getStatusColor(report.status)}`}>
              {getStatusLabel(report.status)}
            </span>
            {report.categories.map((cat) => (
              <span key={cat.category_id} className={`badge ${getSeverityColor(cat.severity)}`}>
                {cat.name} - {getSeverityLabel(cat.severity)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <div className="card">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <FileText className="h-5 w-5" />
              Description
            </h2>
            <p className="whitespace-pre-wrap text-gray-700">{report.description}</p>
          </div>

          {/* Timeline */}
          {report.timeline && (
            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5" />
                Timeline
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">{report.timeline}</p>
            </div>
          )}

          {/* Impact */}
          {report.impact && (
            <div className="card">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Impact</h2>
              <p className="whitespace-pre-wrap text-gray-700">{report.impact}</p>
            </div>
          )}

          {/* Location */}
          {report.location && (
            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <MapPin className="h-5 w-5" />
                Location
              </h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Display Name:</span>{' '}
                  {report.location.display_name || '-'}
                </p>
                <p>
                  <span className="font-medium">Province:</span>{' '}
                  {report.location.province_name || '-'}
                </p>
                <p>
                  <span className="font-medium">Regency:</span>{' '}
                  {report.location.regency_name || '-'}
                </p>
                {report.location.lat && report.location.lon && (
                  <p>
                    <span className="font-medium">Coordinates:</span>{' '}
                    {report.location.lat.toFixed(6)}, {report.location.lon.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="input"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Resolution Notes (Optional)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder="Add notes about the resolution..."
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating || newStatus === report.status}
                className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Report ID</p>
                <p className="font-mono text-xs text-gray-900">{report.id}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Ticket ID</p>
                <p className="font-mono text-xs text-gray-900">{report.ticket_id}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Created</p>
                <p className="text-gray-900">{formatDateTime(report.created_at)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(report.created_at)}</p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Last Updated</p>
                <p className="text-gray-900">{formatDateTime(report.updated_at)}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(report.updated_at)}</p>
              </div>
              {report.verified_at && (
                <div>
                  <p className="mb-1 text-gray-500">Verified</p>
                  <p className="text-gray-900">{formatDateTime(report.verified_at)}</p>
                </div>
              )}
              {report.resolved_at && (
                <div>
                  <p className="mb-1 text-gray-500">Resolved</p>
                  <p className="text-gray-900">{formatDateTime(report.resolved_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tag Type */}
          {report.tag_type && (
            <div className="card">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Tag className="h-5 w-5" />
                Type
              </h2>
              <span className="badge bg-primary-100 text-sm text-primary-800">
                {report.tag_type}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
