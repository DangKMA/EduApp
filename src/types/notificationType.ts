/**
 * Interface cho API Response - CẬP NHẬT để đồng bộ với backend structure
 * Bao gồm timestamp field từ backend response
 */
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string; // Thêm timestamp field
  data?: T; // Thay đổi từ data: T thành data?: T để phù hợp với backend
  message: string; // Thay đổi từ optional thành required
  error?: string; // Giữ nguyên optional
}

// Notification types
export type NotificationType =
  | 'announcement'
  | 'academic'
  | 'event'
  | 'urgent'
  | 'assignment'
  | 'grade'
  | 'attendance'
  | 'schedule'
  | 'system'
  | 'reminder';

export type NotificationUiType =
  | 'school'
  | 'teacher'
  | 'deadline'
  | 'system'
  | 'personal';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 'sent' | 'delivered' | 'read' | 'archived';

// Core Notification interface - enhanced
export interface Notification {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
  type: NotificationType;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  isImportant?: boolean;
  isPinned?: boolean;
  expiryDate?: string;
  sender?: {
    _id: string;
    fullName: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
  recipient?: {
    _id: string;
    fullName: string;
    email?: string;
  };
  relatedTo?: {
    type: 'course' | 'assignment' | 'grade' | 'schedule' | 'attendance';
    id: string;
    name?: string;
  };
  actionUrl?: string; // Deep link to related content
  metadata?: {
    [key: string]: any;
  };
}

// Notification creation parameters
export interface CreateNotificationParams {
  title: string;
  content: string;
  type: NotificationType;
  priority?: NotificationPriority;
  isImportant?: boolean;
  isPinned?: boolean;
  expiryDate?: string;
  recipientIds?: string[]; // For targeted notifications
  recipientType?:
    | 'all'
    | 'students'
    | 'teachers'
    | 'admins'
    | 'course_students';
  courseId?: string; // For course-specific notifications
  relatedTo?: {
    type: 'course' | 'assignment' | 'grade' | 'schedule' | 'attendance';
    id: string;
    name?: string;
  };
  actionUrl?: string;
  metadata?: {
    [key: string]: any;
  };
}

// Notification update parameters
export interface UpdateNotificationParams {
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  isImportant?: boolean;
  isPinned?: boolean;
  expiryDate?: string;
  actionUrl?: string;
  metadata?: {
    [key: string]: any;
  };
}

// Query parameters for fetching notifications
export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  isImportant?: boolean;
  isPinned?: boolean;
  startDate?: string;
  endDate?: string;
  senderId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Filter parameters for notifications
export interface NotificationFilterParams {
  types?: NotificationType[];
  priorities?: NotificationPriority[];
  isRead?: boolean;
  isImportant?: boolean;
  isPinned?: boolean;
  hasExpiry?: boolean;
  isExpired?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// API Response interfaces - CẬP NHẬT
export interface NotificationResponse extends ApiResponse<Notification[]> {
  totalCount?: number;
  unreadCount?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface SingleNotificationResponse extends ApiResponse<Notification> {}

export interface CreateNotificationResponse extends ApiResponse<Notification> {}

export interface UpdateNotificationResponse extends ApiResponse<Notification> {}

export interface DeleteNotificationResponse extends ApiResponse<null> {}

export interface MarkReadResponse
  extends ApiResponse<{
    modifiedCount: number;
    notificationIds: string[];
  }> {}

export interface MarkAllReadResponse
  extends ApiResponse<{
    modifiedCount: number;
  }> {}

export interface NotificationStatsResponse
  extends ApiResponse<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    recent: number; // Last 24 hours
  }> {}

// Bulk operations
export interface BulkNotificationParams {
  notificationIds: string[];
}

export interface BulkMarkReadParams extends BulkNotificationParams {}

export interface BulkDeleteParams extends BulkNotificationParams {}

export interface BulkArchiveParams extends BulkNotificationParams {}

export interface BulkNotificationResponse
  extends ApiResponse<{
    successful: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  }> {}

// Push notification interfaces
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  sound?: string;
  data?: {
    notificationId: string;
    type: NotificationType;
    actionUrl?: string;
    [key: string]: any;
  };
}

export interface SendPushNotificationParams {
  userIds: string[];
  payload: PushNotificationPayload;
  scheduleTime?: string; // For scheduled notifications
}

export interface SendPushNotificationResponse
  extends ApiResponse<{
    sent: number;
    failed: number;
    details: Array<{
      userId: string;
      success: boolean;
      error?: string;
    }>;
  }> {}

// Real-time notification interfaces
export interface NotificationUpdate {
  type: 'new' | 'read' | 'deleted' | 'updated';
  notification: Notification;
  userId: string;
}

// Notification preferences
export interface NotificationPreferences {
  _id: string;
  userId: string;
  emailNotifications: {
    enabled: boolean;
    types: NotificationType[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  pushNotifications: {
    enabled: boolean;
    types: NotificationType[];
    quietHours?: {
      start: string; // HH:MM
      end: string; // HH:MM
    };
  };
  inAppNotifications: {
    enabled: boolean;
    types: NotificationType[];
    showPreview: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesParams {
  emailNotifications?: {
    enabled?: boolean;
    types?: NotificationType[];
    frequency?: 'immediate' | 'daily' | 'weekly';
  };
  pushNotifications?: {
    enabled?: boolean;
    types?: NotificationType[];
    quietHours?: {
      start: string;
      end: string;
    };
  };
  inAppNotifications?: {
    enabled?: boolean;
    types?: NotificationType[];
    showPreview?: boolean;
  };
}

export interface NotificationPreferencesResponse
  extends ApiResponse<NotificationPreferences> {}

export interface UpdateNotificationPreferencesResponse
  extends ApiResponse<NotificationPreferences> {}

// Error response interface - CẬP NHẬT
export interface NotificationErrorResponse {
  success: false;
  timestamp: string; // Thêm timestamp field
  message: string; // Thay đổi từ optional thành required
  error?: string;
  statusCode?: number;
}

// Union type cho tất cả response có thể nhận được
export type NotificationApiResponse<T> =
  | ApiResponse<T>
  | NotificationErrorResponse;

// Type guards
export const isNotificationErrorResponse = (
  response: any,
): response is NotificationErrorResponse => {
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

export const isValidNotificationType = (
  type: string,
): type is NotificationType => {
  return [
    'announcement',
    'academic',
    'event',
    'urgent',
    'assignment',
    'grade',
    'attendance',
    'schedule',
    'system',
    'reminder',
  ].includes(type);
};

export const isValidNotificationPriority = (
  priority: string,
): priority is NotificationPriority => {
  return ['low', 'normal', 'high', 'urgent'].includes(priority);
};

// Helper functions
export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    announcement: '📢',
    academic: '📚',
    event: '📅',
    urgent: '🚨',
    assignment: '📝',
    grade: '📊',
    attendance: '✅',
    schedule: '🕐',
    system: '⚙️',
    reminder: '⏰',
  };
  return iconMap[type] || '📬';
};

export const getNotificationColor = (
  type: NotificationType,
  priority?: NotificationPriority,
): string => {
  if (priority === 'urgent') return '#ff4444';
  if (priority === 'high') return '#ff8800';

  const colorMap: Record<NotificationType, string> = {
    announcement: '#2196F3',
    academic: '#4CAF50',
    event: '#FF9800',
    urgent: '#F44336',
    assignment: '#9C27B0',
    grade: '#3F51B5',
    attendance: '#00BCD4',
    schedule: '#795548',
    system: '#607D8B',
    reminder: '#FFC107',
  };
  return colorMap[type] || '#757575';
};

export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInMs = now.getTime() - notificationTime.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return notificationTime.toLocaleDateString('vi-VN');
};
