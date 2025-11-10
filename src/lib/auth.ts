import apiClient from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'dme_admin' | 'hospice_nurse' | 'driver';
  hospice_id?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, access_token };
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};
