import {
  Course,
  CoursesResponse,
  CourseFilterParams,
  ApiResponse,
  ScheduleItem,
  Schedule,
} from '../types/courseType';
import apiClient from '../apis/apiClient';
import {format, parseISO} from 'date-fns';

const API_PATH = '/courses';

// ✅ SỬA: Interface cho backend response thực tế
export interface BackendScheduleItem {
  date: string; // "2024-12-09"
  dayOfWeek: string; // "Monday"
  startTime: string; // "07:00"
  endTime: string; // "09:30"
  location?: string; // "Tòa TA2"
  room?: string; // "403"
  course: {
    _id: string;
    id: string; // courseCode "CT00003"
    name: string; // courseName "Tin đai cương"
    instructorId: {
      _id: string;
      fullName: string;
      email: string;
      userID: string;
    };
    credits: number;
    progress: number;
    image: string;
    status: string;
    color: any[];
    semesterInfo: {
      _id: string;
      semester: string;
      academicYear: string;
      displayName: string;
      startDate: string;
      endDate: string;
    };
    semester: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    description?: string;
    location?: string;
    students: string[];
    schedule: any[];
    materials: any[];
    enrolledStudents: any[];
    studentActivities: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

// ✅ SỬA: Backend schedule response structure
export interface BackendScheduleResponse
  extends ApiResponse<{
    schedules: BackendScheduleItem[];
    count: number;
    date?: string;
    year?: number;
    month?: number;
    period?: {
      startDate: string;
      endDate: string;
    };
  }> {}

// ✅ SỬA: Legacy interface for compatibility
export interface ScheduleFromCourse {
  _id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorUserID?: string;
  startTime: string;
  endTime: string;
  date: string;
  dayOfWeek: string;
  room?: string;
  location?: string;
  credits?: number;
  progress?: number;
  status?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  semester?: string;
  academicYear?: string;
  semesterInfo?: {
    _id: string;
    semester: string;
    academicYear: string;
    displayName: string;
  };
  statusInfo?: {
    status: string;
    daysUntilStart: number;
    daysUntilEnd: number;
    daysSinceEnd: number;
    duration: number;
    isStartingSoon: boolean;
    isEndingSoon: boolean;
    isRecentlyEnded: boolean;
  };
}

export const scheduleService = {
  // ✅ SỬA: Convert BackendScheduleItem thành ScheduleItem
  convertBackendScheduleToScheduleItem: (
    backendItem: BackendScheduleItem,
  ): ScheduleItem => {
    const course = backendItem.course;

    return {
      _id: `${course._id}_${backendItem.date}_${backendItem.startTime}`, // Generate unique ID
      courseId: course._id,
      courseName: course.name,
      courseCode: course.id,
      instructorName: course.instructorId?.fullName,
      instructorEmail: course.instructorId?.email,
      instructorUserID: course.instructorId?.userID,
      startTime: backendItem.startTime,
      endTime: backendItem.endTime,
      date: backendItem.date,
      dayOfWeek: backendItem.dayOfWeek,
      room: backendItem.room,
      location: backendItem.location || course.location,
      credits: course.credits,
      progress: course.progress,
      status: course.status,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      semester: course.semester,
      academicYear: course.academicYear,
      semesterInfo: course.semesterInfo
        ? {
            _id: course.semesterInfo._id,
            semester: course.semesterInfo.semester,
            academicYear: course.semesterInfo.academicYear,
            displayName: course.semesterInfo.displayName,
            startDate: course.semesterInfo.startDate,
            endDate: course.semesterInfo.endDate,
          }
        : null,
      statusInfo: undefined, // Backend chưa có field này
    };
  },

  // ✅ SỬA: Batch convert BackendScheduleItem[] thành ScheduleItem[]
  convertBackendSchedulesToScheduleItems: (
    backendSchedules: BackendScheduleItem[],
  ): ScheduleItem[] => {
    return backendSchedules.map(
      scheduleService.convertBackendScheduleToScheduleItem,
    );
  },

  // ✅ SỬA: Lấy lịch học theo ngày từ backend API
  getScheduleByDate: async (
    date: string,
  ): Promise<{
    success: boolean;
    timestamp: string;
    data?: {
      schedules: ScheduleItem[];
      count: number;
      date: string;
    };
    error?: string;
    message: string;
  }> => {
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');

      const response = await apiClient.get<BackendScheduleResponse>(
        `${API_PATH}/schedule/daily?date=${formattedDate}`,
      );

      if (response.success && response.data && response.data.schedules) {
        // ✅ Convert backend format sang ScheduleItem format
        const convertedSchedules =
          scheduleService.convertBackendSchedulesToScheduleItems(
            response.data.schedules,
          );

        return {
          success: true,
          timestamp: response.timestamp,
          data: {
            schedules: convertedSchedules,
            count: convertedSchedules.length,
            date: formattedDate,
          },
          message: response.message || 'Lấy lịch học thành công',
        };
      }

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: response.message || 'Không có dữ liệu lịch học',
        error: 'No schedule data available',
      };
    } catch (err: any) {
      console.error('❌ [scheduleService] Error in getScheduleByDate:', err);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lịch học',
        error: err.message || 'Đã xảy ra lỗi khi tải lịch học',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo tháng từ backend API
  getScheduleByMonth: async (
    year: number,
    month: number,
  ): Promise<{
    success: boolean;
    timestamp: string;
    data?: {
      schedules: ScheduleItem[];
      count: number;
      year: number;
      month: number;
      period?: {
        startDate: string;
        endDate: string;
      };
    };
    error?: string;
    message: string;
  }> => {
    try {
      const response = await apiClient.get<BackendScheduleResponse>(
        `${API_PATH}/schedule/month?year=${year}&month=${month}`,
      );

      if (response.success && response.data && response.data.schedules) {
        const convertedSchedules =
          scheduleService.convertBackendSchedulesToScheduleItems(
            response.data.schedules,
          );

        return {
          success: true,
          timestamp: response.timestamp,
          data: {
            schedules: convertedSchedules,
            count: convertedSchedules.length,
            year,
            month,
            period: response.data.period,
          },
          message: response.message || 'Lấy lịch học theo tháng thành công',
        };
      }

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: response.message || 'Không có dữ liệu lịch học',
        error: 'No schedule data available',
      };
    } catch (err: any) {
      console.error('❌ [scheduleService] Error in getScheduleByMonth:', err);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lịch học theo tháng',
        error: err.message || 'Đã xảy ra lỗi khi tải lịch học theo tháng',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo khoảng thời gian từ backend API
  getScheduleByRange: async (
    startDate: string,
    endDate: string,
  ): Promise<{
    success: boolean;
    timestamp: string;
    data?: {
      schedules: ScheduleItem[];
      count: number;
      period: {
        startDate: string;
        endDate: string;
      };
    };
    error?: string;
    message: string;
  }> => {
    try {
      const response = await apiClient.get<BackendScheduleResponse>(
        `${API_PATH}/schedule/range?startDate=${startDate}&endDate=${endDate}`,
      );

      if (response.success && response.data && response.data.schedules) {
        const convertedSchedules =
          scheduleService.convertBackendSchedulesToScheduleItems(
            response.data.schedules,
          );

        return {
          success: true,
          timestamp: response.timestamp,
          data: {
            schedules: convertedSchedules,
            count: convertedSchedules.length,
            period: {
              startDate,
              endDate,
            },
          },
          message:
            response.message || 'Lấy lịch học theo khoảng thời gian thành công',
        };
      }

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: response.message || 'Không có dữ liệu lịch học',
        error: 'No schedule data available',
      };
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message || 'Đã xảy ra lỗi khi tải lịch học theo khoảng thời gian',
        error:
          err.message || 'Đã xảy ra lỗi khi tải lịch học theo khoảng thời gian',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo học kỳ từ backend API
  getScheduleBySemester: async (
    semesterId: string,
  ): Promise<{
    success: boolean;
    timestamp: string;
    data?: {
      schedules: ScheduleItem[];
      count: number;
    };
    error?: string;
    message: string;
  }> => {
    try {
      const response = await apiClient.get<BackendScheduleResponse>(
        `${API_PATH}/schedule/semester/${semesterId}`,
      );

      if (response.success && response.data && response.data.schedules) {
        const convertedSchedules =
          scheduleService.convertBackendSchedulesToScheduleItems(
            response.data.schedules,
          );

        return {
          success: true,
          timestamp: response.timestamp,
          data: {
            schedules: convertedSchedules,
            count: convertedSchedules.length,
          },
          message: response.message || 'Lấy lịch học theo học kỳ thành công',
        };
      }

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: response.message || 'Không có dữ liệu lịch học',
        error: 'No schedule data available',
      };
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lịch học theo học kỳ',
        error: err.message || 'Đã xảy ra lỗi khi tải lịch học theo học kỳ',
      };
    }
  },

  // ✅ SỬA: Lấy lịch học theo khóa học từ backend API
  getScheduleByCourse: async (
    courseId: string,
  ): Promise<{
    success: boolean;
    timestamp: string;
    data?: {
      schedules: ScheduleItem[];
      count: number;
    };
    error?: string;
    message: string;
  }> => {
    try {
      const response = await apiClient.get<BackendScheduleResponse>(
        `${API_PATH}/schedule/course/${courseId}`,
      );

      if (response.success && response.data && response.data.schedules) {
        const convertedSchedules =
          scheduleService.convertBackendSchedulesToScheduleItems(
            response.data.schedules,
          );

        return {
          success: true,
          timestamp: response.timestamp,
          data: {
            schedules: convertedSchedules,
            count: convertedSchedules.length,
          },
          message: response.message || 'Lấy lịch học theo khóa học thành công',
        };
      }

      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: response.message || 'Không có dữ liệu lịch học',
        error: 'No schedule data available',
      };
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải lịch học theo khóa học',
        error: err.message || 'Đã xảy ra lỗi khi tải lịch học theo khóa học',
      };
    }
  },

