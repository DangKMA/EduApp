import {useState, useCallback} from 'react';
import {NavigationProp} from '@react-navigation/native';
import AlertCompunent from '../components/AlertCompunent';
// Import passwordService thay vì authenticationAPI
import {passwordService} from '../services/passwordService';

type PasswordResetStackParamList = {
  Login: undefined;
  ForgotPassword: {email?: string};
  Verication: {email: string};
  ResetPassword: {email: string; otp: string};
};

const usePasswordReset = (
  navigation: NavigationProp<PasswordResetStackParamList>,
) => {
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

  const hideAlert = useCallback(() => {
    setAlert(prev => ({...prev, visible: false}));
  }, []);

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);

    if (!email) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập địa chỉ email',
        visible: true,
      });
      setIsLoading(false);
      setTimeout(hideAlert, 3000);
      return false;
    }

    try {
      // Sử dụng passwordService thay vì gọi API trực tiếp
      const res = await passwordService.requestPasswordReset(email);

      setIsLoading(false);

      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || 'Mã OTP đã được gửi đến email của bạn',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        navigation.navigate('Verication', {email});
        return true;
      } else {
        setAlert({
          type: 'error',
          message: res.message || 'Không thể gửi mã OTP',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.message || 'Không thể gửi mã OTP đến email';
      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);

    if (!email || !otp) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập đầy đủ thông tin',
        visible: true,
      });
      setIsLoading(false);
      setTimeout(hideAlert, 3000);
      return false;
    }

    try {
      // Sử dụng passwordService thay vì gọi API trực tiếp
      const res = await passwordService.verifyOTP(email, otp);

      setIsLoading(false);

      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || 'Xác minh OTP thành công',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        navigation.navigate('ResetPassword', {email, otp});
        return true;
      } else {
        setAlert({
          type: 'error',
          message: res.message || 'Mã OTP không chính xác',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.message || 'Không thể xác minh mã OTP';
      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
    }
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<boolean> => {
    setIsLoading(true);

    if (!email || !otp || !newPassword) {
      setAlert({
        type: 'warning',
        message: 'Vui lòng nhập đầy đủ thông tin',
        visible: true,
      });
      setIsLoading(false);
      setTimeout(hideAlert, 3000);
      return false;
    }

    try {
      // Sử dụng passwordService thay vì gọi API trực tiếp
      const res = await passwordService.resetPassword(email, otp, newPassword);

      setIsLoading(false);

      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || 'Mật khẩu đã được đặt lại thành công',
          visible: true,
        });
        setTimeout(() => {
          hideAlert();
          navigation.navigate('Login');
        }, 3000);
        return true;
      } else {
        setAlert({
          type: 'error',
          message: res.message || 'Không thể đặt lại mật khẩu',
          visible: true,
        });
        setTimeout(hideAlert, 3000);
        return false;
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage =
        error?.message || 'Không thể đặt lại mật khẩu cho tài khoản';
      setAlert({
        type: 'error',
        message: errorMessage,
        visible: true,
      });
      setTimeout(hideAlert, 3000);
      return false;
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
    requestPasswordReset,
    verifyOTP,
    resetPassword,
    isLoading,
    renderAlert,
  };
};

export default usePasswordReset;
