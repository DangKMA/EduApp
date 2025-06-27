import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AttendanceNavigator from './AttendanceNavigator';
import AssignmentNavigator from './Assignmentnavigator';
import ScheduleNavigator from './ScheduleNavigator';
import GradeNavigator from './GradeNavigator';
import MaterialNavigator from './MaterialNavigator';
import CourseNavigator from './CourseNavigator';
import MessageNavigator from './MessageNavigator';

const MainNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ✅ Main Tab Navigator */}
      <Stack.Screen name="Main" component={TabNavigator} />
      {/* ✅ Stack Navigators - Tên duy nhất, không trùng với Tab names */}
      <Stack.Screen name="AttendanceStack" component={AttendanceNavigator} />
      <Stack.Screen name="AssignmentStack" component={AssignmentNavigator} />
      <Stack.Screen name="ScheduleStack" component={ScheduleNavigator} />
      <Stack.Screen name="GradeStack" component={GradeNavigator} />
      <Stack.Screen name="MaterialStack" component={MaterialNavigator} />
      <Stack.Screen name="CourseStack" component={CourseNavigator} />
      <Stack.Screen name="MessageStack" component={MessageNavigator} />
      {/* Giả sử Message nằm trong TabNavigator */}
    </Stack.Navigator>
  );
};

export default MainNavigator;
