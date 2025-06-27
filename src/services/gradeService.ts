import {
  CourseGrade,
  Component,
  AddCourseGradeParams,
  UpdateCourseGradeParams,
  UpdateGradeStatusParams,
  GradeFilterParams,
  GradeResponse,
  GradesResponse,
  StudentGradeResponse,
  CourseGradesResponse,
  TranscriptResponse,
  GPAStatsResponse,
  ImportGradesResponse,
  DeleteGradeResponse,
  UpdateGradeStatusResponse,
} from '../types/gradeType';
import apiClient from '../apis/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_PATH = '/grades';

export const gradeService = {
  /**
   * QUẢN LÝ ĐIỂM CHUNG
   * =================
   */

  // Lấy danh sách điểm với các bộ lọc
  getGrades: async (filters?: GradeFilterParams): Promise<GradesResponse> => {
    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();
      if (filters) {
        if (filters.courseId) {
          queryParams.append('courseId', filters.courseId);
        }
        if (filters.studentId) {
          queryParams.append('studentId', filters.studentId);
        }
        if (filters.status) {
          queryParams.append('status', filters.status);
        }
        if (filters.minGrade) {
          queryParams.append('minGrade', filters.minGrade.toString());
        }
        if (filters.maxGrade) {
          queryParams.append('maxGrade', filters.maxGrade.toString());
        }
        if (filters.semesterId) {
          queryParams.append('semesterId', filters.semesterId);
        }
        if (filters.page) {
          queryParams.append('page', filters.page.toString());
        }
        if (filters.limit) {
          queryParams.append('limit', filters.limit.toString());
        }
      }

      const url = `${API_PATH}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await apiClient.get<GradesResponse>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách điểm',
        data: [],
        error: error.message || 'Đã xảy ra lỗi khi tải danh sách điểm',
      };
    }
  },

  // Thêm điểm mới
  addGrade: async (gradeData: AddCourseGradeParams): Promise<GradeResponse> => {
    try {
      const response = await apiClient.post<GradeResponse>(API_PATH, gradeData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi thêm điểm',
        data: {} as CourseGrade,
        error: error.message || 'Đã xảy ra lỗi khi thêm điểm',
      };
    }
  },

  // Cập nhật điểm
  updateGrade: async (
    id: string,
    gradeData: UpdateCourseGradeParams,
  ): Promise<GradeResponse> => {
    try {
      const response = await apiClient.put<GradeResponse>(
        `${API_PATH}/${id}`,
        gradeData,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi cập nhật điểm',
        data: {} as CourseGrade,
        error: error.message || 'Đã xảy ra lỗi khi cập nhật điểm',
      };
    }
  },

  // Xóa điểm
  deleteGrade: async (id: string): Promise<DeleteGradeResponse> => {
    try {
      const response = await apiClient.delete<DeleteGradeResponse>(
        `${API_PATH}/${id}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi xóa điểm',
        error: error.message || 'Đã xảy ra lỗi khi xóa điểm',
      };
    }
  },

  // Cập nhật trạng thái điểm
  updateGradeStatus: async (
    id: string,
    statusData: UpdateGradeStatusParams,
  ): Promise<UpdateGradeStatusResponse> => {
    try {
      const response = await apiClient.patch<UpdateGradeStatusResponse>(
        `${API_PATH}/${id}/status`,
        statusData,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái điểm',
        error: error.message || 'Đã xảy ra lỗi khi cập nhật trạng thái điểm',
      };
    }
  },

  /**
   * QUẢN LÝ HỌC KỲ
   * =============
   */

  // Lấy danh sách học kỳ
  getSemesters: async (): Promise<{
    success: boolean;
    timestamp: string;
    message: string;
    data: any[];
    error?: string;
  }> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        timestamp: string;
        message: string;
        data: any[];
      }>(`${API_PATH}/semesters`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách học kỳ',
        data: [],
        error: error.message || 'Đã xảy ra lỗi khi tải danh sách học kỳ',
      };
    }
  },

  /**
   * QUẢN LÝ ĐIỂM THEO SINH VIÊN
   * =========================
   */

  // Lấy điểm của một sinh viên
  getStudentGrades: async (
    studentId: string,
  ): Promise<StudentGradeResponse> => {
    try {
      const response = await apiClient.get<StudentGradeResponse>(
        `${API_PATH}/student/${studentId}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải điểm của sinh viên',
        data: [],
        stats: {
          totalCredits: 0,
          gpa: 0,
          completedCourses: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải điểm của sinh viên',
      };
    }
  },

  // Lấy điểm của sinh viên đang đăng nhập (current user)
  getMyGrades: async (): Promise<StudentGradeResponse> => {
    try {
      const response = await apiClient.get<StudentGradeResponse>(
        `${API_PATH}/my-grades`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải điểm của bạn',
        data: [],
        stats: {
          totalCredits: 0,
          gpa: 0,
          completedCourses: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải điểm của bạn',
      };
    }
  },

  /**
   * QUẢN LÝ ĐIỂM THEO KHÓA HỌC
   * ========================
   */

  // Lấy điểm của một khóa học
  getCourseGrades: async (courseId: string): Promise<CourseGradesResponse> => {
    try {
      const response = await apiClient.get<CourseGradesResponse>(
        `${API_PATH}/course/${courseId}`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải điểm của khóa học',
        data: [],
        course: {
          _id: '',
          name: '',
          id: '',
        },
        count: 0,
        stats: {
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          highestGrade: 0,
          lowestGrade: 0,
          averageGrade: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải điểm của khóa học',
      };
    }
  },

  /**
   * QUẢN LÝ EXPORT/IMPORT ĐIỂM
   * =========================
   */

  // Xuất điểm ra Excel
  exportGradesToExcel: async (courseId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get<Blob>(
        `${API_PATH}/course/${courseId}/export`,
        {
          responseType: 'blob',
        },
      );
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.message || 'Đã xảy ra lỗi khi xuất điểm ra Excel');
    }
  },

  // Tải mẫu Excel
  getImportTemplate: async (courseId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get<Blob>(
        `${API_PATH}/course/${courseId}/template`,
        {
          responseType: 'blob',
        },
      );
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.message || 'Đã xảy ra lỗi khi tải mẫu Excel');
    }
  },

  // Nhập điểm từ Excel
  importGradesFromExcel: async (
    formData: FormData,
  ): Promise<ImportGradesResponse> => {
    try {
      const response = await apiClient.post<ImportGradesResponse>(
        `${API_PATH}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi nhập điểm từ Excel',
        data: {
          total: 0,
          success: 0,
          failed: 0,
          errors: [error.message || 'Đã xảy ra lỗi khi nhập điểm từ Excel'],
          updated: [],
        },
        error: error.message || 'Đã xảy ra lỗi khi nhập điểm từ Excel',
      };
    }
  },

  /**
   * CÁC ENDPOINTS BỔ SUNG
   * ===================
   */

  // Lấy điểm học kỳ hiện tại
  getCurrentSemesterGrades: async (): Promise<StudentGradeResponse> => {
    try {
      const response = await apiClient.get<StudentGradeResponse>(
        `${API_PATH}/current-semester`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải điểm học kỳ hiện tại',
        data: [],
        stats: {
          totalCredits: 0,
          gpa: 0,
          completedCourses: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải điểm học kỳ hiện tại',
      };
    }
  },

  // Lấy bảng điểm tổng hợp
  getTranscript: async (): Promise<TranscriptResponse> => {
    try {
      const response = await apiClient.get<TranscriptResponse>(
        `${API_PATH}/transcript`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải bảng điểm',
        data: [],
        semesterStats: [],
        overview: {
          totalCredits: 0,
          totalCourses: 0,
          completedCourses: 0,
          pendingCourses: 0,
          failedCourses: 0,
          cumulativeGPA: 0,
        },
        error: error.message || 'Đã xảy ra lỗi khi tải bảng điểm',
      };
    }
  },

  // Lấy thống kê GPA
  getGPAStats: async (): Promise<GPAStatsResponse> => {
    try {
      const response = await apiClient.get<GPAStatsResponse>(
        `${API_PATH}/gpa-stats`,
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: error.message || 'Đã xảy ra lỗi khi tải thống kê GPA',
        data: {
          overview: {
            totalCredits: 0,
            totalCourses: 0,
            completedCourses: 0,
            pendingCourses: 0,
            failedCourses: 0,
            cumulativeGPA: 0,
          },
          semesterProgress: {
            labels: [],
            gpas: [],
            credits: [],
          },
        },
        error: error.message || 'Đã xảy ra lỗi khi tải thống kê GPA',
      };
    }
  },

  /**
   * HELPER METHODS (Client-side)
   * ==========================
   */

  // Tính toán điểm từ các thành phần
  calculateGrade: (components: Component[]): number => {
    // Nếu không có components, trả về 0
    if (!components || components.length === 0) {
      return 0;
    }

    // Định nghĩa trọng số mặc định cho từng loại điểm
    const weights: {[key: string]: number} = {
      attendance: 0.1,
      midterm: 0.3,
      final: 0.6,
      assignment: 0.1,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const component of components) {
      let weight = 0;
      const name = component.name.toLowerCase();

      if (
        name.includes('attendance') ||
        name.includes('điểm danh') ||
        name.includes('chuyên cần')
      ) {
        weight = weights.attendance;
      } else if (name.includes('midterm') || name.includes('giữa kỳ')) {
        weight = weights.midterm;
      } else if (name.includes('final') || name.includes('cuối kỳ')) {
        weight = weights.final;
      } else if (name.includes('assignment') || name.includes('bài tập')) {
        weight = weights.assignment;
      } else {
        // Trọng số mặc định nếu không nhận dạng được
        weight = 0.1;
      }

      totalWeightedScore += component.score * weight;
      totalWeight += weight;
    }

    // Tính điểm trung bình có trọng số
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  },

  // Xác định điểm chữ dựa trên điểm số
  getLetterGrade: (score: number): string => {
    if (score >= 9.0) {
      return 'A+';
    }
    if (score >= 8.5) {
      return 'A';
    }
    if (score >= 8.0) {
      return 'B+';
    }
    if (score >= 7.0) {
      return 'B';
    }
    if (score >= 6.5) {
      return 'C+';
    }
    if (score >= 5.5) {
      return 'C';
    }
    if (score >= 5.0) {
      return 'D+';
    }
    if (score >= 4.0) {
      return 'D';
    }
    return 'F';
  },

  // Phân loại điểm theo học kỳ
  processCourseGrades: (
    grades: CourseGrade[],
  ): {[key: string]: CourseGrade[]} => {
    const groupedGrades: {[key: string]: CourseGrade[]} = {};

    grades.forEach(grade => {
      const semester =
        grade.courseId.semesterInfo?.displayName || 'Chưa xác định';

      if (!groupedGrades[semester]) {
        groupedGrades[semester] = [];
      }

      groupedGrades[semester].push(grade);
    });

    return groupedGrades;
  },

  /**
   * CACHE METHODS
   * ===========
   */

  // Cache grades data
  cacheGradesData: async (cacheKey: string, data: any): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      // Silent fail for cache errors
    }
  },

  // Get cached grades data
  getCachedGradesData: async (
    cacheKey: string,
    maxAge: number = 3600000,
  ): Promise<any | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cacheTime = parsedData.timestamp;

        // Check if cache is still valid (default: less than 1 hour old)
        if (Date.now() - cacheTime < maxAge) {
          return parsedData.data;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  },
};

export default gradeService;
