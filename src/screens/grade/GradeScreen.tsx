import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSelector} from 'react-redux';
import {userSelector} from '../../redux/reducers/userReducer';
import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useGrade from '../../hooks/useGrade';
import {CourseGrade} from '../../types/gradeType';
import {User} from '../../types/userType';

const GradeScreen = ({navigation}: any) => {
  const {getStudentGrades, loading} = useGrade();
  const reduxUser = useSelector(userSelector) as User;
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [stats, setStats] = useState({
    gpa: 0,
    totalCredits: 0,
    completedCourses: 0,
  });

  useEffect(() => {
    const fetchUserFromStorage = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const response = JSON.parse(userInfoString);

          // Xử lý response theo structure từ backend
          let userData;
          if (response.success && response.data && response.data.user) {
            userData = response.data.user;
          } else if (response.user) {
            userData = response.user;
          } else if (response.data) {
            userData = response.data;
          } else {
            userData = response;
          }

          setLocalUser(userData);
        }
      } catch (error) {}
    };

    fetchUserFromStorage();
  }, []);

  useEffect(() => {
    // Animation cho GPA dashboard
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const user = localUser || reduxUser;

  useEffect(() => {
    if (user?._id) {
      loadGradeData();
    }
  }, [user]);
  const loadGradeData = async () => {
    if (user?._id) {
      try {
        const response = await getStudentGrades(user._id);

        if (response && response.success) {
          // Xử lý course grades data - FIX: API trả về data.data thay vì data
          if (
            response.data &&
            response.data?.data &&
            Array.isArray(response.data.data)
          ) {
            setCourseGrades(response.data.data);
          } else if (response.data && Array.isArray(response.data)) {
            // Fallback cho trường hợp API structure khác

            setCourseGrades(response.data);
          }

          // Xử lý stats data - FIX: stats nằm trong data.stats
          if (response.data && response.data.stats) {
            setStats({
              gpa: response.data.stats.gpa || 0,
              totalCredits: response.data.stats.totalCredits || 0,
              completedCourses: response.data.stats.completedCourses || 0,
            });
          } else if (response.stats) {
            setStats({
              gpa: response.stats.gpa || 0,
              totalCredits: response.stats.totalCredits || 0,
              completedCourses: response.stats.completedCourses || 0,
            });
          } else {
            // Fallback: tính toán stats từ user data nếu API không trả về
            const userStats = {
              gpa: user.studentInfo?.gpa || 0,
              totalCredits: user.studentInfo?.totalCredits || 0,
              completedCourses: user.studentInfo?.completedCourses || 0,
            };
            setStats(userStats);
          }
        } else {
          // Fallback to user data from AsyncStorage
          if (user.studentInfo) {
            setStats({
              gpa: user.studentInfo.gpa || 0,
              totalCredits: user.studentInfo.totalCredits || 0,
              completedCourses: user.studentInfo.completedCourses || 0,
            });
          }
        }
      } catch (error) {
        // Fallback to user data on error
        if (user.studentInfo) {
          setStats({
            gpa: user.studentInfo.gpa || 0,
            totalCredits: user.studentInfo.totalCredits || 0,
            completedCourses: user.studentInfo.completedCourses || 0,
          });
        }
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?._id) {
      await loadGradeData();
    }
    setRefreshing(false);
  }, [user]);

  const getGradeColor = (totalValue: number) => {
    if (totalValue >= 8.5) return '#4CAF50';
    if (totalValue >= 7.0) return appColors.primary;
    if (totalValue >= 5.5) return '#FF9800';
    if (totalValue >= 4.0) return '#FF5722';
    return '#F44336';
  };

  const getGradeText = (totalValue: number) => {
    if (totalValue >= 8.5) return 'Xuất sắc';
    if (totalValue >= 7.0) return 'Giỏi';
    if (totalValue >= 5.5) return 'Khá';
    if (totalValue >= 4.0) return 'Trung bình';
    return 'Yếu';
  };

  const getGradeLevel = (gpa: number) => {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
  };

  const handleCoursePress = useCallback(
    (item: CourseGrade) => {
      navigation.navigate('GradeDetail', {
        courseId: item._id,
        courseName: item.courseId?.name || 'Không có tên',
      });
    },
    [navigation],
  );

  const renderGPADashboard = () => {
    const gradeLevel = getGradeLevel(stats.gpa);

    return (
      <Animated.View
        style={[
          styles.gpaBlock,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.primaryBackground}>
          <View style={styles.gpaHeader}>
            <View style={styles.headerIconContainer}>
              <Icon name="school" size={24} color="white" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.gpaTitle}>Kết quả học tập</Text>
              <Text style={styles.gpaSubtitle}>Học kỳ hiện tại</Text>
            </View>
          </View>

          <View style={styles.gpaMainContent}>
            <View style={styles.gpaCircleContainer}>
              <View style={styles.gpaCircle}>
                <View style={styles.gpaInnerCircle}>
                  <Text style={styles.gpaValue}>{stats.gpa.toFixed(2)}</Text>
                  <Text style={styles.gpaLabel}>GPA</Text>
                </View>
              </View>
              <Text style={styles.gradeLevel}>{gradeLevel}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="menu-book" size={20} color="white" />
                </View>
                <Text style={styles.statValue}>{stats.totalCredits}</Text>
                <Text style={styles.statLabel}>Tín chỉ</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="assignment-turned-in" size={20} color="white" />
                </View>
                <Text style={styles.statValue}>{stats.completedCourses}</Text>
                <Text style={styles.statLabel}>Môn học</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Tiến độ học tập</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      transform: [
                        {
                          scaleX: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, Math.min(stats.gpa / 4, 1)],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((stats.gpa / 4) * 100)}%
              </Text>
            </View>
          </View>

          {/* Achievement Badges */}
          <View style={styles.achievementSection}>
            {stats.gpa >= 3.6 && (
              <View style={styles.achievementBadge}>
                <Icon name="emoji-events" size={16} color="#FFD700" />
                <Text style={styles.achievementText}>Học sinh xuất sắc</Text>
              </View>
            )}
            {stats.completedCourses >= 10 && (
              <View style={styles.achievementBadge}>
                <Icon name="verified" size={16} color="#4CAF50" />
                <Text style={styles.achievementText}>
                  Hoàn thành {stats.completedCourses} môn
                </Text>
              </View>
            )}
            {stats.totalCredits >= 50 && (
              <View style={styles.achievementBadge}>
                <Icon name="star" size={16} color="#2196F3" />
                <Text style={styles.achievementText}>
                  {stats.totalCredits} tín chỉ
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };
  // ...existing code...

  const renderCourseItem = useCallback(
    ({item}: {item: CourseGrade; index: number}) => {
      // ✅ SỬA: Xử lý dữ liệu từ API response theo đúng structure
      const totalValue =
        item.finalGrade !== undefined
          ? item.finalGrade // ✅ API trả về finalGrade
          : item.totalGrade !== undefined
          ? item.totalGrade
          : item.scores?.total !== undefined
          ? item.scores.total
          : 0;

      const courseName = item.courseId?.name || 'Chưa có tên';
      const courseCode = item.courseId?.id || item.courseId?.code || 'N/A'; // ✅ API trả về id
      const credits = item.courseId?.credits || 0;
      const letterGrade = item.letterGrade || '';
      const gradeText = getGradeText(totalValue);
      const gradeColor = getGradeColor(totalValue);
      const instructor = item.courseId?.instructorId?.fullName || 'Chưa có GV';

      // ✅ THÊM: Debug log để kiểm tra
      console.log('🔍 Course item data:', {
        itemId: item._id,
        finalGrade: item.finalGrade,
        totalGrade: item.totalGrade,
        totalValue,
        letterGrade: item.letterGrade,
        courseName,
        courseCode,
      });

      return (
        <TouchableOpacity
          style={styles.courseItem}
          onPress={() => handleCoursePress(item)}
          activeOpacity={0.7}>
          <View style={[styles.accentBorder, {backgroundColor: gradeColor}]} />

          <View style={[styles.gradeBlock1, {borderColor: gradeColor + '40'}]}>
            <Text style={[styles.gradeValue1, {color: gradeColor}]}>
              {totalValue.toFixed(1)}
            </Text>
            <Text style={[styles.gradeLetter, {color: gradeColor}]}>
              {letterGrade}
            </Text>
          </View>

          <View style={styles.contentBlock}>
            <Text style={styles.courseName} numberOfLines={1}>
              {courseName}
            </Text>
            <Text style={[styles.courseCode, {color: appColors.primary}]}>
              {courseCode}
            </Text>

            <View style={styles.infoRow}>
              <Icon name="star" size={14} color={appColors.primary} />
              <Text style={styles.infoText}>{credits} tín chỉ</Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="person" size={14} color={appColors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {instructor}
              </Text>
            </View>

            <View style={styles.gradeStatusRow}>
              <View
                style={[
                  styles.gradeStatusBadge,
                  {
                    backgroundColor: gradeColor + '20',
                    borderColor: gradeColor + '40',
                  },
                ]}>
                <Text style={[styles.gradeStatusText, {color: gradeColor}]}>
                  {gradeText}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowBlock}>
            <Icon name="chevron-right" size={20} color={appColors.primary} />
          </View>
        </TouchableOpacity>
      );
    },
    [handleCoursePress],
  );

  // ...existing code...

  const EmptyGrades = () => (
    <View style={styles.emptyBlock}>
      <View style={styles.emptyIconBlock}>
        <Icon name="grade" size={48} color={appColors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có điểm số</Text>
      <Text style={styles.emptySubtitle}>
        Điểm số sẽ được cập nhật sau khi hoàn thành học phần
      </Text>
    </View>
  );

  const hasGrades = courseGrades && courseGrades.length > 0;

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Kết quả học tập"
        navigation={navigation}
        showBack={true}
        titleStyle={{color: appColors.black}}
        rightIcons={[{name: 'refresh', onPress: onRefresh}]}
      />

      <View style={styles.contentContainer}>
        {renderGPADashboard()}

        <View style={styles.gradeSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách môn học</Text>
            <View style={styles.sectionCountBadge}>
              <Text style={styles.sectionCount}>
                {courseGrades?.length || 0} môn
              </Text>
            </View>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>Đang tải điểm số...</Text>
            </View>
          ) : hasGrades ? (
            <FlatList
              data={courseGrades}
              renderItem={renderCourseItem}
              keyExtractor={item => item._id}
              showsVerticalScrollIndicator={false}
              onRefresh={onRefresh}
              refreshing={refreshing}
              contentContainerStyle={styles.flatListContent}
              ItemSeparatorComponent={() => (
                <View style={styles.itemSeparator} />
              )}
            />
          ) : (
            <EmptyGrades />
          )}
        </View>
      </View>
    </View>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  gpaBlock: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  primaryBackground: {
    backgroundColor: appColors.primary,
    borderRadius: 20,
    padding: 20,
  },
  gpaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  gpaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  gpaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  gpaMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gpaCircleContainer: {
    alignItems: 'center',
  },
  gpaCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  gpaInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpaValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  gpaLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  gradeLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
    transformOrigin: 'left',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    minWidth: 35,
  },
  achievementSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'white',
    marginLeft: 4,
  },
  gradeSection: {
    flex: 1,
    backgroundColor: appColors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: appColors.primary + '10',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.primary + '20',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.black,
  },
  sectionCountBadge: {
    backgroundColor: appColors.primary + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.primary + '30',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.primary,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  courseItem: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: appColors.primary + '15',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
  gradeBlock1: {
    alignItems: 'center',
    marginRight: 16,
    paddingLeft: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  gradeValue1: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gradeLetter: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  contentBlock: {
    flex: 1,
    paddingVertical: 4,
  },
  courseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: appColors.black,
    marginBottom: 4,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: appColors.primary + 'AA',
    marginLeft: 4,
    flex: 1,
  },
  gradeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  gradeStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  gradeStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  arrowBlock: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  itemSeparator: {
    height: 12,
  },
  emptyBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconBlock: {
    backgroundColor: appColors.primary + '08',
    padding: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: appColors.primary + '30',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: appColors.primary + '80',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: appColors.primary,
    marginTop: 12,
    fontWeight: '500',
  },
});

export default GradeScreen;
