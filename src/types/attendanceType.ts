/**
 * ATTENDANCE TYPES - CẬP NHẬT để đồng bộ với backend GeoJSON structure
 * Tương thích với attendanceController.js và attendanceRouter.js
 */

// ===========================
// API RESPONSE INTERFACES
// ===========================

/**
 * Generic API Response - Matching backend responseUtil
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Paginated API Response - Matching backend sendPaginated
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===========================
// CORE LOCATION INTERFACES
// ===========================

/**
 * Basic Location coordinates for check-in
 */
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

/**
 * GeoJSON Point structure - Matching classLocationModel
 */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Class Location - Matching backend classLocationModel with GeoJSON
 */
export interface ClassLocation {
  _id: string;
  name: string;
  location: GeoJSONPoint; // ✅ GeoJSON format
  radius: number;
  address: string;
  description?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // ✅ Virtual fields cho backward compatibility
  latitude: number;
  longitude: number;
}

/**
 * Student Location with GeoJSON - Matching attendanceModel
 */
export interface StudentLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  accuracy: number;
  timestamp: string;
}

// ===========================
// SESSION INTERFACES
// ===========================

/**
 * Attendance Session - Matching attendanceSessionModel
 */
export interface AttendanceSession {
  students: never[];
  attendanceRecords: any;
  description: any;
  _id: string;
  courseId: {
    _id: string;
    name: string;
    code?: string;
    students?: Array<{
      _id: string;
      firstName?: string;
      lastName?: string;
      fullName?: string;
      email: string;
      avatar?: string;
      studentId?: string;
      userID?: string;
    }>;
  };
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  schoolLocationId?: ClassLocation;
  classroom?: string;
  isOpen: boolean;
  createdBy: string;
  totalStudents?: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// ATTENDANCE INTERFACES
// ===========================

/**
 * Student Attendance - Matching attendanceModel với GeoJSON
 */
export interface StudentAttendance {
  _id: string;
  sessionId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    classroom?: string;
    courseId: {
      _id: string;
      name: string;
      code?: string;
    };
  };
  studentId: string;
  courseId: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  checkInTime: string;
  checkInMethod: 'location' | 'manual' | 'qr_code';
  sessionDate: string;
  schoolLocationId?: string;
  studentLocation?: StudentLocation; // ✅ GeoJSON format
  distanceFromSchool?: number;
  isValidLocation?: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Statistics
 */
export interface CourseStats {
  courseId: string;
  courseName: string;
  courseCode?: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
}

/**
 * Attendance Statistics
 */
export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  courseStats: CourseStats[];
}

// ===========================
// REQUEST INTERFACES
// ===========================

/**
 * Create Attendance Session Request - Matching createAttendanceSession
 */
export interface CreateSessionRequest {
  courseId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  schoolLocationId: string; // ✅ Required theo controller
  classroom?: string;
}

/**
 * Create Session from Schedule - Matching createAttendanceFromSchedule
 */
export interface CreateSessionFromScheduleRequest {
  scheduleId: string;
  date: string;
}

/**
 * Update Session Status - Matching updateSessionStatus
 */
export interface UpdateSessionStatusRequest {
  isOpen: boolean;
}

/**
 * Location Check-in Request - Matching checkInWithLocation
 */
export interface LocationCheckInRequest {
  sessionId: string;
  location: Location;
}

/**
 * Manual Check-in Request - Matching manualCheckIn
 */
export interface ManualCheckInRequest {
  sessionId: string;
  studentId: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  note?: string;
}

/**
 * Submit Manual Attendance List - Matching submitManualAttendance
 */
export interface SubmitManualAttendanceRequest {
  sessionId: string;
  attendanceList: Array<{
    studentId: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    note?: string;
  }>;
}

/**
 * Create Class Location Request - Matching createClassLocation với GeoJSON
 */
