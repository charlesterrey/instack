const API_BASE_URL = import.meta.env['VITE_API_URL'] as string ?? 'http://localhost:8787';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiError {
  message: string;
  status: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  pagination?: { page: number; limit: number; total: number };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {};

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      window.location.href = '/login';
      return { error: { message: 'Authentication required', status: 401 } };
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('X-RateLimit-Reset');
      return { error: { message: `Rate limited. Retry after ${retryAfter ?? 'a moment'}`, status: 429 } };
    }

    const json = await response.json() as ApiResponse<T>;
    return json;
  }

  get<T>(path: string) {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient(API_BASE_URL);
