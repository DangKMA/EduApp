import {useState, useEffect, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import assignmentService from '../services/assignmentService';
import {
  Assignment,
  AssignmentListResponse,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmitAssignmentRequest,
  GradeSubmissionRequest,
  ReopenAssignmentRequest,
  SubmissionResponse,
  GradeResponse,
  ReopenResponse,
  StatisticsResponse,
  SubmissionsResponse,
  MyAssignmentsResponse,
  MyAssignmentsStudentQuery,
  MyAssignmentsTeacherQuery,
  FilterType,
  AssignmentQuery,
  UseAssignmentsResult,
  UseAssignmentDetailResult,
  UseSubmissionResult,
  UseGradingResult,
} from '../types/assignmentType';

// ✅ Helper function để get current user info
const getCurrentUserInfo = async (): Promise<{
  id: string | null;
  role: string | null;
}> => {
  try {
    const userInfoString = await AsyncStorage.getItem('userInfo');
    if (userInfoString) {
      const response = JSON.parse(userInfoString);

      let userInfo;
      if (response.success && response.data) {
        userInfo = response.data.user || response.data;
      } else if (response.user) {
        userInfo = response.user;
      } else {
        userInfo = response;
      }

      return {
        id: userInfo?._id || null,
        role: userInfo?.role || null,
      };
    }
    return {id: null, role: null};
  } catch (error) {
    console.error('Error getting current user info:', error);
    return {id: null, role: null};
  }
};

// ✅ Helper function để transform assignment data với status từ submissions
const transformAssignmentWithStatus = async (
  assignment: any,
): Promise<Assignment> => {
  const {id: currentUserId} = await getCurrentUserInfo();

  // Tìm submission của current user trong submissions array
  let userSubmission = null;
  let status = 'pending'; // default status

  if (
    assignment.submissions &&
    assignment.submissions.length > 0 &&
    currentUserId
  ) {
    userSubmission = assignment.submissions.find((sub: any) => {
      // So sánh cả ObjectId string và nested object
      const studentId =
        typeof sub.student === 'string' ? sub.student : sub.student._id;
      return studentId === currentUserId;
    });

    if (userSubmission) {
      status = userSubmission.status || 'submitted';

      // Check if submission is graded
      if (userSubmission.score !== undefined && userSubmission.score !== null) {
        status = 'graded';
      }
    }
  }

  // Check if assignment is overdue and user hasn't submitted
  const isOverdue = assignmentService.isAssignmentOverdue(assignment.dueDate);
  if (!userSubmission && isOverdue) {
    status = 'overdue';
  }

  return {
    ...assignment,
    status, // ✅ Set status based on user's submission
    mySubmission: userSubmission, // ✅ Add user's submission data
  };
};

// ✅ Main hook for assignments list management - Updated for new service methods
export const useAssignments = (
  courseId?: string,
  initialQuery?: AssignmentQuery,
): UseAssignmentsResult => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch assignments function - Updated to use new service methods
  const fetchAssignments = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);

        const {role} = await getCurrentUserInfo();
        let response: MyAssignmentsResponse | AssignmentListResponse;

        if (courseId) {
          // Fetch assignments for specific course
          response = await assignmentService.getAssignmentsByCourse(courseId, {
            ...initialQuery,
            status: activeFilter !== 'all' ? activeFilter : undefined,
          });
        } else {
          // Fetch all assignments for current user based on role
          if (role === 'student') {
            const query: MyAssignmentsStudentQuery = {
              status: activeFilter !== 'all' ? activeFilter : undefined,
            };
            response = await assignmentService.getMyAssignmentsStudent(query);
          } else if (role === 'teacher') {
            const query: MyAssignmentsTeacherQuery = {
              status: activeFilter !== 'all' ? activeFilter : undefined,
            };
            response = await assignmentService.getMyAssignmentsTeacher(query);
          } else {
            throw new Error('Invalid user role');
          }
        }

        // ✅ Transform assignments with proper status
        const transformedAssignments = await Promise.all(
          response.assignments.map(transformAssignmentWithStatus),
        );

        setAssignments(transformedAssignments);
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tải danh sách bài tập';
        setError(errorMessage);
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [courseId, initialQuery, activeFilter],
  );

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments(false);
  }, [fetchAssignments]);

  // Filter assignments based on active filter and search query
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = assignmentService.filterAssignmentsByStatus(
        filtered,
        activeFilter,
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = assignmentService.searchAssignments(filtered, searchQuery);
    }

    // Sort by due date (ascending)
    return assignmentService.sortAssignmentsByDueDate(filtered, true);
  }, [assignments, activeFilter, searchQuery]);

  // Filter change handler
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Initial load
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Get assignment counts by status
  const assignmentCounts = useMemo(() => {
    return assignmentService.getAssignmentCountsByStatus(assignments);
  }, [assignments]);

  return {
    assignments,
    loading,
    error,
    refreshing,
    filteredAssignments,
    activeFilter,
    searchQuery,
    assignmentCounts,
    setActiveFilter: handleFilterChange,
    setSearchQuery: handleSearch,
    refetch: fetchAssignments,
    onRefresh,
    clearError: () => setError(null),
  };
};

