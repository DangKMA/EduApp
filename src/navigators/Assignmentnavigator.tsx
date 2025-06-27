import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Assignment from '../screens/assignment/Assignment';
import AssignmentDetail from '../screens/assignment/AssignmentDetail';
import SubmitAssignment from '../screens/assignment/SubmitAssignment';

const AssignmentNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Assignment" component={Assignment} />
      <Stack.Screen name="SubmitAssignment" component={SubmitAssignment} />
      <Stack.Screen name="AssignmentDetail" component={AssignmentDetail} />
    </Stack.Navigator>
  );
};

export default AssignmentNavigator;
