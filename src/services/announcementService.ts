import apiClient from '../apis/apiClient';
import {
  Announcement,
  AnnouncementFilterParams,
  AnnouncementListResponse,
  AnnouncementResponse,
  ApiResponse,
  CreateAnnouncementParams,
  CreateCourseAnnouncementParams,
  DeleteAnnouncementResponse,
  MarkAsReadResponse,
  UpdateAnnouncementParams,
} from '../types/announcementType';

const API_PATH = '/announcements';

export const announcementService = {
  // Lấy tất cả thông báo
  getAnnouncements: async (
    params?: AnnouncementFilterParams,
  ): Promise<AnnouncementListResponse> => {
    try {
      return await apiClient.get<AnnouncementListResponse>(API_PATH, params);
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải danh sách thông báo',
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        error: err.message || 'Đã xảy ra lỗi khi tải danh sách thông báo',
      };
    }
  },

  // Lấy thông báo theo id
  getAnnouncementById: async (id: string): Promise<AnnouncementResponse> => {
    try {
      return await apiClient.get<AnnouncementResponse>(`${API_PATH}/${id}`);
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông tin thông báo',
        data: {} as Announcement,
        error: err.message || 'Đã xảy ra lỗi khi tải thông tin thông báo',
      };
    }
  },

  // Tạo thông báo mới
  createAnnouncement: async (
    data: CreateAnnouncementParams,
  ): Promise<AnnouncementResponse> => {
    try {
      return await apiClient.post<AnnouncementResponse>(API_PATH, data);
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tạo thông báo',
        data: {} as Announcement,
        error: err.message || 'Đã xảy ra lỗi khi tạo thông báo',
      };
    }
  },

  // Tạo thông báo cho khóa học
  createCourseAnnouncement: async (
    data: CreateCourseAnnouncementParams,
  ): Promise<AnnouncementResponse> => {
    try {
      return await apiClient.post<AnnouncementResponse>(
        `${API_PATH}/course`,
        data,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tạo thông báo cho khóa học',
        data: {} as Announcement,
        error: err.message || 'Đã xảy ra lỗi khi tạo thông báo cho khóa học',
      };
    }
  },

  // Cập nhật thông báo
  updateAnnouncement: async (
    id: string,
    data: UpdateAnnouncementParams,
  ): Promise<AnnouncementResponse> => {
    try {
      return await apiClient.put<AnnouncementResponse>(
        `${API_PATH}/${id}`,
        data,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật thông báo',
        data: {} as Announcement,
        error: err.message || 'Đã xảy ra lỗi khi cập nhật thông báo',
      };
    }
  },

  // Xóa thông báo
  deleteAnnouncement: async (
    id: string,
  ): Promise<DeleteAnnouncementResponse> => {
    try {
      return await apiClient.delete<DeleteAnnouncementResponse>(
        `${API_PATH}/${id}`,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi xóa thông báo',
        data: null,
        error: err.message || 'Đã xảy ra lỗi khi xóa thông báo',
      };
    }
  },

  // Đánh dấu thông báo đã đọc
  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    try {
      return await apiClient.patch<MarkAsReadResponse>(
        `${API_PATH}/${id}/read`,
        {},
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc',
        data: {
          unreadCount: 0,
          announcementId: id,
        },
        error: err.message || 'Đã xảy ra lỗi khi đánh dấu thông báo đã đọc',
      };
    }
  },

  // Đánh dấu tất cả thông báo đã đọc
  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    try {
      return await apiClient.patch<MarkAsReadResponse>(
        `${API_PATH}/read-all`,
        {},
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message || 'Đã xảy ra lỗi khi đánh dấu tất cả thông báo đã đọc',
        data: {
          unreadCount: 0,
          announcementId: '',
        },
        error:
          err.message || 'Đã xảy ra lỗi khi đánh dấu tất cả thông báo đã đọc',
      };
    }
  },

  // Lấy thông báo cho khóa học
  getCourseAnnouncements: async (
    courseId: string,
    params?: AnnouncementFilterParams,
  ): Promise<AnnouncementListResponse> => {
    try {
      return await apiClient.get<AnnouncementListResponse>(
        `${API_PATH}/course/${courseId}`,
        params,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông báo khóa học',
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        error: err.message || 'Đã xảy ra lỗi khi tải thông báo khóa học',
      };
    }
  },

  // Tải lên tệp đính kèm
  uploadAttachment: async (
    formData: FormData,
  ): Promise<
    ApiResponse<{url: string; name: string; type: string; size: number}>
  > => {
    try {
      return await apiClient.upload<
        ApiResponse<{url: string; name: string; type: string; size: number}>
      >('/uploads/announcement', formData);
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lên tệp đính kèm',
        data: {
          url: '',
          name: '',
          type: '',
          size: 0,
        },
        error: err.message || 'Đã xảy ra lỗi khi tải lên tệp đính kèm',
      };
    }
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async (): Promise<ApiResponse<{unreadCount: number}>> => {
    try {
      return await apiClient.get<ApiResponse<{unreadCount: number}>>(
        `${API_PATH}/unread-count`,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message || 'Đã xảy ra lỗi khi lấy số lượng thông báo chưa đọc',
        data: {unreadCount: 0},
        error:
          err.message || 'Đã xảy ra lỗi khi lấy số lượng thông báo chưa đọc',
      };
    }
  },

  // Kiểm tra thông báo có phải của người dùng
  checkOwnership: async (
    id: string,
  ): Promise<ApiResponse<{isOwner: boolean}>> => {
    try {
      return await apiClient.get<ApiResponse<{isOwner: boolean}>>(
        `${API_PATH}/${id}/check-ownership`,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi kiểm tra quyền sở hữu',
        data: {isOwner: false},
        error: err.message || 'Đã xảy ra lỗi khi kiểm tra quyền sở hữu',
      };
    }
  },

  // Lấy thông báo chưa đọc
  getUnreadAnnouncements: async (
    params?: AnnouncementFilterParams,
  ): Promise<AnnouncementListResponse> => {
    try {
      return await apiClient.get<AnnouncementListResponse>(
        `${API_PATH}/unread`,
        params,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông báo chưa đọc',
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        unreadCount: 0,
        error: err.message || 'Đã xảy ra lỗi khi tải thông báo chưa đọc',
      };
    }
  },

  // Xóa nhiều thông báo
  bulkDeleteAnnouncements: async (
    ids: string[],
  ): Promise<ApiResponse<{deletedCount: number; deletedIds: string[]}>> => {
    try {
      return await apiClient.post<
        ApiResponse<{deletedCount: number; deletedIds: string[]}>
      >(`${API_PATH}/bulk-delete`, {ids});
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi xóa nhiều thông báo',
        data: {
          deletedCount: 0,
          deletedIds: [],
        },
        error: err.message || 'Đã xảy ra lỗi khi xóa nhiều thông báo',
      };
    }
  },

  // Lấy thông báo theo loại
  getAnnouncementsByType: async (
    type: string,
    params?: AnnouncementFilterParams,
  ): Promise<AnnouncementListResponse> => {
    try {
      return await apiClient.get<AnnouncementListResponse>(
        `${API_PATH}/type/${type}`,
        params,
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông báo theo loại',
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        error: err.message || 'Đã xảy ra lỗi khi tải thông báo theo loại',
      };
    }
  },

  // Tìm kiếm thông báo
  searchAnnouncements: async (
    searchQuery: string,
    params?: AnnouncementFilterParams,
  ): Promise<AnnouncementListResponse> => {
    try {
      return await apiClient.get<AnnouncementListResponse>(
        `${API_PATH}/search`,
        {
          ...params,
          search: searchQuery,
        },
      );
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tìm kiếm thông báo',
        data: [],
        total: 0,
        page: 1,
        pages: 0,
        error: err.message || 'Đã xảy ra lỗi khi tìm kiếm thông báo',
      };
    }
  },

  // ✅ Thêm utility methods

  // Validate dữ liệu thông báo
  validateAnnouncementData: (data: CreateAnnouncementParams): string[] => {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Tiêu đề thông báo là bắt buộc');
    }

    if (data.title && data.title.length > 200) {
      errors.push('Tiêu đề không được vượt quá 200 ký tự');
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Nội dung thông báo là bắt buộc');
    }

    if (data.content && data.content.length > 5000) {
      errors.push('Nội dung không được vượt quá 5000 ký tự');
    }

    if (!data.recipientType) {
      errors.push('Loại người nhận là bắt buộc');
    }

    if (data.recipientType === 'course' && !data.courseId) {
      errors.push('Mã khóa học là bắt buộc khi gửi cho khóa học');
    }

    if (
      data.recipientType === 'custom' &&
      (!data.recipients || data.recipients.length === 0)
    ) {
      errors.push('Danh sách người nhận là bắt buộc khi chọn gửi tùy chỉnh');
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        errors.push('Ngày hạn phải sau thời điểm hiện tại');
      }
    }

    return errors;
  },

  // Validate file upload
  validateAttachmentFile: (file: File): {isValid: boolean; error?: string} => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error:
          'Loại file không được hỗ trợ. Chỉ cho phép PDF, Word, hình ảnh và text.',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File không được vượt quá 10MB',
      };
    }

    return {isValid: true};
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format announcement date
  formatAnnouncementDate: (date: string | Date): string => {
    try {
      const announcementDate = new Date(date);
      const now = new Date();
      const diffInMs = now.getTime() - announcementDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) {
        return 'Vừa xong';
      }
      if (diffInHours < 24) {
        return `${diffInHours} giờ trước`;
      }
      if (diffInDays < 7) {
        return `${diffInDays} ngày trước`;
      }

      return announcementDate.toLocaleDateString('vi-VN');
    } catch (err) {
      return typeof date === 'string' ? date : date.toString();
    }
  },

  // Check if announcement is urgent
  isUrgentAnnouncement: (announcement: Announcement): boolean => {
    return announcement.type === 'urgent' || announcement.isImportant;
  },

  // Check if announcement is expired
  isAnnouncementExpired: (announcement: Announcement): boolean => {
    if (!announcement.expiresAt) {
      return false;
    }
    const expiryDate = new Date(announcement.expiresAt);
    const now = new Date();
    return now > expiryDate;
  },

  // Check if announcement is due soon
  isAnnouncementDueSoon: (
    announcement: Announcement,
    hoursThreshold: number = 24,
  ): boolean => {
    if (!announcement.dueDate) {
      return false;
    }
    const dueDate = new Date(announcement.dueDate);
    const now = new Date();
    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= hoursThreshold;
  },

  // Get announcement type color
  getAnnouncementTypeColor: (type: string): string => {
    const colorMap: Record<string, string> = {
      announcement: '#2196F3',
      academic: '#4CAF50',
      event: '#FF9800',
      urgent: '#F44336',
      assignment: '#9C27B0',
    };
    return colorMap[type] || '#757575';
  },

  // Get announcement type label
  getAnnouncementTypeLabel: (type: string): string => {
    const labelMap: Record<string, string> = {
      announcement: 'Thông báo',
      academic: 'Học tập',
      event: 'Sự kiện',
      urgent: 'Khẩn cấp',
      assignment: 'Bài tập',
    };
    return labelMap[type] || 'Không xác định';
  },

  // Filter announcements by criteria
  filterAnnouncements: (
    announcements: Announcement[],
    criteria: {
      unreadOnly?: boolean;
      type?: string;
      courseId?: string;
      isImportant?: boolean;
      searchQuery?: string;
    },
  ): Announcement[] => {
    return announcements.filter(announcement => {
      if (criteria.unreadOnly && announcement.isRead) {
        return false;
      }
      if (criteria.type && announcement.type !== criteria.type) {
        return false;
      }
      if (criteria.courseId && announcement.courseId !== criteria.courseId) {
        return false;
      }
      if (
        criteria.isImportant !== undefined &&
        announcement.isImportant !== criteria.isImportant
      ) {
        return false;
      }
      if (criteria.searchQuery) {
        const query = criteria.searchQuery.toLowerCase();
        const titleMatch = announcement.title.toLowerCase().includes(query);
        const contentMatch = announcement.content.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) {
          return false;
        }
      }
      return true;
    });
  },

  // Sort announcements
  sortAnnouncements: (
    announcements: Announcement[],
    sortBy: 'date' | 'type' | 'important' | 'title' = 'date',
    order: 'asc' | 'desc' = 'desc',
  ): Announcement[] => {
    return [...announcements].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'important':
          comparison = (a.isImportant ? 1 : 0) - (b.isImportant ? 1 : 0);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  },
};

export default announcementService;
