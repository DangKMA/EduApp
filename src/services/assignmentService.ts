import {
  Assignment,
  AssignmentListResponse,
  SubmissionsResponse,
  StatisticsResponse,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAssignmentRequest,
  GradeSubmissionRequest,
  ReopenAssignmentRequest,
  SubmissionResponse,
  GradeResponse,
  ReopenResponse,
  ApiResponse,
  AssignmentQuery,
  FilterType,
  AssignmentType,
  MyAssignmentsResponse,
  MyAssignmentsStudentQuery,
  MyAssignmentsTeacherQuery,
} from '../types/assignmentType';
import apiClient from '../apis/apiClient';

// ✅ Base API configuration
const ASSIGNMENT_BASE_URL = '/assignments';

class AssignmentService {
  // ✅ Get assignments by course
  async getAssignmentsByCourse(
    courseId: string,
    query?: AssignmentQuery,
  ): Promise<AssignmentListResponse> {
    try {
      const params: any = {};

      if (query?.status && query.status !== 'all') {
        params.status = query.status;
      }

      if (query?.type) {
        params.type = query.type;
      }

      const response = await apiClient.get<ApiResponse<AssignmentListResponse>>(
        `${ASSIGNMENT_BASE_URL}/course/${courseId}`,
        params,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch assignments');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching assignments by course:', error);
      throw new Error(error.message || 'Failed to fetch assignments');
    }
  }

