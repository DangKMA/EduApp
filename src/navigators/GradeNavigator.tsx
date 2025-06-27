// GradesNavigator.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GradeScreen from '../screens/grade/GradeScreen';

// Định nghĩa kiểu params cho stack và export để sử dụng ở các file khác
export type GradeStackParamList = {
  GradeHome: undefined;
  GradeDetail: {courseId: string; courseName: string};
  Transcript: undefined;
  GPA: {
    stats: {
      gpa: number;
      totalCredits: number;
      completedCourses: number;
    };
  };
};

// Sử dụng kiểu params đã định nghĩa
const Stack = createNativeStackNavigator<GradeStackParamList>();

const GradeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GradeHome" component={GradeScreen} />
    </Stack.Navigator>
  );
};

export default GradeNavigator;
