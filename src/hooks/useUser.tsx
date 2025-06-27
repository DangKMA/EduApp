import {useState, useCallback} from 'react';
import AlertCompunent from '../components/AlertCompunent';
import {User, UserInfoResponse} from '../types/userType';
import {userService} from '../services/userService';

const useUserProfile = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
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

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => {
    setAlert({
      type,
      message,
      visible: true,
    });
    setTimeout(hideAlert, 3000);
  };

  const handleError = (error: any) => {
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Đã xảy ra lỗi';
    showAlert('error', errorMessage);
    return false;
  };

  const getUserById = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: UserInfoResponse = await userService.getUserById(id);

      if (res && res.success && res.data?.user) {
        setUserData(res.data.user);
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể lấy thông tin người dùng',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
    }
  };

  const getUserByUserID = async (userID: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: UserInfoResponse = await userService.getUserByUserID(userID);

      if (res && res.success && res.data?.user) {
        setUserData(res.data.user);
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể lấy thông tin người dùng',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
    }
  };

  const updateUserProfile = async (
    id: string,
    profileData: Partial<User>,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: UserInfoResponse = await userService.updateUserProfile(
        id,
        profileData,
      );

      if (res && res.success && res.data?.user) {
        setUserData(res.data.user);
        showAlert('success', res.message || 'Cập nhật thông tin thành công');
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể cập nhật thông tin',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    if (!currentPassword || !newPassword) {
      showAlert('warning', 'Vui lòng nhập đầy đủ thông tin');
      setIsLoading(false);
      return false;
    }

    try {
      const res = await userService.changePassword(
        currentPassword,
        newPassword,
      );

      if (res && res.success) {
        showAlert('success', res.message || 'Đổi mật khẩu thành công');
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể đổi mật khẩu',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
    }
  };

  const updateUserAvatar = async (
    id: string,
    imageData: FormData,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: UserInfoResponse = await userService.updateUserAvatar(
        id,
        imageData,
      );

      if (res && res.success && res.data?.user) {
        setUserData(res.data.user);
        showAlert('success', res.message || 'Cập nhật ảnh đại diện thành công');
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể cập nhật ảnh đại diện',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
    }
  };

  const updateFCMToken = async (fcmToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: UserInfoResponse = await userService.updateFCMToken(fcmToken);

      if (res && res.success && res.data?.user) {
        setUserData(res.data.user);
        setIsLoading(false);
        return true;
      } else {
        showAlert(
          'error',
          res?.error || res?.message || 'Không thể cập nhật FCM token',
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return handleError(error);
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
    isLoading,
    userData,
    getUserById,
    getUserByUserID,
    updateUserProfile,
    changePassword,
    updateUserAvatar,
    updateFCMToken,
    renderAlert,
  };
};

export default useUserProfile;
