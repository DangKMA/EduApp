// ✅ Import ScheduleItem từ courseType để consistency
import {Assignment} from './assignmentType';
import {ScheduleItem as CourseScheduleItem} from './courseType';

export type RootStackParamList = {
  // Màn hình xác thực
  Login: undefined;
  Register: undefined;
  ForgotPassword: {email?: string};

  // Màn hình chính (Tabs)
  Home: undefined;
  Schedule: undefined;
  Course: undefined;
  Profile: undefined;
  Notifications: undefined;

  // Stack điểm danh
  Attendance: {
    screen?: string;
    params?: any;
  };

  CourseDetail: {
    item: {
      _id: string;
      id: string;
      name: string;
      code: string;
      credits: number;
      instructor: string;
      location: string;
      room: string;
      startTime: string;
      endTime: string;
      dayOfWeek: string;
      description: string;
      status: string;
      students: any[];
      progress: number;
      image: string;
      color: string[];
      semester: string;
      academicYear: string;
      semesterInfo: any;
      startDate: string;
      endDate: string;
      schedule: any[];
      materials: any[];
    };
    date: string;
    userRole?: string; // ✅ THÊM: Optional
    isTeacher?: boolean; // ✅ THÊM: Optional
    userId?: string; // ✅ THÊM: Optional
    scheduleItem?: CourseScheduleItem; // ✅ THÊM: Optional
  };

  Assignment: {
    courseId: string;
    courseName: string;
    courseCode: string;
    students: any[];
    date: string;
    instructor: string;
    userRole: string;
    isTeacher: boolean;
    credits?: number;
    description?: string;
    location?: string;
    room?: string;
    startTime?: string;
    endTime?: string;
  };
  AssignmentDetail: {
    assignmentId: string;
    assignment?: Assignment;
  };
  EditAssignment: {
    assignmentId: string;
    assignment: Assignment;
  };
  AssignmentSubmissions: {
    assignmentId: string;
    assignmentTitle: string;
  };
  SubmitAssignment: {
    assignmentId: string;
    assignment: Assignment;
  };

  // Các màn hình khác
  GradeStack: undefined;
  Material: undefined;
  Classes: undefined;
  ClassDetail: {classId: number};
  Events: undefined;
  EventDetail: {eventId: number};
  Message: undefined;

  // ✅ THÊM: Missing navigation routes
  CourseScheduleEditor: {courseId: string};
  AttendanceManagement: {courseId: string; courseName?: string; date?: string};
  MaterialManagement: {courseId?: string; courseName?: string};
  NotificationDetail: {notificationId: string; readOnly?: boolean};
};

// ✅ THÊM: Re-export ScheduleItem để tránh confusion
export type ScheduleItem = CourseScheduleItem;

// Giữ lại các interface khác...
export interface AttendanceSession {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    code?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  locationId?: {
    _id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  isOpen: boolean;
  attendanceRecords?: Array<{
    studentId: string;
    isPresent: boolean;
    timestamp?: string;
  }>;
}
