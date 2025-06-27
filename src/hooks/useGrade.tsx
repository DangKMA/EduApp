import {useState, useCallback} from 'react';
import {useToast} from 'react-native-toast-notifications';
import {
  CourseGrade,
  SemesterStats,
  OverviewData,
  AddCourseGradeParams,
  UpdateCourseGradeParams,
  UpdateGradeStatusParams,
  GradeFilterParams,
  StudentGradeResponse,
  GradesResponse,
  CourseGradesResponse,
  TranscriptResponse,
  GPAStatsResponse,
  ImportGradesResponse,
  DeleteGradeResponse,
  GradeResponse,
} from '../types/gradeType';
import gradeService from '../services/gradeService';

export const useGrade = () => {
  const [loading, setLoading] = useState(false);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [semesterStats, setSemesterStats] = useState<SemesterStats | null>(
    null,
  );
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast();

  /**
   * QUẢN LÝ ĐIỂM CHUNG
   * =================
   */

  // Lấy danh sách điểm với các bộ lọc
  const getGrades = useCallback(
    async (filters?: GradeFilterParams): Promise<CourseGrade[]> => {
      try {
        setLoading(true);

        const response: GradesResponse = await gradeService.getGrades(filters);

        if (response.success && response.data) {
          setCourseGrades(response.data);
          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải danh sách điểm',
            {
              type: 'danger',
            },
          );
          return [];
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi tải danh sách điểm', {type: 'danger'});
        return [];
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Thêm điểm mới
  const addGrade = useCallback(
    async (gradeData: AddCourseGradeParams): Promise<CourseGrade | null> => {
      try {
        setLoading(true);

        const response: GradeResponse = await gradeService.addGrade(gradeData);

        if (response.success && response.data) {
          toast.show(response.message || 'Thêm điểm thành công', {
            type: 'success',
          });

          // Cập nhật danh sách điểm
          setCourseGrades(prev => [response.data!, ...prev]);

          return response.data;
        } else {
          toast.show(
            response.error || response.message || 'Không thể thêm điểm',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi thêm điểm', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Cập nhật điểm
  const updateGrade = useCallback(
    async (
      id: string,
      gradeData: UpdateCourseGradeParams,
    ): Promise<CourseGrade | null> => {
      try {
        setLoading(true);

        const response: GradeResponse = await gradeService.updateGrade(
          id,
          gradeData,
        );

        if (response.success && response.data) {
          toast.show(response.message || 'Cập nhật điểm thành công', {
            type: 'success',
          });

          // Cập nhật trong danh sách điểm
          setCourseGrades(prev =>
            prev.map(grade => (grade._id === id ? response.data! : grade)),
          );

          return response.data;
        } else {
          toast.show(
            response.error || response.message || 'Không thể cập nhật điểm',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi cập nhật điểm', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Xóa điểm
  const deleteGrade = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);

        const response: DeleteGradeResponse = await gradeService.deleteGrade(
          id,
        );

        if (response.success) {
          toast.show(response.message || 'Xóa điểm thành công', {
            type: 'success',
          });

          // Xóa khỏi danh sách điểm
          setCourseGrades(prev => prev.filter(grade => grade._id !== id));

          return true;
        } else {
          toast.show(
            response.error || response.message || 'Không thể xóa điểm',
            {
              type: 'danger',
            },
          );
          return false;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi xóa điểm', {type: 'danger'});
        return false;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Cập nhật trạng thái điểm
  const updateGradeStatus = useCallback(
    async (
      id: string,
      status: 'completed' | 'pending' | 'failed',
    ): Promise<CourseGrade | null> => {
      try {
        setLoading(true);

        const statusData: UpdateGradeStatusParams = {status};
        const response = await gradeService.updateGradeStatus(id, statusData);

        if (response.success && response.data) {
          toast.show(
            response.message || 'Cập nhật trạng thái điểm thành công',
            {type: 'success'},
          );

          // Cập nhật trong danh sách điểm
          setCourseGrades(prev =>
            prev.map(grade => (grade._id === id ? response.data! : grade)),
          );

          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể cập nhật trạng thái điểm',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi cập nhật trạng thái điểm', {
          type: 'danger',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  /**
   * QUẢN LÝ ĐIỂM THEO SINH VIÊN
   * =========================
   */

  // Lấy điểm của một sinh viên
  const getStudentGrades = useCallback(
    async (studentId: string): Promise<StudentGradeResponse> => {
      try {
        setLoading(true);

        const response: StudentGradeResponse =
          await gradeService.getStudentGrades(studentId);

        if (response.success && response.data) {
          setCourseGrades(response.data);

          // Cập nhật stats nếu có
          if (response.stats) {
            const stats: SemesterStats = {
              semesterId: 'current',
              semesterName: 'Học kỳ hiện tại',
              year: new Date().getFullYear().toString(),
              gpa: response.stats.gpa,
              totalCredits: response.stats.totalCredits,
              completedCredits: response.stats.totalCredits,
              failedCredits: 0,
              completedCourses: response.stats.completedCourses,
            };
            setSemesterStats(stats);
          }

          return response;
        } else {
          toast.show(
            response.error || response.message || 'Không thể tải điểm học sinh',
            {
              type: 'danger',
            },
          );
          return {
            success: false,
            timestamp: new Date().toISOString(),
            message: 'Không thể tải điểm học sinh',
            data: [],
            stats: {
              totalCredits: 0,
              gpa: 0,
              completedCourses: 0,
            },
          };
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi tải điểm sinh viên', {type: 'danger'});
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Đã xảy ra lỗi khi tải điểm sinh viên',
          data: [],
          stats: {
            totalCredits: 0,
            gpa: 0,
            completedCourses: 0,
          },
        };
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Lấy điểm của tôi
  const getMyGrades = useCallback(async (): Promise<StudentGradeResponse> => {
    try {
      setLoading(true);

      const response: StudentGradeResponse = await gradeService.getMyGrades();

      if (response.success && response.data) {
        setCourseGrades(response.data);

        if (response.stats) {
          const stats: SemesterStats = {
            semesterId: 'current',
            semesterName: 'Học kỳ hiện tại',
            year: new Date().getFullYear().toString(),
            gpa: response.stats.gpa,
            totalCredits: response.stats.totalCredits,
            completedCredits: response.stats.totalCredits,
            failedCredits: 0,
            completedCourses: response.stats.completedCourses,
          };
          setSemesterStats(stats);
        }

        return response;
      } else {
        toast.show(
          response.error || response.message || 'Không thể tải điểm của bạn',
          {
            type: 'danger',
          },
        );
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Không thể tải điểm của bạn',
          data: [],
          stats: {
            totalCredits: 0,
            gpa: 0,
            completedCourses: 0,
          },
        };
      }
    } catch (error: any) {
      toast.show('Đã xảy ra lỗi khi tải điểm của bạn', {type: 'danger'});
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Đã xảy ra lỗi khi tải điểm của bạn',
        data: [],
        stats: {
          totalCredits: 0,
          gpa: 0,
          completedCourses: 0,
        },
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy điểm học kỳ hiện tại
  const getCurrentSemesterGrades =
    useCallback(async (): Promise<StudentGradeResponse> => {
      try {
        setLoading(true);

        const response: StudentGradeResponse =
          await gradeService.getCurrentSemesterGrades();

        if (response.success && response.data) {
          setCourseGrades(response.data);

          if (response.stats) {
            const stats: SemesterStats = {
              semesterId: 'current',
              semesterName: 'Học kỳ hiện tại',
              year: new Date().getFullYear().toString(),
              gpa: response.stats.gpa,
              totalCredits: response.stats.totalCredits,
              completedCredits: response.stats.totalCredits,
              failedCredits: 0,
              completedCourses: response.stats.completedCourses,
            };
            setSemesterStats(stats);
          }

          return response;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải điểm học kỳ hiện tại',
            {
              type: 'danger',
            },
          );
          return {
            success: false,
            timestamp: new Date().toISOString(),
            message: 'Không thể tải điểm học kỳ hiện tại',
            data: [],
            stats: {
              totalCredits: 0,
              gpa: 0,
              completedCourses: 0,
            },
          };
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi tải điểm học kỳ hiện tại', {
          type: 'danger',
        });
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Đã xảy ra lỗi khi tải điểm học kỳ hiện tại',
          data: [],
          stats: {
            totalCredits: 0,
            gpa: 0,
            completedCourses: 0,
          },
        };
      } finally {
        setLoading(false);
      }
    }, [toast]);

  /**
   * QUẢN LÝ ĐIỂM THEO KHÓA HỌC
   * ========================
   */

  // Lấy điểm của một khóa học
  const getCourseGrades = useCallback(
    async (courseId: string) => {
      try {
        setLoading(true);

        const response: CourseGradesResponse =
          await gradeService.getCourseGrades(courseId);

        if (response.success && response.data) {
          setCourseGrades(response.data);
          return response;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể tải điểm của khóa học',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi tải điểm của khóa học', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  /**
   * QUẢN LÝ EXPORT/IMPORT ĐIỂM
   * =========================
   */

  // Xuất điểm ra Excel
  const exportGradesToExcel = useCallback(
    async (courseId: string): Promise<Blob | null> => {
      try {
        setLoading(true);

        const blob = await gradeService.exportGradesToExcel(courseId);
        toast.show('Xuất điểm thành công', {type: 'success'});
        return blob;
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi xuất điểm ra Excel', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Tải mẫu Excel
  const getImportTemplate = useCallback(
    async (courseId: string): Promise<Blob | null> => {
      try {
        setLoading(true);

        const blob = await gradeService.getImportTemplate(courseId);
        toast.show('Tải mẫu thành công', {type: 'success'});
        return blob;
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi tải mẫu Excel', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // Nhập điểm từ Excel
  const importGradesFromExcel = useCallback(
    async (formData: FormData) => {
      try {
        setLoading(true);

        const response: ImportGradesResponse =
          await gradeService.importGradesFromExcel(formData);

        if (response.success && response.data) {
          toast.show(response.message || 'Nhập điểm thành công', {
            type: 'success',
          });

          // Refresh grades after import
          await getMyGrades();

          return response.data;
        } else {
          toast.show(
            response.error ||
              response.message ||
              'Không thể nhập điểm từ Excel',
            {
              type: 'danger',
            },
          );
          return null;
        }
      } catch (error: any) {
        toast.show('Đã xảy ra lỗi khi nhập điểm từ Excel', {type: 'danger'});
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getMyGrades, toast],
  );

  /**
   * CÁC ENDPOINTS BỔ SUNG
   * ===================
   */

  // Lấy bảng điểm tổng hợp
  const getTranscript = useCallback(async () => {
    try {
      setLoading(true);

      const response: TranscriptResponse = await gradeService.getTranscript();

      if (response.success && response.data) {
        setCourseGrades(response.data);

        if (response.overview) {
          setOverview(response.overview);
        }

        return response;
      } else {
        toast.show(
          response.error || response.message || 'Không thể tải bảng điểm',
          {
            type: 'danger',
          },
        );
        return null;
      }
    } catch (error: any) {
      toast.show('Đã xảy ra lỗi khi tải bảng điểm', {type: 'danger'});
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy thống kê GPA
  const getGPAStats = useCallback(async () => {
    try {
      setLoading(true);

      const response: GPAStatsResponse = await gradeService.getGPAStats();

      if (response.success && response.data) {
        if (response.data.overview) {
          setOverview(response.data.overview);
        }

        return response.data;
      } else {
        toast.show(
          response.error || response.message || 'Không thể tải thống kê GPA',
          {
            type: 'danger',
          },
        );
        return null;
      }
    } catch (error: any) {
      toast.show('Đã xảy ra lỗi khi tải thống kê GPA', {type: 'danger'});
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Lấy danh sách học kỳ
  const getSemesters = useCallback(async () => {
    try {
      setLoading(true);

      const response = await gradeService.getSemesters();

      if (response.success && response.data) {
        return response.data;
      } else {
        toast.show(
          response.error ||
            response.message ||
            'Không thể tải danh sách học kỳ',
          {
            type: 'danger',
          },
        );
        return [];
      }
    } catch (error: any) {
      toast.show('Đã xảy ra lỗi khi tải danh sách học kỳ', {type: 'danger'});
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * UTILITY FUNCTIONS
   * ================
   */

  // Làm mới dữ liệu điểm
  const refreshGrades = useCallback(
    async (filters?: GradeFilterParams): Promise<CourseGrade[]> => {
      setRefreshing(true);
      try {
        return await getGrades(filters);
      } finally {
        setRefreshing(false);
      }
    },
    [getGrades],
  );

  // Cache và lấy cached data
  const cacheGradesData = useCallback(
    async (cacheKey: string, data: any): Promise<void> => {
      await gradeService.cacheGradesData(cacheKey, data);
    },
    [],
  );

  const getCachedGradesData = useCallback(
    async (cacheKey: string, maxAge?: number): Promise<any | null> => {
      return await gradeService.getCachedGradesData(cacheKey, maxAge);
    },
    [],
  );

  // Backwards compatibility methods (giữ tên cũ cho existing code)
  const addCourseGrade = useCallback(
    async (gradeData: AddCourseGradeParams) => {
      return await addGrade(gradeData);
    },
    [addGrade],
  );

  const deleteCourseGrade = useCallback(
    async (gradeId: string) => {
      return await deleteGrade(gradeId);
    },
    [deleteGrade],
  );

  return {
    // States
    loading,
    courseGrades,
    semesterStats,
    overview,
    refreshing,

    // QUẢN LÝ ĐIỂM CHUNG
    getGrades,
    addGrade,
    updateGrade,
    deleteGrade,
    updateGradeStatus,

    // QUẢN LÝ ĐIỂM THEO SINH VIÊN
    getStudentGrades,
    getMyGrades,
    getCurrentSemesterGrades,

    // QUẢN LÝ ĐIỂM THEO KHÓA HỌC
    getCourseGrades,

    // QUẢN LÝ EXPORT/IMPORT ĐIỂM
    exportGradesToExcel,
    getImportTemplate,
    importGradesFromExcel,

    // CÁC ENDPOINTS BỔ SUNG
    getTranscript,
    getGPAStats,
    getSemesters,

    // UTILITY FUNCTIONS
    refreshGrades,
    cacheGradesData,
    getCachedGradesData,

    // Backwards compatibility
    addCourseGrade,
    deleteCourseGrade,
  };
};

export default useGrade;
