import apiClient from '../apis/apiClient';

/**
 * Interface cho API Response - CẬP NHẬT để đồng bộ với backend structure
 * Bao gồm timestamp field từ backend response
 */
interface ApiResponse<T> {
  success: boolean;
  timestamp: string; // Thêm timestamp field
  data?: T; // Thay đổi từ data: T thành data?: T để phù hợp với backend
  message: string; // Thay đổi từ optional thành required
  error?: string; // Giữ nguyên optional
}

// ✅ Cập nhật interface để đồng bộ với backend structure
interface PasswordResetResponse extends ApiResponse<any> {}

const API_PATH = '/auth';

export const passwordService = {
  // Yêu cầu đặt lại mật khẩu
  requestPasswordReset: async (
    email: string,
  ): Promise<PasswordResetResponse> => {
    try {
      return await apiClient.post<PasswordResetResponse>(
        `${API_PATH}/request-password-reset`,
        {email},
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Không thể gửi mã OTP',
        error: err.message || 'Không thể gửi mã OTP',
      };
    }
  },

  // Xác minh mã OTP
  verifyOTP: async (
    email: string,
    otp: string,
  ): Promise<PasswordResetResponse> => {
    try {
      return await apiClient.post<PasswordResetResponse>(
        `${API_PATH}/verify-otp`,
        {email, otp},
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Không thể xác minh mã OTP',
        error: err.message || 'Không thể xác minh mã OTP',
      };
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<PasswordResetResponse> => {
    try {
      return await apiClient.post<PasswordResetResponse>(
        `${API_PATH}/reset-password`,
        {email, otp, newPassword},
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Không thể đặt lại mật khẩu',
        error: err.message || 'Không thể đặt lại mật khẩu',
      };
    }
  },
};
