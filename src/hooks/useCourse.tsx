import {useState, useCallback} from 'react';
import {
  Course,
  CreateCourseParams,
  UpdateCourseParams,
  CreateAnnouncementParams,
  UpdateCourseStatusParams,
  CourseFilterParams,
  CourseResponse,
  CoursesResponse,
  CourseSemesterResponse,
  InstructorCoursesResponse,
  EnrollmentResponse,
  ApiResponse,
  Schedule,
  SemesterInfo,
  CourseUtils,
} from '../types/courseType';
import {courseService} from '../services/courseService';

// ✅ SỬA: Interface cho student course response (nếu khác với CoursesResponse)
export interface StudentCoursesResponse extends CoursesResponse {}

// ✅ SỬA: Interface cho announcement response (nếu backend có)
export interface AnnouncementResponse
  extends ApiResponse<{
    _id: string;
    title: string;
    content: string;
    courseId: string;
    createdBy: string;
    createdAt: string;
  }> {}

// ✅ SỬA: Interface cho material response (nếu backend có)
export interface MaterialResponse
  extends ApiResponse<{
    _id: string;
    title: string;
    author: string;
    type: string;
    size: string;
    filePath: string;
    category?: string;
    description?: string;
    courseId: string;
    uploadedBy: string;
    createdAt: string;
  }> {}

