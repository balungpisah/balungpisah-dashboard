import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            window.location.href = '/';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // Dashboard Summary
  async getDashboardSummary() {
    const response = await this.client.get('/api/dashboard/summary');
    return response.data;
  }

  async getRecentReports(days: number = 7, limit: number = 10) {
    const response = await this.client.get('/api/dashboard/recent', {
      params: { days, limit },
    });
    return response.data;
  }

  async getReportsByCategory(slug?: string, page: number = 1, pageSize: number = 10) {
    const response = await this.client.get('/api/dashboard/by-category', {
      params: { slug, page, page_size: pageSize },
    });
    return response.data;
  }

  async getReportsByLocation(provinceId?: string, regencyId?: string, page: number = 1, pageSize: number = 10) {
    const response = await this.client.get('/api/dashboard/by-location', {
      params: { province_id: provinceId, regency_id: regencyId, page, page_size: pageSize },
    });
    return response.data;
  }

  async getReportsByTag(tagType?: string, page: number = 1, pageSize: number = 10) {
    const response = await this.client.get('/api/dashboard/by-tag', {
      params: { tag_type: tagType, page, page_size: pageSize },
    });
    return response.data;
  }

  async getMapData(filters?: {
    provinceId?: string;
    regencyId?: string;
    category?: string;
    status?: string;
    limit?: number;
  }) {
    const response = await this.client.get('/api/dashboard/map', {
      params: {
        province_id: filters?.provinceId,
        regency_id: filters?.regencyId,
        category: filters?.category,
        status: filters?.status,
        limit: filters?.limit,
      },
    });
    return response.data;
  }

  async getReports(filters?: {
    page?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    userId?: string;
    platform?: string;
    hasAttachments?: boolean;
    sortBy?: string;
    sort?: string;
  }) {
    const response = await this.client.get('/api/admin/reports', {
      params: {
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        status: filters?.status,
        from_date: filters?.fromDate,
        to_date: filters?.toDate,
        search: filters?.search,
        user_id: filters?.userId,
        platform: filters?.platform,
        has_attachments: filters?.hasAttachments,
        sort_by: filters?.sortBy,
        sort: filters?.sort,
      },
    });
    return response.data;
  }

  async getReport(id: string) {
    const response = await this.client.get(`/api/admin/reports/${id}`);
    return response.data;
  }

  async updateReportStatus(id: string, status: string, resolutionNotes?: string) {
    const response = await this.client.patch(`/api/reports/${id}/status`, {
      status,
      resolution_notes: resolutionNotes,
    });
    return response.data;
  }

  async getTickets(filters?: {
    page?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    userId?: string;
    platform?: string;
    hasError?: boolean;
    sortBy?: string;
    sort?: string;
  }) {
    const response = await this.client.get('/api/admin/tickets', {
      params: {
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        status: filters?.status,
        from_date: filters?.fromDate,
        to_date: filters?.toDate,
        search: filters?.search,
        user_id: filters?.userId,
        platform: filters?.platform,
        has_error: filters?.hasError,
        sort_by: filters?.sortBy,
        sort: filters?.sort,
      },
    });
    return response.data;
  }

  async getTicket(id: string) {
    const response = await this.client.get(`/api/admin/tickets/${id}`);
    return response.data;
  }

  async getContributors(filters?: {
    page?: number;
    pageSize?: number;
    submissionType?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    city?: string;
    sort?: string;
  }) {
    const response = await this.client.get('/api/admin/contributors', {
      params: {
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        submission_type: filters?.submissionType,
        from_date: filters?.fromDate,
        to_date: filters?.toDate,
        search: filters?.search,
        city: filters?.city,
        sort: filters?.sort,
      },
    });
    return response.data;
  }

  async getContributor(id: string) {
    const response = await this.client.get(`/api/admin/contributors/${id}`);
    return response.data;
  }

  async getExpectations(filters?: {
    page?: number;
    pageSize?: number;
    hasEmail?: boolean;
    fromDate?: string;
    toDate?: string;
    search?: string;
    sort?: string;
  }) {
    const response = await this.client.get('/api/admin/expectations', {
      params: {
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        has_email: filters?.hasEmail,
        from_date: filters?.fromDate,
        to_date: filters?.toDate,
        search: filters?.search,
        sort: filters?.sort,
      },
    });
    return response.data;
  }

  async getExpectation(id: string) {
    const response = await this.client.get(`/api/admin/expectations/${id}`);
    return response.data;
  }

  // Categories
  async getCategories(tree: boolean = false) {
    const response = await this.client.get('/api/categories', {
      params: { tree },
    });
    return response.data;
  }

  // Rate Limits (Admin)
  async getRateLimitConfigs() {
    const response = await this.client.get('/api/admin/rate-limits');
    return response.data;
  }

  async getRateLimitConfig(key: string) {
    const response = await this.client.get(`/api/admin/rate-limits/${key}`);
    return response.data;
  }

  async updateRateLimitConfig(key: string, value: number) {
    const response = await this.client.put(`/api/admin/rate-limits/${key}`, {
      value,
    });
    return response.data;
  }

  // Regions
  async getProvinces(search?: string) {
    const response = await this.client.get('/api/regions/provinces', {
      params: { search },
    });
    return response.data;
  }

  async getRegencies(search?: string) {
    const response = await this.client.get('/api/regions/regencies', {
      params: { search },
    });
    return response.data;
  }
  
  async getMapMarkers() {
    const response = await this.client.get('/api/dashboard/map-data');
    return response.data;
  }

}

export const apiClient = new ApiClient();
