import React, {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import {addAuth, authSelector} from '../redux/reducers/authReducer';

const AppNavigator = () => {
  const [isShowSplash, setIsShowSplash] = useState(true);
  const {getItem} = useAsyncStorage('auth');
  const auth = useSelector(authSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await getItem();
        if (res) {
          dispatch(addAuth(JSON.parse(res)));
        }
      } catch (error) {
        'Error reading auth data:', error;
      }
    };

    checkLogin();

    const timeout = setTimeout(() => {
      setIsShowSplash(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {isShowSplash ? (
        <SplashScreen />
      ) : auth?.token ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </>
  );
};

export default AppNavigator;
