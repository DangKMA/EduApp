import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';

import {globalStyles} from '../styles/globalStyles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {appColors} from '../constants/appColors';
import {
  Book,
  Calendar,
  DocumentText,
  Logout,
  MessageQuestion,
  Setting2,
  User,
  Clock,
  Global,
  Lock,
  NotificationBing,
  BrushSquare,
  ProfileCircle,
  Receipt,
  Chart,
  ArrowDown,
  Home2,
  SecurityUser,
  DirectboxSend,
  ClipboardText,
  Note,
  TickCircle,
  Health,
  Edit,
  Activity,
} from 'iconsax-react-native';

import TextComponent from './TextComponent';
import SpaceComponent from './SpaceComponenet';
import CustomAlert from './CustomAlert';
import {useAnnouncement} from '../hooks/useAnnouncement';
import useAuth from '../hooks/useAuth';

const DrawerCustom = ({navigation}: any) => {
  const {handleLogout} = useAuth(navigation);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const {unreadCount} = useAnnouncement();

  const size = 20;
  const color = appColors.gray;
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserFromStorage = async () => {
      try {
        setIsLoading(true);
        const userInfoString = await AsyncStorage.getItem('userInfo');

        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setUser(userInfo);
        }
      } catch (error) {
        console.error('Error fetching user from AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFromStorage();
  }, []);

  const toggleSection = (sectionKey: string) => {
    if (expandedSections.includes(sectionKey)) {
      setExpandedSections(expandedSections.filter(key => key !== sectionKey));
    } else {
      setExpandedSections([...expandedSections, sectionKey]);
    }
  };

  // Common menu items for all users
  const commonMenuItems = [
    {
      key: 'Home',
      title: 'Trang chủ',
      icon: <Home2 size={size} color={color} />,
      subMenu: [
        {key: 'Dashboard', title: 'Bảng điều khiển'},
        {key: 'Announcements', title: 'Thông báo mới'},
        {key: 'Schedule', title: 'Lịch học hôm nay'},
      ],
    },
    {
      key: 'Profile',
      title: 'Thông tin cá nhân',
      icon: <User size={size} color={color} />,
      subMenu: [
        {key: 'MyProfile', title: 'Hồ sơ cá nhân'},
        {key: 'ChangePassword', title: 'Thay đổi mật khẩu'},
        {key: 'EditProfile', title: 'Chỉnh sửa thông tin'},
      ],
    },
    {
      key: 'Schedule',
      title: 'Lịch học',
      icon: <Calendar size={size} color={color} />,
      subMenu: [
        {key: 'WeekSchedule', title: 'Lịch học theo tuần'},
        {key: 'MonthSchedule', title: 'Lịch học theo tháng'},
      ],
    },
    {
      key: 'StudentMaterials',
      title: 'Tài liệu học tập',
      icon: <DocumentText size={size} color={color} />,
      subMenu: [
        {key: 'AllMaterials', title: 'Tất cả tài liệu'},
        {key: 'CourseMaterials', title: 'Tài liệu theo khóa học'},
        {key: 'Downloads', title: 'Tài liệu đã tải'},
      ],
    },
    {
      key: 'Settings',
      title: 'Cài đặt',
      icon: <Setting2 size={size} color={color} />,
      subMenu: [
        {key: 'AppSettings', title: 'Cài đặt ứng dụng'},
        {key: 'NotificationSettings', title: 'Cài đặt thông báo'},
        {key: 'PrivacySecurity', title: 'Quyền riêng tư & Bảo mật'},
        {key: 'Language', title: 'Ngôn ngữ'},
        {key: 'AppTheme', title: 'Giao diện ứng dụng'},
      ],
    },
    {
      key: 'Help',
      title: 'Trợ giúp & Hỗ trợ',
      icon: <MessageQuestion size={size} color={color} />,
      subMenu: [
        {key: 'FAQ', title: 'Câu hỏi thường gặp'},
        {key: 'ContactSupport', title: 'Liên hệ hỗ trợ'},
        {key: 'UserGuide', title: 'Hướng dẫn sử dụng'},
        {key: 'AboutApp', title: 'Về ứng dụng'},
      ],
    },
  ];

  // Student-specific menu items
  const studentMenuItems = [
    {
      key: 'Courses',
      title: 'Khóa học',
      icon: <Book size={size} color={color} />,
      subMenu: [
        {key: 'AllCourses', title: 'Tất cả khóa học'},
        {key: 'CurrentCourses', title: 'Khóa học hiện tại'},
        {key: 'CompletedCourses', title: 'Khóa học đã hoàn thành'},
        {key: 'CourseRegistration', title: 'Đăng ký khóa học'},
      ],
    },
    {
      key: 'Grades',
      title: 'Điểm số & Kết quả',
      icon: <Chart size={size} color={color} />,
      subMenu: [
        {key: 'CurrentGrades', title: 'Điểm học kỳ hiện tại'},
        {key: 'Transcript', title: 'Bảng điểm tổng hợp'},
        {key: 'GPA', title: 'Điểm trung bình tích lũy'},
      ],
    },
    {
      key: 'Attendance',
      title: 'Điểm danh',
      icon: <TickCircle size={size} color={color} />,
      subMenu: [
        {key: 'AttendanceHistory', title: 'Lịch sử điểm danh'},
        {key: 'AttendanceStatistics', title: 'Thống kê điểm danh'},
        {key: 'QRAttendance', title: 'Điểm danh QR'},
      ],
    },
  ];

  // Teacher-specific menu items
  const teacherMenuItems = [
    {
      key: 'Courses',
      title: 'Quản lý khóa học',
      icon: <Book size={size} color={color} />,
      subMenu: [
        {key: 'AllCourses', title: 'Tất cả khóa học'},
        {key: 'CurrentCourses', title: 'Khóa học đang dạy'},
        {key: 'CourseManagement', title: 'Quản lý khóa học'},
        {key: 'AssignmentManagement', title: 'Quản lý bài tập'},
      ],
    },
    {
      key: 'Grades',
      title: 'Quản lý điểm',
      icon: <Chart size={size} color={color} />,
      subMenu: [
        {key: 'GradeInput', title: 'Nhập điểm'},
        {key: 'GradeReview', title: 'Phúc khảo điểm'},
        {key: 'GradeStatistics', title: 'Thống kê điểm số'},
      ],
    },
    {
      key: 'Attendance',
      title: 'Quản lý điểm danh',
      icon: <TickCircle size={size} color={color} />,
      subMenu: [
        {key: 'TakeAttendance', title: 'Điểm danh lớp học'},
        {key: 'CreateQRCode', title: 'Tạo mã QR điểm danh'},
        {key: 'AttendanceReport', title: 'Báo cáo điểm danh'},
      ],
    },
    {
      key: 'TeacherMaterials',
      title: 'Quản lý tài liệu',
      icon: <DocumentText size={size} color={color} />,
      subMenu: [
        {key: 'UploadMaterial', title: 'Tải lên tài liệu'},
        {key: 'ManageMaterials', title: 'Quản lý tài liệu'},
      ],
    },
    {
      key: 'TeachingSchedule',
      title: 'Lịch giảng dạy',
      icon: <Calendar size={size} color={color} />,
      subMenu: [
        {key: 'TeachingSchedule', title: 'Lịch giảng dạy'},
        {key: 'ExamSchedule', title: 'Lịch thi'},
        {key: 'EventSchedule', title: 'Lịch sự kiện khoa'},
      ],
    },
  ];

  // Determine which menu items to show based on user role
  let menuData = [...commonMenuItems];

  if (user?.role === 'student') {
    menuData = menuData.filter(item => item.key !== 'StudentMaterials');
    menuData.splice(2, 0, ...studentMenuItems);
    const materialsItem = commonMenuItems.find(
      item => item.key === 'StudentMaterials',
    );
    if (materialsItem) {
      menuData.splice(5, 0, {...materialsItem, key: 'Materials'});
    }
  } else if (user?.role === 'teacher') {
    menuData = menuData.filter(item => item.key !== 'StudentMaterials');
    menuData.splice(2, 0, ...teacherMenuItems);
  }

  const getSubMenuIcon = (key: string) => {
    switch (key) {
      // Home submenu
      case 'Dashboard':
        return <Home2 size={size - 2} color={color} />;
      case 'Announcements':
        return <Note size={size - 2} color={color} />;
      case 'Schedule':
        return <Calendar size={size - 2} color={color} />;

      // Profile submenu
      case 'MyProfile':
        return <ProfileCircle size={size - 2} color={color} />;
      case 'ChangePassword':
        return <Lock size={size - 2} color={color} />;
      case 'EditProfile':
        return <Edit size={size - 2} color={color} />;

      // Courses submenu
      case 'AllCourses':
        return <Book size={size - 2} color={color} />;
      case 'CurrentCourses':
        return <Book size={size - 2} color={color} />;
      case 'CompletedCourses':
        return <TickCircle size={size - 2} color={color} />;
      case 'CourseRegistration':
        return <Edit size={size - 2} color={color} />;
      case 'CourseManagement':
        return <Setting2 size={size - 2} color={color} />;
      case 'AssignmentManagement':
        return <ClipboardText size={size - 2} color={color} />;

      // Schedule submenu
      case 'WeekSchedule':
        return <Calendar size={size - 2} color={color} />;
      case 'MonthSchedule':
        return <Calendar size={size - 2} color={color} />;
      case 'ExamSchedule':
        return <Note size={size - 2} color={color} />;
      case 'TeachingSchedule':
        return <Calendar size={size - 2} color={color} />;
      case 'EventSchedule':
        return <Calendar size={size - 2} color={color} />;

      // Materials submenu
      case 'AllMaterials':
        return <DocumentText size={size - 2} color={color} />;
      case 'CourseMaterials':
        return <Book size={size - 2} color={color} />;
      case 'Downloads':
        return <ArrowDown size={size - 2} color={color} />;
      case 'UploadMaterial':
        return <DirectboxSend size={size - 2} color={color} />;
      case 'ManageMaterials':
        return <Setting2 size={size - 2} color={color} />;

      // Grades submenu
      case 'CurrentGrades':
        return <Receipt size={size - 2} color={color} />;
      case 'Transcript':
        return <ClipboardText size={size - 2} color={color} />;
      case 'GPA':
        return <Chart size={size - 2} color={color} />;
      case 'GradeInput':
        return <Edit size={size - 2} color={color} />;
      case 'GradeReview':
        return <ClipboardText size={size - 2} color={color} />;
      case 'GradeStatistics':
        return <Chart size={size - 2} color={color} />;

      // Attendance submenu
      case 'AttendanceHistory':
        return <Clock size={size - 2} color={color} />;
      case 'AttendanceStatistics':
        return <Activity size={size - 2} color={color} />;
      case 'QRAttendance':
        return <TickCircle size={size - 2} color={color} />;
      case 'TakeAttendance':
        return <TickCircle size={size - 2} color={color} />;
      case 'CreateQRCode':
        return <DocumentText size={size - 2} color={color} />;
      case 'AttendanceReport':
        return <Chart size={size - 2} color={color} />;

      // Settings submenu
      case 'AppSettings':
        return <Setting2 size={size - 2} color={color} />;
      case 'NotificationSettings':
        return <NotificationBing size={size - 2} color={color} />;
      case 'PrivacySecurity':
        return <SecurityUser size={size - 2} color={color} />;
      case 'Language':
        return <Global size={size - 2} color={color} />;
      case 'AppTheme':
        return <BrushSquare size={size - 2} color={color} />;

      // Help submenu
      case 'FAQ':
        return <MessageQuestion size={size - 2} color={color} />;
      case 'ContactSupport':
        return <Edit size={size - 2} color={color} />;
      case 'UserGuide':
        return <Book size={size - 2} color={color} />;
      case 'AboutApp':
        return <Health size={size - 2} color={color} />;

      default:
        return null;
    }
  };

  const handleSignOut = () => {
    setShowAlert(true);
  };

  const confirmLogout = async () => {
    try {
      setShowAlert(false);
      navigation.closeDrawer();
      await handleLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const cancelLogout = () => {
    setShowAlert(false);
  };

  const handleNavigation = (mainKey: string, subKey: string) => {
    console.log('🔥 Submenu clicked:', mainKey, subKey); // Debug log
    navigation.closeDrawer();

    switch (mainKey) {
      case 'Home':
        if (subKey === 'Dashboard') {
          navigation.navigate('Main', {
            screen: 'Home',
            params: {
              screen: 'HomeNavigator',
            },
          });
        } else if (subKey === 'Announcements') {
          navigation.navigate('Main', {screen: 'Notification'});
        } else if (subKey === 'Schedule') {
          navigation.navigate('Main', {screen: 'Schedule'});
        } else {
          navigation.navigate('Main', {
            screen: 'Home',
            params: {
              screen: 'HomeNavigator',
            },
          });
        }
        break;

      case 'Profile':
        if (subKey === 'MyProfile' || subKey === 'EditProfile') {
          navigation.navigate('Main', {screen: 'Profile'});
        } else if (subKey === 'ChangePassword') {
          navigation.navigate('Main', {
            screen: 'Profile',
            params: {screen: 'ChangePassword'},
          });
        }
        break;

      case 'Courses':
        if (subKey === 'AllCourses' || subKey === 'CurrentCourses') {
          navigation.navigate('Main', {screen: 'Course'});
        } else if (subKey === 'CourseRegistration') {
          navigation.navigate('CourseStack', {screen: 'CourseRegistration'});
        } else if (subKey === 'CourseManagement') {
          navigation.navigate('CourseStack', {screen: 'CourseManagement'});
        } else if (subKey === 'AssignmentManagement') {
          navigation.navigate('AssignmentStack', {screen: 'AssignmentMain'});
        } else if (subKey === 'CompletedCourses') {
          navigation.navigate('Main', {
            screen: 'Course',
            params: {tab: 'completed'},
          });
        }
        break;

      case 'Schedule':
      case 'TeachingSchedule':
        if (user?.role === 'teacher' && subKey === 'TeachingSchedule') {
          navigation.navigate('ScheduleStack', {
            screen: 'ScheduleMain',
            params: {mode: 'teaching'},
          });
        } else if (subKey === 'WeekSchedule') {
          navigation.navigate('Main', {
            screen: 'Schedule',
            params: {view: 'week'},
          });
        } else if (subKey === 'MonthSchedule') {
          navigation.navigate('Main', {
            screen: 'Schedule',
            params: {view: 'month'},
          });
        } else if (subKey === 'ExamSchedule') {
          navigation.navigate('ScheduleStack', {
            screen: 'ScheduleMain',
            params: {mode: 'exam'},
          });
        } else if (subKey === 'EventSchedule') {
          navigation.navigate('ScheduleStack', {
            screen: 'ScheduleMain',
            params: {mode: 'event'},
          });
        } else {
          navigation.navigate('Main', {screen: 'Schedule'});
        }
        break;

      case 'Materials':
      case 'TeacherMaterials':
        if (subKey === 'AllMaterials') {
          navigation.navigate('MaterialStack', {screen: 'MaterialMain'});
        } else if (subKey === 'CourseMaterials') {
          navigation.navigate('MaterialStack', {
            screen: 'MaterialMain',
            params: {filter: 'course'},
          });
        } else if (subKey === 'Downloads') {
          navigation.navigate('MaterialStack', {
            screen: 'MaterialMain',
            params: {filter: 'downloads'},
          });
        } else if (subKey === 'UploadMaterial') {
          navigation.navigate('MaterialStack', {
            screen: 'MaterialMain',
            params: {mode: 'upload'},
          });
        } else if (subKey === 'ManageMaterials') {
          navigation.navigate('MaterialStack', {
            screen: 'MaterialMain',
            params: {mode: 'management'},
          });
        } else {
          navigation.navigate('MaterialStack', {screen: 'MaterialMain'});
        }
        break;

      case 'Grades':
        if (user?.role === 'student') {
          if (subKey === 'CurrentGrades') {
            navigation.navigate('GradeStack', {screen: 'GradeMain'});
          } else if (subKey === 'Transcript') {
            navigation.navigate('GradeStack', {
              screen: 'GradeMain',
              params: {screen: 'Transcript'},
            });
          } else if (subKey === 'GPA') {
            navigation.navigate('GradeStack', {
              screen: 'GradeMain',
              params: {
                screen: 'GPA',
                params: {stats: {gpa: 0, totalCredits: 0, completedCourses: 0}},
              },
            });
          } else {
            navigation.navigate('GradeStack', {screen: 'GradeMain'});
          }
        } else if (user?.role === 'teacher') {
          if (subKey === 'GradeInput') {
            navigation.navigate('GradeStack', {
              screen: 'GradeMain',
              params: {mode: 'input'},
            });
          } else if (subKey === 'GradeReview') {
            navigation.navigate('GradeStack', {
              screen: 'GradeMain',
              params: {mode: 'review'},
            });
          } else if (subKey === 'GradeStatistics') {
            navigation.navigate('GradeStack', {
              screen: 'GradeMain',
              params: {mode: 'statistics'},
            });
          } else {
            navigation.navigate('GradeStack', {screen: 'GradeMain'});
          }
        }
        break;

      case 'Attendance':
        if (user?.role === 'student') {
          if (subKey === 'AttendanceHistory') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'history'},
            });
          } else if (subKey === 'AttendanceStatistics') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'statistics'},
            });
          } else if (subKey === 'QRAttendance') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'qr'},
            });
          } else {
            navigation.navigate('AttendanceStack', {screen: 'AttendanceMain'});
          }
        } else if (user?.role === 'teacher') {
          if (subKey === 'TakeAttendance') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'take'},
            });
          } else if (subKey === 'CreateQRCode') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'qr'},
            });
          } else if (subKey === 'AttendanceReport') {
            navigation.navigate('AttendanceStack', {
              screen: 'AttendanceMain',
              params: {mode: 'report'},
            });
          } else {
            navigation.navigate('AttendanceStack', {screen: 'AttendanceMain'});
          }
        }
        break;

      case 'Settings':
        // Tạm thời navigate về Profile cho các setting
        navigation.navigate('Main', {screen: 'Profile'});
        console.log('Setting action:', subKey);
        break;

      case 'Help':
        // Tạm thời navigate về Profile cho các help
        navigation.navigate('Main', {screen: 'Profile'});
        console.log('Help action:', subKey);
        break;

      default:
        console.log('Chuyển hướng đến:', mainKey, subKey);
    }
  };

  const handleNavigateToMainMenu = (
    mainKey: string,
    _subKey: string = 'default',
  ) => {
    navigation.closeDrawer();

    switch (mainKey) {
      case 'Home':
        navigation.navigate('Main', {
          screen: 'Home',
          params: {
            screen: 'HomeNavigator',
          },
        });
        break;

      case 'Profile':
        navigation.navigate('Main', {screen: 'Profile'});
        break;

      case 'Courses':
        navigation.navigate('Main', {screen: 'Course'});
        break;

      case 'Schedule':
        navigation.navigate('Main', {screen: 'Schedule'});
        break;

      case 'Materials':
      case 'TeacherMaterials':
        navigation.navigate('MaterialStack', {screen: 'MaterialMain'});
        break;

      case 'Grades':
        if (user?.role === 'student') {
          navigation.navigate('GradeStack', {screen: 'GradeMain'});
        } else if (user?.role === 'teacher') {
          navigation.navigate('GradeStack', {screen: 'GradeMain'});
        }
        break;

      case 'Attendance':
        if (user?.role === 'student') {
          navigation.navigate('AttendanceStack', {screen: 'AttendanceMain'});
        } else if (user?.role === 'teacher') {
          navigation.navigate('AttendanceStack', {screen: 'AttendanceMain'});
        }
        break;

      case 'TeachingSchedule':
        navigation.navigate('ScheduleStack', {screen: 'ScheduleMain'});
        break;

      case 'Settings':
        navigation.navigate('Main', {screen: 'Profile'});
        break;

      case 'Help':
        navigation.navigate('Main', {screen: 'Profile'});
        break;

      default:
        console.log('Chuyển hướng đến mục chính:', mainKey);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          localStyles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  return (
    <View style={[localStyles.container]}>
      <TouchableOpacity
        style={localStyles.profileSection}
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Main', {screen: 'Profile'});
        }}>
        {user?.avatar ? (
          <Image source={{uri: user.avatar}} style={[localStyles.avatar]} />
        ) : (
          <View
            style={[localStyles.avatar, {backgroundColor: appColors.gray2}]}>
            <TextComponent
              title
              size={22}
              color={appColors.white}
              text={user?.fullName?.charAt(0) || 'U'}
            />
          </View>
        )}
        <View style={localStyles.profileInfo}>
          <TextComponent
            text={user?.fullName || 'Người dùng'}
            title
            size={18}
          />
          <TextComponent
            text={`${user?.role === 'student' ? 'MSSV' : 'ID'}: ${
              user?.userID || 'N/A'
            }`}
            size={14}
            color={appColors.gray}
          />
          <TextComponent
            text={`${user?.role === 'student' ? 'Lớp' : 'Khoa'}: ${
              user?.studentInfo?.className ||
              user?.teacherInfo?.department ||
              'N/A'
            }`}
            size={14}
            color={appColors.gray}
          />
        </View>
      </TouchableOpacity>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={menuData}
        style={localStyles.menuList}
        renderItem={({item}) => (
          <View>
            <View style={localStyles.menuItemContainer}>
              <TouchableOpacity
                style={localStyles.menuTitleContainer}
                onPress={() => handleNavigateToMainMenu(item.key)}>
                {item.icon}
                <View style={localStyles.menuTitleContent}>
                  <TextComponent
                    text={item.title}
                    styles={localStyles.listItemText}
                  />
                  {item.badge && (
                    <View style={localStyles.badgeContainer}>
                      <TextComponent
                        text={item.badge > 99 ? '99+' : item.badge.toString()}
                        size={10}
                        color={appColors.white}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={localStyles.menuArrowContainer}
                onPress={() => toggleSection(item.key)}>
                <MaterialCommunityIcons
                  name={
                    expandedSections.includes(item.key)
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={22}
                  color={appColors.gray}
                />
              </TouchableOpacity>
            </View>

            {expandedSections.includes(item.key) &&
              item.subMenu.map(subItem => (
                <TouchableOpacity
                  key={subItem.key}
                  style={localStyles.subListItem}
                  onPress={() => handleNavigation(item.key, subItem.key)}
                  activeOpacity={0.7}>
                  <View style={localStyles.subMenuIcon}>
                    {getSubMenuIcon(subItem.key)}
                  </View>
                  <TextComponent
                    text={subItem.title}
                    styles={localStyles.subListItemText}
                  />
                </TouchableOpacity>
              ))}
          </View>
        )}
      />

      <View style={{justifyContent: 'flex-start', flexDirection: 'row'}}>
        <TouchableOpacity
          style={[globalStyles.button, localStyles.logoutButton]}
          onPress={handleSignOut}>
          <Logout size={22} color={appColors.danger} />
          <SpaceComponent width={8} />
          <TextComponent color={appColors.danger} text="Đăng xuất" />
        </TouchableOpacity>
      </View>

      {/* Custom Logout Alert */}
      <CustomAlert
        visible={showAlert}
        type="logout"
        title="Xác nhận đăng xuất"
        message={`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản "${
          user?.fullName || 'Người dùng'
        }" không?`}
        buttons={[
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: cancelLogout,
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            icon: <Logout size={16} color="#fff" />,
            onPress: confirmLogout,
          },
        ]}
        showCloseButton={true}
        onBackdropPress={cancelLogout}
      />
    </View>
  );
};

export default DrawerCustom;

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
    backgroundColor: appColors.white,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
    paddingBottom: 16,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuList: {
    flex: 1,
    marginVertical: 12,
  },
  menuItemContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: appColors.gray2,
    alignItems: 'center',
  },
  menuTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  menuTitleContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  menuArrowContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  listItemText: {
    paddingLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  subListItem: {
    flexDirection: 'row', // Thêm flexDirection
    alignItems: 'center', // Thêm alignItems
    paddingVertical: 12, // Tăng padding
    paddingHorizontal: 16, // Thêm padding horizontal
    justifyContent: 'flex-start',
    paddingLeft: 24,
    backgroundColor: appColors.gray2 + '22',
    marginVertical: 1,
    borderRadius: 8,
    minHeight: 44, // Đảm bảo touch area đủ lớn
  },
  subListItemText: {
    paddingLeft: 12,
    fontSize: 14,
    color: appColors.gray,
  },
  subMenuIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    height: 'auto',
    borderWidth: 0,
  },
  badgeContainer: {
    backgroundColor: appColors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
});