export interface CreateClassLocationRequest {
  name: string;
  latitude: number; // ✅ Input format
  longitude: number; // ✅ Input format
  radius?: number;
  address: string;
  description?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

/**
 * Update Class Location Request - Matching updateClassLocation
 */
export interface UpdateClassLocationRequest {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  address?: string;
  description?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  is_active?: boolean;
}

// ===========================
// RESPONSE INTERFACES
// ===========================

/**
 * Session List Response - GET /api/attendance/sessions/course/:courseId
 */
export interface AttendanceListResponse
  extends ApiResponse<AttendanceSession[]> {}

/**
 * Session Detail Response - GET /api/attendance/sessions/detail/:sessionId
 */
export interface SessionDetailResponse extends ApiResponse<AttendanceSession> {}

/**
 * Create Session Response - POST /api/attendance/sessions
 */
export interface SessionCreateResponse extends ApiResponse<AttendanceSession> {}

/**
 * Update Session Status Response - PATCH /api/attendance/sessions/:sessionId/status
 */
export interface UpdateSessionStatusResponse
  extends ApiResponse<AttendanceSession> {}

/**
 * Attendance Status Response - GET /api/attendance/check-status/:courseId
 */
export interface AttendanceStatusResponse
  extends ApiResponse<{
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    latestAttendance: StudentAttendance | null;
    todaySession: {
      _id: string;
      date: string;
      isOpen: boolean;
      hasAttended: boolean;
      attendanceStatus: 'present' | 'late' | 'absent' | 'excused' | null;
    } | null;
  }> {}

/**
 * Check-in Response - POST /api/attendance/location-check-in
 */
export interface CheckInResponse
  extends ApiResponse<{
    message: string;
    status: 'present' | 'late';
    checkInTime: string;
    courseName: string;
    courseCode?: string;
    distance: number;
    attendance: StudentAttendance;
  }> {}

/**
 * Attendance History Response - GET /api/attendance/history
 */
export interface AttendanceHistoryResponse
  extends PaginatedResponse<StudentAttendance> {}

/**
 * Attendance Stats Response - GET /api/attendance/stats
 */
export interface AttendanceStatsResponse extends ApiResponse<AttendanceStats> {}

/**
 * Manual Check-in Response - POST /api/attendance/manual-check-in
 */
export interface ManualCheckInResponse extends ApiResponse<null> {}

/**
 * Submit Manual Attendance Response - POST /api/attendance/submit-manual
 */
export interface SubmitManualAttendanceResponse
  extends ApiResponse<{
    message: string;
    summary: {
      total: number;
      success: number;
      error: number;
    };
    results: Array<{
      studentId: string;
      success: boolean;
      status?: string;
      error?: string;
    }>;
  }> {}

/**
 * Class Locations Response - GET /api/attendance/locations
 */
export interface ClassLocationResponse extends ApiResponse<ClassLocation[]> {}

/**
 * Create Location Response - POST /api/attendance/locations
 */
export interface CreateClassLocationResponse
  extends ApiResponse<ClassLocation> {}

/**
 * Update Location Response - PUT /api/attendance/locations/:locationId
 */
export interface UpdateClassLocationResponse
  extends ApiResponse<ClassLocation> {}

/**
 * Delete Location Response - DELETE /api/attendance/locations/:locationId
 */
export interface DeleteLocationResponse extends ApiResponse<null> {}

/**
 * Create from Schedule Response - POST /api/attendance/from-schedule
 */
export interface CreateSessionFromScheduleResponse
  extends ApiResponse<AttendanceSession> {}

// ===========================
// ERROR RESPONSE
// ===========================

/**
 * Error Response Interface
 */
export interface AttendanceErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// ===========================
// UTILITY TYPES & CONSTANTS
// ===========================

/**
 * Attendance Status Type
 */
export type AttendanceStatusType = 'present' | 'absent' | 'late' | 'excused';

/**
 * Check-in Method Type
 */
export type CheckInMethodType = 'location' | 'manual' | 'qr_code';

/**
 * Attendance Status Constants
 */
export const ATTENDANCE_STATUS = {
  PRESENT: 'present' as const,
  ABSENT: 'absent' as const,
  LATE: 'late' as const,
  EXCUSED: 'excused' as const,
} as const;

/**
 * Check-in Method Constants
 */
export const CHECK_IN_METHOD = {
  LOCATION: 'location' as const,
  MANUAL: 'manual' as const,
  QR_CODE: 'qr_code' as const,
} as const;

// ===========================
// TYPE GUARDS
// ===========================

/**
 * Type guard for error response
 */
export const isAttendanceErrorResponse = (
  response: any,
): response is AttendanceErrorResponse => {
  return response.success === false && typeof response.message === 'string';
};

/**
 * Type guard for API response
 */
export const isApiResponse = <T>(response: any): response is ApiResponse<T> => {
  return (
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string'
  );
};

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Get attendance status color
 */
export const getAttendanceStatusColor = (
  status: AttendanceStatusType,
): string => {
  const colorMap: Record<AttendanceStatusType, string> = {
    present: '#4CAF50',
    late: '#FF9800',
    absent: '#F44336',
    excused: '#2196F3',
  };
  return colorMap[status] || '#757575';
};

/**
 * Get attendance status label
 */
export const getAttendanceStatusLabel = (
  status: AttendanceStatusType,
): string => {
  const labelMap: Record<AttendanceStatusType, string> = {
    present: 'Có mặt',
    late: 'Muộn',
    absent: 'Vắng mặt',
    excused: 'Có phép',
  };
  return labelMap[status] || 'Không xác định';
};

/**
 * Format attendance rate
 */
export const formatAttendanceRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

/**
 * Calculate attendance rate
 */
export const calculateAttendanceRate = (
  attended: number,
  total: number,
): number => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
};

/**
 * Convert GeoJSON to lat/lng
 */
export const geoJSONToLatLng = (geoJSON: GeoJSONPoint): Location => {
  return {
    longitude: geoJSON.coordinates[0],
    latitude: geoJSON.coordinates[1],
  };
};

/**
 * Convert lat/lng to GeoJSON
 */
export const latLngToGeoJSON = (lat: number, lng: number): GeoJSONPoint => {
  return {
    type: 'Point',
    coordinates: [lng, lat], // [longitude, latitude]
  };
};

/**
 * Extract coordinates from ClassLocation
 */
export const getLocationCoordinates = (location: ClassLocation): Location => {
  // Sử dụng virtual fields nếu có, hoặc extract từ GeoJSON
  if (location.latitude && location.longitude) {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }
  return geoJSONToLatLng(location.location);
};

// ===========================
// EXPORT ALL TYPES
// ===========================

export type AttendanceApiResponse<T> = ApiResponse<T> | AttendanceErrorResponse;
