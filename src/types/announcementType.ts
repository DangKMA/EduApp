import {User} from './userType';
import {Course} from './courseType';

/**
 * Interface cho API Response - CẬP NHẬT để đồng bộ với backend structure
 * Bao gồm timestamp field từ backend response
 */
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string; // Thêm timestamp field
  data?: T; // Thay đổi từ data: T thành data?: T để phù hợp với backend
  message: string; // Thay đổi từ optional thành required
  count?: number; // Giữ nguyên optional
  error?: string; // Giữ nguyên optional
}

// Loại thông báo
export type AnnouncementType =
  | 'announcement'
  | 'academic'
  | 'event'
  | 'urgent'
  | 'assignment';

// Loại người nhận
export type RecipientType =
  | 'all'
  | 'students'
  | 'teachers'
  | 'course'
  | 'custom';

// Role người nhận
export type RecipientRole = 'all' | 'student' | 'teacher' | 'admin';

// Interface cho attachment
export interface AnnouncementAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

// Interface cho model Announcement từ backend
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: AnnouncementType; // Sử dụng type alias thay vì string
  sender: string | User;
  recipients?: string[] | User[];
  role?: RecipientRole;
  courseId?: string | Course;
  isImportant: boolean;
  isRead: boolean; // Đây là trường đã được xử lý phía backend cho người dùng hiện tại
  dueDate?: string | Date | null;
  attachments?: AnnouncementAttachment[]; // Thay thế Array<{...}> bằng AnnouncementAttachment[]
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt?: string | Date;
}

// Interface để tạo thông báo mới
export interface CreateAnnouncementParams {
  title: string;
  content: string;
  type?: AnnouncementType; // Đảm bảo sử dụng AnnouncementType
  recipientType: RecipientType;
  courseId?: string;
  recipients?: string[];
  isImportant?: boolean;
  dueDate?: string | Date;
  attachments?: AnnouncementAttachment[]; // Sử dụng AnnouncementAttachment
}

// Interface để tạo thông báo khóa học
export interface CreateCourseAnnouncementParams {
  title: string;
  content: string;
  type?: AnnouncementType; // Đảm bảo sử dụng AnnouncementType
  courseId: string;
  isImportant?: boolean;
  dueDate?: string | Date;
  attachments?: AnnouncementAttachment[]; // Sử dụng AnnouncementAttachment
}

// Interface để cập nhật thông báo
export interface UpdateAnnouncementParams {
  title?: string;
  content?: string;
  type?: AnnouncementType; // Đây là chỗ đang gây lỗi, đảm bảo sử dụng AnnouncementType
  isImportant?: boolean;
  dueDate?: string | Date | null;
  attachments?: AnnouncementAttachment[]; // Sử dụng AnnouncementAttachment
}

// Interface cho filter params khi lấy danh sách thông báo
export interface AnnouncementFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: AnnouncementType | string; // Cho phép string hoặc AnnouncementType
  unread?: boolean;
  startDate?: string; // Thêm các trường filter cần thiết
  endDate?: string;
  courseId?: string;
}

// Interface cho phân trang
export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// CẬP NHẬT: Interface cho response khi lấy danh sách thông báo
export interface AnnouncementListResponse extends ApiResponse<Announcement[]> {
  total?: number;
  page?: number;
  pages?: number;
  unreadCount?: number;
}

// CẬP NHẬT: Interface cho response khi lấy chi tiết một thông báo
export interface AnnouncementResponse extends ApiResponse<Announcement> {}

// CẬP NHẬT: Interface cho response khi tạo thông báo mới
export interface CreateAnnouncementResponse extends ApiResponse<Announcement> {}

// CẬP NHẬT: Interface cho response khi cập nhật thông báo
export interface UpdateAnnouncementResponse extends ApiResponse<Announcement> {}

// CẬP NHẬT: Interface cho response khi đánh dấu thông báo đã đọc
export interface MarkAsReadResponse
  extends ApiResponse<{
    unreadCount: number;
    announcementId: string;
  }> {}

// CẬP NHẬT: Interface cho response khi xóa thông báo
export interface DeleteAnnouncementResponse extends ApiResponse<null> {}

// CẬP NHẬT: Interface cho response khi lấy thông báo chưa đọc
export interface UnreadAnnouncementsResponse
  extends ApiResponse<{
    announcements: Announcement[];
    unreadCount: number;
  }> {}

