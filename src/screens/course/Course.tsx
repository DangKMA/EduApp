import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import HeaderComponent from '../../components/HeaderCompunent';
import SearchBar from '../../components/SearchBarComponent';
import StudentCourseItem from './StudentCourseItem';
import TeacherCourseItem from './TeacherCourseItem';
import {appColors} from '../../constants/appColors';
import useCourse from '../../hooks/useCourse';
import useSemester from '../../hooks/useSemester';
import useGrade from '../../hooks/useGrade';
import {Course as CourseType} from '../../types/courseType';
import {Semester} from '../../types/semesterType';
import {debounce} from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;
const CARD_HEIGHT = 220;
const TEACHER_CARD_HEIGHT = 260;

// Các màu mặc định an toàn cho gradient
const DEFAULT_GRADIENTS = [
  ['#4A6FFF', '#6A8CFF'],
  ['#FF6B6B', '#FF8E8E'],
  ['#43A047', '#66BB6A'],
  ['#7E57C2', '#9575CD'],
  ['#FF9800', '#FFB74D'],
  ['#26A69A', '#4DB6AC'],
];

// Kiểm tra tính hợp lệ của chuỗi màu hex
const isValidHexColor = (color: string): boolean => {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
};

// ============= COMPONENTS DÙNG CHUNG =============
const SemesterSelector = React.memo(
  ({
    selectedSemesterName,
    openSemesterSelector,
  }: {
    selectedSemesterName: string;
    openSemesterSelector: () => void;
  }) => (
    <TouchableOpacity
      style={styles.semesterContainer}
      onPress={openSemesterSelector}>
      <View style={styles.semesterContent}>
        <IconFeather name="calendar" size={18} color={appColors.primary} />
        <Text style={styles.semesterText}>{selectedSemesterName}</Text>
      </View>
      <IconFeather name="chevron-down" size={20} color={appColors.text} />
    </TouchableOpacity>
  ),
);

const StatusTabs = React.memo(
  ({
    activeTab,
    setActiveTab,
  }: {
    activeTab: string;
    setActiveTab: (tabId: string) => void;
  }) => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContainer}>
        {[
          {id: 'all', label: 'Tất cả'},
          {id: 'ongoing', label: 'Đang diễn ra'},
          {id: 'upcoming', label: 'Sắp tới'},
          {id: 'completed', label: 'Đã hoàn thành'},
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ),
);

