import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/Profile';

const Stack = createNativeStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ✅ Only main profile screen */}
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
