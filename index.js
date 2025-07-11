/**
 * @format
 */
import messaging from '@react-native-firebase/messaging';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  'Message handled in the background!', remoteMessage;
});

AppRegistry.registerComponent(appName, () => App);
