import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Course from '../screens/course/Course';

const CourseNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ✅ Đổi tên để tránh trùng với Tab name "Course" */}
      <Stack.Screen name="CourseMain" component={Course} />
    </Stack.Navigator>
  );
};

export default CourseNavigator;
