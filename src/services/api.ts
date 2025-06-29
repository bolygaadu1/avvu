const API_BASE_URL = window.location.origin;

export interface Order {
  orderId: string;
  fullName: string;
  phoneNumber: string;
  printType: string;
  bindingColorType?: string;
  copies?: number;
  paperSize?: string;
  printSide?: string;
  selectedPages?: string;
  colorPages?: string;
  bwPages?: string;
  specialInstructions?: string;
  orderDate: string;
  status: string;
  totalCost: number;
  files: Array<{
    name: string;
    size: number;
    type: string;
    path?: string;
  }>;
}

export interface OrderFormData {
  fullName: string;
  phoneNumber: string;
  printType: string;
  bindingColorType?: string;
  copies?: number;
  paperSize?: string;
  printSide?: string;
  selectedPages?: string;
  colorPages?: string;
  bwPages?: string;
  specialInstructions?: string;
  totalCost: number;
}

class ApiService {
  private sessionId: string | null = null;

  constructor() {
    this.sessionId = localStorage.getItem('adminSessionId');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const headers: Record<string, string> = {};

    // Only add Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    // Add custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.sessionId) {
      headers['sessionId'] = this.sessionId;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Admin authentication
  async adminLogin(username: string, password: string) {
    const response = await this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      this.sessionId = response.sessionId;
      localStorage.setItem('adminSessionId', response.sessionId);
      localStorage.setItem('adminLoggedIn', 'true');
    }

    return response;
  }

  async verifyAdminSession() {
    if (!this.sessionId) {
      return { valid: false };
    }

    try {
      const response = await this.request('/admin/verify', {
        method: 'POST',
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
      
      if (!response.valid) {
        this.logout();
      }
      
      return response;
    } catch (error) {
      this.logout();
      return { valid: false };
    }
  }

  logout() {
    this.sessionId = null;
    localStorage.removeItem('adminSessionId');
    localStorage.removeItem('adminLoggedIn');
  }

  // Orders
  async submitOrder(orderData: OrderFormData, files: File[]) {
    const formData = new FormData();
    formData.append('orderData', JSON.stringify(orderData));
    
    files.forEach(file => {
      formData.append('files', file);
    });

    const url = `${API_BASE_URL}/api/orders`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Failed to submit order');
    }

    return response.json();
  }

  async getAllOrders(): Promise<Order[]> {
    return this.request('/orders');
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async clearAllOrders() {
    return this.request('/orders', {
      method: 'DELETE',
    });
  }

  // Files
  getFileDownloadUrl(filename: string) {
    return `${API_BASE_URL}/api/files/${filename}`;
  }
}

export const apiService = new ApiService();