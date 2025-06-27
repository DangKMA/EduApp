import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import {appColors} from '../../constants/appColors';
import {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../../types/navigation';
import {StackNavigationProp} from '@react-navigation/stack';
import HeaderComponent from '../../components/HeaderCompunent';
import IconFeather from 'react-native-vector-icons/Feather';
import {Course, ScheduleItem} from '../../types/courseType';
import useCourse from '../../hooks/useCourse';
import {User} from '../../types/userType';
import {courseService} from '../../services/courseService';

interface CourseDetailProps {
  route: RouteProp<RootStackParamList, 'CourseDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'CourseDetail'>;
}

const extractCourseId = (
  scheduleItem: ScheduleItem | null,
  passedItem: any,
): string | null => {
  if (scheduleItem?.courseId) {
    return scheduleItem.courseId;
  }
  if (passedItem?._id) {
    return passedItem._id;
  }
  if (passedItem?.id) {
    return passedItem.id;
  }
  return null;
};

// ✅ Helper function để convert dayOfWeek sang tiếng Việt
const getDayNameInVietnamese = (
  dayOfWeek: number | string | undefined,
): string => {
  if (dayOfWeek === undefined || dayOfWeek === null) {
    return 'Chưa có thông tin';
  }

  const dayMap: {[key: string]: string} = {
    '0': 'Chủ nhật',
    '1': 'Thứ hai',
    '2': 'Thứ ba',
    '3': 'Thứ tư',
    '4': 'Thứ năm',
    '5': 'Thứ sáu',
    '6': 'Thứ bảy',
    sunday: 'Chủ nhật',
    monday: 'Thứ hai',
    tuesday: 'Thứ ba',
    wednesday: 'Thứ tư',
    thursday: 'Thứ năm',
    friday: 'Thứ sáu',
    saturday: 'Thứ bảy',
  };

  const key = String(dayOfWeek).toLowerCase();
  return dayMap[key] || 'Chưa có thông tin';
};

const CourseDetail: React.FC<CourseDetailProps> = ({route, navigation}) => {
  // ✅ State
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'students'>('info');

  // ✅ Refs
  const isMounted = useRef(true);

  // ✅ Hooks
  const {getCourseById} = useCourse();

  // ✅ Params - Lấy dữ liệu từ route params thay vì mock data
  const safeParams = useMemo(() => {
    const params = route.params || {};
    return {
      item: params.item || null,
      date: params.date || new Date().toISOString().split('T')[0],
      scheduleItem: params.scheduleItem || null,
      userRole: params.userRole || 'student',
      isTeacher: params.isTeacher || false,
    };
  }, [route.params]);

  const actualCourseId = useMemo(() => {
    if (!safeParams.item) return null;
    return extractCourseId(safeParams.scheduleItem, safeParams.item);
  }, [safeParams.item, safeParams.scheduleItem]);

  // ✅ Helper functions
  const getInstructorName = useCallback(
    (instructorData: User | string | undefined) => {
      if (!instructorData) return 'Chưa có thông tin';
      if (typeof instructorData === 'string') return instructorData;
      if (typeof instructorData === 'object') {
        return instructorData.fullName || 'Chưa có thông tin';
      }
      return 'Chưa có thông tin';
    },
    [],
  );

  // ✅ Xử lý điểm danh cho cả giảng viên và sinh viên - CHỈNH SỬA THÊM fromCourseDetail
  const handleAttendance = useCallback(() => {
    const displayData = courseData || safeParams.item;

    // Navigate to attendance screen với role-specific data
    navigation.navigate('AttendanceStack', {
      screen: 'AttendanceMain',
      params: {
        courseId: actualCourseId,
        courseName: displayData?.name || 'Khóa học',
        courseCode: displayData?.id || displayData?.code,
        students: students,
        date: safeParams.date,
        instructor: getInstructorName(
          displayData?.instructorId || displayData?.instructor,
        ),
        userRole: safeParams.userRole,
        isTeacher: safeParams.isTeacher,

        // ✅ THÊM CÁC THÔNG TIN MỚI
        fromCourseDetail: true, // Flag để biết đến từ CourseDetail
        courseData: displayData, // Toàn bộ course data
        location: displayData?.location,
        room: displayData?.room,
        startTime:
          displayData?.startTime ||
          (displayData?.schedule && displayData.schedule.length > 0
            ? displayData.schedule[0].startTime
            : '08:00'),
        endTime:
          displayData?.endTime ||
          (displayData?.schedule && displayData.schedule.length > 0
            ? displayData.schedule[0].endTime
            : '10:00'),
      },
    });
  }, [
    navigation,
    actualCourseId,
    students,
    safeParams,
    courseData,
    getInstructorName,
  ]);

  // ✅ Xử lý bài tập - Đơn giản hóa
  const handleAssignment = useCallback(() => {
    const displayData = courseData || safeParams.item;

    // Validate required data
    if (!actualCourseId) {
      console.warn('Missing courseId for Assignment navigation');
      return;
    }

    const navigationParams = {
      courseId: actualCourseId,
      courseName: displayData?.name || 'Khóa học',
      courseCode: displayData?.id || displayData?.code || 'N/A',
      students: students || [],
      date: safeParams.date,
      instructor: getInstructorName(
        displayData?.instructorId || displayData?.instructor,
      ),
      userRole: safeParams.userRole,
      isTeacher: safeParams.isTeacher,
      // Thêm thông tin bổ sung với fallback values
      credits: displayData?.credits || 0,
      description: displayData?.description || '',
      location: displayData?.location || '',
      room: displayData?.room || '',
      startTime:
        displayData?.startTime ||
        (displayData?.schedule && displayData.schedule.length > 0
          ? displayData.schedule[0].startTime
          : '08:00'),
      endTime:
        displayData?.endTime ||
        (displayData?.schedule && displayData.schedule.length > 0
          ? displayData.schedule[0].endTime
          : '10:00'),
    };

    navigation.navigate('AssignmentStack', {
      screen: 'Assignment',
      params: navigationParams,
    });
  }, [
    navigation,
    actualCourseId,
    students,
    safeParams,
    courseData,
    getInstructorName,
  ]);

  // ✅ Fetch functions - Lấy dữ liệu từ API
  const fetchCourseDetails = useCallback(async () => {
    if (!actualCourseId || !isMounted.current) return;

    try {
      setLoading(true);
      setHasError(false);

      const data = await getCourseById(actualCourseId);

      if (data && isMounted.current) {
        setCourseData(data);
      } else if (isMounted.current) {
        setHasError(true);
        setErrorMessage('Không tìm thấy thông tin khóa học');
      }
    } catch (error) {
      if (isMounted.current) {
        setHasError(true);
        setErrorMessage('Không thể tải thông tin khóa học');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [actualCourseId, getCourseById]);

  // ✅ Lấy danh sách sinh viên từ API
  const fetchStudents = useCallback(async () => {
    if (!actualCourseId) return;

    try {
      setLoadingStudents(true);

      // ✅ Kiểm tra xem courseService.getCourseStudents có tồn tại
      if (
        courseService &&
        typeof courseService.getCourseStudents === 'function'
      ) {
        const response = await courseService.getCourseStudents(actualCourseId);

        if (response.success && response.data) {
          setStudents(response.data.data || []);
        } else {
          setStudents([]);
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [actualCourseId]);

  const onRefresh = useCallback(async () => {
    if (!actualCourseId) return;
    setRefreshing(true);
    try {
      await Promise.all([fetchCourseDetails(), fetchStudents()]);
    } catch (error) {
      // Silent error handling
    } finally {
      setRefreshing(false);
    }
  }, [actualCourseId, fetchCourseDetails, fetchStudents]);

  // ✅ Effects
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!actualCourseId && safeParams.item) {
      setHasError(true);
      setErrorMessage('Không thể xác định ID khóa học từ dữ liệu được truyền');
    }
  }, [actualCourseId, safeParams.item]);

  useEffect(() => {
    if (actualCourseId) {
      fetchCourseDetails();
      fetchStudents();
    }
  }, [actualCourseId, fetchCourseDetails, fetchStudents]);

  // ✅ Render functions
  const renderStudentItem = ({item}: {item: User}) => (
    <TouchableOpacity style={styles.studentCard}>
      <Image
        source={{
          uri:
            item.avatar ||
            'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(item.fullName || 'User') +
              '&background=5669FF&color=fff',
        }}
        style={styles.studentAvatar}
      />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1}>
          {item.fullName || 'Không có tên'}
        </Text>
        <Text style={styles.studentId} numberOfLines={1}>
          {item.studentId || item.userID || 'Không có mã'}
        </Text>
        <Text style={styles.studentEmail} numberOfLines={1}>
          {item.email || 'Không có email'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'info' && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab('info')}>
        <IconFeather
          name="book-open"
          size={18}
          color={activeTab === 'info' ? appColors.white : appColors.gray}
        />
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'info' && styles.activeTabButtonText,
          ]}>
          Thông tin chi tiết
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'students' && styles.activeTabButton,
        ]}
        onPress={() => setActiveTab('students')}>
        <IconFeather
          name="users"
          size={18}
          color={activeTab === 'students' ? appColors.white : appColors.gray}
        />
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'students' && styles.activeTabButtonText,
          ]}>
          Sinh viên ({students.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCourseInfo = () => {
    // ✅ Sử dụng dữ liệu từ courseData (API) và safeParams.item (route params)
    const displayData = courseData || safeParams.item;

    if (loading) {
      return (
        <View style={styles.infoLoadingContainer}>
          <ActivityIndicator size="small" color={appColors.primary} />
          <Text style={styles.infoLoadingText}>Đang tải thông tin...</Text>
        </View>
      );
    }

    if (!displayData) {
      return (
        <View style={styles.emptyInfoContainer}>
          <IconFeather name="book-open" size={48} color={appColors.gray} />
          <Text style={styles.emptyInfoText}>
            Không tìm thấy thông tin chi tiết khóa học
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.infoGrid}>
        {[
          {
            icon: 'user',
            label: 'Giảng viên',
            value: getInstructorName(
              displayData?.instructorId || displayData?.instructor,
            ),
          },
          {
            icon: 'book',
            label: 'Mã môn học',
            value: displayData?.id || displayData?.code || 'Chưa có thông tin',
          },
          {
            icon: 'award',
            label: 'Số tín chỉ',
            value: displayData?.credits
              ? `${displayData.credits} tín chỉ`
              : 'Chưa có thông tin',
          },
          {
            icon: 'map-pin',
            label: 'Địa điểm',
            value: displayData?.location || 'Chưa có thông tin',
          },
          {
            icon: 'home',
            label: 'Phòng học',
            value:
              displayData?.room ||
              (displayData?.schedule && displayData.schedule.length > 0
                ? displayData.schedule[0].room
                : 'Chưa có thông tin'),
          },
          {
            icon: 'clock',
            label: 'Thời gian',
            value:
              displayData?.startTime && displayData?.endTime
                ? `${displayData.startTime} - ${displayData.endTime}`
                : displayData?.schedule && displayData.schedule.length > 0
                ? `${displayData.schedule[0].startTime || '08:00'} - ${
                    displayData.schedule[0].endTime || '10:00'
                  }`
                : 'Chưa có thông tin',
          },
          {
            icon: 'calendar',
            label: 'Ngày trong tuần',
            value: displayData?.dayOfWeek
              ? getDayNameInVietnamese(displayData.dayOfWeek)
              : displayData?.schedule && displayData.schedule.length > 0
              ? getDayNameInVietnamese(displayData.schedule[0].dayOfWeek)
              : 'Chưa có thông tin',
          },
          {
            icon: 'info',
            label: 'Mô tả',
            value: displayData?.description || 'Chưa có mô tả',
          },
          {
            icon: 'activity',
            label: 'Trạng thái',
            value: (() => {
              switch (displayData?.status) {
                case 'ongoing':
                  return 'Đang diễn ra';
                case 'upcoming':
                  return 'Sắp tới';
                case 'completed':
                  return 'Đã hoàn thành';
                case 'cancelled':
                  return 'Đã hủy';
                case 'paused':
                  return 'Tạm dừng';
                default:
                  return 'Chưa xác định';
              }
            })(),
          },
          {
            icon: 'percent',
            label: 'Tiến độ',
            value: displayData?.progress ? `${displayData.progress}%` : '0%',
          },
        ].map((info, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <IconFeather
                name={info.icon}
                size={16}
                color={appColors.primary}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{info.label}</Text>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderStudentsList = () => (
    <View style={[styles.section, {flex: 1}]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIcon}>
            <IconFeather name="users" size={18} color={appColors.white} />
          </View>
          <Text style={styles.sectionTitle}>
            Danh sách sinh viên ({students.length})
          </Text>
        </View>
      </View>

      <View style={[styles.sectionContent, {flex: 1}]}>
        {loadingStudents ? (
          <View style={styles.studentsLoadingContainer}>
            <ActivityIndicator size="small" color={appColors.primary} />
            <Text style={styles.studentsLoadingText}>Đang tải...</Text>
          </View>
        ) : students.length > 0 ? (
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={item =>
              item._id || item.userID || String(Math.random())
            }
            style={styles.studentsFlatList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.studentSeparator} />
            )}
            contentContainerStyle={styles.studentsContentContainer}
          />
        ) : (
          <View style={styles.emptyStudentsContainer}>
            <IconFeather name="users" size={48} color={appColors.gray} />
            <Text style={styles.emptyStudentsText}>
              Chưa có sinh viên nào đăng ký khóa học này
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // ✅ Early returns
  if (!safeParams.item || hasError) {
    return (
      <View style={styles.container}>
        <HeaderComponent showBack navigation={navigation} title="Lỗi" />
        <View style={styles.errorContainer}>
          <IconFeather name="alert-circle" size={48} color={appColors.error} />
          <Text style={styles.errorText}>
            {errorMessage || 'Không tìm thấy thông tin khóa học'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!actualCourseId) {
    return (
      <View style={styles.container}>
        <HeaderComponent showBack navigation={navigation} title="Lỗi dữ liệu" />
        <View style={styles.errorContainer}>
          <IconFeather name="database" size={48} color={appColors.error} />
          <Text style={styles.errorText}>
            Không thể xác định ID khóa học từ dữ liệu được truyền
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          showBack
          navigation={navigation}
          title="Chi tiết môn học"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // ✅ Sử dụng dữ liệu thực từ route params hoặc API
  const displayData = courseData || safeParams.item;

  return (
    <View style={styles.container}>
      <HeaderComponent
        showBack
        navigation={navigation}
        title={displayData?.name || 'Chi tiết môn học'}
      />

      {/* Hero Card - Cố định */}
      <View style={styles.heroContainer}>
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              {displayData?.name || 'Tên môn học'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {displayData?.credits || 0} tín chỉ • Mã:{' '}
              {displayData?.id || displayData?.code || 'N/A'}
            </Text>
            <View style={styles.heroDate}>
              <IconFeather
                name="calendar"
                size={14}
                color={appColors.primaryLight}
              />
              <Text style={styles.heroDateText}>{safeParams.date}</Text>
            </View>
            {displayData?.progress !== undefined && (
              <View style={styles.heroProgress}>
                <IconFeather
                  name="trending-up"
                  size={14}
                  color={appColors.primaryLight}
                />
                <Text style={styles.heroProgressText}>
                  Tiến độ: {displayData.progress}%
                </Text>
              </View>
            )}

            {/* ✅ Buttons container - Hiển thị cho cả giảng viên và sinh viên */}
            <View style={styles.buttonsContainer}>
              {/* Button Điểm danh */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAttendance}
                activeOpacity={0.8}>
                <IconFeather
                  name="check-circle"
                  size={18}
                  color={appColors.primary}
                />
                <Text style={styles.actionButtonText}>
                  {safeParams.isTeacher ? 'Quản lý điểm danh' : 'Điểm danh'}
                </Text>
              </TouchableOpacity>

              {/* Button Bài tập */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAssignment}
                activeOpacity={0.8}>
                <IconFeather
                  name="file-text"
                  size={18}
                  color={appColors.primary}
                />
                <Text style={styles.actionButtonText}>
                  {safeParams.isTeacher ? 'Quản lý bài tập' : 'Bài tập'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Navigation - Cố định */}
      <View style={styles.tabWrapper}>{renderTabButtons()}</View>

      {/* Content Area - Có scroll riêng */}
      <View style={styles.contentContainer}>
        {activeTab === 'info' ? (
          <View style={styles.infoTabContainer}>
            {/* Fixed Section Header */}
            <View style={styles.sectionHeaderFixed}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIcon}>
                  <IconFeather
                    name="book-open"
                    size={18}
                    color={appColors.white}
                  />
                </View>
                <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
              </View>
            </View>

            {/* Scrollable Content */}
            <View style={styles.scrollableContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.infoContentContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }>
                <View style={styles.sectionContentPadding}>
                  {renderCourseInfo()}
                </View>
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.studentsTabContainer}>
            {renderStudentsList()}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightGray,
  },
  heroContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  infoTabContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: appColors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appColors.gray2,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // ✅ Fixed header cho info section
  sectionHeaderFixed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
    backgroundColor: appColors.white,
  },
  // ✅ Scrollable content area
  scrollableContent: {
    flex: 1,
  },
  // ✅ Content padding
  sectionContentPadding: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentScrollView: {
    flex: 1,
  },
  infoContentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  studentsTabContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: appColors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: appColors.error,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: appColors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  heroContent: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: appColors.white,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 16,
    color: appColors.primaryLight,
    fontWeight: '500',
  },
  heroDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  heroDateText: {
    fontSize: 14,
    color: appColors.white,
    fontWeight: '600',
  },
  heroProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroProgressText: {
    fontSize: 14,
    color: appColors.white,
    fontWeight: '600',
  },
  // ✅ Styles cho buttons container
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  // ✅ Styles cho action buttons
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: appColors.gray2,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: appColors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.gray,
  },
  activeTabButtonText: {
    color: appColors.white,
  },
  section: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appColors.gray2,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: appColors.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: appColors.text,
    fontWeight: '500',
  },
  infoLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  infoLoadingText: {
    fontSize: 14,
    color: appColors.gray,
  },
  studentsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  studentsLoadingText: {
    fontSize: 14,
    color: appColors.gray,
  },
  studentsFlatList: {
    flex: 1,
  },
  studentsContentContainer: {
    paddingBottom: 20,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: appColors.white2,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: appColors.gray2,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: appColors.gray3,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: appColors.gray,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: appColors.gray,
  },
  studentSeparator: {
    height: 8,
    backgroundColor: 'transparent',
  },
  emptyStudentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyStudentsText: {
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
  },
  emptyInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyInfoText: {
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
  },
});

export default CourseDetail;
