import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeNavigator from './HomeNavigator';
import DrawerCustom from '../components/DrawerCustom';

const DrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
      }}
      // eslint-disable-next-line react/no-unstable-nested-components
      drawerContent={props => <DrawerCustom {...props} />}>
      <Drawer.Screen name="HomeNavigator" component={HomeNavigator} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
