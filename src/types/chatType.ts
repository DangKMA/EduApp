/**
 * Interface cho API Response - CẬP NHẬT để đồng bộ với backend structure
 * Bao gồm timestamp field từ backend response
 */
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data?: T;
  message: string;
  count?: number;
  error?: string;
}

export interface ChatParticipant {
  userId: string;
  userType: 'Student' | 'Teacher';
}

export interface ChatMessage {
  sender: {
    userId: string;
    userType: 'Student' | 'Teacher';
  };
  content?: string;
  file?: string;
  timestamp: Date | string;
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  createdAt: Date | string;
  isGroup?: boolean;
  name?: string;
}

// ✅ THÊM MỚI: Interface cho file trong tin nhắn (theo backend)
export interface MessageFile {
  url: string;
  name: string;
  size: number;
  type:
    | 'image'
    | 'pdf'
    | 'document'
    | 'spreadsheet'
    | 'presentation'
    | 'text'
    | 'archive'
    | 'file';
  mimeType: string;
  thumbnail?: string | null;
  sizeFormatted?: string;
  uploadedAt?: Date | string;
}

// ✅ CẬP NHẬT: Enhanced FormattedMessage với file support
export interface FormattedMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name?: string;
    avatar?: string;
  };
  image?: string | null; // GiftedChat compatibility
  file?: MessageFile | null; // ✅ THÊM MỚI: Enhanced file object
  read: boolean;
}

// ✅ CẬP NHẬT: Interface cho danh sách chat hiển thị
export interface ChatListItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  isGroup: boolean;
  participants: string[]; // array of user IDs
  userInfo: {
    id: string;
    studentId?: string;
    className?: string;
    role?: string;
    email?: string;
  };
}

// ✅ THÊM MỚI: Interface cho upload file response (theo backend)
export interface UploadFileData {
  url: string;
  name: string;
  size: number;
  type:
    | 'image'
    | 'pdf'
    | 'document'
    | 'spreadsheet'
    | 'presentation'
    | 'text'
    | 'archive'
    | 'file';
  mimeType: string;
  sizeFormatted: string;
  thumbnail?: string | null;
  uploadedAt: Date | string;
}

// ✅ CẬP NHẬT: Interface cho gửi tin nhắn với file support
export interface SendMessageParams {
  chatId: string;
  content?: string;
  file?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileMimeType?: string;
  thumbnail?: string;
}

// ✅ CẬP NHẬT: Interface cho response gửi tin nhắn
export interface SendMessageResponse
  extends ApiResponse<{
    messageId: string;
    message: {
      _id: string;
      content: string;
      sender: string;
      timestamp: Date;
      file?: string | null;
      fileName?: string | null;
      fileSize?: number | null;
      fileType?: string | null;
      thumbnail?: string | null;
    };
  }> {}

// ✅ THÊM MỚI: Interface cho chat statistics (theo backend)
export interface ChatStats {
  chatId: string;
  totalMessages: number;
  unreadMessages: number;
  filesCount: number;
  imagesCount: number;
  documentsCount: number;
  participantsCount: number;
}

// ✅ THÊM MỚI: Interface cho response thống kê chat
export interface ChatStatsResponse extends ApiResponse<ChatStats> {}

// Interface cho tạo chat mới
export interface CreateChatParams {
  targetUserId: string; // ✅ CẬP NHẬT: theo backend chỉ cần targetUserId
}

// ✅ CẬP NHẬT: Interface cho response tạo chat mới
export interface CreateChatResponse
  extends ApiResponse<{
    chatId: string;
    message: string;
  }> {}

// ✅ THÊM MỚI: Interface cho check existing chat
export interface CheckExistingChatResponse
  extends ApiResponse<{
    chatId: string;
  }> {}

// Interface cho response tin nhắn đã format
export interface FormattedMessagesResponse
  extends ApiResponse<FormattedMessage[]> {}

// Interface cho xóa chat
export interface DeleteChatResponse extends ApiResponse<null> {}

// ✅ CẬP NHẬT: Interface cho cập nhật trạng thái đọc tin nhắn
export interface MarkAsReadResponse
  extends ApiResponse<{
    chatId: string;
    messageIds: string[];
    readBy: string;
  }> {}

// ✅ CẬP NHẬT: Interface cho upload file trong chat
export interface UploadChatFileResponse extends ApiResponse<UploadFileData> {}

// Interface cho error response
export interface ChatErrorResponse {
  success: false;
  timestamp: string;
  message: string;
  error?: string;
  statusCode?: number;
}

// Union type cho tất cả response có thể nhận được
export type ChatApiResponse<T> = ApiResponse<T> | ChatErrorResponse;

// ✅ THÊM MỚI: Interface cho group chat (dành cho tương lai)
export interface GroupChat extends Chat {
  isGroup: true;
  name: string;
  adminIds: string[];
  memberCount: number;
  description?: string;
  avatar?: string;
}

// ✅ THÊM MỚI: Interface cho individual chat
export interface IndividualChat extends Chat {
  isGroup: false;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
}

// Union type cho chat
export type ChatType = GroupChat | IndividualChat;

// ✅ THÊM MỚI: File types enum (theo backend)
export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
  SPREADSHEET = 'spreadsheet',
  PRESENTATION = 'presentation',
  TEXT = 'text',
  ARCHIVE = 'archive',
  FILE = 'file',
}

// ✅ THÊM MỚI: File type icons mapping
export const FILE_TYPE_ICONS = {
  [FileType.IMAGE]: '📷',
  [FileType.PDF]: '📄',
  [FileType.DOCUMENT]: '📝',
  [FileType.SPREADSHEET]: '📊',
  [FileType.PRESENTATION]: '📋',
  [FileType.ARCHIVE]: '🗜️',
  [FileType.TEXT]: '📄',
  [FileType.FILE]: '📎',
} as const;

// ✅ THÊM MỚI: Allowed MIME types (theo backend fileFilter)
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
] as const;

// ✅ THÊM MỚI: Max file size (theo backend)
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// ✅ THÊM MỚI: Interface cho cleanup old files response
export interface CleanupOldFilesResponse extends ApiResponse<null> {}

// ✅ THÊM MỚI: Helper type để check file type
export type MimeType = (typeof ALLOWED_MIME_TYPES)[number];

// ✅ THÊM MỚI: Interface cho file validation
export interface FileValidation {
  isValid: boolean;
  error?: string;
  fileType?: FileType;
}
