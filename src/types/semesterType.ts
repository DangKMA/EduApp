import {Course} from './courseType';
import {User} from './userType';

/**
 * Interface cho model SemesterInfo từ backend
 * Tương ứng với SemesterInfoSchema trong backend
 */
export interface SemesterInfo {
  _id: string;
  semester: 'HK1' | 'HK2' | 'HK3'; // Enum trong backend: HK1, HK2, HK3
  academicYear: string; // Ví dụ: 2022-2023
  displayName: string; // Tên hiển thị đầy đủ
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean; // Học kỳ đang active
  isCurrent: boolean; // Học kỳ hiện tại
  courses: string[]; // Array of Course IDs
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Interface cho Semester được sử dụng trong frontend
 * Mapping từ SemesterInfo nhưng điều chỉnh cho UI
 */
export interface Semester {
  _id: string;
  name: string; // Map từ semester trong SemesterInfo (HK1, HK2, HK3)
  academicYear: string | {name: string}; // Năm học
  displayName: string; // Tên hiển thị đầy đủ
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  isCurrent: boolean;
  courses?: string[]; // IDs của các courses
}

/**
 * Interface cho SemesterWithCourses - khi lấy semester với danh sách khóa học
 * Tương ứng với response từ getSemesterCourses trong backend
 */
export interface SemesterWithCourses {
  semester: SemesterInfo;
  courses: Course[];
}

/**
 * SemesterParams - thông tin cần thiết để tạo hoặc cập nhật Semester
 * Tương ứng với các tham số trong createSemester và updateSemester
 */
export interface SemesterParams {
  semester: 'HK1' | 'HK2' | 'HK3';
  academicYear: string;
  displayName: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive?: boolean;
  isCurrent?: boolean;
}

/**
 * Interface cho SemesterStats từ backend
 * Tương ứng với SemesterStatsSchema
 */
export interface SemesterStats {
  _id: string;
  student: string | User; // ID của sinh viên
  semester: string; // HK1, HK2, HK3
  academicYear: string; // 2022-2023
  semesterInfo?: string | SemesterInfo; // ID của SemesterInfo
  gpa: number; // Điểm trung bình (0-4)
  totalCredits: number; // Tổng số tín chỉ
  averageScore: number; // Điểm trung bình (0-10)
  passRate: number; // Tỷ lệ đạt (0-100)
  courseCount: number; // Số lượng khóa học
  gradeDistribution: {
    'A+': number;
    A: number;
    'B+': number;
    B: number;
    'C+': number;
    C: number;
    'D+': number;
    D: number;
    F: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Interface cho CumulativeStats từ backend
 * Tương ứng với CumulativeStatsSchema
 */
export interface CumulativeStats {
  _id: string;
  student: string | User; // ID của sinh viên
  cumulativeGPA: number; // Điểm trung bình tích lũy (0-4)
  totalCreditsCompleted: number; // Tổng số tín chỉ đã hoàn thành
  totalCoursesPassed: number; // Số khóa học đã qua
  totalCoursesAttempted: number; // Số khóa học đã tham gia
  gradeDistribution: {
    'A+': number;
    A: number;
    'B+': number;
    B: number;
    'C+': number;
    C: number;
    'D+': number;
    D: number;
    F: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Interface cho GradeOverview response từ getGradeOverview
 */
export interface GradeOverview {
  cumulativeStats: CumulativeStats;
  gpaHistory: Array<{
    semester: string;
    gpa: number;
  }>;
}

/**
 * Interface cho SemesterGrades response từ getSemesterGrades
 */
export interface SemesterGrades {
  courseGrades: Array<any>; // Điểm các khóa học, sẽ phụ thuộc vào CourseGrade model
  semesterStats: SemesterStats;
}

/**
 * Interface cho thống kê điểm danh của sinh viên
 */
export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  courseStats: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
  }>;
}

/**
 * Interface cho API Response - CẬP NHẬT để đồng bộ với backend structure
 * Bao gồm timestamp field từ backend response
 */
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string; // Thêm timestamp field
  data?: T; // Thay đổi từ data: T thành data?: T để phù hợp với backend
  message: string; // Thay đổi từ optional thành required
  count?: number; // Giữ nguyên optional
  error?: string; // Giữ nguyên optional
}

/**
 * Interface cho API Response với thông tin về học kỳ
 */
export interface SemesterResponse extends ApiResponse<SemesterInfo> {}

/**
 * Interface cho API Response với thông tin danh sách học kỳ
 */
export interface SemestersResponse extends ApiResponse<SemesterInfo[]> {}

/**
 * Interface cho API Response với thông tin về khóa học trong học kỳ
 * Tương ứng với response từ getSemesterCourses
 */
export interface SemesterCoursesResponse
  extends ApiResponse<SemesterWithCourses> {}

/**
 * Interface cho API Response với thông tin về khóa học của sinh viên trong học kỳ
 * Tương ứng với response từ getStudentCoursesBySemester
 */
export interface StudentCoursesBySemesterResponse
  extends ApiResponse<SemesterWithCourses> {}

/**
 * Interface cho API Response với thông tin về khóa học của giảng viên trong học kỳ
 * Tương ứng với response từ getInstructorCoursesBySemester
 */
export interface InstructorCoursesBySemesterResponse
  extends ApiResponse<SemesterWithCourses> {}

/**
 * Interface cho API Response với thông tin về GradeOverview
 */
export interface GradeOverviewResponse extends ApiResponse<GradeOverview> {}

/**
 * Interface cho API Response với thông tin về SemesterGrades
 */
export interface SemesterGradesResponse extends ApiResponse<SemesterGrades> {}

/**
 * Interface cho API Response với thông tin về danh sách học kỳ của người dùng
 */
export interface UserSemestersResponse extends ApiResponse<string[]> {}

/**
 * Interface cho API Response với thông tin về academic years
 */
export interface AcademicYearsResponse extends ApiResponse<string[]> {}

/**
 * Interface cho API Response với thông tin về recalculated stats
 */
export interface RecalculatedStatsResponse
  extends ApiResponse<{
    cumulativeStats: CumulativeStats;
  }> {}

/**
 * Interface cho API Response với danh sách ID khóa học trong học kỳ
 * Tương ứng với response từ getSemesterCourseIds
 */
export interface SemesterCourseIdsResponse
  extends ApiResponse<{
    semester: {
      _id: string;
      semester: 'HK1' | 'HK2' | 'HK3';
      academicYear: string;
      displayName: string;
      startDate: string | Date;
      endDate: string | Date;
    };
    courseIds: string[];
  }> {}

/**
 * Interface cho API Response khi thêm khóa học vào học kỳ
 * Tương ứng với response từ addCourseToSemester
 */
export interface AddCourseToSemesterResponse
  extends ApiResponse<{
    semesterId: string;
    courseId: string;
  }> {}

/**
 * Interface cho API Response khi xóa khóa học khỏi học kỳ
 * Tương ứng với response từ removeCourseFromSemester
 */
export interface RemoveCourseFromSemesterResponse extends ApiResponse<null> {}

/**
 * Interface cho API Response khi đặt học kỳ hiện tại
 * Tương ứng với response từ setCurrentSemester
 */
export interface SetCurrentSemesterResponse extends ApiResponse<SemesterInfo> {}

/**
 * Interface cho API Response khi tạo học kỳ mới
 * Tương ứng với response từ createSemester
 */
export interface CreateSemesterResponse extends ApiResponse<SemesterInfo> {}

/**
 * Interface cho API Response khi cập nhật thông tin học kỳ
 * Tương ứng với response từ updateSemester
 */
export interface UpdateSemesterResponse extends ApiResponse<SemesterInfo> {}

/**
 * Interface cho API Response khi xóa học kỳ
 * Tương ứng với response từ deleteSemester
 */
export interface DeleteSemesterResponse extends ApiResponse<null> {}

/**
 * THÊM: Interface cho Error Response từ backend
 * Khi có lỗi, backend có thể trả về cấu trúc khác
 */
export interface ApiErrorResponse {
  success: false;
  timestamp: string;
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * THÊM: Union type cho tất cả response có thể nhận được
 */
export type SemesterApiResponse<T> = ApiResponse<T> | ApiErrorResponse;

export type {Course};
