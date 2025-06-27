// ✅ Base Assignment Types
export type AssignmentType = 'photo' | 'document' | 'video' | 'text';

export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';

export type SubmissionStatus =
  | 'not_submitted'
  | 'submitted'
  | 'late'
  | 'graded';

// ✅ File & Attachment Types
export interface FileAttachment {
  name: string;
  fileUrl: string;
  fileType: 'image' | 'document' | 'video' | 'audio';
  fileSize: string;
  uploadedAt?: string;
}

export interface ImageFile {
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
}

export interface DocumentFile {
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
}

// ✅ User Reference Types
export interface UserReference {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface CourseReference {
  _id: string;
  name: string;
  id: string;
  students?: string[];
  instructorId?: string;
}

// ✅ Grade & Statistics Types
export interface GradeData {
  score: number;
  maxScore: number;
  percentage: number;
  letter: string;
  description: string;
}

export interface ScoreDistribution {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface GradeStats {
  distribution: ScoreDistribution[];
  average: number;
  highest: number;
  lowest: number;
  passRate: number;
}

export interface AssignmentStats {
  totalSubmissions?: number;
  gradedSubmissions?: number;
  averageScore?: number;
  onTimeSubmissions?: number;
  lateSubmissions?: number;
}

export interface DetailedStats {
  overview: {
    totalStudents: number;
    totalSubmissions: number;
    submissionRate: number;
    gradedSubmissions: number;
    pendingGrading: number;
  };
  timing: {
    onTimeSubmissions: number;
    lateSubmissions: number;
    notSubmitted: number;
  };
  scoring: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    scoreDistribution: ScoreDistribution[];
  };
  submissions: SubmissionSummary[];
}

// ✅ Submission Types
export interface Submission {
  _id?: string;
  student: UserReference;
  content: string;
  submissionDate: string;
  formattedSubmissionDate?: string;
  images: ImageFile[];
  files: DocumentFile[];
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  gradedAt?: string;
  formattedGradedAt?: string;
  gradedBy?: UserReference;
  attemptNumber: number;
  isLate: boolean;
  gradeData?: GradeData;
  daysLate?: number;
}

export interface SubmissionSummary {
  studentName: string;
  studentEmail: string;
  submissionDate: string;
  status: SubmissionStatus;
  score?: number;
  isLate: boolean;
  attemptNumber: number;
}

export interface MySubmission {
  _id?: string;
  content: string;
  submissionDate: string;
  formattedSubmissionDate: string;
  images: ImageFile[];
  files: DocumentFile[];
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  gradedAt?: string;
  formattedGradedAt?: string;
  attemptNumber: number;
  isLate: boolean;
  gradeData?: GradeData;
}

export interface CanSubmit {
  can: boolean;
  reason: string;
}

// ✅ Main Assignment Interface
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: CourseReference;
  dueDate: string;
  formattedDueDate?: string;
  formattedCreatedAt?: string;
  daysUntilDue?: number;
  isOverdue?: boolean;
  maxScore: number;
  weight: number;
  type: AssignmentType;
  attachments?: FileAttachment[];
  submissions?: Submission[];
  creator: UserReference;
  isActive: boolean;
  allowLateSubmission: boolean;
  maxAttempts: number;
  instructions: string;
  stats?: AssignmentStats;
  createdAt: string;
  updatedAt?: string;

  // Student-specific fields
  status?: AssignmentStatus;
  score?: number;
  submissionDate?: string;
  feedback?: string;
  submissionCount?: number;
  totalStudents?: number;
  gradeData?: GradeData;
  mySubmission?: MySubmission;
  canSubmit?: CanSubmit;

  // Teacher-specific fields
  gradedCount?: number;
  gradeStats?: GradeStats;
  submissionStats?: {
    total: number;
    graded: number;
    pending: number;
    onTime: number;
    late: number;
    averageScore: number;
    gradeDistribution: ScoreDistribution[];
    highestScore: number;
    lowestScore: number;
  };
}

// ✅ API Request Types
export interface CreateAssignmentRequest {
  title: string;
  description: string;
  course: string;
  dueDate: string;
  maxScore: number;
  weight: number;
  type?: AssignmentType;
  allowLateSubmission?: boolean;
  maxAttempts?: number;
  instructions?: string;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore?: number;
  weight?: number;
  instructions?: string;
  allowLateSubmission?: boolean;
  maxAttempts?: number;
}

export interface SubmitAssignmentRequest {
  content?: string;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}

export interface ReopenAssignmentRequest {
  newDueDate: string;
}

// ✅ API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  totalCount: number;
  filters: {
    status?: string;
    type?: string;
  };
}

