import React, {useState, useCallback, useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';

import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import LocationStatus from './components/LocationStatus';
import InfoCard from './components/InfoCard';
import StudentSessionCard from './components/StudentSessionCard';
import TeacherSessionCard from './components/TeacherSessionCard';
import CreateSessionModal from './components/CreateSessionModal';
import CustomAlert from '../../components/CustomAlert';

import {useAttendance} from '../../hooks/useAttendance';
import useCourse from '../../hooks/useCourse';
import {
  AttendanceSession,
  AttendanceStatusType,
  CreateSessionRequest,
} from '../../types/attendanceType';

const Attendance = ({navigation, route}: any) => {
  // ===========================
  // PARAMS & USER INFO
  // ===========================
  const courseParams = route?.params;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const isTeacher = useMemo(() => userRole === 'teacher', [userRole]);
  const isStudent = useMemo(() => userRole === 'student', [userRole]);
  const hasCourseDetail = useMemo(
    () => !!courseParams?.courseId,
    [courseParams?.courseId],
  );

  const fromCourseDetail = useMemo(
    () => !!courseParams?.fromCourseDetail,
    [courseParams?.fromCourseDetail],
  );

  // ===========================
  // CUSTOM ALERT STATES
  // ===========================
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'warning' | 'error' | 'info' | 'question',
    title: '',
    message: '',
    buttons: [{text: 'OK', onPress: () => {}}],
  });

  // ===========================
  // HOOKS
  // ===========================
  const {
    currentLocation,
    error,
    loading: attendanceLoading,
    locationPermissionGranted,
    attendanceDistance,
    refreshing: hookRefreshing,
    classLocations,

    getCurrentLocation,
    requestLocationPermission,
    getSessionsByCourse,
    checkInWithLocation,
    updateSessionStatus,
    submitManualAttendance,
    createAttendanceSession,

    isWithinClassLocation,
    calculateDistanceToClass,
    refreshData,

    getTodayDateISO,
    generateSessionTitle,
    formatTime,
    formatDate,
    getAttendanceStatusLabel: getStatusLabel,
  } = useAttendance();

  const {courses, loading: coursesLoading} = useCourse();

  // ===========================
  // LOCAL STATES
  // ===========================
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [attendingCourseId, setAttendingCourseId] = useState<string | null>(
    null,
  );
  const [todaySessions, setTodaySessions] = useState<AttendanceSession[]>([]);
  const [attendedSessions, setAttendedSessions] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<{
    [key: string]: AttendanceStatusType;
  }>({});

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSessionData, setCreateSessionData] = useState<
    Partial<CreateSessionRequest>
  >({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    classroom: '',
    schoolLocationId: '',
  });

  // ===========================
  // REFS
  // ===========================
  const dataLoadedRef = useRef(false);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ===========================
  // MEMOIZED VALUES
  // ===========================
  const activeCourses = useMemo(() => {
    return courses.filter(course => course.status === 'ongoing');
  }, [courses]);

  const todayFormatted = useMemo(() => {
    return format(new Date(), 'EEEE, dd/MM/yyyy', {locale: vi});
  }, []);

  // ===========================
  // ALERT HELPER FUNCTIONS
  // ===========================
  const showAlert = useCallback(
    (config: {
      type: 'success' | 'warning' | 'error' | 'info' | 'question';
      title: string;
      message: string;
      buttons?: Array<{
        text: string;
        style?: 'default' | 'cancel' | 'destructive' | 'primary';
        onPress?: () => void;
      }>;
    }) => {
      setAlertConfig({
        visible: true,
        ...config,
        buttons: config.buttons || [{text: 'OK', onPress: () => hideAlert()}],
      });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({...prev, visible: false}));
  }, []);

  // ===========================
  // USER AUTHENTICATION
  // ===========================
  useEffect(() => {
    let isMounted = true;

    const getUserFromStorage = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');

        if (userInfoString && isMounted) {
          const response = JSON.parse(userInfoString);
          let userData;

          if (response.success && response.data) {
            userData = response.data.user || response.data;
          } else if (response.user) {
            userData = response.user;
          } else {
            userData = response;
          }

          setUserRole(userData.role);
          setUserId(userData._id || userData.id);
        } else if (isMounted) {
          navigation.navigate('Main');
        }
      } catch (error) {
        if (isMounted) {
          showAlert({
            type: 'error',
            title: 'Lỗi',
            message:
              'Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.',
            buttons: [
              {
                text: 'OK',
                onPress: () => {
                  hideAlert();
                  navigation.navigate('Main');
                },
              },
            ],
          });
        }
      }
    };

    getUserFromStorage();

    return () => {
      isMounted = false;
    };
  }, [navigation, showAlert, hideAlert]);

  // ===========================
  // UPDATE SESSION DATA WHEN HOOK IS READY
  // ===========================
  useEffect(() => {
    if (getTodayDateISO) {
      setCreateSessionData(prev => ({
        ...prev,
        date: getTodayDateISO(),
      }));
    }
  }, [getTodayDateISO]);

  // ===========================
  // DATA LOADING
  // ===========================
  const loadTodaySessions = useCallback(async () => {
    if (!userRole || !userId) {
      return;
    }

    try {
      setLoading(true);

      let sessions: AttendanceSession[] = [];

      if (hasCourseDetail && courseParams?.courseId) {
        sessions = await getSessionsByCourse(courseParams.courseId);
      } else {
        sessions = await refreshData();
      }

      setTodaySessions(sessions || []);
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách phiên điểm danh',
      });
      setTodaySessions([]);
    } finally {
      setLoading(false);
    }
  }, [
    userRole,
    userId,
    hasCourseDetail,
    courseParams,
    getSessionsByCourse,
    refreshData,
    showAlert,
  ]);

  // ===========================
  // LOCATION PERMISSION
  // ===========================
  const handleRequestPermission = useCallback(async () => {
    if (!isStudent) return false;

    try {
      const result = await requestLocationPermission();
      if (result) {
        await getCurrentLocation();
      }
      return result;
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể yêu cầu quyền truy cập vị trí',
      });
      return false;
    }
  }, [isStudent, requestLocationPermission, getCurrentLocation, showAlert]);

  // ===========================
  // FOCUS EFFECT
  // ===========================
  useFocusEffect(
    useCallback(() => {
      if (userRole && userId) {
        loadTodaySessions();

        if (isStudent) {
          handleRequestPermission();
        }
      }

      return () => {
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
          locationIntervalRef.current = null;
        }
      };
    }, [
      userRole,
      userId,
      isStudent,
      loadTodaySessions,
      handleRequestPermission,
    ]),
  );

  // ===========================
  // HANDLER FUNCTIONS
  // ===========================
  const handleCreateSessionForCourse = useCallback(async () => {
    const {courseId, courseName, startTime, endTime, room, classroom} =
      courseParams || {};

    if (!courseId) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo phiên điểm danh. Thiếu thông tin khóa học.',
      });
      return;
    }

    if (!userId) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể xác định người dùng. Vui lòng đăng nhập lại.',
      });
      return;
    }

    if (userRole !== 'teacher') {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Chỉ giảng viên mới có thể tạo phiên điểm danh.',
      });
      return;
    }

    let effectiveLocations = classLocations;

    if (!effectiveLocations || effectiveLocations.length === 0) {
      const defaultLocation = {
        _id: '684912130dfcf9b75366d2a4',
        name: 'Học viện Kỹ thuật Mật mã - Cơ sở 2',
        location: {
          type: 'Point',
          coordinates: [105.796, 20.981],
        },
        radius: 400,
        address: '141 Chiến Thắng, Phường Tân Triều, Quận Thanh Trì, Hà Nội',
        description:
          'Học viện Kỹ thuật Mật mã - Cơ sở đào tạo chính về an toàn thông tin và mật mã học',
        contactInfo: {
          phone: '024-38585194',
          email: 'info@actvn.edu.vn',
          website: 'https://actvn.edu.vn',
        },
        is_active: true,
        created_at: new Date('2025-06-11T05:20:19.245Z').toISOString(),
        updated_at: new Date('2025-06-11T05:20:19.245Z').toISOString(),
      };

      effectiveLocations = [defaultLocation];
    }

    try {
      const selectedLocation = effectiveLocations[0];

      const sessionData = {
        courseId: courseId,
        title:
          generateSessionTitle?.(courseName) ||
          `Điểm danh ${courseName} - ${new Date().toLocaleDateString('vi-VN')}`,
        date: getTodayDateISO?.() || new Date().toISOString().split('T')[0],
        startTime: startTime || '08:00',
        endTime: endTime || '10:00',
        schoolLocationId: selectedLocation._id,
        classroom: room || classroom || '',
        description: `Phiên điểm danh cho lớp ${courseName}`,
        allowLateCheckIn: true,
        maxDistance: selectedLocation.radius || 400,
        autoClose: false,
        isActive: true,
      };

      setLoading(true);

      await createAttendanceSession(sessionData);
      await loadTodaySessions();

      showAlert({
        type: 'success',
        title: '🎉 Tạo phiên điểm danh thành công!',
        message:
          `Đã tạo phiên điểm danh cho lớp "${courseName}"\n\n` +
          `📅 Ngày: ${sessionData.date}\n` +
          `⏰ Thời gian: ${sessionData.startTime} - ${sessionData.endTime}\n` +
          `📍 Địa điểm: ${selectedLocation.name}\n` +
          `🏫 Phòng: ${sessionData.classroom || 'Chưa xác định'}\n` +
          `📏 Bán kính điểm danh: ${selectedLocation.radius}m`,
      });
    } catch (error) {
      let errorMessage = 'Không thể tạo phiên điểm danh. Vui lòng thử lại.';

      if (error?.message) {
        errorMessage = error.message;
      }

      showAlert({
        type: 'error',
        title: 'Lỗi tạo phiên điểm danh',
        message: errorMessage,
        buttons: [
          {
            text: 'Thử lại',
            style: 'primary',
            onPress: () => {
              hideAlert();
              handleCreateSessionForCourse();
            },
          },
          {
            text: 'Đóng',
            style: 'cancel',
            onPress: hideAlert,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [
    courseParams,
    userId,
    userRole,
    classLocations,
    generateSessionTitle,
    getTodayDateISO,
    createAttendanceSession,
    loadTodaySessions,
    showAlert,
    hideAlert,
  ]);

  const handleStudentAttendance = useCallback(
    async (sessionId: string) => {
      if (!currentLocation) {
        showAlert({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể xác định vị trí của bạn. Vui lòng thử lại.',
          buttons: [
            {
              text: 'Thử lại',
              style: 'primary',
              onPress: () => {
                hideAlert();
                getCurrentLocation();
              },
            },
          ],
        });
        return;
      }

      try {
        setAttendingCourseId(sessionId);
        const success = await checkInWithLocation(sessionId);

        if (success) {
          setAttendedSessions(prev => [...prev, sessionId]);
          setAttendanceSuccess(true);
          setTimeout(() => setAttendanceSuccess(false), 3000);

          showAlert({
            type: 'success',
            title: '🎉 Điểm danh thành công!',
            message: 'Thông tin điểm danh của bạn đã được ghi nhận.',
          });
        }
      } catch (err: any) {
        showAlert({
          type: 'error',
          title: 'Lỗi',
          message: err.message || 'Có lỗi xảy ra khi điểm danh',
        });
      } finally {
        setAttendingCourseId(null);
      }
    },
    [
      currentLocation,
      checkInWithLocation,
      getCurrentLocation,
      showAlert,
      hideAlert,
    ],
  );

  const handleViewDetails = useCallback(
    (sessionId: string, courseName: string) => {
      navigation.navigate('AttendanceStack', {
        screen: 'AttendanceDetail',
        params: {
          sessionId: sessionId,
          courseName: courseName,
        },
      });
    },
    [navigation],
  );

  const toggleSessionStatus = useCallback(
    async (sessionId: string, currentStatus: boolean) => {
      try {
        setLoading(true);
        await updateSessionStatus(sessionId, !currentStatus);
        await loadTodaySessions();
      } catch (error) {
        showAlert({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể cập nhật trạng thái phiên điểm danh',
        });
      } finally {
        setLoading(false);
      }
    },
    [updateSessionStatus, loadTodaySessions, showAlert],
  );

  const handleStudentStatusChange = useCallback(
    (studentId: string, status: AttendanceStatusType) => {
      setSelectedStudents(prev => ({
        ...prev,
        [studentId]: status,
      }));
    },
    [],
  );

  const handleManualAttendance = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        await submitManualAttendance(sessionId, selectedStudents);
        setSelectedStudents({});
        await loadTodaySessions();
        showAlert({
          type: 'success',
          title: 'Thành công',
          message: 'Đã cập nhật điểm danh thủ công',
        });
      } catch (error) {
        showAlert({
          type: 'error',
          title: 'Lỗi',
          message: 'Không thể cập nhật điểm danh thủ công',
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedStudents, submitManualAttendance, loadTodaySessions, showAlert],
  );

  const handleCreateSession = useCallback(async () => {
    if (
      !createSessionData.courseId ||
      !createSessionData.title ||
      !createSessionData.startTime ||
      !createSessionData.endTime ||
      !createSessionData.schoolLocationId
    ) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
      });
      return;
    }

    try {
      setLoading(true);
      await createAttendanceSession(createSessionData as CreateSessionRequest);
      setShowCreateModal(false);
      setCreateSessionData({
        title: '',
        date: getTodayDateISO?.() || new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        classroom: '',
        schoolLocationId: '',
      });
      await loadTodaySessions();
      showAlert({
        type: 'success',
        title: 'Thành công',
        message: 'Đã tạo phiên điểm danh mới',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo phiên điểm danh mới',
      });
    } finally {
      setLoading(false);
    }
  }, [
    createSessionData,
    createAttendanceSession,
    loadTodaySessions,
    getTodayDateISO,
    showAlert,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTodaySessions();
      if (isStudent) {
        await getCurrentLocation();
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setRefreshing(false);
    }
  }, [loadTodaySessions, isStudent, getCurrentLocation]);

  // ===========================
  // RENDER FUNCTIONS
  // ===========================
  const renderTodaySessions = useCallback(() => {
    if (!userRole || !userId) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang xác thực người dùng...</Text>
        </View>
      );
    }

    if (loading || (coursesLoading && courses.length === 0)) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách lớp học...</Text>
        </View>
      );
    }

    if (isStudent && attendanceLoading && !currentLocation) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang xác định vị trí...</Text>
        </View>
      );
    }

    return (
      <View>
        {isTeacher && fromCourseDetail && todaySessions.length > 0 && (
          <TouchableOpacity
            style={styles.createNewSessionButton}
            onPress={handleCreateSessionForCourse}>
            <Text style={styles.createNewSessionIcon}>➕</Text>
            <Text style={styles.createNewSessionText}>
              Tạo phiên điểm danh mới cho lớp này
            </Text>
          </TouchableOpacity>
        )}

        {(!todaySessions || todaySessions.length === 0) && (
          <View style={styles.noClassContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.noClassText}>
              {fromCourseDetail && isTeacher
                ? `Chưa có phiên điểm danh cho lớp ${courseParams?.courseName}`
                : 'Hôm nay không có lớp học nào'}
            </Text>
            <Text style={styles.noClassSubText}>
              {fromCourseDetail && isTeacher
                ? 'Bạn có thể tạo phiên điểm danh mới cho lớp học này'
                : isTeacher
                ? 'Bạn có thể tạo phiên điểm danh mới'
                : 'Bạn có thể quay lại vào ngày học tiếp theo'}
            </Text>

            {isTeacher && fromCourseDetail && (
              <TouchableOpacity
                style={styles.createSessionButton}
                onPress={handleCreateSessionForCourse}>
                <Text style={styles.createSessionButtonText}>
                  📝 Tạo điểm danh cho lớp này
                </Text>
              </TouchableOpacity>
            )}

            {isTeacher && !fromCourseDetail && (
              <TouchableOpacity
                style={styles.createSessionButton}
                onPress={() => setShowCreateModal(true)}>
                <Text style={styles.createSessionButtonText}>
                  ➕ Tạo phiên điểm danh
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {todaySessions &&
          todaySessions.length > 0 &&
          todaySessions.map(session =>
            isTeacher ? (
              <TeacherSessionCard
                key={session._id}
                session={session}
                courseParams={courseParams}
                selectedStudents={selectedStudents}
                formatTime={formatTime}
                getStatusLabel={getStatusLabel}
                onToggleSessionStatus={toggleSessionStatus}
                onStudentStatusChange={handleStudentStatusChange}
                onManualAttendance={handleManualAttendance}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <StudentSessionCard
                key={session._id}
                session={session}
                currentLocation={currentLocation}
                attendingCourseId={attendingCourseId}
                attendedSessions={attendedSessions}
                attendanceSuccess={attendanceSuccess}
                calculateDistanceToClass={calculateDistanceToClass}
                isWithinClassLocation={isWithinClassLocation}
                formatTime={formatTime}
                onAttendance={handleStudentAttendance}
              />
            ),
          )}
      </View>
    );
  }, [
    loading,
    coursesLoading,
    attendanceLoading,
    todaySessions,
    isTeacher,
    isStudent,
    courses.length,
    currentLocation,
    courseParams,
    selectedStudents,
    formatTime,
    getStatusLabel,
    toggleSessionStatus,
    handleStudentStatusChange,
    handleManualAttendance,
    handleViewDetails,
    attendingCourseId,
    attendedSessions,
    attendanceSuccess,
    calculateDistanceToClass,
    isWithinClassLocation,
    handleStudentAttendance,
    userRole,
    userId,
    fromCourseDetail,
    handleCreateSessionForCourse,
  ]);

  // ===========================
  // RENDER MAIN COMPONENT
  // ===========================
  if (!userRole || !userId) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={styles.loadingText}>Đang xác thực người dùng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent
        title={
          hasCourseDetail
            ? courseParams?.courseName || 'Điểm danh'
            : 'Điểm danh'
        }
        navigation={navigation}
        leftIcons={[
          {
            name: hasCourseDetail ? 'arrow-back' : 'menu',
            onPress: hasCourseDetail
              ? () => navigation.goBack()
              : () => navigation.openDrawer(),
          },
        ]}
        rightIcons={
          isTeacher
            ? fromCourseDetail
              ? [
                  {
                    name: 'add',
                    onPress: handleCreateSessionForCourse,
                  },
                ]
              : [
                  {
                    name: 'add',
                    onPress: () => setShowCreateModal(true),
                  },
                ]
            : []
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || hookRefreshing}
            onRefresh={onRefresh}
          />
        }>
        <LinearGradient
          colors={[appColors.primary, '#1A73E8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {isTeacher
              ? fromCourseDetail
                ? `Quản lý điểm danh - ${courseParams?.courseName}`
                : 'Quản lý điểm danh'
              : 'Điểm danh hôm nay'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {hasCourseDetail
              ? formatDate && courseParams?.date
                ? formatDate(courseParams.date)
                : todayFormatted
              : todayFormatted}
          </Text>

          {fromCourseDetail && courseParams && (
            <View style={styles.courseInfo}>
              <Text style={styles.courseInfoText}>
                📚 Mã lớp: {courseParams.courseCode || 'N/A'}
              </Text>
              <Text style={styles.courseInfoText}>
                👨‍🏫 GV: {courseParams.instructor || 'N/A'}
              </Text>
              <Text style={styles.courseInfoText}>
                ⏰ {courseParams.startTime} - {courseParams.endTime}
              </Text>
            </View>
          )}

          {isStudent && (
            <LocationStatus
              error={error}
              locationPermissionGranted={locationPermissionGranted}
              currentLocation={currentLocation}
              attendanceDistance={attendanceDistance}
              onRequestPermission={handleRequestPermission}
            />
          )}
        </LinearGradient>

        {isStudent && !hasCourseDetail && (
          <InfoCard
            title="Hướng dẫn"
            subtitle="Để điểm danh, bạn cần:"
            instructions={[
              {
                icon: '📍',
                text: 'Ở trong khu vực trường học (tối đa 400m)',
              },
              {
                icon: '⏰',
                text: 'Lớp học phải đang mở điểm danh',
              },
              {
                icon: '🔄',
                text: 'Cập nhật vị trí hiện tại bằng cách kéo xuống',
              },
            ]}
          />
        )}

        {isTeacher && !hasCourseDetail && (
          <InfoCard
            title="Chức năng giảng viên"
            instructions={[
              {
                icon: '➕',
                text: 'Tạo phiên điểm danh mới cho lớp học',
              },
              {
                icon: '🔘',
                text: 'Mở/đóng điểm danh cho từng buổi học',
              },
              {
                icon: '✏️',
                text: 'Điểm danh thủ công cho sinh viên',
              },
              {
                icon: '📊',
                text: 'Xem báo cáo điểm danh chi tiết',
              },
            ]}
          />
        )}

        <View style={styles.classesSection}>
          <Text style={styles.sectionTitle}>
            {isTeacher
              ? fromCourseDetail
                ? `Phiên điểm danh - ${courseParams?.courseName}`
                : hasCourseDetail
                ? 'Quản lý điểm danh lớp học'
                : 'Lớp học giảng dạy hôm nay'
              : 'Lớp học hôm nay'}
          </Text>
          {renderTodaySessions()}

          {hasCourseDetail && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>
                Quay lại chi tiết lớp học
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {!fromCourseDetail && (
        <CreateSessionModal
          visible={showCreateModal}
          sessionData={createSessionData}
          activeCourses={activeCourses}
          classLocations={classLocations || []}
          generateSessionTitle={generateSessionTitle}
          onClose={() => setShowCreateModal(false)}
          onUpdateData={setCreateSessionData}
          onCreate={handleCreateSession}
        />
      )}

      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onBackdropPress={hideAlert}
      />

      {loading && (
        <View style={styles.setLoading}>
          <ActivityIndicator size="large" color={appColors.white} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: appColors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  courseInfo: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  courseInfoText: {
    fontSize: 14,
    color: appColors.white,
    marginVertical: 2,
  },
  classesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
  },
  noClassContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: appColors.white,
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noClassText: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  noClassSubText: {
    fontSize: 14,
    color: appColors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createSessionButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createSessionButtonText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  createNewSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: appColors.primary,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createNewSessionIcon: {
    fontSize: 20,
    color: appColors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  createNewSessionText: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  addMoreSessionButton: {
    marginTop: 16,
    backgroundColor: appColors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: appColors.primary,
    borderStyle: 'dashed',
  },
  addMoreSessionText: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
    padding: 16,
    backgroundColor: appColors.white,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    color: appColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  setLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
  },
});

export default Attendance;
