import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialsScreen from '../screens/materials/Material';
import MaterialDetailScreen from '../screens/materials/MaterialDetail';

const Stack = createNativeStackNavigator();

const MaterialsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MaterialsList" component={MaterialsScreen} />
      <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
    </Stack.Navigator>
  );
};

export default MaterialsNavigator;