// CẬP NHẬT: Interface cho response khi lấy thông báo theo khóa học
export interface CourseAnnouncementsResponse
  extends ApiResponse<Announcement[]> {
  course?: {
    _id: string;
    name: string;
    code?: string;
  };
  total?: number;
  page?: number;
  pages?: number;
}

// CẬP NHẬT: Interface cho response khi đánh dấu tất cả đã đọc
export interface MarkAllAsReadResponse
  extends ApiResponse<{
    updatedCount: number;
    unreadCount: number;
  }> {}

// CẬP NHẬT: Interface cho response upload attachment
export interface UploadAttachmentResponse
  extends ApiResponse<AnnouncementAttachment> {}

// CẬP NHẬT: Interface cho response bulk delete
export interface BulkDeleteAnnouncementsResponse
  extends ApiResponse<{
    deletedCount: number;
    deletedIds: string[];
  }> {}

// CẬP NHẬT: Interface cho error response
export interface AnnouncementErrorResponse {
  success: false;
  timestamp: string; // Thêm timestamp field
  message: string; // Thay đổi từ optional thành required
  error?: string;
  statusCode?: number;
}

// Union type cho tất cả response có thể nhận được
export type AnnouncementApiResponse<T> =
  | ApiResponse<T>
  | AnnouncementErrorResponse;

// Type guards
export const isAnnouncementErrorResponse = (
  response: any,
): response is AnnouncementErrorResponse => {
  return response.success === false && typeof response.message === 'string';
};

export const isApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.timestamp === 'string' &&
    typeof response.message === 'string'
  );
};

export const isValidAnnouncementType = (
  type: string,
): type is AnnouncementType => {
  return ['announcement', 'academic', 'event', 'urgent', 'assignment'].includes(
    type,
  );
};

export const isValidRecipientType = (type: string): type is RecipientType => {
  return ['all', 'students', 'teachers', 'course', 'custom'].includes(type);
};

// Helper functions
export const getAnnouncementTypeColor = (type: AnnouncementType): string => {
  const colorMap: Record<AnnouncementType, string> = {
    announcement: '#2196F3',
    academic: '#4CAF50',
    event: '#FF9800',
    urgent: '#F44336',
    assignment: '#9C27B0',
  };
  return colorMap[type] || '#757575';
};

export const getAnnouncementTypeIcon = (type: AnnouncementType): string => {
  const iconMap: Record<AnnouncementType, string> = {
    announcement: '📢',
    academic: '📚',
    event: '📅',
    urgent: '🚨',
    assignment: '📝',
  };
  return iconMap[type] || '📬';
};

export const getAnnouncementTypeLabel = (type: AnnouncementType): string => {
  const labelMap: Record<AnnouncementType, string> = {
    announcement: 'Thông báo',
    academic: 'Học tập',
    event: 'Sự kiện',
    urgent: 'Khẩn cấp',
    assignment: 'Bài tập',
  };
  return labelMap[type] || 'Không xác định';
};

export const formatAnnouncementDate = (date: string | Date): string => {
  const announcementDate = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - announcementDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'Vừa xong';
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return announcementDate.toLocaleDateString('vi-VN');
};

export const isAnnouncementExpired = (announcement: Announcement): boolean => {
  if (!announcement.expiresAt) return false;
  const expiryDate = new Date(announcement.expiresAt);
  const now = new Date();
  return now > expiryDate;
};

export const isAnnouncementDueSoon = (
  announcement: Announcement,
  hoursThreshold: number = 24,
): boolean => {
  if (!announcement.dueDate) return false;
  const dueDate = new Date(announcement.dueDate);
  const now = new Date();
  const diffInMs = dueDate.getTime() - now.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= hoursThreshold;
};

// Constants
export const ANNOUNCEMENT_TYPES = {
  ANNOUNCEMENT: 'announcement' as const,
  ACADEMIC: 'academic' as const,
  EVENT: 'event' as const,
  URGENT: 'urgent' as const,
  ASSIGNMENT: 'assignment' as const,
} as const;

export const RECIPIENT_TYPES = {
  ALL: 'all' as const,
  STUDENTS: 'students' as const,
  TEACHERS: 'teachers' as const,
  COURSE: 'course' as const,
  CUSTOM: 'custom' as const,
} as const;

export const RECIPIENT_ROLES = {
  ALL: 'all' as const,
  STUDENT: 'student' as const,
  TEACHER: 'teacher' as const,
  ADMIN: 'admin' as const,
} as const;
