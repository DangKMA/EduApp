import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appInfo} from '../constants/appInfo';

// Cấu hình axios instance
const axiosInstance = axios.create({
  baseURL: appInfo.BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor cho request - tự động thêm token
axiosInstance.interceptors.request.use(
  async config => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (authData) {
        const parsedData = JSON.parse(authData);
        if (parsedData.token) {
          config.headers.Authorization = `Bearer ${parsedData.token}`;
        }
      }
      return config;
    } catch (error) {
      'Error setting auth token:', error;
      return config;
    }
  },
  error => {
    return Promise.reject(error);
  },
);

// Interceptor cho response - xử lý lỗi và trích xuất dữ liệu
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về dữ liệu từ response
    return response.data;
  },
  async error => {
    const originalRequest = error.config;

    // Xử lý token hết hạn (401)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Thực hiện refresh token hoặc đăng xuất ở đây
      // Ví dụ: await refreshToken();

      // Xóa token nếu không thể refresh
      await AsyncStorage.removeItem('auth');

      // Trả về lỗi để ứng dụng có thể xử lý (như chuyển đến màn hình đăng nhập)
      return Promise.reject(error);
    }

    // Xử lý các lỗi khác
    return Promise.reject({
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        'Đã xảy ra lỗi khi kết nối với máy chủ',
      data: error.response?.data,
    });
  },
);

// Object chính để thực hiện các HTTP request
const apiClient = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<T> => {
    const config: AxiosRequestConfig = {params};
    return axiosInstance.get(url, config);
  },

  // POST request
  post: async <T>(
    url: string,
    data?: any,
    p0?: {headers: {'Content-Type': string}},
  ): Promise<T> => {
    return axiosInstance.post(url, data);
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.put(url, data);
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    return axiosInstance.patch(url, data);
  },

  // DELETE request
  delete: async <T>(url: string, data?: any): Promise<T> => {
    const config: AxiosRequestConfig = {data};
    return axiosInstance.delete(url, config);
  },

  // Upload file với FormData
  upload: async <T>(url: string, formData: FormData): Promise<T> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return axiosInstance.post(url, formData, config);
  },
};

export default apiClient;
