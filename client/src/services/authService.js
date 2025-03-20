import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class AuthService {
  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async login(masv, password) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        masv,
        password
      });

      if (response.data.success) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-token`, {
        token
      });
      return response.data.valid;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Thêm token vào header của mọi request
  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Xử lý response errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

const authService = new AuthService();
export default authService; 