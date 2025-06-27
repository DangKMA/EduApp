import {Course} from './courseType';
import {User} from './userType';

export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data?: T;
  error?: string;
  message: string;
}

// Interface cho ClassLocation
export interface ClassLocation {
  _id: string;
  name: string;
  address: string;
  room: string;
  building: string;
}

// ✅ SỬA: ScheduleItem để match với backend response thực tế
export interface ScheduleItem {
  className: string;
  _id: string; // Từ schedule._id trong course
  courseId: string; // Từ course._id
  courseName: string; // Từ course.name
  courseCode: string; // Từ course.id
  instructorName?: string; // Từ populated instructorId.fullName
  instructorEmail?: string; // ✅ THÊM: Từ populated instructorId.email
  instructorUserID?: string; // ✅ THÊM: Từ populated instructorId.userID
  startTime: string; // Từ schedule.startTime
  endTime: string; // Từ schedule.endTime
  date: string; // Calculated ngày cụ thể (YYYY-MM-DD)
  dayOfWeek: string; // Từ schedule.dayOfWeek
  room?: string; // Từ schedule.room
  location?: string; // Từ course.location
  credits?: number; // ✅ THÊM: Từ course.credits
  progress?: number; // ✅ THÊM: Từ course.progress
  status?: string; // ✅ THÊM: Từ course.status
  description?: string; // ✅ THÊM: Từ course.description
  startDate?: string; // ✅ THÊM: Từ course.startDate
  endDate?: string; // ✅ THÊM: Từ course.endDate
  semester?: string; // ✅ THÊM: Từ course.semester
  academicYear?: string; // ✅ THÊM: Từ course.academicYear
  semesterInfo?: {
    // Từ populated semesterInfo
    _id: string;
    semester: string;
    academicYear: string;
    displayName: string;
    startDate?: string;
    endDate?: string;
  } | null;
  statusInfo?: {
    // ✅ THÊM: Từ course.statusInfo
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

// ✅ SỬA: Interface cho raw schedule item trong course theo backend thực tế
export interface RawScheduleItem {
  _id: string;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  startTime: string; // "07:00"
  endTime: string; // "09:30"
  room?: string; // "403"
}

// ✅ SỬA: Interface cho Course response từ backend theo response thực tế
export interface CourseWithSchedule {
  _id: string;
  id: string; // courseCode như "CT00003"
  name: string; // courseName như "Tin đai cương"
  instructorId:
    | {
        _id: string;
        fullName: string; // "Nguyễn Văn Giảng"
        email: string; // "giangnv@edu.vn"
        userID: string; // "TC00001"
      }
    | string;
  credits: number; // 3
  progress: number; // 0
  image: string; // ""
  status: string; // "ongoing"
  color: any[]; // []
  location?: string; // "Tòa TA2"
  description?: string; // "Làm quen với Tin học"
  startDate: string; // "Thu Aug 15 2024 07:00:00 GMT+0700 (Indochina Time)"
  endDate: string; // "Tue Dec 31 2024 07:00:00 GMT+0700 (Indochina Time)"
  semester: string; // "HK1"
  academicYear: string; // "2024-2025"
  schedule: RawScheduleItem[];
  semesterInfo:
    | {
        _id: string;
        semester: string; // "HK1"
        academicYear: string; // "2024-2025"
        displayName: string; // "Học kỳ 1, năm học 2024-2025"
      }
    | string;
  students: string[]; // Array of student IDs
  materials: any[]; // []
  enrolledStudents: any[]; // []
  studentActivities: any[]; // []
  createdAt: string;
  updatedAt: string;
  __v: number;
  statusInfo?: {
    status: string; // "completed"
    daysUntilStart: number; // 0
    daysUntilEnd: number; // 0
    daysSinceEnd: number; // 159
    duration: number; // 138
    isStartingSoon: boolean; // false
    isEndingSoon: boolean; // false
    isRecentlyEnded: boolean; // false
  };
  shouldUpdateStatus?: boolean; // true
}

// ✅ THÊM: Interface cho CoursesResponse từ backend
export interface CoursesApiResponse
  extends ApiResponse<{
    count: number;
    courses: CourseWithSchedule[];
  }> {}

// ✅ THÊM: Interface cho daily schedule API response
export interface DailyScheduleApiResponse
  extends ApiResponse<{
    schedules: ScheduleItem[]; // Đã được backend convert sang flat structure
    count: number;
    date: string;
  }> {}

// ✅ THÊM: Interface cho monthly schedule API response
export interface MonthlyScheduleApiResponse
  extends ApiResponse<{
    schedules: ScheduleItem[]; // Đã được backend convert sang flat structure
    count: number;
    year: number;
    month: number;
  }> {}

// ✅ LEGACY: Giữ lại old interfaces cho backward compatibility
export interface LegacyScheduleItem {
  _id: string;
  courseId: string | Course;
  title: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  locationId?: string | ClassLocation;
  instructor: string | User;
  description?: string;
  recurring?: boolean;
  weekdays?: string[];
  createdBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho Schedule được populate từ backend (legacy)
export interface PopulatedScheduleItem {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
    credits: number;
    description: string;
  };
  title: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  locationId?: {
    _id: string;
    name: string;
    address: string;
    room: string;
    building: string;
  };
  instructor: {
    _id: string;
    fullName: string;
    email: string;
  };
  description?: string;
  recurring?: boolean;
  weekdays?: string[];
  createdBy?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ SỬA: DisplayScheduleItem để match với ScheduleItem mới
export interface DisplayScheduleItem {
  _id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  instructorName?: string;
  instructorEmail?: string; // ✅ THÊM
  instructorUserID?: string; // ✅ THÊM
  startTime: string;
  endTime: string;
  date: string;
  dayOfWeek: string;
  room?: string;
  location?: string;
  credits?: number; // ✅ THÊM
  progress?: number; // ✅ THÊM
  status?: string; // ✅ THÊM
  description?: string; // ✅ THÊM
  startDate?: string; // ✅ THÊM
  endDate?: string; // ✅ THÊM
  semester?: string; // ✅ THÊM
  academicYear?: string; // ✅ THÊM
  semesterInfo?: {
    _id: string;
    semester: string;
    academicYear: string;
    displayName: string;
    startDate?: string;
    endDate?: string;
  } | null;
  statusInfo?: {
    // ✅ THÊM
    status: string;
    daysUntilStart: number;
    daysUntilEnd: number;
    daysSinceEnd: number;
    duration: number;
    isStartingSoon: boolean;
    isEndingSoon: boolean;
    isRecentlyEnded: boolean;
  };
  // Legacy fields for backward compatibility
  title?: string;
  building?: string;
  recurring?: boolean;
  weekdays?: string[];
}

// Interface cho response của API (legacy)
export interface ScheduleResponse extends ApiResponse<LegacyScheduleItem[]> {
  count?: number;
}

export interface PopulatedScheduleResponse
  extends ApiResponse<PopulatedScheduleItem[]> {
  count?: number;
}

// ✅ SỬA: GroupedSchedule sử dụng ScheduleItem mới
export interface GroupedSchedule {
  [date: string]: ScheduleItem[];
}

// ✅ SỬA: Interface cho tham số tạo sự kiện lịch học
export interface CreateScheduleEventParams {
  courseId: string;
  courseName?: string;
  courseCode?: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  dayOfWeek: string;
  room?: string;
  location?: string;
  instructorName?: string;
  instructorEmail?: string; // ✅ THÊM
  instructorUserID?: string; // ✅ THÊM
  credits?: number; // ✅ THÊM
  status?: string; // ✅ THÊM
  description?: string; // ✅ THÊM
  semester?: string; // ✅ THÊM
  academicYear?: string; // ✅ THÊM
  // Legacy fields
  title?: string;
  locationId?: string;
  recurring?: boolean;
  weekdays?: string[];
}

// Interface cho tham số cập nhật sự kiện lịch học
export interface UpdateScheduleEventParams {
  courseName?: string;
  courseCode?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  dayOfWeek?: string;
  room?: string;
  location?: string;
  instructorName?: string;
  instructorEmail?: string; // ✅ THÊM
  instructorUserID?: string; // ✅ THÊM
  credits?: number; // ✅ THÊM
  status?: string; // ✅ THÊM
  description?: string; // ✅ THÊM
  semester?: string; // ✅ THÊM
  academicYear?: string; // ✅ THÊM
  // Legacy fields
  title?: string;
  locationId?: string;
  recurring?: boolean;
  weekdays?: string[];
}

// ✅ SỬA: Interface cho query parameters
export interface ScheduleQueryParams {
  date?: string; // For getScheduleByDate
  startDate?: string; // For getScheduleByRange
  endDate?: string; // For getScheduleByRange
  year?: number; // For getScheduleByMonth
  month?: number; // For getScheduleByMonth
}

// Interface cho filter lịch học
export interface ScheduleFilterParams {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  semesterId?: string;
  userId?: string;
  status?: string; // ✅ THÊM
  role?: 'student' | 'teacher' | 'admin';
}

// Interface cho response error
export interface ScheduleErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Interface cho delete response
export interface DeleteScheduleResponse extends ApiResponse<null> {
  message: string;
}

// ✅ THÊM: Type guards mới
export const isScheduleErrorResponse = (
  response: any,
): response is ScheduleErrorResponse => {
  return response.success === false && typeof response.error === 'string';
};

export const isPopulatedScheduleItem = (
  item: LegacyScheduleItem | PopulatedScheduleItem,
): item is PopulatedScheduleItem => {
  return typeof item.courseId === 'object' && 'name' in item.courseId;
};

// ✅ SỬA: Validator cho ScheduleItem mới theo backend response
export const isValidScheduleItem = (item: any): item is ScheduleItem => {
  return (
    typeof item === 'object' &&
    typeof item._id === 'string' &&
    typeof item.courseId === 'string' &&
    typeof item.courseName === 'string' &&
    typeof item.courseCode === 'string' &&
    typeof item.startTime === 'string' &&
    typeof item.endTime === 'string' &&
    typeof item.date === 'string' &&
    typeof item.dayOfWeek === 'string'
  );
};

// ✅ SỬA: Validator cho CourseWithSchedule
export const isValidCourseWithSchedule = (
  item: any,
): item is CourseWithSchedule => {
  return (
    typeof item === 'object' &&
    typeof item._id === 'string' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    Array.isArray(item.schedule) &&
    typeof item.credits === 'number' &&
    typeof item.status === 'string'
  );
};

// ✅ THÊM: Converter function type
export type CourseToScheduleConverter = (
  course: CourseWithSchedule,
  targetDate: string,
) => ScheduleItem[];

// ✅ SỬA: Helper function để convert course sang schedule items theo backend response
export const convertCourseToScheduleItems = (
  course: CourseWithSchedule,
  targetDate: string,
): ScheduleItem[] => {
  if (!course.schedule || !Array.isArray(course.schedule)) {
    return [];
  }

  const targetDay = new Date(targetDate).toLocaleDateString('en-US', {
    weekday: 'long',
  });

  return course.schedule
    .filter(scheduleItem => scheduleItem.dayOfWeek === targetDay)
    .map(scheduleItem => ({
      _id: scheduleItem._id,
      courseId: course._id,
      courseName: course.name,
      courseCode: course.id,
      instructorName:
        typeof course.instructorId === 'object'
          ? course.instructorId.fullName
          : undefined,
      instructorEmail:
        typeof course.instructorId === 'object'
          ? course.instructorId.email
          : undefined,
      instructorUserID:
        typeof course.instructorId === 'object'
          ? course.instructorId.userID
          : undefined,
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
      startDate: course.startDate,
      endDate: course.endDate,
      semester: course.semester,
      academicYear: course.academicYear,
      semesterInfo:
        typeof course.semesterInfo === 'object' ? course.semesterInfo : null,
      statusInfo: course.statusInfo,
    }));
};

// ✅ THÊM: Type cho status values
export type CourseStatus =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'paused';

// ✅ THÊM: Type cho day of week values
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

// ✅ THÊM: Helper function để parse date từ backend format
export const parseBackendDate = (dateString: string): Date => {
  // Backend trả về format: "Thu Aug 15 2024 07:00:00 GMT+0700 (Indochina Time)"
  return new Date(dateString);
};

// ✅ THÊM: Helper function để format date cho API
export const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};
