import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text} from 'react-native';
import {Book, Calendar, Home2, Notification, User} from 'iconsax-react-native';
import {appColors} from '../constants/appColors';
import ScheduleNavigator from './ScheduleNavigator';
import CourseNavigator from './CourseNavigator';
import DrawerNavigator from './DrawerNavigator';
import NotificationScreen from '../screens/notification/Notifiaction';
import ProfileScreen from '../screens/profile/Profile';

const TabNavigator = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70, // ✅ SỬA: Tăng height từ 60 lên 70
          paddingTop: 10, // ✅ SỬA: Tăng padding top từ 8 lên 10
          paddingBottom: 10, // ✅ SỬA: Tăng padding bottom từ 8 lên 10
          backgroundColor: appColors.white,
          borderTopWidth: 1,
          borderTopColor: appColors.gray4,
          elevation: 8,
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.gray2,
        tabBarIcon: ({focused, color}) => {
          let icon;
          const size = focused ? 26 : 24; // ✅ SỬA: Giảm size từ 32/28 xuống 26/24 để cân đối hơn
          switch (route.name) {
            case 'Home':
              icon = <Home2 size={size} variant="Bold" color={color} />;
              break;
            case 'Schedule':
              icon = <Calendar size={size} variant="Bold" color={color} />;
              break;
            case 'Notification':
              icon = <Notification size={size} variant="Bold" color={color} />;
              break;
            case 'Course':
              icon = <Book size={size} variant="Bold" color={color} />;
              break;
            case 'Profile':
              icon = <User size={size} variant="Bold" color={color} />;
              break;
            default:
              icon = <Home2 size={size} variant="Bold" color={color} />;
              break;
          }
          return icon;
        },
        tabBarIconStyle: {
          marginTop: 4, // ✅ SỬA: Giảm marginTop từ 8 xuống 4
          marginBottom: 2, // ✅ THÊM: Thêm marginBottom để cân bằng
        },
        tabBarLabel: ({focused, color}) => {
          let label = '';
          switch (route.name) {
            case 'Home':
              label = 'Trang chủ';
              break;
            case 'Schedule':
              label = 'Lịch học';
              break;
            case 'Notification':
              label = 'Thông báo';
              break;
            case 'Course':
              label = 'Khóa học';
              break;
            case 'Profile':
              label = 'Cá nhân';
              break;
            default:
              label = 'Tab';
              break;
          }

          return (
            <Text
              style={{
                fontSize: 11, // ✅ SỬA: Tăng fontSize từ 10 lên 11
                fontWeight: focused ? '600' : '400', // ✅ SỬA: Dùng số thay vì 'bold'/'normal'
                color: color,
                marginTop: 2, // ✅ SỬA: Tăng marginTop từ -4 lên 2
                textAlign: 'center',
                includeFontPadding: false, // ✅ THÊM: Bỏ padding mặc định của font
                textAlignVertical: 'center', // ✅ THÊM: Căn giữa theo chiều dọc
              }}>
              {label}
            </Text>
          );
        },
        tabBarLabelStyle: {
          marginTop: 0, // ✅ THÊM: Reset margin mặc định
          marginBottom: 2, // ✅ THÊM: Thêm khoảng cách với đáy
        },
      })}>
      <Tab.Screen
        name="Home"
        component={DrawerNavigator}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Home', {
              screen: 'HomeNavigator',
              params: {
                screen: 'Home',
              },
            });
          },
        })}
      />

      <Tab.Screen
        name="Schedule"
        component={ScheduleNavigator}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Schedule', {
              screen: 'ScheduleMain',
            });
          },
        })}
      />

      <Tab.Screen
        name="Course"
        component={CourseNavigator}
        listeners={({navigation}) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Course', {
              screen: 'CourseMain',
            });
          },
        })}
      />

      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
