import React, {useState, useCallback, useEffect} from 'react';
import {StyleSheet, View, Image, Switch} from 'react-native';
import ButtonComponent from '../../components/ButtonComponent';
import TextComponent from '../../components/TextComponent';
import {appColors} from '../../constants/appColors';
import InputComponent from '../../components/InputComponent';
import {CallCalling, Lock} from 'iconsax-react-native';
import RowComponent from '../../components/RowComponent';
import LoadingModal from '../../modals/Loading';
import useAuth from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const Login = ({navigation}: any) => {
  // State for form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isRemember, setIsRemember] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  // Get auth functionality from custom hook
  const {handleLogin, isLoading, renderAlert} = useAuth(navigation);

  // Force reset form on component first mount
  useEffect(() => {
    ('Login component mounted for the first time');
    const resetFormOnMount = async () => {
      // Clear form
      setEmail('');
      setPassword('');
      setIsRemember(true);

      // Clear logout flag
      await AsyncStorage.removeItem('isLoggedOut');

      // Load saved credentials if remember option was selected
      if (isRemember) {
        await loadSavedCredentials();
      }
    };

    resetFormOnMount();
  }, []);

  // Handle focus events (when navigating back to this screen)
  useFocusEffect(
    useCallback(() => {
      ('Login screen focused');

      const handleScreenFocus = async () => {
        try {
          // Check if user just logged out
          const isComingFromLogout = await AsyncStorage.getItem('isLoggedOut');
          'Logout status:', isComingFromLogout;

          if (isComingFromLogout === 'true') {
            ('User just logged out - resetting form');

            // IMPORTANT: Force clear form completely
            setEmail('');
            setPassword('');
            setIsRemember(true);

            // Clear logout flag
            await AsyncStorage.removeItem('isLoggedOut');

            // Remove saved credentials (optional)
            await AsyncStorage.removeItem('rememberedEmail');
            await AsyncStorage.removeItem('rememberedPassword');

            ('Form and credentials cleared successfully');
          } else if (isFirstLoad) {
            // First time loading and not coming from logout
            ('First load - attempting to load saved credentials');
            await loadSavedCredentials();
            setIsFirstLoad(false);
          }
        } catch (error) {
          'Error in useFocusEffect:', error;
        }
      };

      // Execute immediately
      handleScreenFocus();

      // Cleanup function if needed
      return () => {
        // Any cleanup here
      };
    }, [isFirstLoad]),
  );

  // Save credentials to AsyncStorage
  const saveCredentials = async (userEmail: string, userPassword: string) => {
    if (isRemember) {
      try {
        await AsyncStorage.setItem('rememberedEmail', userEmail);
        await AsyncStorage.setItem('rememberedPassword', userPassword);
        ('Credentials saved successfully');
      } catch (error) {
        'Error saving credentials:', error;
      }
    } else {
      try {
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        ('Credentials removed successfully');
      } catch (error) {
        'Error removing credentials:', error;
      }
    }
  };

  // Load saved credentials from AsyncStorage
  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      ('Checking for saved credentials...');

      if (savedEmail && savedPassword) {
        ('Found saved credentials - populating form');
        setEmail(savedEmail);
        setPassword(savedPassword);
        setIsRemember(true);
      } else {
        ('No saved credentials found');
      }
    } catch (error) {
      'Error loading credentials:', error;
    }
  };

  // Handle login button press
  const onPressLogin = async () => {
    try {
      ('Login button pressed');

      // Save credentials based on remember option
      if (isRemember) {
        await saveCredentials(email, password);
      } else {
        // Clean up saved credentials if not remembering
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
      }

      // Proceed with login
      await handleLogin(email, password);
    } catch (error) {
      'Error during login:', error;
    }
  };

  // UI Rendering
  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} />
      {renderAlert && renderAlert()}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.formContainer}>
        <TextComponent
          text="Đăng nhập"
          title
          // eslint-disable-next-line react-native/no-inline-styles
          styles={{textAlign: 'center', marginBottom: 20}}
        />

        <TextComponent text="Email" />
        <InputComponent
          value={email}
          onChange={setEmail}
          placeholder="Email"
          type="email-address"
          allowClear
          affix={<CallCalling size={22} color={appColors.gray2} />}
        />

        <TextComponent text="Nhập mật khẩu" />
        <InputComponent
          value={password}
          onChange={setPassword}
          placeholder="Nhập mật khẩu"
          type="default"
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />

        <RowComponent
          justify="space-between"
          styles={{marginVertical: 20, marginTop: -16}}>
          <RowComponent justify="flex-start">
            <Switch
              value={isRemember}
              onValueChange={setIsRemember}
              thumbColor={appColors.white}
              trackColor={{true: appColors.primary, false: appColors.gray2}}
            />
            <TextComponent text="Nhớ mật khẩu" styles={{marginLeft: 8}} />
          </RowComponent>
          <ButtonComponent
            text="Quên mật khẩu?"
            type="link"
            onPress={() =>
              navigation.navigate('ForgotPassword', {email: email})
            }
          />
        </RowComponent>

        <ButtonComponent
          text="ĐĂNG NHẬP"
          type="primary"
          onPress={onPressLogin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 8},
  logoContainer: {alignItems: 'center', marginBottom: 20},
  logo: {width: 240, height: 240, resizeMode: 'contain'},
  formContainer: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
});

export default Login;
