import apiClient from '../apis/apiClient';
import {User, UserInfoResponse} from '../types/userType';

// ✅ Cập nhật interface để đồng bộ với backend structure
interface UserProfileResponse extends UserInfoResponse {
  user?: User; // Giữ nguyên field này để backward compatibility
}

interface UsersListResponse {
  success: boolean;
  timestamp: string;
  data: {
    users: User[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
  message?: string;
  error?: string;
}

// Interface cho search users params
interface SearchUsersParams {
  query?: string;
  role?: 'student' | 'teacher' | 'admin';
  page?: number;
  limit?: number;
  status?: 'online' | 'offline';
}

export const userService = {
  // Lấy thông tin người dùng
  getUserById: async (id: string): Promise<UserProfileResponse> => {
    try {
      return await apiClient.get<UserProfileResponse>(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin người dùng theo userID
  getUserByUserID: async (userID: string): Promise<UserProfileResponse> => {
    try {
      return await apiClient.get<UserProfileResponse>(
        `/users/userID/${userID}`,
      );
    } catch (error) {
      throw error;
    }
  },

  getAllUsers: async (): Promise<UsersListResponse> => {
    try {
      return await apiClient.get<UsersListResponse>('/users');
    } catch (error) {
      throw error;
    }
  },

  // ✅ THÊM MỚI: Lấy danh sách users với pagination
  getUsersWithPagination: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<UsersListResponse> => {
    try {
      return await apiClient.get<UsersListResponse>(
        `/users?page=${page}&limit=${limit}`,
      );
    } catch (error) {
      throw error;
    }
  },

  // ✅ THÊM MỚI: Tìm kiếm users
  searchUsers: async (
    params: SearchUsersParams,
  ): Promise<UsersListResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.query) queryParams.append('search', params.query);
      if (params.role) queryParams.append('role', params.role);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/users/search?${queryString}`
        : '/users/search';

      return await apiClient.get<UsersListResponse>(endpoint);
    } catch (error) {
      throw error;
    }
  },

  // ✅ THÊM MỚI: Lấy users theo role
  getUsersByRole: async (
    role: 'student' | 'teacher' | 'admin',
  ): Promise<UsersListResponse> => {
    try {
      return await apiClient.get<UsersListResponse>(`/users?role=${role}`);
    } catch (error) {
      throw error;
    }
  },

  // ✅ THÊM MỚI: Lấy users online
  getOnlineUsers: async (): Promise<UsersListResponse> => {
    try {
      return await apiClient.get<UsersListResponse>('/users?status=online');
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUserProfile: async (
    id: string,
    profileData: any,
  ): Promise<UserProfileResponse> => {
    try {
      return await apiClient.put<UserProfileResponse>(
        `/users/${id}`,
        profileData,
      );
    } catch (error) {
      throw error;
    }
  },

  // Thay đổi mật khẩu
  changePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<UserProfileResponse> => {
    try {
      return await apiClient.post<UserProfileResponse>(
        '/users/change-password',
        {
          currentPassword,
          newPassword,
        },
      );
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật ảnh đại diện
  updateUserAvatar: async (
    id: string,
    imageData: FormData,
  ): Promise<UserProfileResponse> => {
    try {
      return await apiClient.upload<UserProfileResponse>(
        `/users/avatar`,
        imageData,
      );
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật FCM token cho thông báo
  updateFCMToken: async (fcmToken: string): Promise<UserProfileResponse> => {
    try {
      return await apiClient.patch<UserProfileResponse>('/users/fcm-token', {
        fcmToken,
      });
    } catch (error) {
      throw error;
    }
  },
};
