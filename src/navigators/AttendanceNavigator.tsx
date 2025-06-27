import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Attendance from '../screens/attendance/Attendance';

const AttendanceNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ✅ Đổi tên để tránh trùng với Tab name "Attendance" */}
      <Stack.Screen name="AttendanceMain" component={Attendance} />
    </Stack.Navigator>
  );
};

export default AttendanceNavigator;