const SemesterModal = React.memo(
  ({
    visible,
    onClose,
    semesters,
    selectedSemesterId,
    formatSemesterName,
    handleSelectSemester,
  }: {
    visible: boolean;
    onClose: () => void;
    semesters: Semester[];
    selectedSemesterId?: string;
    formatSemesterName: (semester: Semester) => string;
    handleSelectSemester: (semester: Semester) => void;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn học kỳ</Text>
            <TouchableOpacity onPress={onClose}>
              <IconFeather name="x" size={24} color={appColors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={semesters}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.semesterItem,
                  selectedSemesterId === item._id &&
                    styles.selectedSemesterItem,
                ]}
                onPress={() => handleSelectSemester(item)}>
                <Text
                  style={[
                    styles.semesterItemText,
                    selectedSemesterId === item._id &&
                      styles.selectedSemesterItemText,
                  ]}>
                  {formatSemesterName(item)}
                </Text>
                {item.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Hiện tại</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.semesterList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  ),
);

const EmptyState = React.memo(
  ({
    selectedSemesterId,
    isTeacher,
  }: {
    selectedSemesterId?: string;
    isTeacher: boolean;
  }) => (
    <View style={styles.emptyStateContainer}>
      <IconFeather name="book-open" size={60} color={appColors.gray2} />
      <Text style={styles.emptyStateTitle}>
        {isTeacher ? 'Không có môn học nào' : 'Không tìm thấy khóa học'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {selectedSemesterId
          ? isTeacher
            ? 'Bạn chưa được phân công dạy môn học nào trong học kỳ này'
            : 'Không có khóa học nào trong học kỳ này hoặc không có khóa học nào phù hợp với tìm kiếm của bạn'
          : 'Vui lòng chọn học kỳ để xem các khóa học'}
      </Text>
    </View>
  ),
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={appColors.primary} />
    <Text style={styles.loadingText}>Đang tải khóa học...</Text>
  </View>
);

// ============= COMPONENT CHÍNH =============
const Course = ({navigation}: {navigation: any}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [allCourses, setAllCourses] = useState<CourseType[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseType[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<
    string | undefined
  >(undefined);
  const [isSemesterModalVisible, setIsSemesterModalVisible] = useState(false);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isTeacher, setIsTeacher] = useState(false);

  // Refs
  const isFirstMount = useRef(true);
  const dataLoaded = useRef(false);
  const semesterCoursesLoaded = useRef<{[key: string]: boolean}>({});
  const apiCallInProgressRef = useRef(false);

  // Hooks
  const {
    loading: courseLoading,
    getStudentCourses,
    getInstructorCourses,
  } = useCourse();

  const {
    loading: semesterLoading,
    semesters,
    currentSemester,
    getAllSemesters,
    getCurrentSemester,
    formatSemesterName,
  } = useSemester();

  const {loading: gradeLoading} = useGrade();

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userInfo');

        if (userData) {
          const parsedUserData = JSON.parse(userData);

          // Kiểm tra cả hai cấu trúc có thể có
          let userInfo;
          if (parsedUserData.data && parsedUserData.data.user) {
            // Nếu có cấu trúc data.user (từ API response)
            userInfo = parsedUserData.data.user;
          } else if (parsedUserData.role || parsedUserData._id) {
            // Nếu đã là object user trực tiếp
            userInfo = parsedUserData;
          } else {
            setIsTeacher(false);
            return;
          }

          const userRole = userInfo?.role;
          if (userRole) {
            setIsTeacher(userRole === 'teacher' || userRole === 'admin');
          } else {
            setIsTeacher(false);
          }
        } else {
          setIsTeacher(false);
        }
      } catch (error) {
        setIsTeacher(false);
      }
    };

    getUserRole();
  }, []);

  // Loading state
  const loading = isLoading || courseLoading || semesterLoading || gradeLoading;

  // Debounce search để giảm số lần render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setSearchQuery(text);
    }, 300),
    [],
  );

  // Lấy màu gradient cho khóa học - hàm thuần túy không cần dependencies
  const getCourseColor = useCallback((index: number) => {
    return DEFAULT_GRADIENTS[Math.abs(index) % DEFAULT_GRADIENTS.length];
  }, []);

  // Hàm điều chỉnh sắc thái màu - hàm thuần túy với xử lý lỗi tốt hơn
  const shadeColor = useCallback((color: string, percent: number) => {
    try {
      if (!isValidHexColor(color)) {
        return '#4A6FFF';
      }

      let R = parseInt(color.substring(1, 3), 16);
      let G = parseInt(color.substring(3, 5), 16);
      let B = parseInt(color.substring(5, 7), 16);

      R = Math.floor((R * (100 + percent)) / 100);
      G = Math.floor((G * (100 + percent)) / 100);
      B = Math.floor((B * (100 + percent)) / 100);

      R = R < 255 ? R : 255;
      G = G < 255 ? G : 255;
      B = B < 255 ? B : 255;

      R = R > 0 ? R : 0;
      G = G > 0 ? G : 0;
      B = B > 0 ? B : 0;

      const RR =
        R.toString(16).length === 1 ? '0' + R.toString(16) : R.toString(16);
      const GG =
        G.toString(16).length === 1 ? '0' + G.toString(16) : G.toString(16);
      const BB =
        B.toString(16).length === 1 ? '0' + B.toString(16) : B.toString(16);

      return '#' + RR + GG + BB;
    } catch (error) {
      return '#4A6FFF';
    }
  }, []);

  // ============= LOGIC CHO CẢ HAI VAI TRÒ =============
  // Tải dữ liệu học kỳ
  const loadSemesterData = useCallback(async () => {
    if (dataLoaded.current || apiCallInProgressRef.current) return;

    apiCallInProgressRef.current = true;
    try {
      setIsLoading(true);

      const current = await getCurrentSemester();
      const allSemesters = await getAllSemesters();

      if (current && current._id) {
        setSelectedSemesterId(current._id);
      } else if (allSemesters && allSemesters.length > 0) {
        setSelectedSemesterId(allSemesters[0]._id);
      }

      dataLoaded.current = true;
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu học kỳ');
    } finally {
      setIsLoading(false);
      apiCallInProgressRef.current = false;
    }
  }, [getCurrentSemester, getAllSemesters]);

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadSemesterData();
    }
  }, [loadSemesterData]);

  // Tải khóa học theo học kỳ
  const loadCoursesBySemester = useCallback(
    async (semesterId: string) => {
      if (!semesterId) {
        return;
      }

      if (semesterCoursesLoaded.current[semesterId]) {
        return;
      }

      apiCallInProgressRef.current = true;
      try {
        setIsLoading(true);

        // Chỉ cần gọi hàm và nhận courses array trực tiếp
        let courses: CourseType[] = [];
        if (isTeacher) {
          courses = await getInstructorCourses({semesterId});
        } else {
          courses = await getStudentCourses({semesterId});
        }

        // Đơn giản hóa - courses đã là array
        if (courses && Array.isArray(courses) && courses.length > 0) {
          const normalizedCourses = courses.map((course, idx) => {
            let courseColor;

            try {
              if (course.color) {
                if (
                  Array.isArray(course.color) &&
                  course.color.length >= 2 &&
                  course.color.every(
                    color =>
                      typeof color === 'string' && isValidHexColor(color),
                  )
                ) {
                  courseColor = course.color;
                } else if (
                  Array.isArray(course.color) &&
                  course.color.length === 1 &&
                  typeof course.color[0] === 'string' &&
                  isValidHexColor(course.color[0])
                ) {
                  courseColor = [course.color[0], course.color[0]];
                } else if (
                  typeof course.color === 'string' &&
                  isValidHexColor(course.color)
                ) {
                  const shadedColor = shadeColor(course.color, -20);
                  courseColor = [course.color, shadedColor];
                } else {
                  courseColor = getCourseColor(idx);
                }
              } else {
                courseColor = getCourseColor(idx);
              }
            } catch (error) {
              courseColor = getCourseColor(idx);
            }

            return {...course, color: courseColor};
          });

          setAllCourses(normalizedCourses);
        } else {
          setAllCourses([]);
        }

        semesterCoursesLoaded.current[semesterId] = true;
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải khóa học');
        semesterCoursesLoaded.current[semesterId] = false;
        setAllCourses([]);
      } finally {
        setIsLoading(false);
        apiCallInProgressRef.current = false;
      }
    },
    [
      isTeacher,
      getInstructorCourses,
      getStudentCourses,
      shadeColor,
      getCourseColor,
    ],
  );

  // Effect khi selectedSemesterId thay đổi
  useEffect(() => {
    if (selectedSemesterId) {
      loadCoursesBySemester(selectedSemesterId);
    }
  }, [selectedSemesterId, loadCoursesBySemester, forceRefresh]);

  // Lọc khóa học theo tab và từ khóa tìm kiếm
  useEffect(() => {
    if (!allCourses || allCourses.length === 0) {
      setFilteredCourses([]);
      return;
    }

    let filtered = [...allCourses];

    if (activeTab !== 'all') {
      filtered = filtered.filter(course => course.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        course =>
          course.name?.toLowerCase().includes(query) ||
          course.id?.toLowerCase().includes(query) ||
          (typeof course.instructorId === 'object' &&
            course.instructorId?.fullName &&
            course.instructorId.fullName.toLowerCase().includes(query)),
      );
    }

    setFilteredCourses(filtered);
  }, [allCourses, activeTab, searchQuery]);

  // Lấy tên học kỳ đã chọn
  const selectedSemesterName = useMemo(() => {
    if (selectedSemesterId && semesters.length > 0) {
      const selected = semesters.find(sem => sem._id === selectedSemesterId);
      if (selected) return formatSemesterName(selected);
    }
    return currentSemester
      ? formatSemesterName(currentSemester)
      : 'Chọn học kỳ';
  }, [selectedSemesterId, semesters, currentSemester, formatSemesterName]);

  // Mở hộp thoại chọn học kỳ
  const openSemesterSelector = useCallback(() => {
    if (semesters.length > 0) {
      setIsSemesterModalVisible(true);
    }
  }, [semesters.length]);

  // Xử lý khi chọn học kỳ
  const handleSelectSemester = useCallback(
    (semester: Semester) => {
      if (semester._id !== selectedSemesterId) {
        semesterCoursesLoaded.current = {};
        apiCallInProgressRef.current = false;
        setForceRefresh(prev => prev + 1);
        setSelectedSemesterId(semester._id);
      }
      setIsSemesterModalVisible(false);
    },
    [selectedSemesterId],
  );

  // Xử lý làm mới
  const handleRefresh = useCallback(() => {
    if (selectedSemesterId) {
      semesterCoursesLoaded.current[selectedSemesterId] = false;
      apiCallInProgressRef.current = false;
      setForceRefresh(prev => prev + 1);
    } else {
      dataLoaded.current = false;
      apiCallInProgressRef.current = false;
      loadSemesterData();
    }
  }, [selectedSemesterId, loadSemesterData]);

  // Fix handleCoursePress với stable params
  const handleCoursePress = useCallback(
    async (course: CourseType) => {
      if (apiCallInProgressRef.current) return;
      apiCallInProgressRef.current = true;

      try {
        setLoadingCourseId(course._id || course.id);

        const courseIdentifier = course._id || course.id;

        if (!courseIdentifier) {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin ID khóa học');
          return;
        }

        // Stabilize navigation params theo backend model mới
        const stableNavigationParams = {
          item: {
            _id: course._id,
            id: course.id,
            name: course.name,
            code: course.id,
            credits: course.credits,
            instructor:
              typeof course.instructorId === 'object' &&
              course.instructorId?.fullName
                ? course.instructorId.fullName
                : typeof course.instructorId === 'string'
                ? course.instructorId
                : 'Không có thông tin',
            location: course.location || '',
            // room lấy từ schedule[0] thay vì course.room
            room:
              course.schedule && course.schedule.length > 0
                ? course.schedule[0].room || ''
                : '',
            // startTime/endTime lấy từ schedule[0] thay vì course fields
            startTime:
              course.schedule && course.schedule.length > 0
                ? course.schedule[0].startTime || '08:00'
                : '08:00',
            endTime:
              course.schedule && course.schedule.length > 0
                ? course.schedule[0].endTime || '10:00'
                : '10:00',
            // dayOfWeek từ schedule[0]
            dayOfWeek:
              course.schedule && course.schedule.length > 0
                ? course.schedule[0].dayOfWeek || 'Monday'
                : 'Monday',
            description: course.description || '',
            status: course.status,
            students: course.students || [],
            progress: course.progress || 0,
            image: course.image || '',
            color: Array.isArray(course.color)
              ? course.color
              : DEFAULT_GRADIENTS[0],
            semester: course.semester,
            academicYear: course.academicYear,
            semesterInfo: course.semesterInfo,
            // startDate/endDate từ backend model
            startDate: course.startDate,
            endDate: course.endDate,
            // toàn bộ schedule array thay vì chỉ item đầu tiên
            schedule: course.schedule || [],
            // materials nếu có
            materials: course.materials || [],
          },
          date: new Date().toLocaleDateString('vi-VN'),
          userRole: isTeacher ? 'teacher' : 'student',
          isTeacher: isTeacher,
          userId: undefined,
          // Add timestamp để force new navigation
          timestamp: Date.now(),
        };

        // Add small delay để avoid rapid navigation
        await new Promise(resolve => setTimeout(resolve, 150));

        // Navigate với proper error handling
        navigation.navigate('ScheduleStack', {
          screen: 'CourseDetail',
          params: stableNavigationParams,
        });
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể mở khóa học');
      } finally {
        setLoadingCourseId(null);
        apiCallInProgressRef.current = false;
      }
    },
    [navigation, isTeacher],
  );

  // ============= RENDER PHÂN BIỆT GIẢNG VIÊN VÀ SINH VIÊN =============
  const renderCourseList = () => {
    if (loading) {
      return <LoadingState />;
    }

    return (
      <FlatList
        data={filteredCourses}
        renderItem={({item, index}) =>
          isTeacher ? (
            <TeacherCourseItem
              item={item}
              index={index}
              onPress={handleCoursePress}
              loadingId={loadingCourseId}
              shadeColorFn={shadeColor}
              getCourseColorFn={getCourseColor}
              cardWidth={CARD_WIDTH}
              cardHeight={TEACHER_CARD_HEIGHT}
            />
          ) : (
            <StudentCourseItem
              item={item}
              index={index}
              onPress={handleCoursePress}
              loadingId={loadingCourseId}
              shadeColorFn={shadeColor}
              getCourseColorFn={getCourseColor}
              cardWidth={CARD_WIDTH}
              cardHeight={CARD_HEIGHT}
            />
          )
        }
        keyExtractor={item => item._id || item.id}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.coursesList}
        columnWrapperStyle={styles.coursesRow}
        ListEmptyComponent={
          <EmptyState
            selectedSemesterId={selectedSemesterId}
            isTeacher={isTeacher}
          />
        }
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    );
  };

  const renderHeader = () => {
    return (
      <HeaderComponent
        leftIcons={[{name: 'arrow-back', onPress: () => navigation.goBack()}]}
        title={isTeacher ? 'Môn học phụ trách' : 'Khóa học'}
        navigation={navigation}
        rightIcons={[{name: 'refresh', onPress: handleRefresh}]}
      />
    );
  };

  // ============= RENDER CHÍNH =============
  return (
    <View style={styles.container}>
      {renderHeader()}

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={
            isTeacher ? 'Tìm kiếm môn học...' : 'Tìm kiếm khóa học...'
          }
          value={searchInputValue}
          onChangeText={text => {
            setSearchInputValue(text);
            debouncedSearch(text);
          }}
        />
        <TouchableOpacity style={styles.filterButton}>
          <IconFeather name="sliders" size={20} color={appColors.text} />
        </TouchableOpacity>
      </View>

      <SemesterSelector
        selectedSemesterName={selectedSemesterName}
        openSemesterSelector={openSemesterSelector}
      />

      <StatusTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SemesterModal
        visible={isSemesterModalVisible}
        onClose={() => setIsSemesterModalVisible(false)}
        semesters={semesters}
        selectedSemesterId={selectedSemesterId}
        formatSemesterName={formatSemesterName}
        handleSelectSemester={handleSelectSemester}
      />

      {renderCourseList()}
    </View>
  );
};

// ============= STYLES =============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: appColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  semesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  semesterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  semesterText: {
    fontSize: 15,
    fontWeight: '500',
    color: appColors.text,
    marginLeft: 8,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabsScrollContainer: {
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: appColors.white,
  },
  activeTab: {
    backgroundColor: appColors.primary,
  },
  tabText: {
    fontSize: 14,
    color: appColors.text,
    fontWeight: '500',
  },
  activeTabText: {
    color: appColors.white,
    fontWeight: 'bold',
  },
  coursesList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  coursesRow: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: appColors.text,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: appColors.gray2,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Styles cho modal học kỳ
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: appColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text,
  },
  semesterList: {
    paddingVertical: 12,
  },
  semesterItem: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedSemesterItem: {
    backgroundColor: `${appColors.primary}15`,
    borderRadius: 8,
  },
  semesterItemText: {
    fontSize: 16,
    color: appColors.text,
  },
  selectedSemesterItemText: {
    color: appColors.primary,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  currentBadge: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: appColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Course;
