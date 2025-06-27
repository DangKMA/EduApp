import apiClient from '../apis/apiClient';
import {
  Location,
  ClassLocation,

  // Request interfaces
  CreateSessionRequest,
  CreateSessionFromScheduleRequest,
  LocationCheckInRequest,
  ManualCheckInRequest,
  SubmitManualAttendanceRequest,
  CreateClassLocationRequest,
  UpdateClassLocationRequest,
  UpdateSessionStatusRequest,
  AttendanceHistoryResponse,
  AttendanceStatusResponse,
  CheckInResponse,
  SessionDetailResponse,
  AttendanceListResponse,
  SessionCreateResponse,
  UpdateSessionStatusResponse,
  CreateSessionFromScheduleResponse,
  ManualCheckInResponse,
  SubmitManualAttendanceResponse,
  ClassLocationResponse,
  CreateClassLocationResponse,
  UpdateClassLocationResponse,
  DeleteLocationResponse,
  AttendanceStatsResponse,

  // Utility types
  AttendanceStatusType,
  ATTENDANCE_STATUS,
  CHECK_IN_METHOD,

  // Helper functions
  calculateAttendanceRate,
  getAttendanceStatusColor,
  getAttendanceStatusLabel,
  formatAttendanceRate,
  geoJSONToLatLng,
  latLngToGeoJSON,
  getLocationCoordinates,
} from '../types/attendanceType';