  // ✅ Get single assignment details
  async getAssignmentById(assignmentId: string): Promise<Assignment> {
    try {
      const response = await apiClient.get<ApiResponse<Assignment>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}`,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch assignment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching assignment:', error);
      throw new Error(error.message || 'Failed to fetch assignment');
    }
  }

  // ✅ Create new assignment (Teachers only)
  async createAssignment(
    assignmentData: CreateAssignmentRequest,
    attachments?: any[],
  ): Promise<Assignment> {
    try {
      const formData = new FormData();

      // Append assignment data
      Object.entries(assignmentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append files if any
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', {
            uri: file.uri,
            name: file.fileName || file.name,
            type: file.type || file.mimeType,
          } as any);
        });
      }

      const response = await apiClient.upload<ApiResponse<Assignment>>(
        ASSIGNMENT_BASE_URL,
        formData,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create assignment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      throw new Error(error.message || 'Failed to create assignment');
    }
  }

  // ✅ Update assignment (Teachers only)
  async updateAssignment(
    assignmentId: string,
    updateData: UpdateAssignmentRequest,
    attachments?: any[],
  ): Promise<Assignment> {
    try {
      const formData = new FormData();

      // Append update data
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append files if any
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', {
            uri: file.uri,
            name: file.fileName || file.name,
            type: file.type || file.mimeType,
          } as any);
        });
      }

      const response = await apiClient.put<ApiResponse<Assignment>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}`,
        formData,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to update assignment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      throw new Error(error.message || 'Failed to update assignment');
    }
  }

  // ✅ Delete assignment (Teachers only)
  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<{deletedAt: string}>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}`,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete assignment');
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      throw new Error(error.message || 'Failed to delete assignment');
    }
  }

  // ✅ Submit assignment (Students only)
  async submitAssignment(
    assignmentId: string,
    submissionData: SubmitAssignmentRequest,
    files?: any[],
  ): Promise<SubmissionResponse> {
    try {
      const formData = new FormData();

      // Append submission content
      if (submissionData.content) {
        formData.append('content', submissionData.content);
      }

      // Append files
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('files', {
            uri: file.uri,
            name: file.fileName || file.name,
            type: file.type || file.mimeType,
          } as any);
        });
      }

      const response = await apiClient.upload<ApiResponse<SubmissionResponse>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}/submit`,
        formData,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit assignment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      throw new Error(error.message || 'Failed to submit assignment');
    }
  }

  // ✅ Grade submission (Teachers only)
  async gradeSubmission(
    assignmentId: string,
    studentId: string,
    gradeData: GradeSubmissionRequest,
  ): Promise<GradeResponse> {
    try {
      const response = await apiClient.put<ApiResponse<GradeResponse>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}/grade/${studentId}`,
        gradeData,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to grade submission');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error grading submission:', error);
      throw new Error(error.message || 'Failed to grade submission');
    }
  }

  // ✅ Get assignment submissions (Teachers only)
  async getAssignmentSubmissions(
    assignmentId: string,
    status?: string,
  ): Promise<SubmissionsResponse> {
    try {
      const params: any = {};
      if (status && status !== 'all') {
        params.status = status;
      }

      const response = await apiClient.get<ApiResponse<SubmissionsResponse>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}/submissions`,
        params,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch submissions');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      throw new Error(error.message || 'Failed to fetch submissions');
    }
  }

  // ✅ NEW: Get student's assignments across all courses
  async getMyAssignmentsStudent(
    query?: MyAssignmentsStudentQuery,
  ): Promise<MyAssignmentsResponse> {
    try {
      const params: any = {};

      if (query?.status && query.status !== 'all') {
        params.status = query.status;
      }

      if (query?.courseId) {
        params.courseId = query.courseId;
      }

      const response = await apiClient.get<ApiResponse<MyAssignmentsResponse>>(
        `${ASSIGNMENT_BASE_URL}/student/my-assignments`,
        params,
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to fetch student assignments',
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching student assignments:', error);
      throw new Error(error.message || 'Failed to fetch student assignments');
    }
  }

  // ✅ NEW: Get teacher's assignments across all courses
  async getMyAssignmentsTeacher(
    query?: MyAssignmentsTeacherQuery,
  ): Promise<MyAssignmentsResponse> {
    try {
      const params: any = {};

      if (query?.status && query.status !== 'all') {
        params.status = query.status;
      }

      if (query?.courseId) {
        params.courseId = query.courseId;
      }

      const response = await apiClient.get<ApiResponse<MyAssignmentsResponse>>(
        `${ASSIGNMENT_BASE_URL}/teacher/my-assignments`,
        params,
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to fetch teacher assignments',
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching teacher assignments:', error);
      throw new Error(error.message || 'Failed to fetch teacher assignments');
    }
  }

  // ✅ NEW: Get assignment statistics (Teachers only)
  async getAssignmentStatistics(
    assignmentId: string,
  ): Promise<StatisticsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<StatisticsResponse>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}/statistics`,
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to fetch assignment statistics',
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching assignment statistics:', error);
      throw new Error(error.message || 'Failed to fetch assignment statistics');
    }
  }

  // ✅ NEW: Reopen assignment (Teachers only)
  async reopenAssignment(
    assignmentId: string,
    reopenData: ReopenAssignmentRequest,
  ): Promise<ReopenResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ReopenResponse>>(
        `${ASSIGNMENT_BASE_URL}/${assignmentId}/reopen`,
        reopenData,
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to reopen assignment');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error reopening assignment:', error);
      throw new Error(error.message || 'Failed to reopen assignment');
    }
  }

  // ✅ DEPRECATED: Legacy methods (for backward compatibility)
  async getStudentAssignments(
    status?: FilterType,
    courseId?: string,
  ): Promise<MyAssignmentsResponse> {
    console.warn(
      'getStudentAssignments is deprecated. Use getMyAssignmentsStudent instead.',
    );
    return this.getMyAssignmentsStudent({status, courseId});
  }

  async getTeacherAssignments(
    status?: string,
    courseId?: string,
  ): Promise<MyAssignmentsResponse> {
    console.warn(
      'getTeacherAssignments is deprecated. Use getMyAssignmentsTeacher instead.',
    );
    return this.getMyAssignmentsTeacher({
      status: status as FilterType,
      courseId,
    });
  }

  // ✅ Utility methods - Enhanced for better compatibility

  // Filter assignments by status
  filterAssignmentsByStatus(
    assignments: Assignment[],
    status: FilterType,
  ): Assignment[] {
    if (status === 'all') {
      return assignments;
    }

    return assignments.filter(assignment => assignment.status === status);
  }

  // Filter assignments by type
  filterAssignmentsByType(
    assignments: Assignment[],
    type: AssignmentType,
  ): Assignment[] {
    return assignments.filter(assignment => assignment.type === type);
  }

  // Get assignments count by status (Enhanced to handle server-side counting)
  getAssignmentCountsByStatus(
    assignments: Assignment[],
  ): Record<FilterType, number> {
    return {
      all: assignments.length,
      pending: assignments.filter(a => a.status === 'pending').length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      graded: assignments.filter(a => a.status === 'graded').length,
      overdue: assignments.filter(a => a.status === 'overdue').length,
    };
  }

  // Check if assignment is overdue (Compatible with server isOverdue helper)
  isAssignmentOverdue(dueDate: string, currentDate?: Date): boolean {
    const due = new Date(dueDate);
    const now = currentDate || new Date();
    return due < now;
  }

  // Get days until due date (Compatible with server getDaysUntilDue helper)
  getDaysUntilDue(dueDate: string, fromDate?: Date): number {
    const due = new Date(dueDate);
    const from = fromDate || new Date();
    const diffTime = due.getTime() - from.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Format due date for display (Enhanced with Vietnamese locale)
  formatDueDate(dueDate: string): string {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`;
    } else if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Ngày mai';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày nữa`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  // Format assignment status for display (Updated with all status types)
  getStatusDisplayText(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Chưa nộp',
      submitted: 'Đã nộp',
      graded: 'Đã chấm điểm',
      overdue: 'Quá hạn',
      not_submitted: 'Chưa nộp',
      late: 'Nộp muộn',
    };

    return statusMap[status] || status;
  }

  // Get status color (Enhanced with more status types)
  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      pending: '#FFA500', // Orange
      submitted: '#4CAF50', // Green
      graded: '#2196F3', // Blue
      overdue: '#F44336', // Red
      late: '#FF9800', // Amber
      not_submitted: '#757575', // Grey
    };

    return colorMap[status] || '#757575';
  }

  // Get status icon (Enhanced with more status types)
  getStatusIcon(status: string): string {
    const iconMap: Record<string, string> = {
      pending: 'clock-outline',
      submitted: 'checkmark-circle-outline',
      graded: 'trophy-outline',
      overdue: 'alert-circle-outline',
      late: 'time-outline',
      not_submitted: 'document-outline',
    };

    return iconMap[status] || 'document-outline';
  }

  // Enhanced file validation with server-side compatibility
  validateFile(
    file: any,
    maxSize: number = 10 * 1024 * 1024, // 10MB default
  ): {valid: boolean; error?: string} {
    if (!file || !file.uri) {
      return {
        valid: false,
        error: 'Không có file được chọn',
      };
    }

    if (file.fileSize && file.fileSize > maxSize) {
      return {
        valid: false,
        error: `Kích thước file phải nhỏ hơn ${this.formatFileSize(maxSize)}`,
      };
    }

    // Enhanced file type validation matching server allowedMimes
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'video/mp4',
      'audio/mp3',
      'audio/mpeg',
    ];

    const fileType = file.type || file.mimeType;
    if (fileType && !allowedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `Loại file ${fileType} không được hỗ trợ`,
      };
    }

    return {valid: true};
  }

  // Format file size (Compatible with server formatFileSize helper)
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Enhanced grade calculation (Compatible with server calculateGrade helper)
  calculateGradePercentage(score: number, maxScore: number): number {
    return Math.round((score / maxScore) * 100 * 100) / 100; // Match server precision
  }

  // Get grade letter (Compatible with server grade calculation)
  getGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  // Get grade description (Matching server descriptions)
  getGradeDescription(percentage: number): string {
    if (percentage >= 90) return 'Xuất sắc';
    if (percentage >= 85) return 'Rất tốt';
    if (percentage >= 80) return 'Tốt';
    if (percentage >= 75) return 'Khá tốt';
    if (percentage >= 70) return 'Khá';
    if (percentage >= 65) return 'Trung bình';
    if (percentage >= 50) return 'Yếu';
    return 'Rất kém';
  }

  // Get grade color based on percentage (Enhanced grading scale)
  getGradeColor(percentage: number): string {
    if (percentage >= 90) return '#4CAF50'; // Green - Excellent
    if (percentage >= 85) return '#8BC34A'; // Light Green - Very Good
    if (percentage >= 80) return '#CDDC39'; // Lime - Good
    if (percentage >= 75) return '#FFEB3B'; // Yellow - Good
    if (percentage >= 70) return '#FFC107'; // Amber - Fair
    if (percentage >= 65) return '#FF9800'; // Orange - Average
    if (percentage >= 50) return '#FF5722'; // Deep Orange - Poor
    return '#F44336'; // Red - Very Poor
  }

  // Format assignment type for display
  getTypeDisplayText(type: AssignmentType): string {
    const typeMap: Record<AssignmentType, string> = {
      photo: 'Ảnh',
      document: 'Tài liệu',
      video: 'Video',
      text: 'Văn bản',
    };

    return typeMap[type] || type;
  }

  // Get type icon
  getTypeIcon(type: AssignmentType): string {
    const iconMap: Record<AssignmentType, string> = {
      photo: 'camera-outline',
      document: 'document-text-outline',
      video: 'videocam-outline',
      text: 'text-outline',
    };

    return iconMap[type] || 'document-outline';
  }

  // Sort assignments by due date (Enhanced with null safety)
  sortAssignmentsByDueDate(
    assignments: Assignment[],
    ascending: boolean = true,
  ): Assignment[] {
    return [...assignments].sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();

      if (isNaN(dateA) || isNaN(dateB)) {
        return 0; // Handle invalid dates
      }

      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  // Group assignments by status (Enhanced with safe grouping)
  groupAssignmentsByStatus(
    assignments: Assignment[],
  ): Record<string, Assignment[]> {
    return assignments.reduce((groups, assignment) => {
      const status = assignment.status || 'pending';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(assignment);
      return groups;
    }, {} as Record<string, Assignment[]>);
  }

  // Search assignments (Enhanced search with course code)
  searchAssignments(assignments: Assignment[], query: string): Assignment[] {
    if (!query.trim()) return assignments;

    const searchTerm = query.toLowerCase().trim();
    return assignments.filter(
      assignment =>
        assignment.title.toLowerCase().includes(searchTerm) ||
        assignment.description.toLowerCase().includes(searchTerm) ||
        assignment.course.name.toLowerCase().includes(searchTerm) ||
        (assignment.course.id &&
          assignment.course.id.toLowerCase().includes(searchTerm)) ||
        assignment.instructions.toLowerCase().includes(searchTerm),
    );
  }

  // NEW: Get file type (Compatible with server getFileType helper)
  getFileType(mimetype: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // NEW: Check submission permission (Client-side validation)
  canSubmitAssignment(assignment: Assignment): {can: boolean; reason: string} {
    if (!assignment.isActive) {
      return {
        can: false,
        reason: 'Bài tập đã bị vô hiệu hóa',
      };
    }

    if (
      this.isAssignmentOverdue(assignment.dueDate) &&
      !assignment.allowLateSubmission
    ) {
      return {
        can: false,
        reason: 'Đã quá hạn nộp bài',
      };
    }

    return {
      can: true,
      reason: 'Có thể nộp bài',
    };
  }

  // NEW: Format submission statistics
  formatSubmissionStats(stats: any) {
    return {
      ...stats,
      submissionRate: `${stats.submissionRate || 0}%`,
      passRate: `${stats.passRate || 0}%`,
      averageScore: `${stats.averageScore || 0}/${stats.maxScore || 100}`,
    };
  }
}

// ✅ Export singleton instance
export const assignmentService = new AssignmentService();
export default assignmentService;
