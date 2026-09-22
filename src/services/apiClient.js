/**
 * Standardized HTTP API Client
 * Clean architecture wrapper for consuming backend REST API or Database endpoints.
 */

const DEFAULT_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://superetlapi.vercel.app/api').replace(/\/+$/, '');

class ApiClient {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  setBaseUrl(url) {
    this.baseUrl = (url || DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  async request(endpoint, { method = 'GET', data = null, params = {}, headers = {}, timeout = 15000 } = {}) {
    let cleanEndpoint = (endpoint || '').replace(/^\/+/, '');
    let base = this.baseUrl;

    // Prevent duplicate /api/api if both base and endpoint have /api
    if (base.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
      cleanEndpoint = cleanEndpoint.substring(4);
    } else if (!base.endsWith('/api') && !cleanEndpoint.startsWith('api/') && !cleanEndpoint.startsWith('http')) {
      cleanEndpoint = `api/${cleanEndpoint}`;
    }

    const urlStr = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${base}/${cleanEndpoint}`;
    const url = new URL(urlStr);

    // Append search params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    };

    if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          (errorBody && (errorBody.message || errorBody.error)) ||
          `API Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout / 1000}s`);
      }
      throw error;
    }
  }

  get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, { method: 'GET', params, ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'POST', data, ...options });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'PUT', data, ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