// ✅ Hook for single assignment details - Enhanced
export const useAssignmentDetail = (
  assignmentId: string,
): UseAssignmentDetailResult => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const fetchAssignmentDetail = useCallback(async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      const assignmentData = await assignmentService.getAssignmentById(
        assignmentId,
      );

      // ✅ Transform assignment data with proper status
      const transformedAssignment = await transformAssignmentWithStatus(
        assignmentData,
      );
      setAssignment(transformedAssignment);

      // If user is teacher, also fetch submissions
      const {role} = await getCurrentUserInfo();
      if (role === 'teacher') {
        try {
          const submissionsData =
            await assignmentService.getAssignmentSubmissions(assignmentId);
          setSubmissions(submissionsData.submissions);
        } catch (submissionError) {
          console.warn('Could not fetch submissions:', submissionError);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải chi tiết bài tập';
      setError(errorMessage);
      console.error('Error fetching assignment detail:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetail();
  }, [fetchAssignmentDetail]);

  // Check if student can submit - Using service method
  const canSubmit = useMemo(() => {
    if (!assignment) return {can: false, reason: 'Assignment not found'};

    return assignmentService.canSubmitAssignment(assignment);
  }, [assignment]);

  return {
    assignment,
    loading,
    error,
    submissions,
    canSubmit,
    refetch: fetchAssignmentDetail,
    clearError: () => setError(null),
  };
};

// ✅ Hook for assignment submission - Enhanced with progress tracking
export const useSubmission = (assignmentId: string): UseSubmissionResult => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitAssignment = useCallback(
    async (
      submissionData: SubmitAssignmentRequest,
      files?: any[],
    ): Promise<SubmissionResponse | null> => {
      try {
        setSubmitting(true);
        setError(null);

        // Validate files if any
        if (files && files.length > 0) {
          for (const file of files) {
            const validation = assignmentService.validateFile(file);
            if (!validation.valid) {
              throw new Error(validation.error);
            }
          }
        }

        const response = await assignmentService.submitAssignment(
          assignmentId,
          submissionData,
          files,
        );

        Alert.alert('Thành công', 'Bài tập đã được nộp thành công!', [
          {text: 'OK'},
        ]);

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể nộp bài tập';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [assignmentId],
  );

  return {
    submitting,
    error,
    submitAssignment,
    clearError: () => setError(null),
  };
};

// ✅ Hook for grading submissions (Teachers only)
export const useGrading = (assignmentId: string): UseGradingResult => {
  const [grading, setGrading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const gradeSubmission = useCallback(
    async (
      studentId: string,
      gradeData: GradeSubmissionRequest,
    ): Promise<GradeResponse | null> => {
      try {
        setGrading(true);
        setError(null);

        const response = await assignmentService.gradeSubmission(
          assignmentId,
          studentId,
          gradeData,
        );

        Alert.alert('Thành công', 'Đã chấm điểm thành công!', [{text: 'OK'}]);

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể chấm điểm';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return null;
      } finally {
        setGrading(false);
      }
    },
    [assignmentId],
  );

  return {
    grading,
    error,
    gradeSubmission,
    clearError: () => setError(null),
  };
};

// ✅ Hook for assignment CRUD operations (Teachers only) - Enhanced
export const useAssignmentCRUD = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createAssignment = useCallback(
    async (
      assignmentData: CreateAssignmentRequest,
      attachments?: any[],
    ): Promise<Assignment | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await assignmentService.createAssignment(
          assignmentData,
          attachments,
        );

        Alert.alert('Thành công', 'Bài tập đã được tạo thành công!', [
          {text: 'OK'},
        ]);

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tạo bài tập';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateAssignment = useCallback(
    async (
      assignmentId: string,
      updateData: UpdateAssignmentRequest,
      attachments?: any[],
    ): Promise<Assignment | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await assignmentService.updateAssignment(
          assignmentId,
          updateData,
          attachments,
        );

        Alert.alert('Thành công', 'Bài tập đã được cập nhật thành công!', [
          {text: 'OK'},
        ]);

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể cập nhật bài tập';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteAssignment = useCallback(
    async (assignmentId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await assignmentService.deleteAssignment(assignmentId);

        Alert.alert('Thành công', 'Bài tập đã được xóa thành công!', [
          {text: 'OK'},
        ]);

        return true;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể xóa bài tập';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reopenAssignment = useCallback(
    async (
      assignmentId: string,
      reopenData: ReopenAssignmentRequest,
    ): Promise<ReopenResponse | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await assignmentService.reopenAssignment(
          assignmentId,
          reopenData,
        );

        Alert.alert('Thành công', 'Bài tập đã được mở lại thành công!', [
          {text: 'OK'},
        ]);

        return response;
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể mở lại bài tập';
        setError(errorMessage);

        Alert.alert('Lỗi', errorMessage, [{text: 'OK'}]);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    reopenAssignment,
    clearError: () => setError(null),
  };
};

// ✅ Hook for assignment statistics (Teachers only) - Enhanced
export const useAssignmentStatistics = (assignmentId: string) => {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await assignmentService.getAssignmentStatistics(
        assignmentId,
      );
      setStatistics(response);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải thống kê bài tập';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
    clearError: () => setError(null),
  };
};

// ✅ Hook for assignment submissions list (Teachers only) - Enhanced
export const useAssignmentSubmissions = (
  assignmentId: string,
  statusFilter?: string,
) => {
  const [submissionsData, setSubmissionsData] =
    useState<SubmissionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchSubmissions = useCallback(
    async (showLoading = true) => {
      if (!assignmentId) return;

      try {
        if (showLoading) setLoading(true);
        setError(null);

        const response = await assignmentService.getAssignmentSubmissions(
          assignmentId,
          statusFilter,
        );
        setSubmissionsData(response);
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tải danh sách bài nộp';
        setError(errorMessage);
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [assignmentId, statusFilter],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubmissions(false);
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Extract submissions array for backward compatibility
  const submissions = useMemo(() => {
    return submissionsData?.submissions || [];
  }, [submissionsData]);

  return {
    submissions,
    submissionsData, // Full response with statistics
    loading,
    error,
    refreshing,
    refetch: fetchSubmissions,
    onRefresh,
    clearError: () => setError(null),
  };
};

// ✅ NEW: Hook for student assignments across all courses
export const useStudentAssignments = (query?: MyAssignmentsStudentQuery) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAssignments = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);

        const response = await assignmentService.getMyAssignmentsStudent(query);
        setAssignments(response.assignments);
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tải danh sách bài tập';
        setError(errorMessage);
        console.error('Error fetching student assignments:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments(false);
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refreshing,
    refetch: fetchAssignments,
    onRefresh,
    clearError: () => setError(null),
  };
};

// ✅ NEW: Hook for teacher assignments across all courses
export const useTeacherAssignments = (query?: MyAssignmentsTeacherQuery) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAssignments = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);

        const response = await assignmentService.getMyAssignmentsTeacher(query);
        setAssignments(response.assignments);
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tải danh sách bài tập';
        setError(errorMessage);
        console.error('Error fetching teacher assignments:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments(false);
  }, [fetchAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    loading,
    error,
    refreshing,
    refetch: fetchAssignments,
    onRefresh,
    clearError: () => setError(null),
  };
};

// ✅ Export all hooks
export default {
  useAssignments,
  useAssignmentDetail,
  useSubmission,
  useGrading,
  useAssignmentCRUD,
  useAssignmentStatistics,
  useAssignmentSubmissions,
  useStudentAssignments,
  useTeacherAssignments,
};
