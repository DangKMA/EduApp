import {ScheduleFromCourse} from '../services/scheduleSevice';
import {User} from './userType';

/**
 * ✅ CẬP NHẬT API Response Interface để đồng bộ với backend response
 */
export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data?: T;
  error?: string;
  message: string;
}

/**
 * ✅ SỬA: Semester info interface theo backend response
 */
export interface SemesterInfo {
  _id: string;
  semester: string;
  academicYear: string;
  displayName: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

/**
 * ✅ SỬA: Schedule interface theo backend model thực tế
 */
export interface Schedule {
  _id: string; // ✅ THÊM: MongoDB ObjectId
  /** Day of the week */
  dayOfWeek:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  /** Class start time (HH:mm format) */
  startTime: string;
  /** Class end time (HH:mm format) */
  endTime: string;
  /** Room for this specific class */
  room?: string;
}

/**
 * ✅ SỬA: Course interface matching backend response thực tế
 */
export interface Course {
  /** Unique database identifier */
  _id: string;
  /** Course identifier/code */
  id: string;
  /** Course name */
  name: string;
  /** Course description */
  description?: string;
  /** Instructor reference - có thể populated hoặc ObjectId */
  instructorId:
    | string
    | {
        _id: string;
        fullName: string;
        email: string;
        userID: string;
      };
  /** Number of credits */
  credits: number;
  /** Course progress percentage */
  progress: number;
  /** Course image URL */
  image: string;
  /** Course status */
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'paused';
  /** Course color for UI */
  color: any[];
  /** Course location */
  location?: string;
  /** Semester information reference - có thể populated hoặc ObjectId */
  semesterInfo: string | SemesterInfo;
  /** Semester string */
  semester: string;
  /** Academic year */
  academicYear: string;
  /** Course start date - STRING FORMAT theo backend */
  startDate: string;
  /** Course end date - STRING FORMAT theo backend */
  endDate: string;
  /** Enrolled students - array of ObjectIds */
  students: string[];
  /** Weekly schedule */
  schedule: Schedule[];
  /** Course materials - array of ObjectIds */
  materials: any[];
  /** Detailed enrollment information */
  enrolledStudents: any[];
  /** Student activities */
  studentActivities: any[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Version key */
  __v: number;
  /** Status information - computed by backend */
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
  /** Flag indicating if status should be updated */
  shouldUpdateStatus?: boolean;
}

/**
 * Composite Course ID utilities for handling complex courseId formats
 */
export interface CompositeCourseId {
  originalId: string;
  actualCourseId: string;
  index?: number;
  date?: string;
}

/**
 * ✅ SỬA: Create course parameters theo backend model
 */
export interface CreateCourseParams {
  id: string;
  name: string;
  description?: string;
  instructorId: string;
  credits: number;
  image?: string;
  color?: any[];
  semesterInfo: string; // SemesterInfo ObjectId
  location?: string;
  schedule?: Omit<Schedule, '_id'>[]; // Không bao gồm _id khi tạo mới
}

/**
 * ✅ SỬA: Update course parameters theo backend model
 */
export interface UpdateCourseParams {
  name?: string;
  description?: string;
  instructorId?: string;
  credits?: number;
  image?: string;
  color?: any[];
  location?: string;
  schedule?: Schedule[];
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'paused';
}

/**
 * ✅ SỬA: Update course schedule parameters
 */
export interface UpdateCourseScheduleParams {
  schedule: Omit<Schedule, '_id'>[]; // Backend sẽ tự generate _id
}

/**
 * ✅ SỬA: Add material parameters theo Material model
 */
export interface AddCourseMaterialParams {
  title: string;
  author: string;
  type:
    | 'pdf'
    | 'doc'
    | 'docx'
    | 'ppt'
    | 'pptx'
    | 'xls'
    | 'xlsx'
    | 'mp4'
    | 'avi'
    | 'mov'
    | 'mp3'
    | 'wav'
    | 'zip'
    | 'rar';
  size: string;
  filePath: string;
  category?:
    | 'book'
    | 'slide'
    | 'exercise'
    | 'exam'
    | 'video'
    | 'project'
    | 'other';
  description?: string;
  chapters?: string[];
  tags?: string[];
}

/**
 * Parameters for creating an announcement
 */
export interface CreateAnnouncementParams {
  title: string;
  content: string;
}

/**
 * Parameters for enrolling a student to a course
 */
export interface EnrollStudentParams {
  studentId?: string;
}

/**
 * Parameters for unenrolling a student from a course
 */
export interface UnenrollStudentParams {
  studentId?: string;
}

/**
 * Parameters for updating course status
 */
export interface UpdateCourseStatusParams {
  status: 'ongoing' | 'upcoming' | 'completed' | 'cancelled' | 'paused';
}

/**
 * ✅ SỬA: Course filter parameters theo getAllCourses controller
 */
export interface CourseFilterParams {
  semesterId?: string;
  instructorId?: string;
  studentId?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'paused';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * ✅ SỬA: Schedule query parameters theo controllers
 */
export interface ScheduleQueryParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  semesterId?: string;
  courseId?: string;
  studentId?: string;
  instructorId?: string;
  year?: string;
  month?: string;
}

/**
 * ✅ SỬA: Schedule item theo backend response
 */
export interface ScheduleItem {
  color: string[];
  image: string;
  students: never[];
  instructor: any;
  _id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  instructorName?: string;
  instructorEmail?: string;
  instructorUserID?: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
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
    startDate?: string;
    endDate?: string;
  } | null;
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

/**
 * ✅ SỬA: Course status info theo backend response
 */
export interface CourseStatusInfo {
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'paused';
  daysUntilStart: number;
  daysUntilEnd: number;
  daysSinceEnd: number;
  duration: number;
  isStartingSoon: boolean;
  isEndingSoon: boolean;
  isRecentlyEnded: boolean;
}

/**
 * Response cho single course
 */
export interface CourseResponse extends ApiResponse<Course> {}

/**
 * ✅ SỬA: Courses response theo backend response thực tế
 */
export interface CoursesResponse
  extends ApiResponse<{
    count: number;
    courses: Course[];
  }> {}

/**
 * ✅ SỬA: Course semester response theo getCoursesBySemester
 */
export interface CourseSemesterResponse
  extends ApiResponse<{
    count: number;
    semester: SemesterInfo;
    courses: Course[];
  }> {}

/**
 * ✅ SỬA: Instructor courses response theo getInstructorCourses
 */
export interface InstructorCoursesResponse
  extends ApiResponse<{
    count: number;
    courses: Course[];
    semester?: SemesterInfo | null;
  }> {}

/**
 * ✅ SỬA: Schedule response theo schedule controllers
 */
export interface ScheduleResponse
  extends ApiResponse<{
    schedules: ScheduleFromCourse[];
    count: number;
    date?: string;
    period?: {
      startDate: string;
      endDate: string;
    };
  }> {
  semester: any;
}

/**
 * ✅ SỬA: Course status response theo getCourseStatusDetail
 */
export interface CourseStatusResponse
  extends ApiResponse<{
    course: {
      _id: string;
      id: string;
      name: string;
      status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'paused';
      startDate: string;
      endDate: string;
      instructorId: User | null;
      semesterInfo: SemesterInfo | null;
    };
    statusInfo: CourseStatusInfo;
    schedule: {
      thisWeekClasses: ScheduleFromCourse[];
      nextClass: ScheduleFromCourse | null;
      lastClass: ScheduleFromCourse | null;
      totalClassesThisWeek: number;
    };
  }> {}

/**
 * ✅ SỬA: Course schedule response theo getCourseSchedule
 */
export interface CourseScheduleResponse
  extends ApiResponse<{
    course: {
      _id: string;
      id: string;
      name: string;
      instructor: User | null;
      semester: SemesterInfo | null;
    };
    schedule: {
      dates: ScheduleFromCourse[];
      nextClass: ScheduleFromCourse | null;
      lastClass: ScheduleFromCourse | null;
      thisWeekClasses: ScheduleFromCourse[];
      totalSessions: number;
    };
    period: {
      startDate: string;
      endDate: string;
    };
  }> {}

/**
 * ✅ SỬA: Update responses với string timestamps
 */
export interface UpdateAllCoursesStatusResponse
  extends ApiResponse<{
    totalCourses: number;
    updatedCount: number;
    notifications: any[];
    timestamp: string;
  }> {}

export interface UpdateSemesterCoursesStatusResponse
  extends ApiResponse<{
    semester: {
      _id: string;
      displayName: string;
    };
    totalCourses: number;
    updatedCount: number;
    notifications: any[];
    timestamp: string;
  }> {}

export interface CourseOverviewReportResponse
  extends ApiResponse<{
    summary: {
      upcoming: number;
      ongoing: number;
      completed: number;
      total: number;
      coursesNeedUpdate: number;
      updatePercentage: number;
    };
    courses: any[];
    timestamp: string;
  }> {}

/**
 * ✅ SỬA: Check update course status response
 */
export interface CheckUpdateCourseStatusResponse
  extends ApiResponse<{
    updated: boolean;
    currentStatus?: string;
    oldStatus?: string;
    newStatus?: string;
    course?: Course;
    updatedAt?: string;
    message?: string;
  }> {}

/**
 * ✅ SỬA: Schedule by month response
 */
export interface ScheduleByMonthResponse
  extends ApiResponse<{
    schedules: ScheduleFromCourse[];
    count: number;
    period: {
      year: number;
      month: number;
      startDate: string;
      endDate: string;
    };
  }> {}

/**
 * ✅ SỬA: Course students response theo getCourseStudents
 */
export interface CourseStudentsResponse
  extends ApiResponse<{
    count: number;
    course: {
      _id: string;
      id: string;
      name: string;
      instructorId: User;
    };
    data: User[];
  }> {}

/**
 * ✅ SỬA: Enrollment response theo enrollStudent
 */
export interface EnrollmentResponse
  extends ApiResponse<{
    message?: string;
    course: {
      _id: string;
      id: string;
      name: string;
    };
    student: {
      _id: string;
      userID: string;
      fullName: string;
    };
  }> {}

/**
 * Course statistics interface
 */
export interface CourseStats {
  totalStudents: number;
  attendanceRate?: number;
  completionRate?: number;
  averageGrade?: number;
}

/**
 * Course with extended information for detailed views
 */
export interface CourseWithStats extends Course {
  stats?: CourseStats;
  recentActivity?: {
    type: 'announcement' | 'material' | 'assignment' | 'grade';
    title: string;
    date: string;
  }[];
}

// ✅ SỬA: Type definitions theo backend model
export type CourseStatusType =
  | 'ongoing'
  | 'upcoming'
  | 'completed'
  | 'cancelled'
  | 'paused';
export type DayOfWeekType =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
export type MaterialType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'xls'
  | 'xlsx'
  | 'mp4'
  | 'avi'
  | 'mov'
  | 'mp3'
  | 'wav'
  | 'zip'
  | 'rar';
export type MaterialCategory =
  | 'book'
  | 'slide'
  | 'exercise'
  | 'exam'
  | 'video'
  | 'project'
  | 'other';
export type UserRole = 'admin' | 'teacher' | 'student';

/**
 * Utility functions for course ID handling
 */
export const CourseUtils = {
  /**
   * Extract actual MongoDB ObjectId from composite course ID
   */
  extractCourseId: (compositeId: string): string => {
    if (compositeId.includes('_')) {
      return compositeId.split('_')[0];
    }
    return compositeId;
  },

  /**
   * Parse composite course ID into components
   */
  parseCompositeId: (compositeId: string): CompositeCourseId => {
    const parts = compositeId.split('_');
    return {
      originalId: compositeId,
      actualCourseId: parts[0],
      index: parts[1] ? parseInt(parts[1]) : undefined,
      date: parts[2] || undefined,
    };
  },

  /**
   * Create composite course ID
   */
  createCompositeId: (
    courseId: string,
    index?: number,
    date?: string,
  ): string => {
    let result = courseId;
    if (index !== undefined) {
      result += `_${index}`;
    }
    if (date) {
      result += `_${date}`;
    }
    return result;
  },

  /**
   * Validate if string is a valid MongoDB ObjectId
   */
  isValidObjectId: (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  /**
   * ✅ THÊM: Helper để check populated instructor
   */
  isPopulatedInstructor: (
    instructorId: any,
  ): instructorId is {
    _id: string;
    fullName: string;
    email: string;
    userID: string;
  } => {
    return (
      typeof instructorId === 'object' &&
      instructorId._id &&
      instructorId.fullName
    );
  },

  /**
   * ✅ THÊM: Helper để check populated semester
   */
  isPopulatedSemester: (semesterInfo: any): semesterInfo is SemesterInfo => {
    return (
      typeof semesterInfo === 'object' &&
      semesterInfo._id &&
      semesterInfo.displayName
    );
  },

  /**
   * ✅ THÊM: Helper để parse backend date format
   */
  parseBackendDate: (dateString: string): Date => {
    // Format: "Thu Aug 15 2024 07:00:00 GMT+0700 (Indochina Time)"
    return new Date(dateString);
  },

  /**
   * ✅ THÊM: Helper để format date cho display
   */
  formatDisplayDate: (dateString: string): string => {
    const date = CourseUtils.parseBackendDate(dateString);
    return date.toLocaleDateString('vi-VN');
  },

  /**
   * ✅ THÊM: Helper để format date cho API
   */
  formatAPIDate: (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  },
};

/**
 * ✅ SỬA: Constants theo backend model
 */
export const COURSE_STATUS = {
  ONGOING: 'ongoing' as const,
  UPCOMING: 'upcoming' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  PAUSED: 'paused' as const,
} as const;

export const MATERIAL_TYPES = {
  PDF: 'pdf' as const,
  DOC: 'doc' as const,
  DOCX: 'docx' as const,
  PPT: 'ppt' as const,
  PPTX: 'pptx' as const,
  XLS: 'xls' as const,
  XLSX: 'xlsx' as const,
  MP4: 'mp4' as const,
  AVI: 'avi' as const,
  MOV: 'mov' as const,
  MP3: 'mp3' as const,
  WAV: 'wav' as const,
  ZIP: 'zip' as const,
  RAR: 'rar' as const,
} as const;

export const MATERIAL_CATEGORIES = {
  BOOK: 'book' as const,
  SLIDE: 'slide' as const,
  EXERCISE: 'exercise' as const,
  EXAM: 'exam' as const,
  VIDEO: 'video' as const,
  PROJECT: 'project' as const,
  OTHER: 'other' as const,
} as const;

export const DAYS_OF_WEEK = {
  MONDAY: 'Monday' as const,
  TUESDAY: 'Tuesday' as const,
  WEDNESDAY: 'Wednesday' as const,
  THURSDAY: 'Thursday' as const,
  FRIDAY: 'Friday' as const,
  SATURDAY: 'Saturday' as const,
  SUNDAY: 'Sunday' as const,
} as const;

// ✅ THÊM: Legacy exports for backward compatibility
export type CreateCourseRequest = CreateCourseParams;
export type UpdateCourseRequest = UpdateCourseParams;
