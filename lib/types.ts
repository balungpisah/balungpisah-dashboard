export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  };
}

export interface DashboardSummary {
  total_reports: number;
  pending_count: number;
  resolved_count: number;
  reports_this_week: number;
  reports_this_month: number;
}

export interface DashboardReport {
  id: string;
  title: string;
  description: string;
  status: ReportStatus;
  created_at: string;
  categories: ReportCategoryInfo[];
  location?: ReportLocationInfo;
  impact?: string;
  timeline?: string;
  tag_type?: ReportTagType;
}

export interface ReportDetail extends DashboardReport {
  ticket_id: string;
  updated_at: string;
  verified_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface ReportCategoryInfo {
  category_id: string;
  name: string;
  slug: string;
  severity: ReportSeverity;
  color?: string;
  icon?: string;
}

export interface ReportLocationInfo {
  raw_input: string;
  display_name?: string;
  lat?: number;
  lon?: number;
  province_id?: string;
  province_name?: string;
  regency_id?: string;
  regency_name?: string;
  city?: string;
  road?: string;
  state?: string;
}

export type ReportStatus =
  | 'draft'
  | 'pending'
  | 'verified'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReportTagType = 'report' | 'proposal' | 'complaint' | 'inquiry' | 'appreciation';

export interface CategoryReportSummary {
  id: string;
  name: string;
  slug: string;
  report_count: number;
  color?: string;
  description?: string;
  icon?: string;
}

export interface ProvinceReportSummary {
  id: string;
  name: string;
  code: string;
  report_count: number;
  lat?: number;
  lng?: number;
}

export interface RegencyReportSummary {
  id: string;
  province_id: string;
  name: string;
  code: string;
  report_count: number;
  lat?: number;
  lng?: number;
}

export interface TagReportSummary {
  tag_type: ReportTagType;
  label: string;
  report_count: number;
}

export interface Ticket {
  id: string;
  reference_number: string;
  adk_thread_id: string;
  platform: string;
  status: TicketStatus;
  confidence_score: number;
  completeness_score?: number;
  submitted_at: string;
  processed_at?: string;
  created_at: string;
}

export type TicketStatus = 'submitted' | 'processing' | 'completed' | 'failed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  parent_id?: string;
  color?: string;
  description?: string;
  icon?: string;
}

export interface RateLimitConfig {
  key: string;
  value: number;
  description?: string;
  updated_at: string;
}

export interface Province {
  id: string;
  code: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface Regency {
  id: string;
  code: string;
  name: string;
  provinceId: string;
  lat?: number;
  lng?: number;
}

export interface MapReportMarker {
  id: string;
  title: string;
  lat: number;
  lon: number;
  status: ReportStatus;
  created_at: string;
  category_slug?: string;
  category_color?: string;
}

export interface User {
  account_id: string;
  sub: string;
  roles: string[];
  session_uid?: string;
}

export interface AdminReportDto {
  id: string;
  reference_number?: string;
  title?: string;
  status: ReportStatus;
  platform?: string;
  user_id?: string;
  primary_category?: string;
  category_count: number;
  attachment_count: number;
  location_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminReportDetailDto {
  id: string;
  reference_number?: string;
  title?: string;
  description?: string;
  status: ReportStatus;
  platform?: string;
  user_id?: string;
  ticket_id?: string;
  adk_thread_id?: string;
  cluster_id?: string;
  impact?: string;
  timeline?: string;
  resolution_notes?: string;
  verified_at?: string;
  verified_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  categories: AdminReportCategoryDto[];
  tags: ReportTagType[];
  location?: AdminReportLocationDto;
  attachments: AdminReportAttachmentDto[];
}

export interface AdminReportCategoryDto {
  category_id: string;
  category_name: string;
  category_slug: string;
  severity: ReportSeverity;
}

export interface AdminReportLocationDto {
  raw_input: string;
  display_name?: string;
  lat?: number;
  lon?: number;
  province_name?: string;
  regency_name?: string;
  city?: string;
  state?: string;
}

export interface AdminReportAttachmentDto {
  file_id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  url: string;
}

export interface AdminTicketDto {
  id: string;
  reference_number: string;
  user_id: string;
  platform: string;
  status: TicketStatus;
  confidence_score: number;
  retry_count: number;
  has_error: boolean;
  report_id?: string;
  submitted_at: string;
  processed_at?: string;
  created_at: string;
}

export interface AdminTicketDetailDto {
  id: string;
  reference_number: string;
  adk_thread_id: string;
  user_id: string;
  platform: string;
  status: TicketStatus;
  confidence_score: number;
  completeness_score?: number;
  retry_count: number;
  report_id?: string;
  error_message?: string;
  submitted_at: string;
  processed_at?: string;
  last_attempt_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminContributorDto {
  id: string;
  submission_type: string;
  name?: string;
  email?: string;
  organization_name?: string;
  city?: string;
  created_at: string;
}

export interface AdminContributorDetailDto {
  id: string;
  submission_type: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  city?: string;
  organization_name?: string;
  organization_type?: string;
  contact_name?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  contact_position?: string;
  role?: string;
  skills?: string;
  bio?: string;
  portfolio_url?: string;
  contribution_offer?: string;
  aspiration?: string;
  agreed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminExpectationDto {
  id: string;
  name?: string;
  email?: string;
  expectation: string;
  created_at: string;
}
