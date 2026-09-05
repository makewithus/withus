import { apiClient } from './client';

const BASE = '/superadmin';

export const superAdminApi = {
  getOverview: () => apiClient.get(`${BASE}/overview`),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get(`${BASE}/users`, { params }),

  getUserDetail: (id: string) => apiClient.get(`${BASE}/users/${id}`),

  getOrganizations: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get(`${BASE}/organizations`, { params }),

  getOrganizationDetail: (id: string) =>
    apiClient.get(`${BASE}/organizations/${id}`),

  getSessions: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get(`${BASE}/sessions`, { params }),

  getGlobalAudit: (params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get(`${BASE}/audit`, { params }),

  getPlatformAudit: (params?: { page?: number; limit?: number }) =>
    apiClient.get(`${BASE}/platform-audit`, { params }),
};
