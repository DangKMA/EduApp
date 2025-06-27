import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Schedule from '../screens/schedule/Schedule';
import CourseDetail from '../screens/schedule/CourseDetail';

const ScheduleNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ✅ Đổi tên để tránh trùng với Tab name "Schedule" */}
      <Stack.Screen name="ScheduleMain" component={Schedule} />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetail} // Assuming you have a detail screen in Schedule
      />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator;
