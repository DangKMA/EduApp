import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  AppState,
  RefreshControl,
} from 'react-native';
import {format} from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HeaderComponent from '../../components/HeaderCompunent';
import useUserProfile from '../../hooks/useUser';
import useSchedule from '../../hooks/useSchedule';
import {appColors} from '../../constants/appColors';
import {User} from '../../redux/reducers/userReducer';

// Import components
import ProfileCard from './components/ProfileCard';
import DateDisplay from './components/DateDisplay';
import ScheduleSection from './components/ScheduleSection';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

const Home = ({navigation}: {navigation: any}) => {
  const {isLoading, renderAlert} = useUserProfile();
  const [user, setUser] = useState<User | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Refs để tracking state và throttling
  const mountedRef = useRef(true);
  const lastUserUpdateRef = useRef(0);
  const lastScheduleUpdateRef = useRef(0);
  const appStartTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    loading: scheduleLoading,
    scheduleItems,
    getScheduleByDate,
    renderAlert: renderScheduleAlert,
  } = useSchedule();

  // ✅ Pull to refresh handler
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh user data
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const response = JSON.parse(userInfoString);
        let userData;
        if (response.success && response.data) {
          userData = response.data.user || response.data;
        } else if (response.user) {
          userData = response.user;
        } else {
          userData = response;
        }
        setUser(userData);
      }

      // Refresh schedule
      if (user?._id) {
        const today = format(new Date(), 'yyyy-MM-dd');
        await getScheduleByDate(today);
      }
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  }, [user?._id, getScheduleByDate]);

  // ✅ Initial user load từ AsyncStorage
  useEffect(() => {
    const fetchUserFromStorage = async () => {
      try {
        setIsLocalLoading(true);
        const userInfoString = await AsyncStorage.getItem('userInfo');

        if (userInfoString) {
          const response = JSON.parse(userInfoString);
          let userData;
          if (response.success && response.data) {
            userData = response.data.user || response.data;
          } else if (response.user) {
            userData = response.user;
          } else {
            userData = response;
          }

          setUser(userData);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setIsLocalLoading(false);
      }
    };

    fetchUserFromStorage();
  }, []);

  // ✅ Smart schedule loading - chỉ load khi cần thiết
  useEffect(() => {
    if (!user?._id) return;

    const loadTodaySchedule = async () => {
      const now = Date.now();

      if (
        now - lastScheduleUpdateRef.current < 5 * 60 * 1000 &&
        lastScheduleUpdateRef.current > 0
      ) {
        return;
      }

      if (!mountedRef.current) return;

      try {
        lastScheduleUpdateRef.current = now;
        const today = format(new Date(), 'yyyy-MM-dd');
        await getScheduleByDate(today);
      } catch (error) {
        // Silent error handling
      }
    };

    loadTodaySchedule();
  }, [user?._id, getScheduleByDate]);

  // ✅ Intelligent adaptive polling
  useEffect(() => {
    if (!user?._id) return;

    let isMounted = true;

    const updateUserData = async () => {
      if (!isMounted || !mountedRef.current) return;

      const now = Date.now();

      if (now - lastUserUpdateRef.current < 60 * 1000) {
        return;
      }

      try {
        lastUserUpdateRef.current = now;
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

          setUser(prevUser => {
            if (
              !prevUser ||
              JSON.stringify(prevUser) !== JSON.stringify(userData)
            ) {
              return userData;
            }
            return prevUser;
          });
        }
      } catch (error) {
        // Silent error handling
      }
    };

    const getPollingInterval = () => {
      const now = Date.now();
      const timeSinceStart = now - appStartTimeRef.current;

      if (timeSinceStart < 2 * 60 * 1000) {
        return 60 * 1000; // 1 phút
      }

      return 5 * 60 * 1000; // 5 phút
    };

    updateUserData();

    const setupPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const currentInterval = getPollingInterval();

      intervalRef.current = setInterval(() => {
        if (isMounted && mountedRef.current) {
          updateUserData();
        }
      }, currentInterval);

      if (currentInterval === 60 * 1000) {
        setTimeout(() => {
          if (isMounted) {
            setupPolling();
          }
        }, 2 * 60 * 1000);
      }
    };

    setupPolling();

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?._id]);

  // ✅ App state awareness
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        mountedRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (nextAppState === 'active') {
        mountedRef.current = true;

        const now = Date.now();
        if (now - lastUserUpdateRef.current > 10 * 60 * 1000) {
          appStartTimeRef.current = now;

          const refreshUser = async () => {
            try {
              const userInfoString = await AsyncStorage.getItem('userInfo');
              if (userInfoString) {
                const response = JSON.parse(userInfoString);
                let userData;
                if (response.success && response.data) {
                  userData = response.data.user || response.data;
                } else if (response.user) {
                  userData = response.user;
                } else {
                  userData = response;
                }
                setUser(userData);
              }
            } catch (error) {
              // Silent error handling
            }
          };

          refreshUser();
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      mountedRef.current = false;
      subscription?.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ✅ Memoize expensive calculations
  const todayScheduleData = useMemo(() => {
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

  // ✅ SỬA: navigateToScreen với Stack navigation structure
  const navigateToScreen = (screenName: string, params = {}) => {
    try {
      // ✅ Handle Stack navigation properly
      switch (screenName) {
        // Tab Navigation
        case 'Profile':
          navigation.navigate('Main', {
            screen: 'Profile',
          });
          break;
        case 'Notification':
          navigation.navigate('Main', {
            screen: 'Notification',
          });
          break;
        case 'Schedule':
          navigation.navigate('Main', {
            screen: 'Schedule',
          });
          break;
        case 'Course':
          navigation.navigate('Main', {
            screen: 'Course',
          });
          break;

        // Stack Navigation
        case 'ScheduleStack':
          navigation.navigate('ScheduleStack', params);
          break;
        case 'CourseStack':
          navigation.navigate('CourseStack', params);
          break;
        case 'AssignmentStack':
          navigation.navigate('AssignmentStack', params);
          break;
        case 'AttendanceStack':
          navigation.navigate('AttendanceStack', params);
          break;
        case 'MaterialStack':
          navigation.navigate('MaterialStack', params);
          break;
        case 'GradeStack':
          navigation.navigate('GradeStack', params);
          break;
        case 'MessageStack':
          navigation.navigate('MessageStack', params);
          break;

        // ✅ Backward compatibility - nếu screen name cũ
        case 'Assignment':
          navigation.navigate('AssignmentStack', {
            screen: 'AssignmentMain',
            params,
          });
          break;
        case 'Attendance':
          navigation.navigate('AttendanceStack', {
            screen: 'AttendanceMain',
            params,
          });
          break;
        case 'Material':
          navigation.navigate('MaterialStack', {
            screen: 'MaterialMain',
            params,
          });
          break;
        case 'Grade':
          navigation.navigate('GradeStack', {
            screen: 'GradeMain',
            params,
          });
          break;
        case 'Message':
          navigation.navigate('MessageStack', {
            screen: 'MessageMain',
            params,
          });
          break;

        // Default case
        default:
          navigation.navigate(screenName, params);
      }
    } catch (error) {
      console.error('❌ [Home] Navigation error:', error);
    }
  };

  if (isLoading || isLocalLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={appColors.primary} barStyle="light-content" />

      {/* Fixed Header */}
      <HeaderComponent
        title="Trang chủ"
        navigation={navigation}
        leftIcons={[
          {
            name: 'menu',
            onPress: () => navigation.openDrawer(),
          },
        ]}
        rightIcons={[
          {
            name: 'notifications',
            onPress: () =>
              // ✅ SỬA: Navigate đến Tab screen
              navigation.navigate('Main', {
                screen: 'Notification',
              }),
          },
          {
            name: 'message',
            onPress: () =>
              // ✅ SỬA: Navigate đến MessageStack
              navigation.navigate('MessageStack', {
                screen: 'MessageMain',
              }),
          },
        ]}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[appColors.primary]}
            tintColor={appColors.primary}
          />
        }>
        {/* Top Section - Profile & Date */}
        <View style={styles.topSection}>
          <ProfileCard
            user={user}
            onPress={() => navigateToScreen('Profile')}
          />
          <DateDisplay />
        </View>

        {/* Main Content Section */}
        <View style={styles.mainContent}>
          {/* Schedule Section - Moved to top */}
          <View style={styles.section}>
            <ScheduleSection
              scheduleLoading={scheduleLoading}
              todayScheduleData={todayScheduleData}
              navigateToScreen={navigateToScreen}
            />
          </View>

          {/* Dashboard Section - Role-based */}
          <View style={styles.section}>
            {user?.role === 'student' ? (
              <StudentDashboard
                user={user}
                navigateToScreen={navigateToScreen}
              />
            ) : (
              <TeacherDashboard
                user={user}
                navigateToScreen={navigateToScreen}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {renderAlert()}
      {renderScheduleAlert()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F8FAFC',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 16,
  },
});

export default Home;