export const useCourse = () => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [semesterCourses, setSemesterCourses] = useState<{
    courses: Course[];
    semester: SemesterInfo;
  } | null>(null);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * QUẢN LÝ KHÓA HỌC CHUNG
   * ======================
   */

  // ✅ SỬA: Lấy tất cả khóa học với backend response format - BỎ TOAST
  const getAllCourses = useCallback(
    async (filters?: CourseFilterParams): Promise<Course[]> => {
      try {
        setLoading(true);

        const response: CoursesResponse = await courseService.getAllCourses(
          filters,
        );

        if (response.success && response.data) {
          setCourses(response.data.courses);
          return response.data.courses;
        } else {
          console.warn(
            'Failed to load courses:',
            response.message || response.error,
          );
          return [];
        }
      } catch (error: any) {
        console.error('Error loading courses:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Lấy một khóa học theo ID với null check - BỎ TOAST
  const getCourseById = useCallback(
    async (id: string): Promise<Course | null> => {
      try {
        setLoading(true);

        const response: CourseResponse = await courseService.getCourseById(id);

        if (response.success && response.data) {
          setCourse(response.data);
          return response.data;
        } else {
          console.warn(
            'Failed to load course:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error loading course:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Tạo khóa học mới với null check - BỎ TOAST
  const createCourse = useCallback(
    async (courseData: CreateCourseParams): Promise<Course | null> => {
      try {
        setLoading(true);

        const response: CourseResponse = await courseService.createCourse(
          courseData,
        );

        if (response.success && response.data) {
          // Cập nhật danh sách khóa học
          setCourses(prev => [response.data!, ...prev]);
          return response.data;
        } else {
          console.warn(
            'Failed to create course:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error creating course:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Cập nhật khóa học với null check - BỎ TOAST
  const updateCourse = useCallback(
    async (
      id: string,
      courseData: UpdateCourseParams,
    ): Promise<Course | null> => {
      try {
        setLoading(true);

        const response: CourseResponse = await courseService.updateCourse(
          id,
          courseData,
        );

        if (response.success && response.data) {
          setCourse(response.data);

          // Cập nhật trong danh sách courses
          setCourses(prev =>
            prev.map(c => (c._id === id ? response.data! : c)),
          );

          return response.data;
        } else {
          console.warn(
            'Failed to update course:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error updating course:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Xóa khóa học (chỉ admin) - BỎ TOAST
  const deleteCourse = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response: ApiResponse<null> = await courseService.deleteCourse(
          id,
        );

        if (response.success) {
          // Xóa khỏi danh sách courses
          setCourses(prev => prev.filter(c => c._id !== id));

          // Clear course hiện tại nếu đang xem course bị xóa
          if (course && course._id === id) {
            setCourse(null);
          }

          return true;
        } else {
          console.warn(
            'Failed to delete course:',
            response.message || response.error,
          );
          return false;
        }
      } catch (error: any) {
        console.error('Error deleting course:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [course],
  );

  /**
   * QUẢN LÝ KHÓA HỌC THEO HỌC KỲ
   * ===========================
   */

  // ✅ SỬA: Lấy khóa học theo học kỳ với type safety - BỎ TOAST
  const getCoursesBySemester = useCallback(async (semesterId: string) => {
    try {
      setLoading(true);

      const response: CourseSemesterResponse =
        await courseService.getCoursesBySemester(semesterId);

      if (response.success && response.data && response.data.semester) {
        const result = {
          courses: response.data.courses,
          semester: response.data.semester,
        };
        setSemesterCourses(result);
        return result;
      } else {
        console.warn(
          'Failed to load courses by semester:',
          response.message || response.error,
        );
        return null;
      }
    } catch (error: any) {
      console.error('Error loading courses by semester:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * QUẢN LÝ KHÓA HỌC CHO GIẢNG VIÊN
   * ==============================
   */

  // Lấy khóa học của giảng viên - BỎ TOAST
  const getInstructorCourses = useCallback(
    async (filters?: CourseFilterParams) => {
      try {
        setLoading(true);

        const response: InstructorCoursesResponse =
          await courseService.getInstructorCourses(filters);

        if (response.success && response.data) {
          setInstructorCourses(response.data.courses);
          return response.data.courses;
        } else {
          console.warn(
            'Failed to load instructor courses:',
            response.message || response.error,
          );
          return [];
        }
      } catch (error: any) {
        console.error('Error loading instructor courses:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Tạo thông báo khóa học (nếu backend hỗ trợ) - BỎ TOAST
  const createCourseAnnouncement = useCallback(
    async (_courseId: string, _announcementData: CreateAnnouncementParams) => {
      try {
        setLoading(true);

        // ✅ Chú ý: Cần implement endpoint này trong courseService nếu backend hỗ trợ
        // const response = await courseService.createCourseAnnouncement(courseId, announcementData);

        // Tạm thời return mock response
        console.warn('Course announcement feature is under development');
        return null;
      } catch (error: any) {
        console.error('Error creating course announcement:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * QUẢN LÝ SINH VIÊN TRONG KHÓA HỌC
   * ==============================
   */

  // ✅ SỬA: Lấy danh sách khóa học của sinh viên = getAllCourses với filter studentId - BỎ TOAST
  const getStudentCourses = useCallback(
    async (filters?: CourseFilterParams): Promise<Course[]> => {
      try {
        setLoading(true);

        // ✅ SỬA: Sử dụng getAllCourses với filter studentId thay vì endpoint riêng
        const response: CoursesResponse = await courseService.getAllCourses(
          filters,
        );

        if (response.success && response.data) {
          const coursesData = response.data.courses || [];
          setCourses(coursesData);
          return coursesData;
        } else {
          console.warn(
            'Failed to load student courses:',
            response.message || response.error,
          );
          return [];
        }
      } catch (error: any) {
        console.error('Error loading student courses:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Lấy chi tiết khóa học của sinh viên = getCourseById - BỎ TOAST
  const getStudentCourseDetail = useCallback(
    async (courseId: string): Promise<Course | null> => {
      try {
        setLoading(true);

        // ✅ SỬA: Sử dụng getCourseById thay vì endpoint riêng
        const response: CourseResponse = await courseService.getCourseById(
          courseId,
        );

        if (response.success && response.data) {
          setCourse(response.data);
          return response.data;
        } else {
          console.warn(
            'Failed to load student course detail:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error loading student course detail:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Đăng ký sinh viên vào khóa học - BỎ TOAST
  const enrollStudentToCourse = useCallback(
    async (courseId: string, studentId?: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response: EnrollmentResponse =
          await courseService.enrollStudentToCourse(courseId, studentId);

        if (response.success && response.data) {
          // Refresh course detail để cập nhật danh sách sinh viên
          if (course && course._id === courseId) {
            await getCourseById(courseId);
          }

          return true;
        } else {
          console.warn(
            'Failed to enroll student:',
            response.message || response.error,
          );
          return false;
        }
      } catch (error: any) {
        console.error('Error enrolling student:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [course, getCourseById],
  );

  // ✅ SỬA: Hủy đăng ký sinh viên khỏi khóa học - BỎ TOAST
  const unenrollStudentFromCourse = useCallback(
    async (courseId: string, studentId?: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response: ApiResponse<{message?: string}> =
          await courseService.unenrollStudentFromCourse(courseId, studentId);

        if (response.success) {
          // Refresh course detail để cập nhật danh sách sinh viên
          if (course && course._id === courseId) {
            await getCourseById(courseId);
          }

          return true;
        } else {
          console.warn(
            'Failed to unenroll student:',
            response.message || response.error,
          );
          return false;
        }
      } catch (error: any) {
        console.error('Error unenrolling student:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [course, getCourseById],
  );

  // ✅ SỬA: Cập nhật trạng thái khóa học với status types mới - BỎ TOAST
  const updateCourseStatus = useCallback(
    async (
      courseId: string,
      status: 'ongoing' | 'upcoming' | 'completed' | 'cancelled' | 'paused',
    ): Promise<Course | null> => {
      try {
        setLoading(true);

        const statusData: UpdateCourseStatusParams = {status};
        const response: CourseResponse = await courseService.updateCourseStatus(
          courseId,
          statusData,
        );

        if (response.success && response.data) {
          // Cập nhật course hiện tại
          if (course && course._id === courseId) {
            setCourse(response.data);
          }

          // Cập nhật trong danh sách courses
          setCourses(prev =>
            prev.map(c => (c._id === courseId ? response.data! : c)),
          );

          return response.data;
        } else {
          console.warn(
            'Failed to update course status:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error updating course status:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [course],
  );

  /**
   * TÀI LIỆU KHÓA HỌC
   * ================
   */

  // ✅ SỬA: Thêm tài liệu mới cho khóa học (nếu backend hỗ trợ) - BỎ TOAST
  const addCourseMaterial = useCallback(async (_courseId: string) => {
    try {
      setLoading(true);

      // ✅ Chú ý: Cần implement endpoint này trong courseService nếu backend hỗ trợ
      // const response = await courseService.addCourseMaterial(courseId, materialData);

      // Tạm thời return mock response
      console.warn('Course material feature is under development');
      return null;
    } catch (error: any) {
      console.error('Error adding course material:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * QUẢN LÝ LỊCH HỌC
   * ================
   */

  // ✅ SỬA: Lấy lịch học theo ngày - BỎ TOAST
  const getScheduleByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);

      const response = await courseService.getScheduleByDate(date);

      if (response.success && response.data) {
        return response.data.schedules || [];
      } else {
        console.warn(
          'Failed to load schedule by date:',
          response.message || response.error,
        );
        return [];
      }
    } catch (error: any) {
      console.error('Error loading schedule by date:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ SỬA: Lấy lịch học theo khoảng thời gian - BỎ TOAST
  const getScheduleByRange = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        setLoading(true);

        const response = await courseService.getScheduleByRange(
          startDate,
          endDate,
        );

        if (response.success && response.data) {
          return response.data.schedules || [];
        } else {
          console.warn(
            'Failed to load schedule by range:',
            response.message || response.error,
          );
          return [];
        }
      } catch (error: any) {
        console.error('Error loading schedule by range:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ SỬA: Lấy lịch học theo học kỳ - BỎ TOAST
  const getScheduleBySemester = useCallback(async (semesterId: string) => {
    try {
      setLoading(true);

      const response = await courseService.getScheduleBySemester(semesterId);

      if (response.success && response.data) {
        return {
          schedule: response.data.schedules || [],
          count: response.data.count || 0,
        };
      } else {
        console.warn(
          'Failed to load schedule by semester:',
          response.message || response.error,
        );
        return null;
      }
    } catch (error: any) {
      console.error('Error loading schedule by semester:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ THÊM: Cập nhật lịch học khóa học - BỎ TOAST
  const updateCourseSchedule = useCallback(
    async (courseId: string, schedule: Schedule[]): Promise<Course | null> => {
      try {
        setLoading(true);

        const response: CourseResponse =
          await courseService.updateCourseSchedule(courseId, schedule);

        if (response.success && response.data) {
          // Cập nhật course hiện tại
          if (course && course._id === courseId) {
            setCourse(response.data);
          }

          // Cập nhật trong danh sách courses
          setCourses(prev =>
            prev.map(c => (c._id === courseId ? response.data! : c)),
          );

          return response.data;
        } else {
          console.warn(
            'Failed to update course schedule:',
            response.message || response.error,
          );
          return null;
        }
      } catch (error: any) {
        console.error('Error updating course schedule:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [course],
  );

  // ✅ THÊM: Lấy thống kê khóa học - BỎ TOAST
  const getCourseStats = useCallback(async (courseId: string) => {
    try {
      setLoading(true);

      const response = await courseService.getCourseStats(courseId);

      if (response.success && response.data) {
        return {
          course: response.data.course,
          stats: response.data.stats,
        };
      } else {
        console.warn(
          'Failed to load course stats:',
          response.message || response.error,
        );
        return null;
      }
    } catch (error: any) {
      console.error('Error loading course stats:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * HÀM TIỆN ÍCH
   * ===========
   */

  // ✅ SỬA: Phân loại khóa học theo trạng thái với status types mới
  const categorizeByStatus = useCallback(
    (courseList: Course[] = courses) => {
      return courseService.categorizeByStatus(courseList);
    },
    [courses],
  );

  // Làm mới dữ liệu khóa học
  const refreshCourses = useCallback(
    async (filters?: CourseFilterParams): Promise<Course[]> => {
      setRefreshing(true);
      try {
        return await getAllCourses(filters);
      } finally {
        setRefreshing(false);
      }
    },
    [getAllCourses],
  );

  // ✅ SỬA: Validate dữ liệu lịch học với Schedule interface mới
  const validateScheduleData = useCallback((schedule: Schedule[]) => {
    return courseService.validateScheduleData(schedule);
  }, []);

  // Format thời gian
  const formatTime = useCallback((time: string) => {
    return courseService.formatTime(time);
  }, []);

  // Lấy tên ngày trong tuần bằng tiếng Việt
  const getDayNameInVietnamese = useCallback((dayOfWeek: string) => {
    return courseService.getDayNameInVietnamese(dayOfWeek);
  }, []);

  // ✅ THÊM: Helper functions từ CourseUtils
  const parseBackendDate = useCallback((dateString: string) => {
    return CourseUtils.parseBackendDate(dateString);
  }, []);

  const formatDisplayDate = useCallback((dateString: string) => {
    return CourseUtils.formatDisplayDate(dateString);
  }, []);

  const formatAPIDate = useCallback((date: Date) => {
    return CourseUtils.formatAPIDate(date);
  }, []);

  const isPopulatedInstructor = useCallback((instructorId: any) => {
    return CourseUtils.isPopulatedInstructor(instructorId);
  }, []);

  const isPopulatedSemester = useCallback((semesterInfo: any) => {
    return CourseUtils.isPopulatedSemester(semesterInfo);
  }, []);

  const extractCourseId = useCallback((compositeId: string) => {
    return CourseUtils.extractCourseId(compositeId);
  }, []);

  return {
    // States
    loading,
    courses,
    course,
    semesterCourses,
    instructorCourses,
    refreshing,

    // QUẢN LÝ KHÓA HỌC CHUNG
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,

    // QUẢN LÝ KHÓA HỌC THEO HỌC KỲ
    getCoursesBySemester,

    // QUẢN LÝ KHÓA HỌC CHO GIẢNG VIÊN
    getInstructorCourses,
    createCourseAnnouncement,

    // QUẢN LÝ SINH VIÊN TRONG KHÓA HỌC
    getStudentCourses,
    getStudentCourseDetail,
    enrollStudentToCourse,
    unenrollStudentFromCourse,
    updateCourseStatus,

    // TÀI LIỆU KHÓA HỌC
    addCourseMaterial,

    // QUẢN LÝ LỊCH HỌC VÀ THỐNG KÊ
    getScheduleByDate,
    getScheduleByRange,
    getScheduleBySemester,
    updateCourseSchedule,
    getCourseStats, // ✅ THÊM

    // HÀM TIỆN ÍCH
    categorizeByStatus,
    refreshCourses,
    validateScheduleData,
    formatTime,
    getDayNameInVietnamese,

    // ✅ THÊM: Helper functions từ CourseUtils
    parseBackendDate,
    formatDisplayDate,
    formatAPIDate,
    isPopulatedInstructor,
    isPopulatedSemester,
    extractCourseId,
  };
};

export default useCourse;