  // ✅ LEGACY: Giữ các function cũ để tương thích
  getUserCourses: async (
    filterParams?: CourseFilterParams,
  ): Promise<CoursesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (filterParams?.semesterId) {
        queryParams.append('semesterId', filterParams.semesterId);
      }
      if (filterParams?.instructorId) {
        queryParams.append('instructorId', filterParams.instructorId);
      }
      if (filterParams?.studentId) {
        queryParams.append('studentId', filterParams.studentId);
      }
      if (filterParams?.status) {
        queryParams.append('status', filterParams.status);
      }
      if (filterParams?.search) {
        queryParams.append('search', filterParams.search);
      }

      const queryString = queryParams.toString();
      const url = `${API_PATH}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<CoursesResponse>(url);
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải danh sách khóa học',
        data: {
          count: 0,
          courses: [],
        },
        error: err.message || 'Đã xảy ra lỗi khi tải danh sách khóa học',
      };
    }
  },

  // ✅ LEGACY: Convert functions for compatibility
  convertCourseToSchedule: (
    course: Course,
    targetDate: string,
  ): ScheduleFromCourse[] => {
    // Implementation remains the same for compatibility
    const schedules: ScheduleFromCourse[] = [];

    if (!course.schedule || course.schedule.length === 0) {
      return schedules;
    }

    const targetDay = format(parseISO(targetDate), 'EEEE');

    const instructorName =
      typeof course.instructorId === 'object' && course.instructorId?.fullName
        ? course.instructorId.fullName
        : undefined;

    const instructorEmail =
      typeof course.instructorId === 'object' && course.instructorId?.email
        ? course.instructorId.email
        : undefined;

    const instructorUserID =
      typeof course.instructorId === 'object' && course.instructorId?.userID
        ? course.instructorId.userID
        : undefined;

    const semesterInfo =
      typeof course.semesterInfo === 'object' && course.semesterInfo
        ? {
            _id: course.semesterInfo._id,
            semester: course.semesterInfo.semester,
            academicYear: course.semesterInfo.academicYear,
            displayName: course.semesterInfo.displayName,
          }
        : undefined;

    const daySchedules = course.schedule.filter(
      (scheduleItem: Schedule) => scheduleItem.dayOfWeek === targetDay,
    );

    daySchedules.forEach((scheduleItem: Schedule) => {
      schedules.push({
        _id: `${course._id}_${scheduleItem._id}_${targetDate}`,
        courseId: course._id,
        courseName: course.name,
        courseCode: course.id,
        instructorName,
        instructorEmail,
        instructorUserID,
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        date: targetDate,
        dayOfWeek: scheduleItem.dayOfWeek,
        room: scheduleItem.room,
        location: course.location,
        credits: course.credits,
        progress: course.progress,
        status: course.status,
        description: course.description,
        startDate: course.startDate
          ? new Date(course.startDate).toISOString()
          : undefined,
        endDate: course.endDate
          ? new Date(course.endDate).toISOString()
          : undefined,
        semester: course.semester,
        academicYear: course.academicYear,
        semesterInfo,
        statusInfo: course.statusInfo
          ? {
              status: course.statusInfo.status,
              daysUntilStart: course.statusInfo.daysUntilStart,
              daysUntilEnd: course.statusInfo.daysUntilEnd,
              daysSinceEnd: course.statusInfo.daysSinceEnd,
              duration: course.statusInfo.duration,
              isStartingSoon: course.statusInfo.isStartingSoon,
              isEndingSoon: course.statusInfo.isEndingSoon,
              isRecentlyEnded: course.statusInfo.isRecentlyEnded,
            }
          : undefined,
      });
    });

    return schedules;
  },

  convertToScheduleItem: (
    scheduleFromCourse: ScheduleFromCourse,
  ): ScheduleItem => {
    return {
      _id: scheduleFromCourse._id,
      courseId: scheduleFromCourse.courseId,
      courseName: scheduleFromCourse.courseName,
      courseCode: scheduleFromCourse.courseCode,
      instructorName: scheduleFromCourse.instructorName,
      instructorEmail: scheduleFromCourse.instructorEmail,
      instructorUserID: scheduleFromCourse.instructorUserID,
      date: scheduleFromCourse.date,
      dayOfWeek: scheduleFromCourse.dayOfWeek as any,
      startTime: scheduleFromCourse.startTime,
      endTime: scheduleFromCourse.endTime,
      room: scheduleFromCourse.room,
      location: scheduleFromCourse.location,
      credits: scheduleFromCourse.credits,
      progress: scheduleFromCourse.progress,
      status: scheduleFromCourse.status,
      description: scheduleFromCourse.description,
      startDate: scheduleFromCourse.startDate,
      endDate: scheduleFromCourse.endDate,
      semester: scheduleFromCourse.semester,
      academicYear: scheduleFromCourse.academicYear,
      semesterInfo: scheduleFromCourse.semesterInfo || null,
      statusInfo: scheduleFromCourse.statusInfo,
    };
  },

  convertToScheduleItems: (
    schedulesFromCourse: ScheduleFromCourse[],
  ): ScheduleItem[] => {
    return schedulesFromCourse.map(scheduleService.convertToScheduleItem);
  },

  // ✅ REST: Utility functions remain the same
  updateCourseSchedule: async (
    courseId: string,
    schedule: Schedule[],
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.put<ApiResponse<null>>(
        `${API_PATH}/${courseId}/schedule`,
        {schedule},
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật lịch học khóa học',
        data: null,
        error: err.message || 'Đã xảy ra lỗi khi cập nhật lịch học khóa học',
      };
    }
  },

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

  isValidTimeFormat: (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  },

  formatTime: (time: string): string => {
    try {
      if (!scheduleService.isValidTimeFormat(time)) {
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

  convert12To24Format: (time12h: string): string => {
    try {
      const [timePart, ampm] = time12h.trim().split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);

      let hours24 = hours;
      if (ampm?.toLowerCase() === 'pm' && hours < 12) {
        hours24 = hours + 12;
      } else if (ampm?.toLowerCase() === 'am' && hours === 12) {
        hours24 = 0;
      }

      return `${hours24.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
    } catch (err) {
      return time12h;
    }
  },

  convert24To12Format: (time24h: string): string => {
    try {
      if (!scheduleService.isValidTimeFormat(time24h)) {
        return time24h;
      }

      const [hours, minutes] = time24h.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;

      return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (err) {
      return time24h;
    }
  },

  formatDate: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'dd/MM/yyyy');
    } catch (err) {
      return typeof date === 'string' ? date : date.toString();
    }
  },

  formatDateTime: (dateTime: string | Date): string => {
    try {
      const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (err) {
      return typeof dateTime === 'string' ? dateTime : dateTime.toString();
    }
  },

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

  getStatusInVietnamese: (status: string): string => {
    const statusMap: Record<string, string> = {
      upcoming: 'Sắp diễn ra',
      ongoing: 'Đang diễn ra',
      completed: 'Đã hoàn thành',
      cancelled: 'Đã hủy',
      paused: 'Tạm dừng',
    };
    return statusMap[status] || status;
  },

  createScheduleFromCourseResponse: (
    courseResponse: any,
    targetDate?: string,
  ): ScheduleFromCourse[] => {
    if (!courseResponse?.data?.courses) {
      return [];
    }

    const schedules: ScheduleFromCourse[] = [];
    const courses = courseResponse.data.courses;

    courses.forEach((course: any) => {
      if (targetDate) {
        const courseSchedules = scheduleService.convertCourseToSchedule(
          course,
          targetDate,
        );
        schedules.push(...courseSchedules);
      } else {
        const today = new Date();
        const currentWeekDates = [];

        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - today.getDay() + i);
          currentWeekDates.push(format(date, 'yyyy-MM-dd'));
        }

        currentWeekDates.forEach(date => {
          const courseSchedules = scheduleService.convertCourseToSchedule(
            course,
            date,
          );
          schedules.push(...courseSchedules);
        });
      }
    });

    return schedules;
  },
};

export default scheduleService;
