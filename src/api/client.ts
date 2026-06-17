import type {
  Style,
  Process,
  Worker,
  ProductionRecord,
  Subsidy,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  BatchEntryRequest,
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('garment_token');
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data as T;
}

export const api = {
  auth: {
    login: (payload: LoginRequest) =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  styles: {
    getAll: () => request<Style[]>('/styles'),
    create: (payload: Omit<Style, 'id' | 'createdAt'>) =>
      request<Style>('/styles', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Style>) =>
      request<Style>(`/styles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/styles/${id}`, {
        method: 'DELETE',
      }),
  },

  processes: {
    create: (payload: Omit<Process, 'id' | 'createdAt'>) =>
      request<Process>('/processes', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Process>) =>
      request<Process>(`/processes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/processes/${id}`, {
        method: 'DELETE',
      }),
  },

  workers: {
    getAll: () => request<Worker[]>('/workers'),
    create: (payload: Omit<Worker, 'id' | 'createdAt'>) =>
      request<Worker>('/workers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Worker>) =>
      request<Worker>(`/workers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/workers/${id}`, {
        method: 'DELETE',
      }),
  },

  records: {
    getAll: (params?: {
      workerId?: string;
      date?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return request<ProductionRecord[]>(`/records${query}`);
    },
    create: (payload: Omit<ProductionRecord, 'id' | 'amount' | 'createdAt'>) =>
      request<ProductionRecord>('/records', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    batchCreate: (payload: BatchEntryRequest) =>
      request<ProductionRecord[]>('/records/batch', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<ProductionRecord>) =>
      request<ProductionRecord>(`/records/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/records/${id}`, {
        method: 'DELETE',
      }),
  },

  subsidies: {
    getAll: (params?: {
      workerId?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return request<Subsidy[]>(`/subsidies${query}`);
    },
    create: (payload: Omit<Subsidy, 'id' | 'createdAt'>) =>
      request<Subsidy>('/subsidies', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Subsidy>) =>
      request<Subsidy>(`/subsidies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/subsidies/${id}`, {
        method: 'DELETE',
      }),
  },
};

export default api;
