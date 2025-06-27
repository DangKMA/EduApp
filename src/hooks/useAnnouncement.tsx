import {useState, useCallback} from 'react';
import {useToast} from 'react-native-toast-notifications';
import {
  Announcement,
  AnnouncementFilterParams,
  AnnouncementListResponse,
  AnnouncementResponse,
  CreateAnnouncementParams,
  CreateCourseAnnouncementParams,
  UpdateAnnouncementParams,
  MarkAsReadResponse,
  DeleteAnnouncementResponse,
  ApiResponse,
} from '../types/announcementType';
import {announcementService} from '../services/announcementService';

export const useAnnouncement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const toast = useToast();

  // Lấy tất cả thông báo
  const getAnnouncements = useCallback(
    async (params?: AnnouncementFilterParams): Promise<Announcement[]> => {
      try {
        setLoading(true);

        const response: AnnouncementListResponse =
          await announcementService.getAnnouncements(params);

        if (response.success && response.data) {
          setAnnouncements(response.data);
          setPaginationInfo({
            total: response.total || 0,
            page: response.page || 1,
            pages: response.pages || 1,
          });
          if (response.unreadCount !== undefined) {
            setUnreadCount(response.unreadCount);
          }
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải danh sách thông báo',
            {
              type: 'danger',
            },
          );
          return [];
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy danh sách thông báo:', error);
        toast.show('Đã xảy ra lỗi khi tải danh sách thông báo', {
          type: 'danger',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Lấy chi tiết thông báo
  const getAnnouncementById = useCallback(
    async (id: string): Promise<Announcement | null> => {
      try {
        setLoading(true);

        const response: AnnouncementResponse =
          await announcementService.getAnnouncementById(id);

        if (response.success && response.data) {
          setAnnouncement(response.data);
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải chi tiết thông báo',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy chi tiết thông báo:', error);
        toast.show('Đã xảy ra lỗi khi tải chi tiết thông báo', {
          type: 'danger',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Tạo thông báo mới
  const createAnnouncement = useCallback(
    async (data: CreateAnnouncementParams): Promise<Announcement | null> => {
      try {
        setLoading(true);

        // Validate dữ liệu trước khi gửi
        const validationErrors =
          announcementService.validateAnnouncementData(data);
        if (validationErrors.length > 0) {
          toast.show(validationErrors[0], {type: 'danger'});
          return null;
        }

        const response: AnnouncementResponse =
          await announcementService.createAnnouncement(data);

        if (response.success && response.data) {
          toast.show(response.message || 'Tạo thông báo thành công', {
            type: 'success',
          });

          // Cập nhật danh sách thông báo
          setAnnouncements(prev => [response.data!, ...prev]);

          return response.data;
        } else {
          toast.show(
            response.error || response.message || 'Không thể tạo thông báo',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi tạo thông báo:', error);
        toast.show('Đã xảy ra lỗi khi tạo thông báo', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Tạo thông báo khóa học
  const createCourseAnnouncement = useCallback(
    async (
      data: CreateCourseAnnouncementParams,
    ): Promise<Announcement | null> => {
      try {
        setLoading(true);

        const response: AnnouncementResponse =
          await announcementService.createCourseAnnouncement(data);

        if (response.success && response.data) {
          toast.show(response.message || 'Tạo thông báo khóa học thành công', {
            type: 'success',
          });

          // Cập nhật danh sách thông báo
          setAnnouncements(prev => [response.data!, ...prev]);

          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tạo thông báo khóa học',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi tạo thông báo khóa học:', error);
        toast.show('Đã xảy ra lỗi khi tạo thông báo khóa học', {
          type: 'danger',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Cập nhật thông báo
  const updateAnnouncement = useCallback(
    async (
      id: string,
      data: UpdateAnnouncementParams,
    ): Promise<Announcement | null> => {
      try {
        setLoading(true);

        const response: AnnouncementResponse =
          await announcementService.updateAnnouncement(id, data);

        if (response.success && response.data) {
          toast.show(response.message || 'Cập nhật thông báo thành công', {
            type: 'success',
          });

          // Cập nhật thông báo trong danh sách
          setAnnouncements(prev =>
            prev.map(item => (item._id === id ? response.data! : item)),
          );

          // Cập nhật thông báo hiện tại nếu đang xem chi tiết
          if (announcement && announcement._id === id) {
            setAnnouncement(response.data);
          }

          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể cập nhật thông báo',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi cập nhật thông báo:', error);
        toast.show('Đã xảy ra lỗi khi cập nhật thông báo', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast, announcement],
  );

  // Xóa thông báo
  const deleteAnnouncement = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response: DeleteAnnouncementResponse =
          await announcementService.deleteAnnouncement(id);

        if (response.success) {
          toast.show(response.message || 'Xóa thông báo thành công', {
            type: 'success',
          });

          // Cập nhật lại state sau khi xóa
          setAnnouncements(prev => prev.filter(item => item._id !== id));

          return true;
        } else {
          toast.show(
            response.error || response.message || 'Không thể xóa thông báo',
            {
              type: 'danger',
            },
          );
          return false;
        }
      } catch (error: any) {
        console.error('Lỗi khi xóa thông báo:', error);
        toast.show('Đã xảy ra lỗi khi xóa thông báo', {type: 'danger'});
        return false;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Đánh dấu thông báo đã đọc
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const response: MarkAsReadResponse = await announcementService.markAsRead(
        id,
      );

      if (response.success && response.data) {
        // Cập nhật trạng thái đã đọc trong state
        setAnnouncements(prev =>
          prev.map(item => (item._id === id ? {...item, isRead: true} : item)),
        );

        // Cập nhật số lượng chưa đọc
        setUnreadCount(response.data.unreadCount);

        return true;
      } else {
        console.error(
          'Lỗi khi đánh dấu đã đọc:',
          response.error || response.message,
        );
        return false;
      }
    } catch (error: any) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);

      const response: MarkAsReadResponse =
        await announcementService.markAllAsRead();

      if (response.success) {
        // Cập nhật trạng thái đã đọc cho tất cả thông báo
        setAnnouncements(prev => prev.map(item => ({...item, isRead: true})));

        // Đặt số lượng chưa đọc về 0
        setUnreadCount(0);

        toast.show(
          response.message || 'Đã đánh dấu tất cả thông báo là đã đọc',
          {
            type: 'success',
          },
        );

        return true;
      } else {
        toast.show(
          response.error ||
            response.message ||
            'Không thể đánh dấu tất cả là đã đọc',
          {
            type: 'danger',
          },
        );
        return false;
      }
    } catch (error: any) {
      console.error('Lỗi khi đánh dấu tất cả thông báo là đã đọc:', error);
      toast.show('Đã xảy ra lỗi khi đánh dấu tất cả thông báo là đã đọc', {
        type: 'danger',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy thông báo khóa học
  const getCourseAnnouncements = useCallback(
    async (
      courseId: string,
      params?: AnnouncementFilterParams,
    ): Promise<Announcement[]> => {
      try {
        setLoading(true);

        const response: AnnouncementListResponse =
          await announcementService.getCourseAnnouncements(courseId, params);

        if (response.success && response.data) {
          setAnnouncements(response.data);
          setPaginationInfo({
            total: response.total || 0,
            page: response.page || 1,
            pages: response.pages || 1,
          });
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải thông báo khóa học',
            {
              type: 'danger',
            },
          );
          return [];
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy thông báo khóa học:', error);
        toast.show('Đã xảy ra lỗi khi tải thông báo khóa học', {
          type: 'danger',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Tải lên tệp đính kèm
  const uploadAttachment = useCallback(
    async (
      file: FormData,
    ): Promise<{
      url: string;
      name: string;
      type: string;
      size: number;
    } | null> => {
      try {
        setLoading(true);

        const response: ApiResponse<{
          url: string;
          name: string;
          type: string;
          size: number;
        }> = await announcementService.uploadAttachment(file);

        if (response.success && response.data) {
          toast.show(response.message || 'Tải lên tệp đính kèm thành công', {
            type: 'success',
          });
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải lên tệp đính kèm',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi tải lên tệp đính kèm:', error);
        toast.show('Đã xảy ra lỗi khi tải lên tệp đính kèm', {
          type: 'danger',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Lấy số lượng thông báo chưa đọc
  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      setLoading(true);

      const response: ApiResponse<{unreadCount: number}> =
        await announcementService.getUnreadCount();

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
        return response.data.unreadCount;
      } else {
        console.error(
          'Lỗi khi lấy số thông báo chưa đọc:',
          response.error || response.message,
        );
        return 0;
      }
    } catch (error: any) {
      console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy thông báo chưa đọc
  const getUnreadAnnouncements = useCallback(
    async (params?: AnnouncementFilterParams): Promise<Announcement[]> => {
      try {
        setLoading(true);

        const response: AnnouncementListResponse =
          await announcementService.getUnreadAnnouncements(params);

        if (response.success && response.data) {
          setAnnouncements(response.data);
          setPaginationInfo({
            total: response.total || 0,
            page: response.page || 1,
            pages: response.pages || 1,
          });
          if (response.unreadCount !== undefined) {
            setUnreadCount(response.unreadCount);
          }
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải thông báo chưa đọc',
            {
              type: 'danger',
            },
          );
          return [];
        }
      } catch (error: any) {
        console.error('Lỗi khi lấy thông báo chưa đọc:', error);
        toast.show('Đã xảy ra lỗi khi tải thông báo chưa đọc', {
          type: 'danger',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Xóa nhiều thông báo
  const bulkDeleteAnnouncements = useCallback(
    async (
      ids: string[],
    ): Promise<{deletedCount: number; deletedIds: string[]} | null> => {
      try {
        setLoading(true);

        const response: ApiResponse<{
          deletedCount: number;
          deletedIds: string[];
        }> = await announcementService.bulkDeleteAnnouncements(ids);

        if (response.success && response.data) {
          toast.show(
            response.message ||
              `Đã xóa ${response.data.deletedCount} thông báo`,
            {type: 'success'},
          );

          // Cập nhật danh sách thông báo
          setAnnouncements(prev =>
            prev.filter(item => !response.data!.deletedIds.includes(item._id)),
          );

          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể xóa nhiều thông báo',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        console.error('Lỗi khi xóa nhiều thông báo:', error);
        toast.show('Đã xảy ra lỗi khi xóa nhiều thông báo', {
          type: 'danger',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Tìm kiếm thông báo
  const searchAnnouncements = useCallback(
    async (
      searchQuery: string,
      params?: AnnouncementFilterParams,
    ): Promise<Announcement[]> => {
      try {
        setLoading(true);

        const response: AnnouncementListResponse =
          await announcementService.searchAnnouncements(searchQuery, params);

        if (response.success && response.data) {
          setAnnouncements(response.data);
          setPaginationInfo({
            total: response.total || 0,
            page: response.page || 1,
            pages: response.pages || 1,
          });
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tìm kiếm thông báo',
            {
              type: 'danger',
            },
          );
          return [];
        }
      } catch (error: any) {
        console.error('Lỗi khi tìm kiếm thông báo:', error);
        toast.show('Đã xảy ra lỗi khi tìm kiếm thông báo', {
          type: 'danger',
        });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Phân loại thông báo theo loại
  const categorizeAnnouncements = useCallback(
    (announcementList: Announcement[] = announcements) => {
      return {
        announcement: announcementList.filter(
          item => item.type === 'announcement',
        ),
        academic: announcementList.filter(item => item.type === 'academic'),
        event: announcementList.filter(item => item.type === 'event'),
        urgent: announcementList.filter(item => item.type === 'urgent'),
        assignment: announcementList.filter(item => item.type === 'assignment'),
      };
    },
    [announcements],
  );

  // Lọc thông báo quan trọng
  const getImportantAnnouncements = useCallback(
    (announcementList: Announcement[] = announcements) => {
      return announcementList.filter(item => item.isImportant);
    },
    [announcements],
  );

  // Lọc thông báo theo tiêu chí
  const filterAnnouncements = useCallback(
    (criteria: {
      unreadOnly?: boolean;
      type?: string;
      courseId?: string;
      isImportant?: boolean;
      searchQuery?: string;
    }) => {
      return announcementService.filterAnnouncements(announcements, criteria);
    },
    [announcements],
  );

  // Sắp xếp thông báo
  const sortAnnouncements = useCallback(
    (
      sortBy: 'date' | 'type' | 'important' | 'title' = 'date',
      order: 'asc' | 'desc' = 'desc',
    ) => {
      const sorted = announcementService.sortAnnouncements(
        announcements,
        sortBy,
        order,
      );
      setAnnouncements(sorted);
      return sorted;
    },
    [announcements],
  );

  // Kiểm tra quyền sở hữu
  const checkOwnership = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response: ApiResponse<{isOwner: boolean}> =
        await announcementService.checkOwnership(id);
      return (response.success && response.data?.isOwner) || false;
    } catch (error: any) {
      console.error('Lỗi khi kiểm tra quyền sở hữu:', error);
      return false;
    }
  }, []);

  // Validate file trước khi upload
  const validateFile = useCallback(
    (file: File): {isValid: boolean; error?: string} => {
      return announcementService.validateAttachmentFile(file);
    },
    [],
  );

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    return announcementService.formatFileSize(bytes);
  }, []);

  // Format announcement date
  const formatAnnouncementDate = useCallback((date: string | Date): string => {
    return announcementService.formatAnnouncementDate(date);
  }, []);

  return {
    // States
    loading,
    announcements,
    announcement,
    unreadCount,
    paginationInfo,

    // CRUD operations
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    createCourseAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    bulkDeleteAnnouncements,

    // Read operations
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadAnnouncements,

    // Course specific
    getCourseAnnouncements,

    // File operations
    uploadAttachment,
    validateFile,
    formatFileSize,

    // Search and filter
    searchAnnouncements,
    categorizeAnnouncements,
    getImportantAnnouncements,
    filterAnnouncements,
    sortAnnouncements,

    // Utilities
    checkOwnership,
    formatAnnouncementDate,
  };
};

export default useAnnouncement;
