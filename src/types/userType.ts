export interface SemesterStat {
  semester: string; // VD: "HK1-2023"
  gpa: number;
  credits: number;
  courses: number;
}

export type StudentStatus =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'suspended'
  | 'on-leave';

export interface StudentInfo {
  className?: string;
  faculty?: string;
  gpa: number;
  attendanceRate: number;
  totalCredits: number;
  failedCredits: number;
  completedCourses: number;
  failedCourses: number;
  status: StudentStatus;
  semesterStats: SemesterStat[];
}

export interface TeacherInfo {
  department?: string;
  position?: string;
  degree?: string;
}

export interface User {
  firstName: any;
  _id: string;
  userID: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  dob?: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  studentInfo?: StudentInfo;
  teacherInfo?: TeacherInfo;
  courses: string[];
  status?: 'online' | 'offline' | 'away';
  lastActive?: string;
  isVerified: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // ✅ Thêm field này từ MongoDB
  fcmToken?: string | null; // ✅ Thêm field này
}

// ✅ Sửa lại UserInfoResponse để match với backend response
export interface UserInfoResponse {
  success: boolean;
  timestamp: string;
  data?: {
    user: User; // ✅ Backend trả về nested: data.user
  };
  message: string;
  error?: string;
}

export interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}