export interface SubmissionResponse {
  _id: string;
  submissionDate: string;
  status: SubmissionStatus;
  isLate: boolean;
  attemptNumber: number;
  filesUploaded: number;
  content: string;
  images: ImageFile[];
  files: DocumentFile[];
  assignment: {
    _id: string;
    title: string;
    maxScore: number;
  };
}

export interface GradeResponse {
  score: number;
  feedback: string;
  gradedAt: string;
  gradeData: GradeData;
  maxScore: number;
}

export interface SubmissionsResponse {
  assignment: {
    _id: string;
    title: string;
    maxScore: number;
    dueDate: string;
    formattedDueDate: string;
    isOverdue: boolean;
  };
  submissions: Submission[];
  statistics: {
    total: number;
    graded: number;
    pending: number;
    gradeDistribution: ScoreDistribution[];
    averageGrade: number;
    passRate: number;
    highestScore: number;
    lowestScore: number;
  };
  filters: {
    status?: string;
  };
}

export interface StatisticsResponse {
  overview: {
    totalStudents: number;
    totalSubmissions: number;
    submissionRate: number;
    gradedSubmissions: number;
    pendingGrading: number;
  };
  timing: {
    onTimeSubmissions: number;
    lateSubmissions: number;
    notSubmitted: number;
  };
  scoring: {
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    scoreDistribution: ScoreDistribution[];
  };
  submissions: SubmissionSummary[];
}

export interface ReopenResponse {
  _id: string;
  title: string;
  newDueDate: string;
  formattedDueDate: string;
  isActive: boolean;
  allowLateSubmission: boolean;
}

// ✅ Filter & Query Types
export type FilterType = 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';

export interface FilterTab {
  key: FilterType;
  label: string;
  icon: string;
  count: number;
}

export interface AssignmentQuery {
  status?: FilterType;
  type?: AssignmentType;
  courseId?: string;
}

// ✅ Form Types for Frontend
export interface AssignmentFormData {
  title: string;
  description: string;
  courseId: string;
  dueDate: Date;
  maxScore: number;
  weight: number;
  type: AssignmentType;
  allowLateSubmission: boolean;
  maxAttempts: number;
  instructions: string;
  attachments: File[];
}

export interface SubmissionFormData {
  content: string;
  files: File[];
}

export interface ImagePickerResult {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

export interface GradingFormData {
  score: number;
  feedback: string;
}

// ✅ Navigation Types
export interface AssignmentNavigationParams {
  courseId: string;
  courseName: string;
}

export interface AssignmentDetailParams {
  assignmentId: string;
  assignment?: Assignment;
}

// ✅ Component Props Types
export interface AssignmentCardProps {
  assignment: Assignment;
  onPress: (assignment: Assignment) => void;
  userRole: 'student' | 'teacher';
}

export interface SubmissionCardProps {
  submission: Submission;
  maxScore: number;
  onGrade?: (submission: Submission) => void;
}

export interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  assignments: Assignment[];
}

export interface AssignmentStatsProps {
  stats: AssignmentStats;
  totalStudents: number;
  userRole: 'student' | 'teacher';
}

// ✅ Hook Types
export interface UseAssignmentsResult {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  filteredAssignments: Assignment[];
  activeFilter: FilterType;
  searchQuery: string;
  assignmentCounts: {[key: string]: number};
  setActiveFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
  onRefresh: () => void;
  clearError: () => void;
}

export interface UseAssignmentDetailResult {
  assignment: Assignment | null;
  loading: boolean;
  error: string | null;
  submissions: Submission[];
  canSubmit: CanSubmit | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export interface UseSubmissionResult {
  submitting: boolean;
  error: string | null;
  submitAssignment: (data: SubmissionFormData) => Promise<void>;
}

export interface UseGradingResult {
  grading: boolean;
  error: string | null;
  gradeSubmission: (studentId: string, data: GradingFormData) => Promise<void>;
}

// ✅ Error Types
export interface AssignmentError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ✅ Utility Types
export type AssignmentAction =
  | 'view'
  | 'edit'
  | 'delete'
  | 'submit'
  | 'grade'
  | 'reopen'
  | 'export';

export interface AssignmentPermission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canGrade: boolean;
  canReopen: boolean;
}

// ✅ NEW: Types for new controller functions
export interface MyAssignmentsStudentQuery {
  status?: FilterType;
  courseId?: string;
}

export interface MyAssignmentsTeacherQuery {
  status?: FilterType;
  courseId?: string;
}

export interface MyAssignmentsResponse {
  assignments: Assignment[];
  totalCount: number;
}
