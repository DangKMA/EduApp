import apiClient from '../apis/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserInfoResponse, User} from '../types/userType';

export interface AuthResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: {
    email: string;
    token: string;
    user: User;
  };
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: {
    email: string;
    otp?: string;
  };
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: any;
  error?: string;
}

export interface StatusResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: {
    status: 'online' | 'offline' | 'away';
  };
  error?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: {
    token: string;
  };
  error?: string;
}

// ✅ Interface cho profile check
export interface ProfileResponse {
  success: boolean;
  timestamp: string;
  message: string;
  data?: {
    user: User;
  };
  error?: string;
}

export const authService = {
  // Đăng nhập
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        await AsyncStorage.setItem(
          'auth',
          JSON.stringify({
            token: response.data.token,
            email: response.data.email,
          }),
        );

        if (response.data.user) {
          await AsyncStorage.setItem(
            'userInfo',
            JSON.stringify(response.data.user),
          );
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Đăng nhập không thành công',
        error: error?.message || 'Đăng nhập không thành công',
      };
    }
  },

  // Đăng xuất
  logout: async (): Promise<AuthResponse> => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (authData) {
        try {
          await apiClient.post('/auth/logout', {});
        } catch (logoutError) {
          // Silent fail cho API logout
        }
      }

      await AsyncStorage.removeItem('auth');
      await AsyncStorage.removeItem('userInfo');

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Đăng xuất thành công',
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Không thể đăng xuất',
        error: error?.message || 'Không thể đăng xuất',
      };
    }
  },

  // Lấy thông tin người dùng
  getUserInfo: async (): Promise<UserInfoResponse> => {
    try {
      const response = await apiClient.get<UserInfoResponse>('/users/profile');
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error?.message || 'Không thể lấy thông tin người dùng',
        error: error?.message || 'Không thể lấy thông tin người dùng',
      };
    }
  },

  // Quên mật khẩu - Gửi mã OTP
  requestPasswordReset: async (email: string): Promise<OTPResponse> => {
    try {
      const response = await apiClient.post<OTPResponse>(
        '/auth/request-password-reset',
        {email},
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Không thể gửi mã OTP',
        error: error.message || 'Không thể gửi mã OTP',
      };
    }
  },

  // Xác thực mã OTP
  verifyOTP: async (email: string, otp: string): Promise<OTPResponse> => {
    try {
      const response = await apiClient.post<OTPResponse>('/auth/verify-otp', {
        email,
        otp,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Mã OTP không hợp lệ',
        error: error.message || 'Mã OTP không hợp lệ',
      };
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<ResetPasswordResponse> => {
    try {
      const response = await apiClient.post<ResetPasswordResponse>(
        '/auth/reset-password',
        {
          email,
          otp,
          newPassword,
        },
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Không thể đặt lại mật khẩu',
        error: error.message || 'Không thể đặt lại mật khẩu',
      };
    }
  },

  // Cập nhật trạng thái online/offline/away
  updateStatus: async (
    status: 'online' | 'offline' | 'away',
  ): Promise<StatusResponse> => {
    try {
      const response = await apiClient.patch<StatusResponse>('/auth/status', {
        status,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Không thể cập nhật trạng thái',
        error: error.message || 'Không thể cập nhật trạng thái',
      };
    }
  },

  // Làm mới token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    try {
      const response = await apiClient.post<RefreshTokenResponse>(
        '/auth/refresh-token',
      );

      if (response.success && response.data?.token) {
        const authData = await AsyncStorage.getItem('auth');
        if (authData) {
          const parsedAuth = JSON.parse(authData);
          parsedAuth.token = response.data.token;
          await AsyncStorage.setItem('auth', JSON.stringify(parsedAuth));
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Không thể làm mới token',
        error: error.message || 'Không thể làm mới token',
      };
    }
  },

  // ✅ Kiểm tra token có hợp lệ không - Fixed TypeScript error
  checkAuthToken: async (): Promise<boolean> => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (!authData) return false;

      const parsedAuth = JSON.parse(authData);
      if (!parsedAuth.token) return false;

      // ✅ Thử gọi API để kiểm tra token với proper typing
      const response = await apiClient.get<ProfileResponse>('/auth/profile');
      return response?.success === true;
    } catch (error) {
      return false;
    }
  },

  // ✅ Lấy token từ AsyncStorage
  getAuthToken: async (): Promise<string | null> => {
    try {
      const authData = await AsyncStorage.getItem('auth');
      if (!authData) return null;

      const parsedAuth = JSON.parse(authData);
      return parsedAuth.token || null;
    } catch (error) {
      return null;
    }
  },

  // ✅ Lấy thông tin user từ AsyncStorage
  getCachedUserInfo: async (): Promise<User | null> => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (!userInfo) return null;

      return JSON.parse(userInfo) as User;
    } catch (error) {
      return null;
    }
  },

  // ✅ Xóa cache khi token hết hạn
  clearAuthCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('auth');
      await AsyncStorage.removeItem('userInfo');
    } catch (error) {
      // Silent fail
    }
  },
};
