import {useState, useCallback, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import AlertComponent from '../components/AlertCompunent';

import scheduleService from '../services/scheduleSevice';
import {
  ScheduleItem,
  GroupedSchedule,
  isValidScheduleItem,
} from '../types/scheduleType';
import {CourseFilterParams, Schedule} from '../types/courseType';

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<GroupedSchedule>({});
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // Lấy thông tin user từ AsyncStorage khi component mount
  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const userJson = await AsyncStorage.getItem('userInfo');
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
        }
      } catch (error) {
        handleError(error, 'Lỗi khi lấy thông tin user từ AsyncStorage');
      }
    };

    getUserFromStorage();
  }, [handleError]);

  // ✅ Group schedule items theo ngày
  const groupScheduleByDate = useCallback(
    (items: ScheduleItem[]): GroupedSchedule => {
      if (!Array.isArray(items)) {
        return {};
      }

      return items.reduce((acc: GroupedSchedule, item) => {
        // ✅ VALIDATION: Kiểm tra item hợp lệ
        if (!isValidScheduleItem(item)) {
          return acc;
        }

        const dateStr = item.date;
        if (!dateStr) {
          return acc;
        }

        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(item);
        return acc;
      }, {});
    },
    [],
  );

  /**
   * CORE SCHEDULE FUNCTIONS
   * =====================
   */

  // ✅ SỬA: Lấy lịch học theo ngày - sử dụng backend format mới
  const getScheduleByDate = useCallback(
    async (date: string): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Gọi service với backend format mới
        const response = await scheduleService.getScheduleByDate(date);

        if (response.success && response.data && response.data.schedules) {
          // ✅ Schedules đã được convert trong service, không cần convert thêm
          const scheduleItems = response.data.schedules;

          // Validate schedules
          const validSchedules = scheduleItems.filter(isValidScheduleItem);
          if (validSchedules.length !== scheduleItems.length) {
          }

          const grouped = groupScheduleByDate(validSchedules);

          setScheduleItems(current => ({...current, ...grouped}));
          return grouped;
        } else {
          const errorMsg =
            response.error || response.message || 'Không thể tải lịch học';

          showAlert('info', 'Không có lịch học cho ngày này');
          return {};
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải lịch học');
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  // ✅ SỬA: Lấy lịch học theo tháng - sử dụng backend format mới
  const getScheduleByMonth = useCallback(
    async (year: number, month: number): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getScheduleByMonth(year, month);

        if (response.success && response.data && response.data.schedules) {
          // ✅ Schedules đã được convert trong service
          const scheduleItems = response.data.schedules;
          const validSchedules = scheduleItems.filter(isValidScheduleItem);
          const grouped = groupScheduleByDate(validSchedules);

          setScheduleItems(current => ({...current, ...grouped}));
          return grouped;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể tải lịch học theo tháng';
          showAlert('error', errorMsg);
          return {};
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải lịch học theo tháng');
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  // ✅ SỬA: Các function khác tương tự
  const getScheduleByRange = useCallback(
    async (startDate: string, endDate: string): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getScheduleByRange(
          startDate,
          endDate,
        );

        if (response.success && response.data && response.data.schedules) {
          const scheduleItems = response.data.schedules;
          const validSchedules = scheduleItems.filter(isValidScheduleItem);
          const grouped = groupScheduleByDate(validSchedules);

          setScheduleItems(grouped);
          return grouped;
        } else {
          const errorMsg =
            response.error || response.message || 'Không thể tải lịch học';
          showAlert('error', errorMsg);
          return {};
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải lịch học');
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  const getScheduleBySemester = useCallback(
    async (semesterId: string): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getScheduleBySemester(
          semesterId,
        );

        if (response.success && response.data && response.data.schedules) {
          const scheduleItems = response.data.schedules;
          const validSchedules = scheduleItems.filter(isValidScheduleItem);
          const grouped = groupScheduleByDate(validSchedules);

          setScheduleItems(grouped);
          return grouped;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể tải lịch học học kỳ';
          showAlert('error', errorMsg);
          return {};
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải lịch học học kỳ');
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  const getScheduleByCourse = useCallback(
    async (courseId: string): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getScheduleByCourse(courseId);

        if (response.success && response.data && response.data.schedules) {
          const scheduleItems = response.data.schedules;
          const validSchedules = scheduleItems.filter(isValidScheduleItem);
          const grouped = groupScheduleByDate(validSchedules);

          setScheduleItems(grouped);
          return grouped;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể tải lịch học khóa học';
          showAlert('error', errorMsg);
          return {};
        }
        // eslint-disable-next-line no-catch-shadow
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải lịch học khóa học');
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  // ✅ REST: Các function khác giữ nguyên
  const updateCourseSchedule = useCallback(
    async (courseId: string, scheduleData: Schedule[]): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const validationErrors =
          scheduleService.validateScheduleData(scheduleData);
        if (validationErrors.length > 0) {
          showAlert('error', validationErrors.join(', '));
          return false;
        }

        const response = await scheduleService.updateCourseSchedule(
          courseId,
          scheduleData,
        );

        if (response.success) {
          showAlert(
            'success',
            response.message || 'Cập nhật lịch học khóa học thành công',
          );

          const currentDates = Object.keys(scheduleItems);
          for (const date of currentDates) {
            await getScheduleByDate(date);
          }

          return true;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể cập nhật lịch học khóa học';
          showAlert('error', errorMsg);
          return false;
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi cập nhật lịch học khóa học');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getScheduleByDate, scheduleItems, handleError, showAlert],
  );

  const getUserCourses = useCallback(
    async (filterParams?: CourseFilterParams) => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getUserCourses(filterParams);

        if (response.success && response.data) {
          const courses = response.data.courses || [];

          return courses;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể tải danh sách khóa học';
          showAlert('error', errorMsg);
          return [];
        }
      } catch (error: any) {
        handleError(error, 'Đã xảy ra lỗi khi tải danh sách khóa học');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [handleError, showAlert],
  );

  const getScheduleFromCourses = useCallback(
    async (filterParams?: CourseFilterParams): Promise<GroupedSchedule> => {
      try {
        setLoading(true);
        setError(null);

        const response = await scheduleService.getUserCourses(filterParams);

        if (response.success && response.data) {
          const courses = response.data.courses || [];

          const scheduleItems =
            scheduleService.createScheduleFromCourseResponse(response);
          const validSchedules = scheduleItems.filter(item =>
            isValidScheduleItem(scheduleService.convertToScheduleItem(item)),
          );

          const convertedItems =
            scheduleService.convertToScheduleItems(validSchedules);
          const grouped = groupScheduleByDate(convertedItems);

          setScheduleItems(current => ({...current, ...grouped}));
          return grouped;
        } else {
          const errorMsg =
            response.error ||
            response.message ||
            'Không thể tải lịch học từ khóa học';
          showAlert('error', errorMsg);
          return {};
        }
      } catch (error: any) {
        handleError(
          error,
          'Đã xảy ra lỗi khi chuyển đổi khóa học thành lịch học',
        );
        return {};
      } finally {
        setLoading(false);
      }
    },
    [groupScheduleByDate, handleError, showAlert],
  );

  // ✅ REST: Utility functions giữ nguyên
  const validateScheduleData = useCallback(
    (scheduleData: Schedule[]): string[] => {
      return scheduleService.validateScheduleData(scheduleData);
    },
    [],
  );

  const isValidTimeFormat = useCallback((time: string): boolean => {
    return scheduleService.isValidTimeFormat(time);
  }, []);

  const formatTime = useCallback((time: string): string => {
    return scheduleService.formatTime(time);
  }, []);

  const convertTimeFormat = useCallback((time12h: string): string => {
    return scheduleService.convert12To24Format(time12h);
  }, []);

  const convertTo12HourFormat = useCallback((time24h: string): string => {
    return scheduleService.convert24To12Format(time24h);
  }, []);

  const formatDate = useCallback((date: string | Date): string => {
    return scheduleService.formatDate(date);
  }, []);

  const formatDateTime = useCallback((dateTime: string | Date): string => {
    return scheduleService.formatDateTime(dateTime);
  }, []);

  const getDayNameInVietnamese = useCallback((dayOfWeek: string): string => {
    return scheduleService.getDayNameInVietnamese(dayOfWeek);
  }, []);

  const getStatusInVietnamese = useCallback((status: string): string => {
    return scheduleService.getStatusInVietnamese(status);
  }, []);

  const clearScheduleData = useCallback(() => {
    ('🧹 [useSchedule] Clearing schedule data');
    setScheduleItems({});
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const removeScheduleFromState = useCallback(
    (scheduleId: string, date: string) => {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');

      setScheduleItems(currentItems => {
        const newItems = {...currentItems};

        if (newItems[formattedDate]) {
          newItems[formattedDate] = newItems[formattedDate].filter(
            item => item._id !== scheduleId,
          );

          if (newItems[formattedDate].length === 0) {
            delete newItems[formattedDate];
          }
        }

        return newItems;
      });
    },
    [],
  );

  const getScheduleStatistics = useCallback(() => {
    const allSchedules = Object.values(scheduleItems).flat();
    const uniqueCourses = new Set(allSchedules.map(item => item.courseId));
    const totalClasses = allSchedules.length;
    const coursesCount = uniqueCourses.size;

    return {
      totalClasses,
      coursesCount,
      daysWithSchedule: Object.keys(scheduleItems).length,
      averageClassesPerDay:
        Object.keys(scheduleItems).length > 0
          ? totalClasses / Object.keys(scheduleItems).length
          : 0,
    };
  }, [scheduleItems]);

  const searchSchedule = useCallback(
    (searchTerm: string): ScheduleItem[] => {
      const allSchedules = Object.values(scheduleItems).flat();
      const lowercaseSearch = searchTerm.toLowerCase();

      return allSchedules.filter(
        item =>
          item.courseName.toLowerCase().includes(lowercaseSearch) ||
          item.courseCode.toLowerCase().includes(lowercaseSearch) ||
          (item.instructorName &&
            item.instructorName.toLowerCase().includes(lowercaseSearch)) ||
          (item.location &&
            item.location.toLowerCase().includes(lowercaseSearch)) ||
          (item.room && item.room.toLowerCase().includes(lowercaseSearch)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowercaseSearch)),
      );
    },
    [scheduleItems],
  );

  const getNextSchedule = useCallback(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const sortedDates = Object.keys(scheduleItems)
      .sort()
      .filter(date => date >= todayStr);

    if (sortedDates.length === 0) return null;

    const todaySchedules = scheduleItems[todayStr];
    if (todaySchedules && todaySchedules.length > 0) {
      const currentTime = format(today, 'HH:mm');
      const upcomingToday = todaySchedules
        .filter(item => item.startTime > currentTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (upcomingToday.length > 0) {
        return {
          date: todayStr,
          schedules: upcomingToday,
          isToday: true,
        };
      }
    }

    const nextDate = sortedDates.find(date => date > todayStr);
    if (nextDate) {
      const nextSchedules = scheduleItems[nextDate] || [];
      return {
        date: nextDate,
        schedules: nextSchedules.sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ),
        isToday: false,
      };
    }

    return null;
  }, [scheduleItems]);

  const getTodaySchedule = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todaySchedules = scheduleItems[today] || [];

    return {
      date: today,
      schedules: todaySchedules.sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
      hasSchedule: todaySchedules.length > 0,
    };
  }, [scheduleItems]);

  const getWeekSchedule = useCallback(() => {
    const today = new Date();
    const weekDates = [];

    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(diff + i);
      weekDates.push(format(date, 'yyyy-MM-dd'));
    }

    const weekSchedule = weekDates.map(date => ({
      date,
      schedules: scheduleItems[date] || [],
      dayName: getDayNameInVietnamese(format(new Date(date), 'EEEE')),
    }));

    return {
      weekDates,
      weekSchedule,
      totalClasses: weekSchedule.reduce(
        (sum, day) => sum + day.schedules.length,
        0,
      ),
    };
  }, [scheduleItems, getDayNameInVietnamese]);

  const refreshData = useCallback(async (): Promise<void> => {
    ('🔄 [useSchedule] Refreshing data');
    setRefreshing(true);
    try {
      const currentDates = Object.keys(scheduleItems);
      if (currentDates.length > 0) {
        for (const date of currentDates) {
          await getScheduleByDate(date);
        }
      } else {
        const today = format(new Date(), 'yyyy-MM-dd');
        await getScheduleByDate(today);
      }
    } finally {
      setRefreshing(false);
    }
  }, [getScheduleByDate, scheduleItems]);

  useEffect(() => {
    if (user && user._id) {
      const today = format(new Date(), 'yyyy-MM-dd');
      getScheduleByDate(today);
    }
  }, [user, getScheduleByDate]);

  const renderAlert = () =>
    alert.visible ? (
      <AlertComponent
        type={alert.type}
        message={alert.message}
        duration={3000}
      />
    ) : null;

  return {
    loading,
    error,
    scheduleItems,
    user,
    refreshing,

    getScheduleByDate,
    getScheduleByRange,
    getScheduleBySemester,
    getScheduleByCourse,
    getScheduleByMonth,
    getUserCourses,
    getScheduleFromCourses,

    updateCourseSchedule,

    validateScheduleData,
    isValidTimeFormat,

    formatTime,
    convertTimeFormat,
    convertTo12HourFormat,
    formatDate,
    formatDateTime,
    getDayNameInVietnamese,
    getStatusInVietnamese,
    clearScheduleData,
    clearError,
    removeScheduleFromState,

    getScheduleStatistics,
    searchSchedule,
    getNextSchedule,
    getTodaySchedule,
    getWeekSchedule,
    refreshData,

    renderAlert,
  };
};

export default useSchedule;
