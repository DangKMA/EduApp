import {useState, useCallback} from 'react';
import {NavigationProp} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {addAuth, removeAuth} from '../redux/reducers/authReducer';
import AlertCompunent from '../components/AlertCompunent';
import {UserInfoResponse} from '../types/userType';
import {setUserFromResponse} from '../redux/reducers/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  authService,
  AuthResponse,
  OTPResponse,
  ResetPasswordResponse,
} from '../services/authService';

type RootStackParamList = {
  Main: undefined;
  Login: undefined;
};

const useAuth = (navigation: NavigationProp<RootStackParamList>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
  }>({
    type: 'info',
    message: '',
    visible: false,
  });

  const dispatch = useDispatch();

  const hideAlert = useCallback(() => {
    setAlert(prev => ({...prev, visible: false}));
  }, []);

  const getUserInfo = async (): Promise<UserInfoResponse | null> => {
    try {
      const response: UserInfoResponse = await authService.getUserInfo();
      'getUserInfo response:', JSON.stringify(response);

      if (response && response.success && response.data) {
        dispatch(setUserFromResponse(response));
        return response;
      }

      console.warn('Invalid user info response structure:', response);
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  };

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<void> => {
    setIsLoading(true);

    if (!email || !password) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập đầy đủ thông tin',
        visible: true,
      });
      setIsLoading(false);
      setTimeout(hideAlert, 3000);
      return;
    }

    try {
      const result: AuthResponse = await authService.login(email, password);
      'Login response:', JSON.stringify(result);

      if (result.success && result.data && result.data.token) {
        // Lưu token và thông tin auth vào AsyncStorage
        const authData = {
          token: result.data.token,
          email: result.data.email,
          timestamp: result.timestamp,
        };

        await AsyncStorage.setItem('auth', JSON.stringify(authData));
        'Auth data saved to AsyncStorage:', authData;

        // Lưu token vào Redux
        dispatch(
          addAuth({
            token: result.data.token,
          }),
        );

        // Gọi getUserInfo để lấy thông tin chi tiết của user
        try {
          const userInfoResponse = await getUserInfo();
          'getUserInfo response received:', userInfoResponse;

          if (
            userInfoResponse &&
            userInfoResponse.success &&
            userInfoResponse.data?.user
          ) {
            // Lưu toàn bộ response từ getUserInfo để giữ nguyên structure
            await AsyncStorage.setItem(
              'userInfo',
              JSON.stringify(userInfoResponse), // Lưu toàn bộ response, không chỉ user
            );
            'User info from getUserInfo saved:', userInfoResponse;
          } else {
            console.warn('Invalid getUserInfo response:', userInfoResponse);
          }
        } catch (userInfoError) {
          console.error('Error fetching user info after login:', userInfoError);
        }

        setIsLoading(false);
        setAlert({
          type: 'success',
          message: result.message || 'Đăng nhập thành công',
          visible: true,
        });

        setTimeout(() => navigation.navigate('Main'), 1500);
        setTimeout(hideAlert, 3000);
      } else {
        throw new Error(result.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);

      let errorMessage = 'Email hoặc mật khẩu không chính xác';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      ('Starting logout process...');

      // Set logout flag
      await AsyncStorage.setItem('isLoggedOut', 'true');
      ('isLoggedOut flag set to true');

      // Clear remembered credentials
      await AsyncStorage.removeItem('rememberedEmail');
      await AsyncStorage.removeItem('rememberedPassword');
      ('Remembered credentials cleared');

      // Call logout API
      const result: AuthResponse = await authService.logout();
      'Logout response:', JSON.stringify(result);

      if (result.success) {
        ('Logout successful, removing auth from Redux');

        // Clear Redux state
        dispatch(removeAuth({}));

        setAlert({
          type: 'success',
          message: result.message || 'Đăng xuất thành công',
          visible: true,
        });

        ('Logout process completed successfully');
      } else {
        'Logout service returned error:', result.message;

        setAlert({
          type: 'error',
          message: result.message || 'Không thể đăng xuất',
          visible: true,
        });
      }
    } catch (error: any) {
      console.error('Error during logout:', error);

      let errorMessage = 'Lỗi khi đăng xuất';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
    } finally {
      setIsLoading(false);
      setTimeout(hideAlert, 3000);
    }
  };

  const handleForgotPassword = async (email: string): Promise<boolean> => {
    if (!email) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập email',
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    }

    setIsLoading(true);

    try {
      const response: OTPResponse = await authService.requestPasswordReset(
        email,
      );
      'Password reset request response:', JSON.stringify(response);

      if (response.success) {
        setAlert({
          type: 'success',
          message: response.message || 'Mã OTP đã được gửi đến email của bạn',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return true;
      } else {
        setAlert({
          type: 'error',
          message: response.message || 'Không thể gửi mã OTP',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      console.error('Password reset request error:', error);

      let errorMessage = 'Không thể gửi mã OTP';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (
    email: string,
    otp: string,
  ): Promise<boolean> => {
    if (!email || !otp) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập đầy đủ thông tin',
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    }

    setIsLoading(true);

    try {
      const response: OTPResponse = await authService.verifyOTP(email, otp);
      'OTP verification response:', JSON.stringify(response);

      if (response.success) {
        setAlert({
          type: 'success',
          message: response.message || 'Xác thực OTP thành công',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return true;
      } else {
        setAlert({
          type: 'error',
          message: response.message || 'Mã OTP không hợp lệ',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);

      let errorMessage = 'Mã OTP không hợp lệ';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<boolean> => {
    if (!email || !otp || !newPassword) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập đầy đủ thông tin',
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    }

    setIsLoading(true);

    try {
      const response: ResetPasswordResponse = await authService.resetPassword(
        email,
        otp,
        newPassword,
      );
      'Password reset response:', JSON.stringify(response);

      if (response.success) {
        setAlert({
          type: 'success',
          message: response.message || 'Đặt lại mật khẩu thành công',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return true;
      } else {
        setAlert({
          type: 'error',
          message: response.message || 'Không thể đặt lại mật khẩu',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      console.error('Password reset error:', error);

      let errorMessage = 'Không thể đặt lại mật khẩu';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const renderAlert = () =>
    alert.visible ? (
      <AlertCompunent
        type={alert.type}
        message={alert.message}
        duration={3000}
      />
    ) : null;

  return {
    handleLogin,
    handleLogout,
    getUserInfo,
    handleForgotPassword,
    handleVerifyOTP,
    handleResetPassword,
    isLoading,
    renderAlert,
  };
};

export default useAuth;
