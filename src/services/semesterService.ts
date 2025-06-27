import apiClient from '../apis/apiClient';
import {
  Semester,
  SemesterInfo,
  SemesterParams,
  SemesterResponse,
  SemestersResponse,
  SemesterCourseIdsResponse,
  StudentCoursesBySemesterResponse,
  InstructorCoursesBySemesterResponse,
  AcademicYearsResponse,
  AddCourseToSemesterResponse,
  RemoveCourseFromSemesterResponse,
  SetCurrentSemesterResponse,
  CreateSemesterResponse,
  UpdateSemesterResponse,
  DeleteSemesterResponse,
} from '../types/semesterType';

const API_PATH = '/semesters';

// ✅ Interface cho response thực tế từ API
interface ActualSemestersResponse {
  success: boolean;
  timestamp: string;
  data: {
    count: number;
    data: SemesterInfo[];
  };
  message: string;
  error?: string;
}

export const semesterService = {
  // Lấy tất cả học kỳ
  getAllSemesters: async (params?: {
    academicYear?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<SemestersResponse> => {
    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.academicYear)
          queryParams.append('academicYear', params.academicYear);
        if (params.isActive !== undefined)
          queryParams.append('isActive', params.isActive.toString());
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
      }

      const url = `${API_PATH}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      // ✅ Sử dụng interface thực tế
      const response = await apiClient.get<ActualSemestersResponse>(url);

      // ✅ Transform response để match với expected interface
      const transformedResponse: SemestersResponse = {
        success: response.success,
        timestamp: response.timestamp,
        data: response.data?.data || [], // Lấy data.data từ response
        message: response.message,
        count: response.data?.count,
        error: response.error,
      };

      return transformedResponse;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải danh sách học kỳ',
        data: [],
        error: err.message || 'Đã xảy ra lỗi khi tải danh sách học kỳ',
      };
    }
  },

  // Lấy học kỳ hiện tại
  getCurrentSemester: async (): Promise<SemesterResponse> => {
    try {
      const response = await apiClient.get<SemesterResponse>(
        `${API_PATH}/current`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải học kỳ hiện tại',
        data: {} as SemesterInfo,
        error: err.message || 'Đã xảy ra lỗi khi tải học kỳ hiện tại',
      };
    }
  },

  // Lấy chi tiết học kỳ
  getSemesterById: async (id: string): Promise<SemesterResponse> => {
    try {
      const response = await apiClient.get<SemesterResponse>(
        `${API_PATH}/${id}`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải thông tin học kỳ',
        data: {} as SemesterInfo,
        error: err.message || 'Đã xảy ra lỗi khi tải thông tin học kỳ',
      };
    }
  },

  // Lấy danh sách khóa học IDs trong học kỳ
  getSemesterCourseIds: async (
    id: string,
  ): Promise<SemesterCourseIdsResponse> => {
    try {
      const response = await apiClient.get<SemesterCourseIdsResponse>(
        `${API_PATH}/${id}/courses`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message ||
          'Đã xảy ra lỗi khi tải danh sách ID khóa học của học kỳ',
        data: {
          semester: {} as any,
          courseIds: [],
        },
        error:
          err.message ||
          'Đã xảy ra lỗi khi tải danh sách ID khóa học của học kỳ',
      };
    }
  },

  // Lấy khóa học của sinh viên trong học kỳ (từ CourseController)
  getStudentCoursesBySemester: async (
    id: string,
  ): Promise<StudentCoursesBySemesterResponse> => {
    try {
      const response = await apiClient.get<StudentCoursesBySemesterResponse>(
        `${API_PATH}/${id}/student-courses`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message ||
          'Đã xảy ra lỗi khi tải khóa học của sinh viên trong học kỳ',
        data: {
          semester: {} as SemesterInfo,
          courses: [],
        },
        error:
          err.message ||
          'Đã xảy ra lỗi khi tải khóa học của sinh viên trong học kỳ',
      };
    }
  },

  // Lấy khóa học của giảng viên trong học kỳ (từ CourseController)
  getInstructorCoursesBySemester: async (
    id: string,
  ): Promise<InstructorCoursesBySemesterResponse> => {
    try {
      const response = await apiClient.get<InstructorCoursesBySemesterResponse>(
        `${API_PATH}/${id}/instructor-courses`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message:
          err.message ||
          'Đã xảy ra lỗi khi tải khóa học của giảng viên trong học kỳ',
        data: {
          semester: {} as SemesterInfo,
          courses: [],
        },
        error:
          err.message ||
          'Đã xảy ra lỗi khi tải khóa học của giảng viên trong học kỳ',
      };
    }
  },

  // Lấy danh sách năm học
  getAcademicYears: async (): Promise<AcademicYearsResponse> => {
    try {
      const response = await apiClient.get<AcademicYearsResponse>(
        `${API_PATH}/academic-years`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tải danh sách năm học',
        data: [],
        error: err.message || 'Đã xảy ra lỗi khi tải danh sách năm học',
      };
    }
  },

  // Tạo học kỳ mới
  createSemester: async (
    semesterData: SemesterParams,
  ): Promise<CreateSemesterResponse> => {
    try {
      const response = await apiClient.post<CreateSemesterResponse>(
        API_PATH,
        semesterData,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi tạo học kỳ',
        data: {} as SemesterInfo,
        error: err.message || 'Đã xảy ra lỗi khi tạo học kỳ',
      };
    }
  },

  // Cập nhật học kỳ
  updateSemester: async (
    id: string,
    semesterData: Partial<SemesterParams>,
  ): Promise<UpdateSemesterResponse> => {
    try {
      const response = await apiClient.put<UpdateSemesterResponse>(
        `${API_PATH}/${id}`,
        semesterData,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi cập nhật học kỳ',
        data: {} as SemesterInfo,
        error: err.message || 'Đã xảy ra lỗi khi cập nhật học kỳ',
      };
    }
  },

  // Xóa học kỳ
  deleteSemester: async (id: string): Promise<DeleteSemesterResponse> => {
    try {
      const response = await apiClient.delete<DeleteSemesterResponse>(
        `${API_PATH}/${id}`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi xóa học kỳ',
        data: null,
        error: err.message || 'Đã xảy ra lỗi khi xóa học kỳ',
      };
    }
  },

  // Đặt học kỳ làm học kỳ hiện tại
  setCurrentSemester: async (
    id: string,
  ): Promise<SetCurrentSemesterResponse> => {
    try {
      const response = await apiClient.put<SetCurrentSemesterResponse>(
        `${API_PATH}/${id}/set-current`,
        {},
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi thiết lập học kỳ hiện tại',
        data: {} as SemesterInfo,
        error: err.message || 'Đã xảy ra lỗi khi thiết lập học kỳ hiện tại',
      };
    }
  },

  // Thêm khóa học vào học kỳ
  addCourseToSemester: async (
    semesterId: string,
    courseId: string,
  ): Promise<AddCourseToSemesterResponse> => {
    try {
      const response = await apiClient.post<AddCourseToSemesterResponse>(
        `${API_PATH}/${semesterId}/courses`,
        {courseId},
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi thêm khóa học vào học kỳ',
        data: {
          semesterId: '',
          courseId: '',
        },
        error: err.message || 'Đã xảy ra lỗi khi thêm khóa học vào học kỳ',
      };
    }
  },

  // Xóa khóa học khỏi học kỳ
  removeCourseFromSemester: async (
    semesterId: string,
    courseId: string,
  ): Promise<RemoveCourseFromSemesterResponse> => {
    try {
      const response = await apiClient.delete<RemoveCourseFromSemesterResponse>(
        `${API_PATH}/${semesterId}/courses/${courseId}`,
      );
      return response;
    } catch (err: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: err.message || 'Đã xảy ra lỗi khi xóa khóa học khỏi học kỳ',
        data: null,
        error: err.message || 'Đã xảy ra lỗi khi xóa khóa học khỏi học kỳ',
      };
    }
  },

  // ✅ Cập nhật formatSemesterName để xử lý đúng cấu trúc
  formatSemesterName: (semester: SemesterInfo | Semester): string => {
    if (!semester) return 'Chưa có thông tin';

    // Nếu có displayName, sử dụng nó
    if (semester.displayName) return semester.displayName;

    // Nếu không, tạo từ semester và academicYear
    let semesterName = '';
    let semValue = '';
    let academicYearValue = '';

    // ✅ Xác định semester value (cho SemesterInfo từ API)
    if ('semester' in semester && typeof semester.semester === 'string') {
      semValue = semester.semester;
    } else if ('name' in semester) {
      semValue = semester.name || '';
    }

    // ✅ Xác định academicYear value
    if (typeof semester.academicYear === 'string') {
      academicYearValue = semester.academicYear;
    } else if (
      typeof semester.academicYear === 'object' &&
      semester.academicYear &&
      'name' in semester.academicYear
    ) {
      academicYearValue = semester.academicYear.name || '';
    }

    // Format lại tên học kỳ
    switch (semValue) {
      case 'HK1':
        semesterName = 'Học kỳ 1';
        break;
      case 'HK2':
        semesterName = 'Học kỳ 2';
        break;
      case 'HK3':
        semesterName = 'Học kỳ 3';
        break;
      default:
        semesterName = semValue;
    }

    return academicYearValue
      ? `${semesterName}, ${academicYearValue}`
      : semesterName;
  },
};

export default semesterService;
