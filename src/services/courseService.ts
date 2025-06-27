import apiClient from '../apis/apiClient';
import {
  Course,
  CreateCourseParams,
  UpdateCourseParams,
  CourseResponse,
  CoursesResponse,
  CourseSemesterResponse,
  InstructorCoursesResponse,
  EnrollmentResponse,
  UpdateCourseStatusParams,
  CourseFilterParams,
  ApiResponse,
  ScheduleResponse,
  CourseScheduleResponse,
  UpdateAllCoursesStatusResponse,
  UpdateSemesterCoursesStatusResponse,
  CourseOverviewReportResponse,
  CourseStatusResponse,
  CheckUpdateCourseStatusResponse,
  CourseStudentsResponse,
  ScheduleByMonthResponse,
  Schedule,
  SemesterInfo,
  CourseUtils,
} from '../types/courseType';

// ✅ SỬA: Hàm helper để xây dựng query parameters từ filters theo backend API
const buildQueryParams = (filters?: CourseFilterParams): string => {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  // ✅ SỬA: Theo CourseFilterParams interface mới
  if (filters.semesterId) {
    params.append('semesterId', filters.semesterId);
  }

  if (filters.instructorId) {
    params.append('instructorId', filters.instructorId);
  }

  if (filters.studentId) {
    params.append('studentId', filters.studentId);
  }

  if (filters.status) {
    params.append('status', filters.status);
  }

  if (filters.search) {
    params.append('search', filters.search);
  }

  if (filters.page) {
    params.append('page', filters.page.toString());
  }

  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }

  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const courseService = {
  /**
   * QUẢN LÝ KHÓA HỌC CHUNG
   * ======================
   */

  // ✅ SỬA: Lấy tất cả khóa học với backend response format
  getAllCourses: async (
    filters?: CourseFilterParams,
  ): Promise<CoursesResponse> => {
    try {
      const queryParams = buildQueryParams(filters);
      const url = `/courses${queryParams}`;

      const response = await apiClient.get<CoursesResponse>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách khóa học',
        data: {
          count: 0,
          courses: [],
        },
        error: error.message || 'Đã xảy ra lỗi khi tải danh sách khóa học',
      };
    }
  },

  // ✅ SỬA: Lấy chi tiết khóa học theo ID với Course interface mới
  getCourseById: async (id: string): Promise<CourseResponse> => {
    try {
      const response = await apiClient.get<CourseResponse>(`/courses/${id}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải thông tin khóa học',
        data: undefined,
        error: error.message || 'Đã xảy ra lỗi khi tải thông tin khóa học',
      };
    }
  },

  // ✅ SỬA: Tạo khóa học mới theo CreateCourseParams interface
  createCourse: async (
    courseData: CreateCourseParams,
  ): Promise<CourseResponse> => {
    try {
      const response = await apiClient.post<CourseResponse>(
        '/courses',
        courseData,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tạo khóa học',
        data: undefined,
        error: error.message || 'Đã xảy ra lỗi khi tạo khóa học',
      };
    }
  },

  // ✅ SỬA: Cập nhật khóa học theo UpdateCourseParams interface
  updateCourse: async (
    id: string,
    courseData: UpdateCourseParams,
  ): Promise<CourseResponse> => {
    try {
      const response = await apiClient.put<CourseResponse>(
        `/courses/${id}`,
        courseData,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi cập nhật khóa học',
        data: undefined,
        error: error.message || 'Đã xảy ra lỗi khi cập nhật khóa học',
      };
    }
  },

  // ✅ SỬA: Cập nhật trạng thái khóa học theo backend model
  updateCourseStatus: async (
    courseId: string,
    statusData: UpdateCourseStatusParams,
  ): Promise<CourseResponse> => {
    try {
      const response = await apiClient.put<CourseResponse>(
        `/courses/${courseId}/status`,
        statusData,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái khóa học',
        data: undefined,
        error:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái khóa học',
      };
    }
  },

  // ✅ SỬA: Xóa khóa học với ApiResponse format
  deleteCourse: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/courses/${id}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi xóa khóa học',
        data: null,
        error: error.message || 'Đã xảy ra lỗi khi xóa khóa học',
      };
    }
  },

  /**
   * QUẢN LÝ KHÓA HỌC THEO HỌC KỲ
   * ===========================
   */

  // ✅ SỬA: Lấy khóa học theo học kỳ với CourseSemesterResponse
  getCoursesBySemester: async (
    semesterId: string,
  ): Promise<CourseSemesterResponse> => {
    try {
      const response = await apiClient.get<CourseSemesterResponse>(
        `/courses/semester/${semesterId}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message ||
          'Đã xảy ra lỗi khi tải danh sách khóa học theo học kỳ',
        data: {
          count: 0,
          semester: {
            _id: '',
            semester: '',
            academicYear: '',
            displayName: '',
          } as SemesterInfo,
          courses: [],
        },
        error:
          error.message ||
          'Đã xảy ra lỗi khi tải danh sách khóa học theo học kỳ',
      };
    }
  },

  /**
   * QUẢN LÝ KHÓA HỌC CHO GIẢNG VIÊN & SINH VIÊN
   * ===========================================
   */

  // ✅ SỬA: Lấy khóa học của giảng viên với InstructorCoursesResponse
  getInstructorCourses: async (
    filters?: CourseFilterParams,
  ): Promise<InstructorCoursesResponse> => {
    try {
      const queryParams = buildQueryParams(filters);
      const url = `/courses/instructor/courses${queryParams}`;

      const response = await apiClient.get<InstructorCoursesResponse>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message ||
          'Đã xảy ra lỗi khi tải danh sách khóa học của giảng viên',
        data: {
          count: 0,
          courses: [],
          semester: null,
        },
        error:
          error.message ||
          'Đã xảy ra lỗi khi tải danh sách khóa học của giảng viên',
      };
    }
  },

  // ✅ SỬA: Lấy danh sách sinh viên với CourseStudentsResponse
  getCourseStudents: async (
    courseId: string,
  ): Promise<CourseStudentsResponse> => {
    try {
      const response = await apiClient.get<CourseStudentsResponse>(
        `/courses/${courseId}/students`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách sinh viên',
        data: {
          count: 0,
          course: {
            _id: '',
            id: '',
            name: '',
            instructorId: {} as any,
          },
          data: [],
        },
        error: error.message || 'Đã xảy ra lỗi khi tải danh sách sinh viên',
      };
    }
  },

  // ✅ SỬA: Đăng ký sinh viên vào khóa học theo EnrollmentResponse
  enrollStudentToCourse: async (
    courseId: string,
    studentId?: string,
  ): Promise<EnrollmentResponse> => {
    try {
      const response = await apiClient.post<EnrollmentResponse>(
        `/courses/${courseId}/enroll`,
        studentId ? {studentId} : {},
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi đăng ký khóa học',
        data: {
          course: {
            _id: '',
            id: '',
            name: '',
          },
          student: {
            _id: '',
            userID: '',
            fullName: '',
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi đăng ký khóa học',
      };
    }
  },

  // ✅ SỬA: Hủy đăng ký sinh viên với ApiResponse
  unenrollStudentFromCourse: async (
    courseId: string,
    studentId?: string,
  ): Promise<ApiResponse<{message?: string}>> => {
    try {
      const response = await apiClient.post<ApiResponse<{message?: string}>>(
        `/courses/${courseId}/unenroll`,
        studentId ? {studentId} : {},
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi hủy đăng ký khóa học',
        data: undefined,
        error: error.message || 'Đã xảy ra lỗi khi hủy đăng ký khóa học',
      };
    }
  },

  /**
   * QUẢN LÝ TRẠNG THÁI KHÓA HỌC
   * ===========================
   */

  // ✅ SỬA: Cập nhật trạng thái tất cả khóa học với UpdateAllCoursesStatusResponse
  updateAllCoursesStatus: async (): Promise<UpdateAllCoursesStatusResponse> => {
    try {
      const response = await apiClient.put<UpdateAllCoursesStatusResponse>(
        '/courses/status/update-all',
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái khóa học',
        data: {
          totalCourses: 0,
          updatedCount: 0,
          notifications: [],
          timestamp: new Date().toISOString(),
        },
        error:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái khóa học',
      };
    }
  },

  // ✅ SỬA: Lấy thông tin chi tiết trạng thái khóa học với CourseStatusResponse
  getCourseStatusDetail: async (
    courseId: string,
  ): Promise<CourseStatusResponse> => {
    try {
      const response = await apiClient.get<CourseStatusResponse>(
        `/courses/${courseId}/status/detail`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải thông tin trạng thái',
        data: {
          course: {
            _id: '',
            id: '',
            name: '',
            status: 'upcoming',
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            instructorId: null,
            semesterInfo: null,
          },
          statusInfo: {
            status: 'upcoming',
            daysUntilStart: 0,
            daysUntilEnd: 0,
            daysSinceEnd: 0,
            duration: 0,
            isStartingSoon: false,
            isEndingSoon: false,
            isRecentlyEnded: false,
          },
          schedule: {
            thisWeekClasses: [],
            nextClass: null,
            lastClass: null,
            totalClassesThisWeek: 0,
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi tải thông tin trạng thái',
      };
    }
  },

  // ✅ SỬA: Kiểm tra và cập nhật trạng thái với CheckUpdateCourseStatusResponse
  checkAndUpdateCourseStatus: async (
    courseId: string,
  ): Promise<CheckUpdateCourseStatusResponse> => {
    try {
      const response = await apiClient.put<CheckUpdateCourseStatusResponse>(
        `/courses/${courseId}/status/check`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi kiểm tra trạng thái',
        data: {
          updated: false,
          message: 'Đã xảy ra lỗi',
        },
        error: error.message || 'Đã xảy ra lỗi khi kiểm tra trạng thái',
      };
    }
  },

  // ✅ SỬA: Cập nhật trạng thái khóa học theo học kỳ với UpdateSemesterCoursesStatusResponse
  updateSemesterCoursesStatus: async (
    semesterId: string,
  ): Promise<UpdateSemesterCoursesStatusResponse> => {
    try {
      const response = await apiClient.put<UpdateSemesterCoursesStatusResponse>(
        `/courses/semester/${semesterId}/status`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái học kỳ',
        data: {
          semester: {
            _id: '',
            displayName: '',
          },
          totalCourses: 0,
          updatedCount: 0,
          notifications: [],
          timestamp: new Date().toISOString(),
        },
        error: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái học kỳ',
      };
    }
  },

  // ✅ SỬA: Lấy báo cáo tổng quan với CourseOverviewReportResponse
  getCourseOverviewReport: async (): Promise<CourseOverviewReportResponse> => {
    try {
      const response = await apiClient.get<CourseOverviewReportResponse>(
        '/courses/reports/overview',
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải báo cáo tổng quan',
        data: {
          summary: {
            upcoming: 0,
            ongoing: 0,
            completed: 0,
            total: 0,
            coursesNeedUpdate: 0,
            updatePercentage: 0,
          },
          courses: [],
          timestamp: new Date().toISOString(),
        },
        error: error.message || 'Đã xảy ra lỗi khi tải báo cáo tổng quan',
      };
    }
  },

  /**
   * LỊCH HỌC VÀ THỐNG KÊ
   * ====================
   */

  // ✅ SỬA: Lấy lịch học của khóa học với CourseScheduleResponse
  getCourseSchedule: async (
    courseId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<CourseScheduleResponse> => {
    try {
      let url = `/courses/${courseId}/schedule`;
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get<CourseScheduleResponse>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải lịch học khóa học',
        data: {
          course: {
            _id: '',
            id: '',
            name: '',
            instructor: null,
            semester: null,
          },
          schedule: {
            dates: [],
            nextClass: null,
            lastClass: null,
            thisWeekClasses: [],
            totalSessions: 0,
          },
          period: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi tải lịch học khóa học',
      };
    }
  },

  /**
   * ✅ THÊM: Lấy thống kê chi tiết khóa học (bao gồm tỷ lệ hoàn thành)
   */
  getCourseStats: async (
    courseId: string,
  ): Promise<
    ApiResponse<{
      course: Course;
      stats: {
        totalSessions: number;
        completedSessions: number;
        remainingSessions: number;
        sessionsThisWeek: number;
        sessionsThisMonth: number;
        completionPercentage: number; // ✅ Tỷ lệ hoàn thành (%)
        statusInfo: {
          status: string;
          daysUntilStart: number;
          daysUntilEnd: number;
          daysSinceEnd: number;
          duration: number;
          isStartingSoon: boolean;
          isEndingSoon: boolean;
          isRecentlyEnded: boolean;
        };
      };
    }>
  > => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/courses/${courseId}/stats`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải thống kê khóa học',
        data: {
          course: {} as Course,
          stats: {
            totalSessions: 0,
            completedSessions: 0,
            remainingSessions: 0,
            sessionsThisWeek: 0,
            sessionsThisMonth: 0,
            completionPercentage: 0, // ✅ Default 0%
            statusInfo: {
              status: 'upcoming',
              daysUntilStart: 0,
              daysUntilEnd: 0,
              daysSinceEnd: 0,
              duration: 0,
              isStartingSoon: false,
              isEndingSoon: false,
              isRecentlyEnded: false,
            },
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi tải thống kê khóa học',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo ngày với ScheduleResponse
  getScheduleByDate: async (date: string): Promise<ScheduleResponse> => {
    try {
      const response = await apiClient.get<ScheduleResponse>(
        `/courses/schedule/daily?date=${date}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải lịch học theo ngày',
        data: {
          schedules: [],
          count: 0,
          date,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải lịch học theo ngày',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo khoảng thời gian với ScheduleResponse
  getScheduleByRange: async (
    startDate: string,
    endDate: string,
  ): Promise<ScheduleResponse> => {
    try {
      const response = await apiClient.get<ScheduleResponse>(
        `/courses/schedule/range?startDate=${startDate}&endDate=${endDate}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message ||
          'Đã xảy ra lỗi khi tải lịch học theo khoảng thời gian',
        data: {
          schedules: [],
          count: 0,
          period: {
            startDate,
            endDate,
          },
        },
        error:
          error.message ||
          'Đã xảy ra lỗi khi tải lịch học theo khoảng thời gian',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo tháng với ScheduleByMonthResponse
  getScheduleByMonth: async (
    year: number,
    month: number,
  ): Promise<ScheduleByMonthResponse> => {
    try {
      const response = await apiClient.get<ScheduleByMonthResponse>(
        `/courses/schedule/month?year=${year}&month=${month}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải lịch học theo tháng',
        data: {
          schedules: [],
          count: 0,
          period: {
            year,
            month,
            startDate: new Date(year, month - 1, 1).toISOString(),
            endDate: new Date(year, month, 0).toISOString(),
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi tải lịch học theo tháng',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo học kỳ với ScheduleResponse
  getScheduleBySemester: async (
    semesterId: string,
  ): Promise<ScheduleResponse> => {
    try {
      const response = await apiClient.get<ScheduleResponse>(
        `/courses/schedule/semester/${semesterId}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải lịch học theo học kỳ',
        data: {
          schedules: [],
          count: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải lịch học theo học kỳ',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo khóa học với ScheduleResponse
  getScheduleByCourse: async (courseId: string): Promise<ScheduleResponse> => {
    try {
      const response = await apiClient.get<ScheduleResponse>(
        `/courses/schedule/course/${courseId}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message || 'Đã xảy ra lỗi khi tải lịch học theo khóa học',
        data: {
          schedules: [],
          count: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải lịch học theo khóa học',
      };
    }
  },

  // ✅ SỬA: Cập nhật lịch học của khóa học theo Schedule interface
  updateCourseSchedule: async (
    courseId: string,
    schedule: Schedule[],
  ): Promise<CourseResponse> => {
    try {
      const response = await apiClient.put<CourseResponse>(
        `/courses/${courseId}/schedule`,
        {schedule},
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          error.message || 'Đã xảy ra lỗi khi cập nhật lịch học khóa học',
        data: undefined,
        error: error.message || 'Đã xảy ra lỗi khi cập nhật lịch học khóa học',
      };
    }
  },

  /**
   * HÀM TIỆN ÍCH
   * ===========
   */

  // ✅ SỬA: Phân loại khóa học theo trạng thái với CourseStatusType
  categorizeByStatus: (courseList: Course[]) => {
    return {
      ongoing: courseList.filter(course => course.status === 'ongoing'),
      upcoming: courseList.filter(course => course.status === 'upcoming'),
      completed: courseList.filter(course => course.status === 'completed'),
      cancelled: courseList.filter(course => course.status === 'cancelled'),
      paused: courseList.filter(course => course.status === 'paused'),
    };
  },

  // ✅ SỬA: Validate dữ liệu lịch học theo Schedule interface mới
  validateScheduleData: (schedule: Schedule[]): string[] => {
    const errors: string[] = [];
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    schedule.forEach((item, index) => {
      if (!validDays.includes(item.dayOfWeek)) {
        errors.push(`Lịch ${index + 1}: Ngày trong tuần không hợp lệ`);
      }

      if (!item.startTime) {
        errors.push(`Lịch ${index + 1}: Thời gian bắt đầu là bắt buộc`);
      } else if (!timeRegex.test(item.startTime)) {
        errors.push(
          `Lịch ${index + 1}: Định dạng thời gian bắt đầu không hợp lệ (HH:MM)`,
        );
      }

      if (!item.endTime) {
        errors.push(`Lịch ${index + 1}: Thời gian kết thúc là bắt buộc`);
      } else if (!timeRegex.test(item.endTime)) {
        errors.push(
          `Lịch ${
            index + 1
          }: Định dạng thời gian kết thúc không hợp lệ (HH:MM)`,
        );
      }

      if (item.startTime && item.endTime) {
        const [startHour, startMinute] = item.startTime.split(':').map(Number);
        const [endHour, endMinute] = item.endTime.split(':').map(Number);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute >= endMinute)
        ) {
          errors.push(
            `Lịch ${
              index + 1
            }: Thời gian bắt đầu phải trước thời gian kết thúc`,
          );
        }
      }
    });

    return errors;
  },

  // Kiểm tra định dạng thời gian hợp lệ (HH:MM)
  isValidTimeFormat: (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  },

  // ✅ SỬA: Định dạng thời gian hiển thị
  formatTime: (time: string): string => {
    try {
      if (!courseService.isValidTimeFormat(time)) {
        return time;
      }

      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (err) {
      return time;
    }
  },

  // ✅ SỬA: Lấy tên ngày trong tuần bằng tiếng Việt
  getDayNameInVietnamese: (dayOfWeek: string): string => {
    const dayMap: Record<string, string> = {
      Monday: 'Thứ 2',
      Tuesday: 'Thứ 3',
      Wednesday: 'Thứ 4',
      Thursday: 'Thứ 5',
      Friday: 'Thứ 6',
      Saturday: 'Thứ 7',
      Sunday: 'Chủ nhật',
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  },

  // ✅ THÊM: Helper để parse backend date format
  parseBackendDate: CourseUtils.parseBackendDate,

  // ✅ THÊM: Helper để format date cho hiển thị
  formatDisplayDate: CourseUtils.formatDisplayDate,

  // ✅ THÊM: Helper để format date cho API
  formatAPIDate: CourseUtils.formatAPIDate,

  // ✅ THÊM: Helper để check populated instructor
  isPopulatedInstructor: CourseUtils.isPopulatedInstructor,

  // ✅ THÊM: Helper để check populated semester
  isPopulatedSemester: CourseUtils.isPopulatedSemester,

  // ✅ THÊM: Helper để extract course ID
  extractCourseId: CourseUtils.extractCourseId,

  // ✅ THÊM: Helper để validate ObjectId
  isValidObjectId: CourseUtils.isValidObjectId,
};

export default courseService;
