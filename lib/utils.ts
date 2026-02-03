import { format, formatDistanceToNow } from 'date-fns';
import { ReportStatus, ReportSeverity, TicketStatus, ReportTagType } from './types';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getStatusColor(status: ReportStatus): string {
  const colors: Record<ReportStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: ReportStatus): string {
  const labels: Record<ReportStatus, string> = {
    draft: 'Draft',
    pending: 'Pending',
    verified: 'Verified',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };
  return labels[status] || status;
}

export function getSeverityColor(severity: ReportSeverity): string {
  const colors: Record<ReportSeverity, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
}

export function getSeverityLabel(severity: ReportSeverity): string {
  const labels: Record<ReportSeverity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[severity] || severity;
}

export function getTicketStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getTicketStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    submitted: 'Submitted',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] || status;
}

export function getTagTypeColor(tagType: ReportTagType): string {
  const colors: Record<ReportTagType, string> = {
    report: 'bg-blue-100 text-blue-800',
    proposal: 'bg-purple-100 text-purple-800',
    complaint: 'bg-red-100 text-red-800',
    inquiry: 'bg-yellow-100 text-yellow-800',
    appreciation: 'bg-green-100 text-green-800',
  };
  return colors[tagType] || 'bg-gray-100 text-gray-800';
}

export function getTagTypeLabel(tagType: ReportTagType): string {
  const labels: Record<ReportTagType, string> = {
    report: 'Report',
    proposal: 'Proposal',
    complaint: 'Complaint',
    inquiry: 'Inquiry',
    appreciation: 'Appreciation',
  };
  return labels[tagType] || tagType;
}

export function truncate(str: string, length: number = 100): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatPercentage(value: number, total: number = 100) { 
  return (value / total) * 100; 
}
