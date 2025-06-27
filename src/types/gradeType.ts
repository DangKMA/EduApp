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
 * Định nghĩa type cho Component (thành phần điểm)
 */
export interface Component {
  weight(arg0: string, weight: any): unknown;
  type(arg0: string, type: any): unknown;
  name: string;
  score: number;
  maxScore: number;
}

/**
 * Định nghĩa type cho Assignment
 */
export interface Assignment {
  name: string;
  score: number;
  maxScore: number;
}

/**
 * Định nghĩa type cho điểm của khóa học
 */
export interface CourseGrade {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    id: string; // Mã khóa học
    code?: string; // Thay 'id' bằng 'code' để phù hợp với GradeScreen
    credits: number;
    instructorId?: {
      _id: string;
      fullName: string;
    };
    semesterInfo?: {
      _id: string;
      displayName: string;
    };
  };
  studentId?: {
    _id: string;
    fullName: string;
    userID: string;
    avatar?: string;
    studentInfo?: {
      className: string;
    };
  };

  // Thêm các trường điểm riêng lẻ để phù hợp với GradeScreen
  attendanceGrade: number;
  midtermGrade: number;
  finalGrade: number;
  totalGrade: number;

  // Giữ lại cấu trúc scores ban đầu nếu API vẫn trả về dạng này
  scores: {
    midterm: number;
    final: number;
    attendance: number;
    assignments?: Assignment[];
    total: number;
  };

  letterGrade: string;
  status: 'completed' | 'failed' | 'pending';
  feedback?: string;
  lastUpdatedBy?: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;

  // Thêm trường components để hỗ trợ phương thức tính điểm
  components?: Component[];
}

/**
 * Định nghĩa type cho thống kê học kỳ
 */
export interface SemesterStats {
  semesterId: string;
  semesterName: string;
  year: string;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  failedCredits: number;
  completedCourses?: number;
}

/**
 * Định nghĩa type cho dữ liệu tổng quan
 */
export interface OverviewData {
  totalCredits: number;
  totalCourses: number;
  completedCourses: number;
  pendingCourses: number;
  failedCourses: number;
  cumulativeGPA: number;
}

/**
 * Định nghĩa type cho thống kê điểm khóa học
 */
export interface CourseGradeStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  highestGrade: number;
  lowestGrade: number;
  averageGrade: number;
}

/**
 * Định nghĩa type cho tham số thêm điểm
 */
export interface AddCourseGradeParams {
  studentId: string;
  courseId: string;
  scores: {
    midterm: number;
    final: number;
    attendance: number;
    assignments?: Assignment[];
    total?: number;
  };
  feedback?: string;
}

/**
 * Định nghĩa type cho tham số cập nhật điểm
 */
export interface UpdateCourseGradeParams {
  scores: {
    midterm: number;
    final: number;
    attendance: number;
    assignments?: Assignment[];
    total?: number;
  };
  feedback?: string;
}

/**
 * Định nghĩa type cho tham số cập nhật trạng thái điểm
 */
export interface UpdateGradeStatusParams {
  status: 'completed' | 'pending' | 'failed';
}

/**
 * Định nghĩa type cho kết quả nhập điểm từ Excel
 */
export interface ImportGradesResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  updated: Array<{
    studentId: string;
    userID: string;
    name: string;
    finalGrade: number;
    letterGrade: string;
    isNew?: boolean;
  }>;
}

/**
 * Định nghĩa type cho các filter trong API
 */
export interface GradeFilterParams {
  courseId?: string;
  studentId?: string;
  status?: 'completed' | 'failed' | 'pending';
  minGrade?: number;
  maxGrade?: number;
  semesterId?: string;
  page?: number;
  limit?: number;
}

/**
 * Định nghĩa type cho API response - CẬP NHẬT
 */
export interface GradeResponse extends ApiResponse<CourseGrade> {}

/**
 * Định nghĩa type cho response API lấy danh sách điểm - CẬP NHẬT
 */
export interface GradesResponse extends ApiResponse<CourseGrade[]> {
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Định nghĩa type cho response API lấy điểm của học sinh - CẬP NHẬT
 */
export interface StudentGradeResponse extends ApiResponse<CourseGrade[]> {
  stats?: {
    totalCredits: number;
    gpa: number;
    completedCourses: number;
  };
}

/**
 * Định nghĩa type cho response API lấy điểm của khóa học - CẬP NHẬT
 */
export interface CourseGradesResponse extends ApiResponse<CourseGrade[]> {
  course?: {
    _id: string;
    name: string;
    id: string;
  };
  stats?: CourseGradeStats;
}

/**
 * Định nghĩa type cho kết quả lấy bảng điểm - CẬP NHẬT
 */
export interface TranscriptResponse extends ApiResponse<CourseGrade[]> {
  semesterStats?: SemesterStats[];
  overview?: OverviewData;
}

/**
 * Định nghĩa type cho kết quả GPA stats - CẬP NHẬT
 */
export interface GPAStatsResponse
  extends ApiResponse<{
    overview: OverviewData;
    semesterProgress: {
      labels: string[];
      gpas: number[];
      credits: number[];
    };
  }> {}

/**
 * Định nghĩa type cho kết quả nhập điểm - CẬP NHẬT
 */
export interface ImportGradesResponse extends ApiResponse<ImportGradesResult> {}

/**
 * Định nghĩa type cho kết quả xóa điểm - CẬP NHẬT
 */
export interface DeleteGradeResponse extends ApiResponse<null> {}

/**
 * Định nghĩa type cho kết quả cập nhật trạng thái điểm - CẬP NHẬT
 */
export interface UpdateGradeStatusResponse extends ApiResponse<CourseGrade> {}

/**
 * Định nghĩa enum cho loại điểm chữ
 */
export enum LetterGrade {
  APlus = 'A+',
  A = 'A',
  BPlus = 'B+',
  B = 'B',
  CPlus = 'C+',
  C = 'C',
  DPlus = 'D+',
  D = 'D',
  F = 'F',
}

/**
 * Định nghĩa enum cho trạng thái điểm
 */
export enum GradeStatus {
  Completed = 'completed',
  Failed = 'failed',
  Pending = 'pending',
}
