import apiClient from '../apis/apiClient';
import {
  ChatListItem,
  FormattedMessage,
  ChatApiResponse,
  SendMessageParams,
  SendMessageResponse,
  CreateChatResponse,
  CheckExistingChatResponse,
  DeleteChatResponse,
  MarkAsReadResponse,
  UploadChatFileResponse,
  UploadFileData,
  ChatStatsResponse,
  CleanupOldFilesResponse,
  FileValidation,
  FileType,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '../types/chatType';

export const chatService = {
  // Lấy danh sách các cuộc trò chuyện
  getChats: async (): Promise<ChatApiResponse<ChatListItem[]>> => {
    try {
      return await apiClient.get<ChatApiResponse<ChatListItem[]>>('/chats');
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi tải danh sách cuộc trò chuyện',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Lấy tin nhắn với phân trang
  getChatMessages: async (
    chatId: string,
    limit: number = 50,
    lastMessageId?: string,
  ): Promise<ChatApiResponse<FormattedMessage[]>> => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(lastMessageId && {lastMessageId}),
      });

      return await apiClient.get<ChatApiResponse<FormattedMessage[]>>(
        `/chats/${chatId}/messages?${params.toString()}`,
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi tải tin nhắn',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Tạo cuộc trò chuyện mới với interface mới
  createChat: async (targetUserId: string): Promise<CreateChatResponse> => {
    try {
      return await apiClient.post<CreateChatResponse>('/chats', {
        targetUserId,
      });
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi tạo cuộc trò chuyện',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Gửi tin nhắn với file support đầy đủ
  sendMessage: async (
    params: SendMessageParams,
  ): Promise<SendMessageResponse> => {
    try {
      const {chatId, ...messageData} = params;

      // Validate input
      if (!messageData.content && !messageData.file) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Vui lòng cung cấp nội dung tin nhắn hoặc tệp đính kèm',
          error: 'MISSING_CONTENT',
        };
      }

      return await apiClient.post<SendMessageResponse>(
        `/chats/${chatId}/messages`,
        messageData,
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi gửi tin nhắn',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Đánh dấu tin nhắn đã đọc với response type
  markMessagesAsRead: async (chatId: string): Promise<MarkAsReadResponse> => {
    try {
      return await apiClient.put<MarkAsReadResponse>(
        `/chats/${chatId}/read`,
        {},
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi đánh dấu tin nhắn đã đọc',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Xóa cuộc trò chuyện với cleanup files
  deleteChat: async (chatId: string): Promise<DeleteChatResponse> => {
    try {
      return await apiClient.delete<DeleteChatResponse>(`/chats/${chatId}`);
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi xóa cuộc trò chuyện',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Upload file với enhanced response
  uploadChatMedia: async (
    chatId: string,
    formData: FormData,
  ): Promise<UploadChatFileResponse> => {
    try {
      return await apiClient.upload<UploadChatFileResponse>(
        `/chats/${chatId}/upload`,
        formData,
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi tải lên file',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Check existing chat với response type
  checkExistingChat: async (
    userId: string,
  ): Promise<CheckExistingChatResponse> => {
    try {
      return await apiClient.get<CheckExistingChatResponse>(
        `/chats/check-existing/${userId}`,
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi kiểm tra cuộc trò chuyện',
        error: error.message,
      };
    }
  },

  // ✅ THÊM MỚI: Lấy thống kê chat
  getChatStats: async (chatId: string): Promise<ChatStatsResponse> => {
    try {
      return await apiClient.get<ChatStatsResponse>(`/chats/${chatId}/stats`);
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi lấy thống kê cuộc trò chuyện',
        error: error.message,
      };
    }
  },

  // ✅ THÊM MỚI: Cleanup old files
  cleanupOldFiles: async (): Promise<CleanupOldFilesResponse> => {
    try {
      return await apiClient.post<CleanupOldFilesResponse>(
        '/chats/cleanup-old-files',
        {},
      );
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.response?.data?.message ||
          error.message ||
          'Đã xảy ra lỗi khi dọn dẹp files cũ',
        error: error.message,
      };
    }
  },

  // ✅ CẬP NHẬT: Enhanced message validation
  validateMessage: (
    content?: string,
    file?: string,
  ): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // At least one of content or file must be provided
    if ((!content || content.trim().length === 0) && !file) {
      errors.push('Vui lòng cung cấp nội dung tin nhắn hoặc tệp đính kèm');
    }

    // Content validation
    if (content) {
      if (content.length > 1000) {
        errors.push('Nội dung tin nhắn không được vượt quá 1000 ký tự');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // ✅ CẬP NHẬT: Enhanced file validation theo backend
  validateFileType: (file: File): FileValidation => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return {
        isValid: false,
        error:
          'Loại file không được hỗ trợ. Chỉ chấp nhận: ảnh, PDF, Word, Excel, PowerPoint, Text, ZIP, RAR',
      };
    }

    // Check file size (20MB theo backend)
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'File không được vượt quá 20MB',
      };
    }

    // Determine file type
    let fileType: FileType = FileType.FILE;
    if (file.type.startsWith('image/')) {
      fileType = FileType.IMAGE;
    } else if (file.type === 'application/pdf') {
      fileType = FileType.PDF;
    } else if (
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      fileType = FileType.DOCUMENT;
    } else if (
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      fileType = FileType.SPREADSHEET;
    } else if (
      file.type === 'application/vnd.ms-powerpoint' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      fileType = FileType.PRESENTATION;
    } else if (file.type === 'text/plain' || file.type === 'text/csv') {
      fileType = FileType.TEXT;
    } else if (
      file.type === 'application/zip' ||
      file.type === 'application/x-rar-compressed'
    ) {
      fileType = FileType.ARCHIVE;
    }

    return {
      isValid: true,
      fileType,
    };
  },

  // ✅ CẬP NHẬT: Enhanced file type detection
  getFileType: (mimeType: string): FileType => {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType === 'application/pdf') return FileType.PDF;
    if (
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return FileType.DOCUMENT;
    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
      return FileType.SPREADSHEET;
    if (
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )
      return FileType.PRESENTATION;
    if (mimeType === 'text/plain' || mimeType === 'text/csv')
      return FileType.TEXT;
    if (
      mimeType === 'application/zip' ||
      mimeType === 'application/x-rar-compressed'
    )
      return FileType.ARCHIVE;
    return FileType.FILE;
  },

  // Format thời gian tin nhắn
  formatMessageTime: (timestamp: string | Date): string => {
    try {
      const date =
        typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) {
        return 'Vừa xong';
      } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays === 1) {
        return 'Hôm qua';
      } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN');
      }
    } catch (err) {
      return typeof timestamp === 'string' ? timestamp : timestamp.toString();
    }
  },

  // Tạo preview cho file upload
  createFilePreview: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Không thể tạo preview'));
        reader.readAsDataURL(file);
      } else {
        resolve(''); // Non-image files don't need preview
      }
    });
  },

  // ✅ CẬP NHẬT: Format file size giống backend
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // ✅ THÊM MỚI: Helper để tạo FormData cho upload
  createUploadFormData: (file: File): FormData => {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  },

  // ✅ THÊM MỚI: Helper để tạo SendMessageParams với file
  createSendMessageParams: (
    chatId: string,
    content?: string,
    uploadData?: UploadFileData,
  ): SendMessageParams => {
    const params: SendMessageParams = {
      chatId,
    };

    if (content) {
      params.content = content;
    }

    if (uploadData) {
      params.file = uploadData.url;
      params.fileName = uploadData.name;
      params.fileSize = uploadData.size;
      params.fileType = uploadData.type;
      params.fileMimeType = uploadData.mimeType;
      params.thumbnail = uploadData.thumbnail || undefined;
    }

    return params;
  },

  // ✅ THÊM MỚI: Check if file is image
  isImageFile: (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  },

  // ✅ THÊM MỚI: Get file icon by type
  getFileIcon: (fileType: FileType): string => {
    const icons = {
      [FileType.IMAGE]: '📷',
      [FileType.PDF]: '📄',
      [FileType.DOCUMENT]: '📝',
      [FileType.SPREADSHEET]: '📊',
      [FileType.PRESENTATION]: '📋',
      [FileType.ARCHIVE]: '🗜️',
      [FileType.TEXT]: '📄',
      [FileType.FILE]: '📎',
    };
    return icons[fileType] || '📎';
  },
};

export default chatService;
