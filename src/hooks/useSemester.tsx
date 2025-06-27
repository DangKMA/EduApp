import {useState, useCallback} from 'react';
import AlertComponent from '../components/AlertCompunent';
import {
  Semester,
  SemesterInfo,
  SemesterWithCourses,
  SemesterParams,
  SemestersResponse,
  SemesterResponse,
  SemesterCourseIdsResponse,
  StudentCoursesBySemesterResponse,
  InstructorCoursesBySemesterResponse,
  AcademicYearsResponse,
  CreateSemesterResponse,
  UpdateSemesterResponse,
  DeleteSemesterResponse,
  SetCurrentSemesterResponse,
  AddCourseToSemesterResponse,
  RemoveCourseFromSemesterResponse,
} from '../types/semesterType';
import {semesterService} from '../services/semesterService';

export const useSemester = () => {
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [semesterDetail, setSemesterDetail] = useState<Semester | null>(null);
  const [semesterWithCourses, setSemesterWithCourses] =
    useState<SemesterWithCourses | null>(null);
  const [semesterCourseIds, setSemesterCourseIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alert state
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({
    type: 'info',
    message: '',
    visible: false,
  });

  // Alert functions
  const hideAlert = useCallback(() => {
    setAlert(prev => ({...prev, visible: false}));
  }, []);

  const showAlert = useCallback(
    (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
      setAlert({
        type,
        message,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
    },
    [hideAlert],
  );

  // Helper function để convert SemesterInfo sang Semester
  const convertToSemester = useCallback((semInfo: SemesterInfo): Semester => {
    return {
      _id: semInfo._id,
      name: semInfo.semester,
      academicYear: semInfo.academicYear,
      displayName: semInfo.displayName,
      startDate: semInfo.startDate,
      endDate: semInfo.endDate,
      isActive: semInfo.isActive,
      isCurrent: semInfo.isCurrent,
      courses: semInfo.courses,
    };
  }, []);

  // Helper function để handle error
  const handleError = useCallback(
    (error: any, defaultMessage: string): void => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        defaultMessage;

      setError(errorMessage);
      showAlert('error', errorMessage);
    },
    [showAlert],
  );

  /**
   * LẤY THÔNG TIN HỌC KỲ
   * ==================
   */

  // Lấy tất cả học kỳ
  const getAllSemesters = useCallback(
    async (params?: {
      academicYear?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    }): Promise<Semester[]> => {
      try {
        setLoading(true);
        setError(null);

        const response: SemestersResponse =
          await semesterService.getAllSemesters(params);

        if (response.success && response.data && response.data.length > 0) {
          const formattedSemesters = response.data.map(convertToSemester);
          setSemesters(formattedSemesters);
          return formattedSemesters;
        } else {
          if (!response.success) {
            showAlert(
              'error',
              response.error ||
                response.message ||
                'Không thể tải danh sách học kỳ',
            );
          }
          setSemesters([]);
          return [];
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải danh sách học kỳ');
        setSemesters([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [convertToSemester, handleError, showAlert],
  );

  // Lấy học kỳ hiện tại
  const getCurrentSemester = useCallback(async (): Promise<Semester | null> => {
    try {
      setLoading(true);
      setError(null);

      const response: SemesterResponse =
        await semesterService.getCurrentSemester();

      if (response.success && response.data) {
        const semester = convertToSemester(response.data);
        setCurrentSemester(semester);
        return semester;
      } else {
        showAlert(
          'error',
          response.error || response.message || 'Không thể tải học kỳ hiện tại',
        );
        return null;
      }
      // eslint-disable-next-line no-catch-shadow
    } catch (error: any) {
      handleError(error, 'Đã xảy ra lỗi khi tải học kỳ hiện tại');
      return null;
    } finally {
      setLoading(false);
    }
  }, [convertToSemester, handleError, showAlert]);

  // Lấy chi tiết học kỳ
  const getSemesterById = useCallback(
    async (id: string): Promise<Semester | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: SemesterResponse =
          await semesterService.getSemesterById(id);

        if (response.success && response.data) {
          const semester = convertToSemester(response.data);
          setSemesterDetail(semester);
          return semester;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể tải thông tin học kỳ',
          );
          return null;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải thông tin học kỳ');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [convertToSemester, handleError, showAlert],
  );

  // Lấy danh sách ID khóa học trong học kỳ
  const getSemesterCourseIds = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response: SemesterCourseIdsResponse =
          await semesterService.getSemesterCourseIds(id);

        if (response.success && response.data) {
          setSemesterCourseIds(response.data.courseIds);
          return response.data;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể tải danh sách ID khóa học',
          );
          return null;
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải danh sách ID khóa học');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  /**
   * LẤY KHÓA HỌC THEO HỌC KỲ
   * =====================
   */

  // Lấy khóa học của sinh viên trong học kỳ
  const getStudentCoursesBySemester = useCallback(
    async (id: string): Promise<SemesterWithCourses | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: StudentCoursesBySemesterResponse =
          await semesterService.getStudentCoursesBySemester(id);

        if (response.success && response.data) {
          const semesterWithCoursesData: SemesterWithCourses = {
            semester: response.data.semester,
            courses: response.data.courses || [],
          };

          setSemesterWithCourses(semesterWithCoursesData);
          return semesterWithCoursesData;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể tải khóa học của sinh viên trong học kỳ',
          );
          return null;
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(
          error,
          'Đã xảy ra lỗi khi tải khóa học của sinh viên trong học kỳ',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  // Lấy khóa học của giảng viên trong học kỳ
  const getInstructorCoursesBySemester = useCallback(
    async (id: string): Promise<SemesterWithCourses | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: InstructorCoursesBySemesterResponse =
          await semesterService.getInstructorCoursesBySemester(id);

        if (response.success && response.data) {
          const semesterWithCoursesData: SemesterWithCourses = {
            semester: response.data.semester,
            courses: response.data.courses || [],
          };

          setSemesterWithCourses(semesterWithCoursesData);
          return semesterWithCoursesData;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể tải khóa học của giảng viên trong học kỳ',
          );
          return null;
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(
          error,
          'Đã xảy ra lỗi khi tải khóa học của giảng viên trong học kỳ',
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  /**
   * QUẢN LÝ HỌC KỲ (ADMIN/TEACHER)
   * =============================
   */

  // Tạo học kỳ mới
  const createSemester = useCallback(
    async (semesterData: SemesterParams): Promise<Semester | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: CreateSemesterResponse =
          await semesterService.createSemester(semesterData);

        if (response.success && response.data) {
          const semester = convertToSemester(response.data);

          // Cập nhật danh sách semesters
          setSemesters(prev => [semester, ...prev]);

          showAlert('success', response.message || 'Tạo học kỳ thành công');
          return semester;
        } else {
          showAlert(
            'error',
            response.error || response.message || 'Không thể tạo học kỳ',
          );
          return null;
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tạo học kỳ');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [convertToSemester, handleError, showAlert],
  );

  // Cập nhật học kỳ
  const updateSemester = useCallback(
    async (
      id: string,
      semesterData: Partial<SemesterParams>,
    ): Promise<Semester | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: UpdateSemesterResponse =
          await semesterService.updateSemester(id, semesterData);

        if (response.success && response.data) {
          const semester = convertToSemester(response.data);

          // Cập nhật trong danh sách semesters
          setSemesters(prev =>
            prev.map(sem => (sem._id === id ? semester : sem)),
          );

          // Cập nhật semesterDetail nếu đang xem semester này
          if (semesterDetail && semesterDetail._id === id) {
            setSemesterDetail(semester);
          }

          // Cập nhật currentSemester nếu là semester hiện tại
          if (currentSemester && currentSemester._id === id) {
            setCurrentSemester(semester);
          }

          showAlert(
            'success',
            response.message || 'Cập nhật học kỳ thành công',
          );
          return semester;
        } else {
          showAlert(
            'error',
            response.error || response.message || 'Không thể cập nhật học kỳ',
          );
          return null;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi cập nhật học kỳ');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      convertToSemester,
      handleError,
      semesterDetail,
      currentSemester,
      showAlert,
    ],
  );

  // Xóa học kỳ
  const deleteSemester = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response: DeleteSemesterResponse =
          await semesterService.deleteSemester(id);

        if (response.success) {
          // Xóa khỏi danh sách semesters
          setSemesters(prev => prev.filter(sem => sem._id !== id));

          // Clear các state liên quan nếu cần
          if (semesterDetail && semesterDetail._id === id) {
            setSemesterDetail(null);
          }

          if (currentSemester && currentSemester._id === id) {
            setCurrentSemester(null);
          }

          showAlert('success', response.message || 'Xóa học kỳ thành công');
          return true;
        } else {
          showAlert(
            'error',
            response.error || response.message || 'Không thể xóa học kỳ',
          );
          return false;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi xóa học kỳ');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, semesterDetail, currentSemester, showAlert],
  );

  // Đặt học kỳ làm học kỳ hiện tại
  const setAsSemesterCurrent = useCallback(
    async (id: string): Promise<Semester | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: SetCurrentSemesterResponse =
          await semesterService.setCurrentSemester(id);

        if (response.success && response.data) {
          const semester = convertToSemester(response.data);

          // Cập nhật tất cả semesters - chỉ semester này là current
          setSemesters(prev =>
            prev.map(sem => ({
              ...sem,
              isCurrent: sem._id === id,
            })),
          );

          setCurrentSemester(semester);

          showAlert(
            'success',
            response.message || 'Thiết lập học kỳ hiện tại thành công',
          );
          return semester;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể thiết lập học kỳ hiện tại',
          );
          return null;
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi thiết lập học kỳ hiện tại');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [convertToSemester, handleError, showAlert],
  );

  /**
   * QUẢN LÝ KHÓA HỌC TRONG HỌC KỲ
   * ============================
   */

  // Thêm khóa học vào học kỳ
  const addCourseToSemester = useCallback(
    async (
      semesterId: string,
      courseId: string,
    ): Promise<{semesterId: string; courseId: string} | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: AddCourseToSemesterResponse =
          await semesterService.addCourseToSemester(semesterId, courseId);

        if (response.success && response.data) {
          showAlert(
            'success',
            response.message || 'Thêm khóa học vào học kỳ thành công',
          );
          return response.data;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể thêm khóa học vào học kỳ',
          );
          return null;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi thêm khóa học vào học kỳ');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  // Xóa khóa học khỏi học kỳ
  const removeCourseFromSemester = useCallback(
    async (semesterId: string, courseId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const response: RemoveCourseFromSemesterResponse =
          await semesterService.removeCourseFromSemester(semesterId, courseId);

        if (response.success) {
          showAlert(
            'success',
            response.message || 'Xóa khóa học khỏi học kỳ thành công',
          );
          return true;
        } else {
          showAlert(
            'error',
            response.error ||
              response.message ||
              'Không thể xóa khóa học khỏi học kỳ',
          );
          return false;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi xóa khóa học khỏi học kỳ');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  /**
   * UTILITY FUNCTIONS
   * ================
   */

  // Lấy danh sách năm học
  const getAcademicYears = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);

      const response: AcademicYearsResponse =
        await semesterService.getAcademicYears();

      if (response.success && response.data) {
        return response.data;
      } else {
        showAlert(
          'error',
          response.error ||
            response.message ||
            'Không thể tải danh sách năm học',
        );
        return [];
      }
    } catch (error: any) {
      handleError(error, 'Đã xảy ra lỗi khi tải danh sách năm học');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, showAlert]);

  // Định dạng học kỳ để hiển thị
  const formatSemesterName = useCallback(
    (semester: Semester | null): string => {
      if (!semester) {
        return '';
      }
      return semesterService.formatSemesterName(semester);
    },
    [],
  );

  // Làm mới dữ liệu
  const refreshData = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([getAllSemesters(), getCurrentSemester()]);
    } finally {
      setRefreshing(false);
    }
  }, [getAllSemesters, getCurrentSemester]);

  // Clear data
  const clearSemesterData = useCallback(() => {
    setSemesters([]);
    setCurrentSemester(null);
    setSemesterDetail(null);
    setSemesterWithCourses(null);
    setSemesterCourseIds([]);
    setError(null);
  }, []);

  // Kiểm tra semester có đang active không
  const isActiveSemester = useCallback(
    (semesterId: string): boolean => {
      const semester = semesters.find(sem => sem._id === semesterId);
      return semester?.isActive || false;
    },
    [semesters],
  );

  // Kiểm tra semester có phải là current không
  const isCurrentSemester = useCallback(
    (semesterId: string): boolean => {
      const semester = semesters.find(sem => sem._id === semesterId);
      return semester?.isCurrent || false;
    },
    [semesters],
  );

  // Render Alert component
  const renderAlert = () =>
    alert.visible ? (
      <AlertComponent
        type={alert.type}
        message={alert.message}
        duration={3000}
      />
    ) : null;

  return {
    // States
    loading,
    semesters,
    currentSemester,
    semesterDetail,
    semesterWithCourses,
    semesterCourseIds,
    refreshing,
    error,

    // Lấy thông tin học kỳ
    getAllSemesters,
    getCurrentSemester,
    getSemesterById,
    getSemesterCourseIds,

    // Lấy khóa học theo học kỳ
    getStudentCoursesBySemester,
    getInstructorCoursesBySemester,

    // Quản lý học kỳ
    createSemester,
    updateSemester,
    deleteSemester,
    setAsSemesterCurrent,

    // Quản lý khóa học trong học kỳ
    addCourseToSemester,
    removeCourseFromSemester,

    // Utility functions
    getAcademicYears,
    formatSemesterName,
    refreshData,
    clearSemesterData,
    isActiveSemester,
    isCurrentSemester,

    // Alert
    renderAlert,
  };
};

export default useSemester;