export const attendanceService = {
  // ===========================
  // CHỨC NĂNG DÙNG CHUNG
  // ===========================

  /**
   * Lấy chi tiết buổi điểm danh
   * GET /api/attendance/sessions/detail/:sessionId
   */
  getSessionDetail: async (
    sessionId: string,
  ): Promise<SessionDetailResponse> => {
    try {
      const response = await apiClient.get<SessionDetailResponse>(
        `/attendance/sessions/detail/${sessionId}`,
      );
      return response;
    } catch (error: any) {
      console.error('Error getting session detail:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải chi tiết buổi điểm danh',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Lấy danh sách buổi điểm danh theo khóa học
   * GET /api/attendance/sessions/course/:courseId
   */
  getAttendanceSessions: async (
    courseId: string,
  ): Promise<AttendanceListResponse> => {
    try {
      const response = await apiClient.get<AttendanceListResponse>(
        `/attendance/sessions/course/${courseId}`,
      );
      return response;
    } catch (error: any) {
      console.error('Error getting attendance sessions:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải danh sách buổi điểm danh',
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Lấy danh sách vị trí lớp học
   * GET /api/attendance/locations
   */
  getClassLocations: async (): Promise<ClassLocationResponse> => {
    try {
      const response = await apiClient.get<ClassLocationResponse>(
        '/attendance/locations',
      );
      return response;
    } catch (error: any) {
      console.error('Error getting class locations:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải danh sách vị trí lớp học',
        data: [],
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // ===========================
  // CHỨC NĂNG CHO SINH VIÊN
  // ===========================

  /**
   * Kiểm tra trạng thái điểm danh của sinh viên trong khóa học
   * GET /api/attendance/check-status/:courseId
   */
  checkStudentAttendanceStatus: async (
    courseId: string,
  ): Promise<AttendanceStatusResponse> => {
    try {
      const response = await apiClient.get<AttendanceStatusResponse>(
        `/attendance/check-status/${courseId}`,
      );
      return response;
    } catch (error: any) {
      console.error('Error checking attendance status:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi kiểm tra trạng thái điểm danh',
        data: {
          totalSessions: 0,
          attendedSessions: 0,
          attendanceRate: 0,
          latestAttendance: null,
          todaySession: null,
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Điểm danh bằng vị trí (sinh viên)
   * POST /api/attendance/location-check-in
   */
  checkInWithLocation: async (
    sessionId: string,
    location: Location,
  ): Promise<CheckInResponse> => {
    try {
      const requestData: LocationCheckInRequest = {
        sessionId,
        location,
      };

      const response = await apiClient.post<CheckInResponse>(
        '/attendance/location-check-in',
        requestData,
      );
      return response;
    } catch (error: any) {
      console.error('Error checking in with location:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi điểm danh bằng vị trí',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Lấy lịch sử điểm danh của sinh viên
   * GET /api/attendance/history
   */
  getAttendanceHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AttendanceHistoryResponse> => {
    try {
      const response = await apiClient.get<AttendanceHistoryResponse>(
        '/attendance/history',
        {
          params,
        },
      );
      return response;
    } catch (error: any) {
      console.error('Error getting attendance history:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải lịch sử điểm danh',
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 10,
          hasNext: false,
          hasPrev: false,
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Lấy thống kê điểm danh của sinh viên
   * GET /api/attendance/stats
   */
  getAttendanceStats: async (): Promise<AttendanceStatsResponse> => {
    try {
      const response = await apiClient.get<AttendanceStatsResponse>(
        '/attendance/stats',
      );
      return response;
    } catch (error: any) {
      console.error('Error getting attendance stats:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải thống kê điểm danh',
        data: {
          totalSessions: 0,
          attendedSessions: 0,
          attendanceRate: 0,
          courseStats: [],
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // ===========================
  // CHỨC NĂNG CHO GIẢNG VIÊN
  // ===========================

  /**
   * Tạo buổi điểm danh mới (dành cho giáo viên)
   * POST /api/attendance/sessions
   */
  createAttendanceSession: async (
    sessionData: CreateSessionRequest,
  ): Promise<SessionCreateResponse> => {
    try {
      const response = await apiClient.post<SessionCreateResponse>(
        '/attendance/sessions',
        sessionData,
      );
      return response;
    } catch (error: any) {
      console.error('Error creating attendance session:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tạo buổi điểm danh',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Tạo buổi điểm danh từ lịch học (dành cho giáo viên)
   * POST /api/attendance/from-schedule
   */
  createAttendanceFromSchedule: async (
    scheduleId: string,
    date: string,
  ): Promise<CreateSessionFromScheduleResponse> => {
    try {
      const requestData: CreateSessionFromScheduleRequest = {
        scheduleId,
        date,
      };

      const response = await apiClient.post<CreateSessionFromScheduleResponse>(
        '/attendance/from-schedule',
        requestData,
      );
      return response;
    } catch (error: any) {
      console.error('Error creating session from schedule:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tạo buổi điểm danh từ lịch học',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Cập nhật trạng thái của buổi điểm danh (mở/đóng) - cho giáo viên
   * PATCH /api/attendance/sessions/:sessionId/status
   */
  updateSessionStatus: async (
    sessionId: string,
    isOpen: boolean,
  ): Promise<UpdateSessionStatusResponse> => {
    try {
      const requestData: UpdateSessionStatusRequest = {isOpen};

      const response = await apiClient.patch<UpdateSessionStatusResponse>(
        `/attendance/sessions/${sessionId}/status`,
        requestData,
      );
      return response;
    } catch (error: any) {
      console.error('Error updating session status:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi cập nhật trạng thái buổi điểm danh',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Điểm danh thủ công cho sinh viên (dành cho giáo viên)
   * POST /api/attendance/manual-check-in
   */
  manualCheckIn: async (
    sessionId: string,
    studentId: string,
    status: AttendanceStatusType,
    note?: string,
  ): Promise<ManualCheckInResponse> => {
    try {
      const requestData: ManualCheckInRequest = {
        sessionId,
        studentId,
        status,
        note,
      };

      const response = await apiClient.post<ManualCheckInResponse>(
        '/attendance/manual-check-in',
        requestData,
      );
      return response;
    } catch (error: any) {
      console.error('Error manual check-in:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi điểm danh thủ công',
        data: null,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Nộp danh sách điểm danh thủ công (giáo viên)
   * POST /api/attendance/submit-manual
   */
  submitManualAttendance: async (
    attendanceData: SubmitManualAttendanceRequest,
  ): Promise<SubmitManualAttendanceResponse> => {
    try {
      const response = await apiClient.post<SubmitManualAttendanceResponse>(
        '/attendance/submit-manual',
        attendanceData,
      );
      return response;
    } catch (error: any) {
      console.error('Error submitting manual attendance:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi nộp danh sách điểm danh thủ công',
        data: {
          message: '',
          summary: {
            total: 0,
            success: 0,
            error: 0,
          },
          results: [],
        },
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // ===========================
  // QUẢN LÝ VỊ TRÍ LỚP HỌC
  // ===========================

  /**
   * Tạo vị trí lớp học mới
   * POST /api/attendance/locations
   */
  createClassLocation: async (
    locationData: CreateClassLocationRequest,
  ): Promise<CreateClassLocationResponse> => {
    try {
      const response = await apiClient.post<CreateClassLocationResponse>(
        '/attendance/locations',
        locationData,
      );
      return response;
    } catch (error: any) {
      console.error('Error creating class location:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tạo vị trí lớp học',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  getMyAttendanceStatus: async (
    sessionId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      session: {
        _id: string;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        isOpen: boolean;
        classroom?: string;
        course: {
          _id: string;
          name: string;
          code: string;
        };
        schoolLocation?: ClassLocation;
      };
      attendanceStatus: {
        hasCheckedIn: boolean;
        attendanceStatus: string;
        status: AttendanceStatusType;
        checkInTime?: string;
        checkInMethod?: string;
        distanceFromSchool?: number;
        isValidLocation?: boolean;
      };
      canAttend: boolean;
      canAttendReason?: string;
      message: string;
    };
    error?: string;
    timestamp: string;
  }> => {
    try {
      type MyAttendanceStatusResponse = {
        success: boolean;
        message: string;
        data?: {
          session: {
            _id: string;
            title: string;
            date: string;
            startTime: string;
            endTime: string;
            isOpen: boolean;
            classroom?: string;
            course: {
              _id: string;
              name: string;
              code: string;
            };
            schoolLocation?: ClassLocation;
          };
          attendanceStatus: {
            hasCheckedIn: boolean;
            attendanceStatus: string;
            status: AttendanceStatusType;
            checkInTime?: string;
            checkInMethod?: string;
            distanceFromSchool?: number;
            isValidLocation?: boolean;
          };
          canAttend: boolean;
          canAttendReason?: string;
          message: string;
        };
        error?: string;
        timestamp: string;
      };

      const response = await apiClient.get<MyAttendanceStatusResponse>(
        `/attendance/sessions/${sessionId}/my-status`,
      );
      return response;
    } catch (error: any) {
      console.error('Error getting my attendance status:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi kiểm tra trạng thái điểm danh',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  getSessionStudentsStatus: async (
    sessionId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      session: {
        _id: string;
        title: string;
        date: string;
        startTime: string;
        endTime: string;
        isOpen: boolean;
        classroom?: string;
        course: {
          _id: string;
          name: string;
          code: string;
        };
        schoolLocation?: ClassLocation;
        attendanceStats?: {
          totalStudents: number;
          presentCount: number;
          lateCount: number;
          absentCount: number;
          excusedCount: number;
          attendanceRate: number;
        };
        attendanceSummary?: {
          total: number;
          present: number;
          late: number;
          absent: number;
          excused: number;
          notMarked: number;
        };
      };
      students: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        email: string;
        avatar?: string;
        studentId: string;
        userID: string;
        attendanceStatus: {
          hasCheckedIn: boolean;
          attendanceStatus: string;
          status: AttendanceStatusType;
          checkInTime?: string;
          checkInMethod?: string;
          distanceFromSchool?: number;
          isValidLocation?: boolean;
          note?: string;
          markedBy?: string;
          markedTime?: string;
        };
      }>;
      summary: {
        total: number;
        present: number;
        late: number;
        absent: number;
        excused: number;
        notMarked: number;
      };
    };
    error?: string;
    timestamp: string;
  }> => {
    try {
      type SessionStudentsStatusResponse = {
        success: boolean;
        message: string;
        data?: {
          session: {
            _id: string;
            title: string;
            date: string;
            startTime: string;
            endTime: string;
            isOpen: boolean;
            classroom?: string;
            course: {
              _id: string;
              name: string;
              code: string;
            };
            schoolLocation?: ClassLocation;
            attendanceStats?: {
              totalStudents: number;
              presentCount: number;
              lateCount: number;
              absentCount: number;
              excusedCount: number;
              attendanceRate: number;
            };
            attendanceSummary?: {
              total: number;
              present: number;
              late: number;
              absent: number;
              excused: number;
              notMarked: number;
            };
          };
          students: Array<{
            _id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            email: string;
            avatar?: string;
            studentId: string;
            userID: string;
            attendanceStatus: {
              hasCheckedIn: boolean;
              attendanceStatus: string;
              status: AttendanceStatusType;
              checkInTime?: string;
              checkInMethod?: string;
              distanceFromSchool?: number;
              isValidLocation?: boolean;
              note?: string;
              markedBy?: string;
              markedTime?: string;
            };
          }>;
          summary: {
            total: number;
            present: number;
            late: number;
            absent: number;
            excused: number;
            notMarked: number;
          };
        };
        error?: string;
        timestamp: string;
      };

      const response = await apiClient.get<SessionStudentsStatusResponse>(
        `/attendance/sessions/${sessionId}/students-status`,
      );
      return response;
    } catch (error: any) {
      console.error('Error getting session students status:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi tải trạng thái điểm danh sinh viên',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Cập nhật vị trí lớp học
   * PUT /api/attendance/locations/:locationId
   */
  updateClassLocation: async (
    locationId: string,
    updateData: UpdateClassLocationRequest,
  ): Promise<UpdateClassLocationResponse> => {
    try {
      const response = await apiClient.put<UpdateClassLocationResponse>(
        `/attendance/locations/${locationId}`,
        updateData,
      );
      return response;
    } catch (error: any) {
      console.error('Error updating class location:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi cập nhật vị trí lớp học',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Xóa vị trí lớp học
   * DELETE /api/attendance/locations/:locationId
   */
  deleteClassLocation: async (
    locationId: string,
  ): Promise<DeleteLocationResponse> => {
    try {
      const response = await apiClient.delete<DeleteLocationResponse>(
        `/attendance/locations/${locationId}`,
      );
      return response;
    } catch (error: any) {
      console.error('Error deleting class location:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Đã xảy ra lỗi khi xóa vị trí lớp học',
        data: null,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // ===========================
  // UTILITY METHODS
  // ===========================
  validateCreateFromScheduleData: (data: {
    scheduleId: string;
    date: string;
  }): string[] => {
    const errors: string[] = [];

    if (!data.scheduleId || data.scheduleId.trim().length === 0) {
      errors.push('Mã lịch học là bắt buộc');
    }

    if (!data.date) {
      errors.push('Ngày học là bắt buộc');
    } else {
      const sessionDate = new Date(data.date);
      if (isNaN(sessionDate.getTime())) {
        errors.push('Định dạng ngày không hợp lệ');
      }
    }

    return errors;
  },

  /**
   * ✅ Validate manual attendance data
   */
  validateManualAttendanceData: (data: {
    sessionId: string;
    studentId: string;
    status: string;
    note?: string;
  }): string[] => {
    const errors: string[] = [];

    if (!data.sessionId || data.sessionId.trim().length === 0) {
      errors.push('Mã buổi học là bắt buộc');
    }

    if (!data.studentId || data.studentId.trim().length === 0) {
      errors.push('Mã sinh viên là bắt buộc');
    }

    if (
      !data.status ||
      !Object.values(ATTENDANCE_STATUS).includes(data.status as any)
    ) {
      errors.push('Trạng thái điểm danh không hợp lệ');
    }

    if (data.note && data.note.length > 255) {
      errors.push('Ghi chú không được vượt quá 255 ký tự');
    }

    return errors;
  },

  /**
   * ✅ Format attendance status for display
   */
  formatAttendanceStatusForDisplay: (
    status: AttendanceStatusType,
  ): {
    label: string;
    color: string;
    icon: string;
  } => {
    const statusConfig = {
      present: {
        label: 'Có mặt',
        color: '#4CAF50',
        icon: '✓',
      },
      late: {
        label: 'Đi muộn',
        color: '#FF9800',
        icon: '⏰',
      },
      absent: {
        label: 'Vắng mặt',
        color: '#F44336',
        icon: '✗',
      },
      excused: {
        label: 'Có phép',
        color: '#2196F3',
        icon: '📝',
      },
    };

    return (
      statusConfig[status] || {
        label: 'Chưa xác định',
        color: '#9E9E9E',
        icon: '?',
      }
    );
  },

  /**
   * ✅ Check if session can be attended now
   */
  canAttendSession: (session: {
    date: string;
    startTime: string;
    endTime: string;
    isOpen: boolean;
  }): {
    canAttend: boolean;
    reason: string;
  } => {
    if (!session.isOpen) {
      return {
        canAttend: false,
        reason: 'Buổi điểm danh chưa mở',
      };
    }

    const now = new Date();
    const sessionDate = new Date(session.date);

    // Check if today is the session date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);

    if (today.getTime() !== sessionDate.getTime()) {
      return {
        canAttend: false,
        reason: 'Không phải ngày học',
      };
    }

    // Check time range
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);

    const sessionStart = new Date();
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date();
    sessionEnd.setHours(endHour, endMin, 0, 0);

    if (now < sessionStart) {
      return {
        canAttend: false,
        reason: 'Chưa đến giờ học',
      };
    }

    if (now > sessionEnd) {
      return {
        canAttend: false,
        reason: 'Đã hết giờ học',
      };
    }

    return {
      canAttend: true,
      reason: 'Có thể điểm danh',
    };
  },

  /**
   * ✅ Calculate attendance statistics
   */
  calculateSessionStatistics: (
    studentsData: Array<{
      attendanceStatus: {
        status: AttendanceStatusType;
        hasCheckedIn: boolean;
      };
    }>,
  ): {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    notMarked: number;
    attendanceRate: number;
  } => {
    const stats = {
      total: studentsData.length,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      notMarked: 0,
      attendanceRate: 0,
    };

    studentsData.forEach(student => {
      if (!student.attendanceStatus.hasCheckedIn) {
        stats.notMarked++;
      } else {
        switch (student.attendanceStatus.status) {
          case 'present':
            stats.present++;
            break;
          case 'late':
            stats.late++;
            break;
          case 'absent':
            stats.absent++;
            break;
          case 'excused':
            stats.excused++;
            break;
        }
      }
    });

    const attendedCount = stats.present + stats.late;
    stats.attendanceRate =
      stats.total > 0 ? (attendedCount / stats.total) * 100 : 0;

    return stats;
  },

  /**
   * ✅ Format distance for display
   */
  formatDistance: (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  },

  /**
   * ✅ Get current time in session format
   */
  getCurrentTimeForSession: (): string => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  },

  /**
   * ✅ Check if time is valid format
   */
  isValidTimeFormat: (time: string): boolean => {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  },

  /**
   * ✅ Compare times (returns -1, 0, 1)
   */
  compareTimes: (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);

    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;

    return minutes1 - minutes2;
  },

  /**
   * Tính khoảng cách giữa hai vị trí (Haversine formula)
   */
  calculateDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  /**
   * Kiểm tra vị trí có trong bán kính cho phép không
   */
  isWithinRadius: (
    userLocation: Location,
    classLocation:
      | ClassLocation
      | {latitude: number; longitude: number; radius: number},
  ): {isWithin: boolean; distance: number} => {
    // ✅ Smart detection cho cả GeoJSON và old format
    let lat: number, lng: number, radius: number;

    if ('location' in classLocation) {
      // ClassLocation với GeoJSON format
      const coords = getLocationCoordinates(classLocation);
      lat = coords.latitude;
      lng = coords.longitude;
      radius = classLocation.radius;
    } else {
      // Legacy format
      lat = classLocation.latitude;
      lng = classLocation.longitude;
      radius = classLocation.radius;
    }

    const distance = attendanceService.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      lat,
      lng,
    );

    return {
      isWithin: distance <= radius,
      distance,
    };
  },

  /**
   * Validate thông tin buổi điểm danh
   */
  validateSessionData: (sessionData: CreateSessionRequest): string[] => {
    const errors: string[] = [];

    if (!sessionData.courseId) {
      errors.push('Mã khóa học là bắt buộc');
    }

    if (!sessionData.title || sessionData.title.trim().length === 0) {
      errors.push('Tiêu đề buổi học là bắt buộc');
    }

    if (!sessionData.date) {
      errors.push('Ngày học là bắt buộc');
    } else {
      const sessionDate = new Date(sessionData.date);
      if (isNaN(sessionDate.getTime())) {
        errors.push('Định dạng ngày không hợp lệ');
      }
    }

    if (!sessionData.startTime) {
      errors.push('Thời gian bắt đầu là bắt buộc');
    } else if (
      !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(sessionData.startTime)
    ) {
      errors.push('Định dạng thời gian bắt đầu không hợp lệ (HH:MM)');
    }

    if (!sessionData.endTime) {
      errors.push('Thời gian kết thúc là bắt buộc');
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(sessionData.endTime)) {
      errors.push('Định dạng thời gian kết thúc không hợp lệ (HH:MM)');
    }

    // ✅ schoolLocationId là required theo controller
    if (!sessionData.schoolLocationId) {
      errors.push('Vị trí trường học là bắt buộc');
    }

    // Kiểm tra thời gian bắt đầu < thời gian kết thúc
    if (sessionData.startTime && sessionData.endTime) {
      const [startHour, startMinute] = sessionData.startTime
        .split(':')
        .map(Number);
      const [endHour, endMinute] = sessionData.endTime.split(':').map(Number);

      if (
        startHour > endHour ||
        (startHour === endHour && startMinute >= endMinute)
      ) {
        errors.push('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    }

    return errors;
  },

  /**
   * Validate dữ liệu vị trí
   */
  validateLocationData: (
    locationData: CreateClassLocationRequest,
  ): string[] => {
    const errors: string[] = [];

    if (!locationData.name || locationData.name.trim().length === 0) {
      errors.push('Tên vị trí là bắt buộc');
    }

    if (typeof locationData.latitude !== 'number') {
      errors.push('Vĩ độ phải là số');
    } else if (locationData.latitude < -90 || locationData.latitude > 90) {
      errors.push('Vĩ độ phải trong khoảng -90 đến 90');
    }

    if (typeof locationData.longitude !== 'number') {
      errors.push('Kinh độ phải là số');
    } else if (locationData.longitude < -180 || locationData.longitude > 180) {
      errors.push('Kinh độ phải trong khoảng -180 đến 180');
    }

    if (!locationData.address || locationData.address.trim().length === 0) {
      errors.push('Địa chỉ là bắt buộc');
    }

    if (
      locationData.radius &&
      (locationData.radius < 10 || locationData.radius > 1000)
    ) {
      errors.push('Bán kính phải trong khoảng 10 đến 1000 mét');
    }

    return errors;
  },

  /**
   * Format thời gian hiển thị
   */
  formatTime: (time: string): string => {
    try {
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
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

  /**
   * Format ngày hiển thị
   */
  formatDate: (date: string | Date): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('vi-VN');
    } catch (err) {
      return typeof date === 'string' ? date : date.toString();
    }
  },

  /**
   * ✅ Export helper functions từ types
   */
  calculateAttendanceRate,
  getAttendanceStatusColor,
  getAttendanceStatusLabel,
  formatAttendanceRate,

  /**
   * ✅ GeoJSON utility functions
   */
  geoJSONToLatLng,
  latLngToGeoJSON,
  getLocationCoordinates,

  /**
   * ✅ Constants từ types
   */
  ATTENDANCE_STATUS,
  CHECK_IN_METHOD,

  /**
   * ✅ Compatibility method cho mobile location
   * Convert device location thành format backend cần
   */
  prepareLocationForCheckIn: (deviceLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }): Location => {
    return {
      latitude: deviceLocation.latitude,
      longitude: deviceLocation.longitude,
      accuracy: deviceLocation.accuracy || 0,
    };
  },

  /**
   * ✅ Extract coordinates từ ClassLocation (support cả GeoJSON và virtual fields)
   */
  extractLocationCoordinates: (
    location: ClassLocation,
  ): {lat: number; lng: number; radius: number} => {
    const coords = getLocationCoordinates(location);
    return {
      lat: coords.latitude,
      lng: coords.longitude,
      radius: location.radius,
    };
  },

  /**
   * ✅ Check if location is valid for check-in
   */
  validateLocationForCheckIn: (
    userLocation: Location,
    classLocation: ClassLocation,
  ): {isValid: boolean; distance: number; message?: string} => {
    const result = attendanceService.isWithinRadius(
      userLocation,
      classLocation,
    );

    return {
      isValid: result.isWithin,
      distance: result.distance,
      message: result.isWithin
        ? 'Vị trí hợp lệ để điểm danh'
        : `Bạn đang ở cách vị trí trường học ${Math.round(
            result.distance,
          )}m, vui lòng đến gần hơn (trong phạm vi ${classLocation.radius}m)`,
    };
  },

  /**
   * ✅ Get today's date in ISO format cho create session
   */
  getTodayDateISO: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * ✅ Format session title helper
   */
  generateSessionTitle: (
    courseName: string,
    sessionNumber?: number,
  ): string => {
    const today = new Date().toLocaleDateString('vi-VN');
    const sessionText = sessionNumber ? ` - Buổi ${sessionNumber}` : '';
    return `${courseName}${sessionText} - ${today}`;
  },
};

export default attendanceService;
