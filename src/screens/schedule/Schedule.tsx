import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {Calendar, DateData} from 'react-native-calendars';
import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useSchedule from '../../hooks/useSchedule';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {RootStackParamList} from '../../types/navigation';
import {
  ScheduleItem,
  DayOfWeekType,
  CourseStatusType,
} from '../../types/courseType';

interface ScheduleProps {
  navigation: StackNavigationProp<RootStackParamList, 'Schedule'>;
}

const Schedule: React.FC<ScheduleProps> = ({navigation}) => {
  // ... existing state and hooks remain the same ...
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const userRoleFromRedux = useSelector((state: any) => state.auth?.user?.role);
  const [userRole, setUserRole] = useState<string>('student');
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userInitialized, setUserInitialized] = useState<boolean>(false);

  const {
    loading,
    error,
    scheduleItems,
    getScheduleByDate,
    getScheduleByMonth,
    clearError,
    clearScheduleData,
  } = useSchedule();

  // ... all existing useCallback and useEffect hooks remain the same until handleCoursePress ...

  const initializeUserInfo = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        const parsedUserData = JSON.parse(userData);

        let userInfo = parsedUserData;
        if (parsedUserData.success && parsedUserData.data) {
          userInfo = parsedUserData.data.user || parsedUserData.data;
        } else if (parsedUserData.user) {
          userInfo = parsedUserData.user;
        }

        const role = userInfo?.role || userRoleFromRedux || 'student';
        const userId = userInfo?._id || userInfo?.id || '';
        const teacherFlag = role === 'teacher' || role === 'admin';

        setUserRole(role);
        setCurrentUserId(userId);
        setIsTeacher(teacherFlag);
      } else {
        const role = userRoleFromRedux || 'student';
        const teacherFlag = role === 'teacher' || role === 'admin';

        setUserRole(role);
        setIsTeacher(teacherFlag);
      }
    } catch (error) {
      setUserRole('student');
      setIsTeacher(false);
    } finally {
      setUserInitialized(true);
    }
  }, [userRoleFromRedux]);

  useEffect(() => {
    initializeUserInfo();
  }, [initializeUserInfo]);

  const loadMonthSchedule = useCallback(
    async (date: Date) => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        await getScheduleByMonth(year, month);
      } catch (error) {
        // Handle error silently
      }
    },
    [getScheduleByMonth],
  );

  const loadDateSchedule = useCallback(
    async (dateString: string) => {
      try {
        await getScheduleByDate(dateString);
      } catch (error) {
        // Handle error silently
      }
    },
    [getScheduleByDate],
  );

  const onDayPress = useCallback(
    async (day: DateData) => {
      try {
        if (!day?.dateString) {
          return;
        }

        setSelectedDate(day.dateString);

        if (!scheduleItems[day.dateString]) {
          await loadDateSchedule(day.dateString);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải lịch cho ngày được chọn');
      }
    },
    [scheduleItems, loadDateSchedule],
  );

  const onMonthChange = useCallback(
    async (month: DateData) => {
      try {
        if (!month?.year || !month?.month) {
          return;
        }

        const newDate = new Date(month.year, month.month - 1, 1);
        setCurrentMonth(newDate);
        await loadMonthSchedule(newDate);
      } catch (error) {
        // Handle error silently
      }
    },
    [loadMonthSchedule],
  );

  const goToToday = useCallback(async () => {
    try {
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      setSelectedDate(todayDate);
      setCurrentMonth(new Date());

      if (!scheduleItems[todayDate]) {
        await loadDateSchedule(todayDate);
      }
    } catch (error) {
      // Handle error silently
    }
  }, [scheduleItems, loadDateSchedule]);

  const refreshSchedule = useCallback(async () => {
    try {
      setRefreshing(true);
      clearScheduleData();
      await Promise.all([
        loadMonthSchedule(currentMonth),
        loadDateSchedule(selectedDate),
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể làm mới lịch học');
    } finally {
      setRefreshing(false);
    }
  }, [
    clearScheduleData,
    loadMonthSchedule,
    currentMonth,
    loadDateSchedule,
    selectedDate,
  ]);

  useEffect(() => {
    if (!userInitialized) return;

    const initializeSchedule = async () => {
      try {
        await Promise.all([
          loadMonthSchedule(new Date()),
          loadDateSchedule(today),
        ]);
      } catch (error) {
        // Handle error silently
      }
    };

    initializeSchedule();
  }, [userInitialized, loadMonthSchedule, loadDateSchedule, today]);

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi', error, [
        {text: 'OK', onPress: clearError},
        {text: 'Thử lại', onPress: refreshSchedule},
      ]);
    }
  }, [error, clearError, refreshSchedule]);

  const markedDates = useMemo(() => {
    const marked = Object.keys(scheduleItems).reduce((acc, date) => {
      const hasSchedule = scheduleItems[date] && scheduleItems[date].length > 0;

      acc[date] = {
        marked: hasSchedule,
        dotColor: hasSchedule ? appColors.primary : appColors.gray3,
        selected: date === selectedDate,
        selectedColor: appColors.primary,
      };
      return acc;
    }, {} as Record<string, any>);

    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: appColors.primary,
      };
    }

    return marked;
  }, [scheduleItems, selectedDate]);

  const selectedItems = useMemo(() => {
    const items = scheduleItems[selectedDate] || [];
    const normalizedItems = items.map((item, index) => ({
      ...item,
      _id: item._id || `schedule-${selectedDate}-${index}`,
      courseId: item.courseId || item._id || `course-${index}`,
      courseName: item.courseName || 'Không có tên',
      courseCode: item.courseCode || 'N/A',
      instructorName: item.instructorName || '',
      instructorEmail: item.instructorEmail || '',
      instructorUserID: item.instructorUserID || '',
      date: item.date || selectedDate,
      dayOfWeek: item.dayOfWeek || 'Monday',
      room: item.room || 'Chưa xác định',
      location: item.location || 'Chưa xác định',
      credits: item.credits || 3,
      progress: item.progress || 0,
      status: item.status || 'ongoing',
      description: item.description || 'Chưa có mô tả',
      startDate: item.startDate || new Date().toISOString(),
      endDate: item.endDate || new Date().toISOString(),
      semester: item.semester || 'N/A',
      academicYear: item.academicYear || 'N/A',
      semesterInfo: item.semesterInfo || {
        _id: '',
        semester: item.semester || 'N/A',
        academicYear: item.academicYear || 'N/A',
        displayName: `${item.semester || 'N/A'}, năm học ${
          item.academicYear || 'N/A'
        }`,
        startDate: item.startDate || new Date().toISOString(),
        endDate: item.endDate || new Date().toISOString(),
      },
      statusInfo: item.statusInfo,
      startTime: item.startTime || '07:30',
      endTime: item.endTime || '09:30',
    })) as unknown as ScheduleItem[];

    return normalizedItems;
  }, [scheduleItems, selectedDate]);

  const hasScheduleForDay = selectedItems.length > 0;

  // ✅ SỬA: handleCoursePress với navigation call đúng
  const handleCoursePress = useCallback(
    (item: ScheduleItem) => {
      try {
        if (!item) {
          Alert.alert('Lỗi', 'Dữ liệu khóa học không hợp lệ');
          return;
        }

        const courseId = item.courseId || item._id;
        const courseName = item.courseName;

        if (!courseId || !courseName) {
          Alert.alert('Lỗi', 'Thiếu thông tin khóa học cần thiết');
          return;
        }

        const courseDetailItem = {
          _id: courseId,
          id: item.courseCode || courseId,
          name: courseName,
          code: item.courseCode || 'N/A',
          credits: item.credits || 3,
          instructor: item.instructorName || 'Chưa có thông tin',
          location: item.location || 'Chưa xác định',
          room: item.room || 'Chưa xác định',
          startTime: item.startTime || '07:30',
          endTime: item.endTime || '09:30',
          dayOfWeek: (item.dayOfWeek || 'Monday') as DayOfWeekType,
          description: item.description || 'Chưa có mô tả',
          status: (item.status || 'ongoing') as CourseStatusType,
          students: [],
          progress: item.progress || 0,
          image: '',
          color: ['#007AFF'],
          semester: item.semester || 'N/A',
          academicYear: item.academicYear || 'N/A',
          semesterInfo: item.semesterInfo || {
            _id: '',
            semester: item.semester || 'N/A',
            academicYear: item.academicYear || 'N/A',
            displayName: `${item.semester || 'N/A'}, năm học ${
              item.academicYear || 'N/A'
            }`,
            startDate: item.startDate || new Date().toISOString(),
            endDate: item.endDate || new Date().toISOString(),
          },
          startDate: item.startDate || new Date().toISOString(),
          endDate: item.endDate || new Date().toISOString(),
          schedule: [
            {
              _id: `${courseId}_schedule_1`,
              dayOfWeek: (item.dayOfWeek || 'Monday') as DayOfWeekType,
              startTime: item.startTime || '07:30',
              endTime: item.endTime || '09:30',
              room: item.room || 'Chưa xác định',
            },
          ],
          materials: [],
          instructorId: item.instructorUserID || '',
          enrolledStudents: [],
          studentActivities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0,
        };

        const scheduleItemForDetail: ScheduleItem = {
          ...item,
          _id: item._id || `${courseId}_${selectedDate}_${item.startTime}`,
          courseId: courseId,
          courseName: courseName,
          courseCode: item.courseCode || 'N/A',
          instructorName: item.instructorName || 'Chưa có thông tin',
          instructorEmail: item.instructorEmail || '',
          instructorUserID: item.instructorUserID || '',
          date: selectedDate,
          dayOfWeek: item.dayOfWeek || 'Monday',
          room: item.room || 'Chưa xác định',
          location: item.location || 'Chưa xác định',
          credits: item.credits || 3,
          progress: item.progress || 0,
          status: item.status || 'ongoing',
          description: item.description || 'Chưa có mô tả',
          startDate: item.startDate || new Date().toISOString(),
          endDate: item.endDate || new Date().toISOString(),
          semester: item.semester || 'N/A',
          academicYear: item.academicYear || 'N/A',
          semesterInfo: item.semesterInfo || {
            _id: '',
            semester: item.semester || 'N/A',
            academicYear: item.academicYear || 'N/A',
            displayName: `${item.semester || 'N/A'}, năm học ${
              item.academicYear || 'N/A'
            }`,
            startDate: item.startDate || new Date().toISOString(),
            endDate: item.endDate || new Date().toISOString(),
          },
          statusInfo: item.statusInfo,
          startTime: item.startTime || '07:30',
          endTime: item.endTime || '09:30',
        };

        // ✅ SỬA: Navigate đến ScheduleStack -> CourseDetail thay vì CourseDetail trực tiếp
        navigation.navigate('ScheduleStack', {
          screen: 'CourseDetail',
          params: {
            item: courseDetailItem,
            date: selectedDate,
            userRole: userRole,
            isTeacher: isTeacher,
            userId: currentUserId,
            scheduleItem: scheduleItemForDetail,
          },
        });
      } catch (error) {
        Alert.alert(
          'Lỗi Navigation',
          'Không thể mở chi tiết khóa học. Vui lòng thử lại.',
        );
      }
    },
    [navigation, selectedDate, userRole, isTeacher, currentUserId],
  );

  // ... rest of the component remains the same ...
  const getCourseAccent = useCallback((index: number) => {
    const primaryVariations = [
      appColors.primary,
      appColors.primary + '80',
      appColors.primary + 'CC',
      appColors.primary + '66',
      appColors.primary + 'AA',
      appColors.primary + '99',
      appColors.primary + '77',
      appColors.primary + 'BB',
    ];
    return primaryVariations[index % primaryVariations.length];
  }, []);

  const renderScheduleItem = useCallback(
    ({item, index}: {item: ScheduleItem; index: number}) => {
      try {
        const accentColor = getCourseAccent(index);

        const courseName = item.courseName || 'Không có tên';
        const courseCode = item.courseCode || 'N/A';
        const startTime = item.startTime || '00:00';
        const endTime = item.endTime || '00:00';
        const instructorName = item.instructorName;
        const roomInfo = item.room || 'Chưa xác định';
        const locationInfo = item.location || '';
        const semesterInfo = item.semesterInfo;

        const locationDisplay =
          roomInfo !== 'Chưa xác định' && locationInfo
            ? `${roomInfo} - ${locationInfo}`
            : roomInfo !== 'Chưa xác định'
            ? roomInfo
            : locationInfo || 'Chưa xác định';

        return (
          <TouchableOpacity
            style={styles.courseItem}
            onPress={() => handleCoursePress(item)}
            activeOpacity={0.7}>
            <View
              style={[styles.accentBorder, {backgroundColor: accentColor}]}
            />

            <View style={styles.timeBlock}>
              <Text style={styles.startTime}>{startTime}</Text>
              <View style={styles.timeDivider} />
              <Text style={styles.endTime}>{endTime}</Text>
            </View>

            <View style={styles.contentBlock}>
              <Text style={styles.courseTitle} numberOfLines={1}>
                {courseName}
              </Text>
              <Text style={[styles.courseCode, {color: appColors.primary}]}>
                {courseCode}
              </Text>

              <View style={styles.infoRow}>
                <Icon name="place" size={14} color={appColors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {locationDisplay}
                </Text>
              </View>

              {!isTeacher && instructorName && (
                <View style={styles.infoRow}>
                  <Icon name="person" size={14} color={appColors.primary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {instructorName}
                  </Text>
                </View>
              )}

              {semesterInfo && (
                <View style={styles.infoRow}>
                  <Icon name="school" size={14} color={appColors.primary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {semesterInfo.displayName || semesterInfo.semester || 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.arrowBlock}>
              <Icon name="chevron-right" size={20} color={appColors.primary} />
            </View>
          </TouchableOpacity>
        );
      } catch (error) {
        return (
          <View style={[styles.courseItem, styles.errorItem]}>
            <Text style={styles.errorText}>Lỗi hiển thị khóa học</Text>
          </View>
        );
      }
    },
    [handleCoursePress, isTeacher, getCourseAccent],
  );

  const EmptySchedule = useCallback(
    () => (
      <View style={styles.emptyBlock}>
        <View style={styles.emptyIconBlock}>
          <Icon name="event-available" size={48} color={appColors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Không có lịch học</Text>
        <Text style={styles.emptySubtitle}>
          {selectedDate === today
            ? 'Hôm nay bạn rảnh rỗi'
            : 'Ngày này không có lịch học'}
        </Text>
      </View>
    ),
    [selectedDate, today],
  );

  if (!userInitialized) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Lịch Học"
          navigation={navigation}
          showBack={true}
          titleStyle={{color: appColors.black}}
        />
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang khởi tạo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Lịch Học"
        navigation={navigation}
        showBack={true}
        titleStyle={{color: appColors.black}}
        rightIcons={[
          {name: 'today', onPress: goToToday},
          {name: 'refresh', onPress: refreshSchedule},
        ]}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshSchedule}
            colors={[appColors.primary]}
            tintColor={appColors.primary}
          />
        }>
        <View style={styles.calendarBlock}>
          <Calendar
            current={format(currentMonth, 'yyyy-MM-dd')}
            markedDates={markedDates}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            monthFormat={'MM/yyyy'}
            hideExtraDays={true}
            firstDay={1}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: appColors.primary,
              selectedDayBackgroundColor: appColors.primary,
              selectedDayTextColor: appColors.white,
              todayTextColor: appColors.primary,
              dayTextColor: appColors.black,
              textDisabledColor: appColors.gray2,
              arrowColor: appColors.primary,
              monthTextColor: appColors.primary,
              indicatorColor: appColors.primary,
              textMonthFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
            }}
          />
        </View>

        <View style={styles.scheduleBlock}>
          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>Đang tải lịch học...</Text>
            </View>
          ) : hasScheduleForDay ? (
            <View style={styles.listBlock}>
              <FlatList<ScheduleItem>
                data={selectedItems}
                renderItem={renderScheduleItem}
                keyExtractor={(item, index) =>
                  item._id ||
                  item.courseId ||
                  `schedule-${selectedDate}-${index}`
                }
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View style={styles.itemSeparator} />
                )}
                removeClippedSubviews={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
                getItemLayout={(data, index) => ({
                  length: 120,
                  offset: 120 * index,
                  index,
                })}
              />
            </View>
          ) : (
            <EmptySchedule />
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// ... existing styles remain the same ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  calendarBlock: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: appColors.primary + '15',
  },
  scheduleBlock: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listBlock: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  courseItem: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: appColors.primary + '15',
    minHeight: 120,
  },
  errorItem: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  timeBlock: {
    alignItems: 'center',
    marginRight: 20,
    paddingLeft: 12,
    paddingVertical: 12,
    backgroundColor: appColors.primary + '08',
    borderRadius: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: appColors.primary + '20',
  },
  startTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  timeDivider: {
    width: 24,
    height: 1,
    backgroundColor: appColors.primary + '50',
    marginVertical: 6,
  },
  endTime: {
    fontSize: 13,
    color: appColors.primary + '80',
    fontWeight: '600',
  },
  contentBlock: {
    flex: 1,
    paddingVertical: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    lineHeight: 22,
  },
  courseCode: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  arrowBlock: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  itemSeparator: {
    height: 16,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: appColors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: appColors.primary + '15',
  },
  emptyIconBlock: {
    backgroundColor: appColors.primary + '10',
    padding: 24,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: appColors.primary + '20',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: appColors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: appColors.primary + '15',
  },
  loadingText: {
    fontSize: 15,
    color: appColors.primary,
    marginTop: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default Schedule;
