import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import AppNavigator from './src/navigators/AppNavigator';
import store from './src/redux/store';
import {AlertProvider} from './src/hooks/useAlert';
import {useNotification} from './src/hooks/useNotification';

const App = () => {
  useNotification();
  return (
    <>
      <Provider store={store}>
        <AlertProvider>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />

          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AlertProvider>
      </Provider>
    </>
  );
};

export default App;
