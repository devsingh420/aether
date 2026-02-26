import { STORAGE_KEYS } from '../data/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.token);
    } catch {
      return null;
    }
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || 'Request failed');
      error.status = response.status;
      error.code = data.error?.code;
      error.errors = data.error?.errors;
      throw error;
    }

    return data;
  }

  // Auth endpoints
  async register(input) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: input,
    });
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    const data = await this.request('/auth/refresh', { method: 'POST' });
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }

  getLineLoginUrl() {
    return `${this.baseUrl}/auth/line`;
  }

  // Products endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async getProductsByCategory(category, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products/category/${category}${queryString ? `?${queryString}` : ''}`);
  }

  async getRelatedProducts(productId, limit = 4) {
    return this.request(`/products/${productId}/related?limit=${limit}`);
  }

  async getCategories() {
    return this.request('/products/meta/categories');
  }

  async checkStock(productId, quantity) {
    return this.request(`/products/${productId}/stock?quantity=${quantity}`);
  }

  // Farms endpoints
  async getFarms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farms${queryString ? `?${queryString}` : ''}`);
  }

  async getFarm(id) {
    return this.request(`/farms/${id}`);
  }

  async getFarmBySlug(slug) {
    return this.request(`/farms/slug/${slug}`);
  }

  async getFarmProducts(farmId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farms/${farmId}/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProvinces() {
    return this.request('/farms/meta/provinces');
  }

  // Market trends
  async getMarketTrends() {
    return this.request('/market/trends');
  }

  // Orders endpoints
  async createOrder(input) {
    return this.request('/orders', {
      method: 'POST',
      body: input,
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async getOrderByNumber(orderNumber) {
    return this.request(`/orders/number/${orderNumber}`);
  }

  async cancelOrder(id) {
    return this.request(`/orders/${id}/cancel`, { method: 'PATCH' });
  }

  // Inquiries endpoints
  async createInquiry(input) {
    return this.request('/inquiries', {
      method: 'POST',
      body: input,
    });
  }

  async getInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inquiries${queryString ? `?${queryString}` : ''}`);
  }

  async getInquiry(id) {
    return this.request(`/inquiries/${id}`);
  }

  async updateInquiry(id, input) {
    return this.request(`/inquiries/${id}`, {
      method: 'PATCH',
      body: input,
    });
  }

  async addInquiryMessage(id, message) {
    return this.request(`/inquiries/${id}/messages`, {
      method: 'POST',
      body: { message },
    });
  }

  // Payments endpoints
  async getPaymentConfig() {
    return this.request('/payments/config');
  }

  async createPromptPayPayment(orderId) {
    return this.request('/payments/promptpay', {
      method: 'POST',
      body: { orderId },
    });
  }

  async createCardPayment(orderId) {
    return this.request('/payments/card', {
      method: 'POST',
      body: { orderId },
    });
  }

  async getPaymentStatus(orderId) {
    return this.request(`/payments/${orderId}/status`);
  }

  // Notifications endpoints
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  // Farm dashboard endpoints
  async getFarmDashboard() {
    return this.request('/farm/dashboard');
  }

  async getFarmProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farm/products${queryString ? `?${queryString}` : ''}`);
  }

  async createFarmProduct(input) {
    return this.request('/farm/products', {
      method: 'POST',
      body: input,
    });
  }

  async updateFarmProduct(id, input) {
    return this.request(`/farm/products/${id}`, {
      method: 'PATCH',
      body: input,
    });
  }

  async updateInventory(productId, stock) {
    return this.request(`/farm/inventory/${productId}`, {
      method: 'PATCH',
      body: { stock },
    });
  }

  async getFarmOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farm/orders${queryString ? `?${queryString}` : ''}`);
  }

  async updateFarmOrder(orderId, status, trackingNumber) {
    return this.request(`/farm/orders/${orderId}`, {
      method: 'PATCH',
      body: { status, trackingNumber },
    });
  }

  async getFarmInquiries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farm/inquiries${queryString ? `?${queryString}` : ''}`);
  }

  async respondToInquiry(inquiryId, action, counterPrice, message) {
    return this.request(`/farm/inquiries/${inquiryId}/respond`, {
      method: 'POST',
      body: { action, counterPrice, message },
    });
  }

  async getFarmPayouts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/farm/payouts${queryString ? `?${queryString}` : ''}`);
  }

  async getPayoutSummary() {
    return this.request('/farm/payouts/summary');
  }
}

export const api = new ApiClient();
export default api;
