import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import HeaderComponent from '../../components/HeaderCompunent';
import CustomAlert from '../../components/CustomAlert';
import CustomModal from '../../components/CustomModal'; // ✅ THÊM import CustomModal
import useUserProfile from '../../hooks/useUser';
import {appColors} from '../../constants/appColors';
import {User} from '../../redux/reducers/userReducer';
import IconFeather from 'react-native-vector-icons/Feather';

interface ProfileProps {
  navigation: any;
  route: any;
}

const Profile: React.FC<ProfileProps> = ({navigation, route}) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState<boolean>(false);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(true);

  // Modal states
  const [editInfoModal, setEditInfoModal] = useState<boolean>(false);
  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);
  const [, setEditAvatarModal] = useState<boolean>(false);

  // ✅ CustomAlert states
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'warning' | 'error' | 'info' | 'question',
    title: '',
    message: '',
    buttons: [] as any[],
  });

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const {
    isLoading,
    userData,
    getUserById,
    getUserByUserID,
    updateUserProfile,
    changePassword,
    updateUserAvatar,
    renderAlert,
  } = useUserProfile();

  // ✅ Helper functions cho CustomAlert
  const showCustomAlert = (
    type: 'success' | 'warning' | 'error' | 'info' | 'question',
    title: string,
    message: string,
    buttons: any[] = [{text: 'OK', onPress: () => hideCustomAlert()}],
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      buttons,
    });
  };

  const hideCustomAlert = () => {
    setAlertConfig(prev => ({...prev, visible: false}));
  };

  // First, fetch current user from AsyncStorage
  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        setIsLocalLoading(true);
        const userInfoString = await AsyncStorage.getItem('userInfo');
        'Profile - Raw userInfo from storage:', userInfoString;

        if (userInfoString) {
          const response = JSON.parse(userInfoString);
          'Profile - Parsed response:', response;

          let userData;
          if (response.success && response.data) {
            if (response.data.user) {
              userData = response.data.user;
              'Profile - Using response.data.user:', userData;
            } else {
              userData = response.data;
              'Profile - Using response.data:', userData;
            }
          } else if (response.user) {
            userData = response.user;
            'Profile - Using response.user:', userData;
          } else {
            userData = response;
            'Profile - Using direct response:', userData;
          }

          'Profile - Final userData to set:', userData;
          setLocalUser(userData);
        } else {
          ('Profile - No userInfo found in storage');
        }
      } catch (error) {
        console.error(
          'Profile - Error fetching user from AsyncStorage:',
          error,
        );
      } finally {
        setIsLocalLoading(false);
      }
    };

    fetchLocalUser();
  }, []);

  // Then, fetch profile data based on route params or local user
  useEffect(() => {
    const fetchUserData = async () => {
      let success = false;

      if (route.params?.userId) {
        success = await getUserById(route.params.userId);
        if (localUser && localUser._id === route.params.userId) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }
      } else if (route.params?.userID) {
        success = await getUserByUserID(route.params.userID);
        if (localUser && localUser.userID === route.params.userID) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }
      } else if (localUser?._id) {
        success = await getUserById(localUser._id);
        setIsOwnProfile(true);
      }

      if (!success && localUser?._id) {
        await getUserById(localUser._id);
        setIsOwnProfile(true);
      }
    };

    if (!isLocalLoading) {
      fetchUserData();
    }
  }, [localUser, route.params, isLocalLoading]);

  useEffect(() => {
    if (userData) {
      'Profile - Hook userData updated:', userData;
      setUserProfile(userData);
      setEditForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        dob: userData.dob || '',
      });
    }
  }, [userData]);

  useEffect(() => {
    'Profile - Current userProfile state:', userProfile;
  }, [userProfile]);

  // ✅ SỬA: Xử lý cập nhật thông tin với CustomAlert
  const handleUpdateInfo = async () => {
    if (!userProfile?._id) return;

    // Validate form
    if (!editForm.fullName.trim()) {
      showCustomAlert('error', 'Lỗi', 'Họ tên không được để trống');
      return;
    }

    if (!editForm.email.trim()) {
      showCustomAlert('error', 'Lỗi', 'Email không được để trống');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showCustomAlert('error', 'Lỗi', 'Email không đúng định dạng');
      return;
    }

    // Phone validation
    if (editForm.phone && !/^[0-9]{10,11}$/.test(editForm.phone)) {
      showCustomAlert('error', 'Lỗi', 'Số điện thoại phải từ 10-11 chữ số');
      return;
    }

    const success = await updateUserProfile(userProfile._id, {
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      dob: editForm.dob,
    });

    if (success) {
      setEditInfoModal(false);

      if (userProfile) {
        const updatedUser = {
          ...userProfile,
          fullName: editForm.fullName.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
          dob: editForm.dob,
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    }
  };

  // ✅ SỬA: Xử lý đổi mật khẩu với CustomAlert
  const handleChangePassword = async () => {
    // Validate form
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showCustomAlert('error', 'Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showCustomAlert('error', 'Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showCustomAlert('error', 'Lỗi', 'Xác nhận mật khẩu không khớp');
      return;
    }

    const success = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );

    if (success) {
      setChangePasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  // ✅ SỬA: Xử lý đổi avatar với CustomAlert
  const handleChangeAvatar = () => {
    showCustomAlert(
      'question',
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Thư viện ảnh',
          style: 'default',
          onPress: () => {
            hideCustomAlert();
            openImageLibrary();
          },
        },
        {
          text: 'Chụp ảnh',
          style: 'primary',
          onPress: () => {
            hideCustomAlert();
            openCamera();
          },
        },
      ],
    );
  };

  const openImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      },
      response => {
        if (response.assets && response.assets[0]) {
          uploadAvatar(response.assets[0]);
        }
      },
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      },
      response => {
        if (response.assets && response.assets[0]) {
          uploadAvatar(response.assets[0]);
        }
      },
    );
  };

  const uploadAvatar = async (asset: any) => {
    if (!userProfile?._id) return;

    const formData = new FormData();
    formData.append('avatar', {
      uri: asset.uri,
      type: asset.type,
      name: asset.fileName || 'avatar.jpg',
    } as any);

    const success = await updateUserAvatar(userProfile._id, formData);
    if (success) {
      setEditAvatarModal(false);

      if (userData) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      }
    }
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  if (isLoading || isLocalLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            if (localUser?._id) {
              getUserById(localUser._id);
            }
          }}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getAvatarSource = () => {
    if (
      userProfile.avatar &&
      userProfile.avatar !== 'https://www.gravatar.com/avatar/default'
    ) {
      return {uri: userProfile.avatar};
    }
    return require('../../assets/images/logo.png');
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return '#4CAF50';
    if (gpa >= 3.0) return '#2196F3';
    if (gpa >= 2.5) return '#FF9800';
    if (gpa >= 2.0) return '#FF5722';
    return '#F44336';
  };

  const getGPARank = (gpa: number) => {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
  };

  const renderStudentInfo = () => {
    if (userProfile.role === 'student' && userProfile.studentInfo) {
      return (
        <>
          <View style={styles.gpaHighlightCard}>
            <View style={styles.gpaIconContainer}>
              <IconFeather name="award" size={24} color="#FFD700" />
            </View>
            <View style={styles.gpaContent}>
              <Text style={styles.gpaTitle}>Điểm trung bình tích lũy</Text>
              <View style={styles.gpaValueContainer}>
                <Text
                  style={[
                    styles.gpaMainValue,
                    {color: getGPAColor(userProfile.studentInfo.gpa || 0)},
                  ]}>
                  {userProfile.studentInfo.gpa || '0.00'}
                </Text>
                <Text style={styles.gpaMaxValue}>/4.0</Text>
              </View>
              <Text
                style={[
                  styles.gpaRank,
                  {color: getGPAColor(userProfile.studentInfo.gpa || 0)},
                ]}>
                {getGPARank(userProfile.studentInfo.gpa || 0)}
              </Text>
            </View>
            <View style={styles.gpaProgressContainer}>
              <View style={styles.gpaProgressBar}>
                <View
                  style={[
                    styles.gpaProgress,
                    {
                      width: `${
                        ((userProfile.studentInfo.gpa || 0) / 4.0) * 100
                      }%`,
                      backgroundColor: getGPAColor(
                        userProfile.studentInfo.gpa || 0,
                      ),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Khoa</Text>
              <Text style={styles.infoValue}>
                {userProfile.studentInfo.faculty || 'Chưa cập nhật'}
              </Text>
            </View>
            <View style={styles.infoItemRight}>
              <Text style={styles.infoLabel}>Lớp</Text>
              <Text style={styles.infoValue}>
                {userProfile.studentInfo.className || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>
        </>
      );
    }
    return null;
  };

  const renderTeacherInfo = () => {
    if (userProfile.role === 'teacher' && userProfile.teacherInfo) {
      return (
        <>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Khoa/Bộ môn</Text>
              <Text style={styles.infoValue}>
                {userProfile.teacherInfo.department || 'Chưa cập nhật'}
              </Text>
            </View>
            <View style={styles.infoItemRight}>
              <Text style={styles.infoLabel}>Chức vụ</Text>
              <Text style={styles.infoValue}>
                {userProfile.teacherInfo.position || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Học vị</Text>
              <Text style={styles.infoValue}>
                {userProfile.teacherInfo.degree || 'Chưa cập nhật'}
              </Text>
            </View>
          </View>
        </>
      );
    }
    return null;
  };

  const getTitle = () => {
    if (userProfile.role === 'student') return 'Hồ sơ sinh viên';
    if (userProfile.role === 'teacher') return 'Hồ sơ giảng viên';
    return 'Hồ sơ người dùng';
  };

  const getUserStatus = () => {
    return userProfile.status || 'offline';
  };

  const rightIcons = isOwnProfile
    ? [
        {
          name: 'more-vertical',
          onPress: () => {
            showCustomAlert(
              'question',
              'Tùy chọn',
              'Chọn hành động bạn muốn thực hiện',
              [
                {
                  text: 'Hủy',
                  style: 'cancel',
                  onPress: () => hideCustomAlert(),
                },
                {
                  text: 'Sửa thông tin',
                  style: 'default',
                  icon: (
                    <IconFeather
                      name="edit"
                      size={16}
                      color={appColors.white}
                    />
                  ),
                  onPress: () => {
                    hideCustomAlert();
                    setEditInfoModal(true);
                  },
                },
                {
                  text: 'Đổi avatar',
                  style: 'default',
                  icon: (
                    <IconFeather
                      name="camera"
                      size={16}
                      color={appColors.white}
                    />
                  ),
                  onPress: () => {
                    hideCustomAlert();
                    handleChangeAvatar();
                  },
                },
                {
                  text: 'Đổi mật khẩu',
                  style: 'primary',
                  icon: (
                    <IconFeather
                      name="lock"
                      size={16}
                      color={appColors.white}
                    />
                  ),
                  onPress: () => {
                    hideCustomAlert();
                    setChangePasswordModal(true);
                  },
                },
              ],
            );
          },
          color: appColors.primary,
          size: 20,
        },
      ]
    : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Chưa cập nhật';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={appColors.white} />

      {isOwnProfile ? (
        <HeaderComponent
          title={getTitle()}
          showBack={true}
          navigation={navigation}
          showNotification={true}
          rightIcons={rightIcons}
        />
      ) : (
        <HeaderComponent
          showBack={true}
          navigation={navigation}
          showAvatar={true}
          avatarSource={userProfile.avatar}
          userName={userProfile.fullName}
          userStatus={getUserStatus() as 'online' | 'offline' | 'away'}
          showPhoneCall={!!userProfile.phone}
          onPhoneCallPress={() => {
            /* Implement phone call functionality */
          }}
          rightIcons={[]}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isOwnProfile ? handleChangeAvatar : undefined}
            activeOpacity={isOwnProfile ? 0.7 : 1}>
            <Image source={getAvatarSource()} style={styles.avatar} />
            {isOwnProfile && (
              <View style={styles.avatarEditOverlay}>
                <IconFeather name="camera" size={16} color={appColors.white} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>
            {userProfile.fullName || 'Người dùng'}
          </Text>
          <View style={styles.idContainer}>
            <Text style={styles.studentId}>{userProfile.userID || 'N/A'}</Text>
          </View>
          <Text style={styles.email}>
            {userProfile.email || 'Chưa cập nhật'}
          </Text>

          {isOwnProfile && (
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setEditInfoModal(true)}>
                <IconFeather name="edit" size={16} color={appColors.primary} />
                <Text style={styles.quickActionText}>Sửa thông tin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setChangePasswordModal(true)}>
                <IconFeather name="lock" size={16} color={appColors.primary} />
                <Text style={styles.quickActionText}>Đổi mật khẩu</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoCard}>
            {renderStudentInfo()}
            {renderTeacherInfo()}

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <View style={styles.contactValue}>
                  <Text style={styles.infoValue}>
                    {userProfile.phone || 'Chưa cập nhật'}
                  </Text>
                  {userProfile.phone && !isOwnProfile && (
                    <TouchableOpacity style={styles.phoneButton}>
                      <IconFeather
                        name="phone"
                        size={16}
                        color={appColors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Địa chỉ</Text>
                <Text style={styles.infoValue}>
                  {userProfile.address || 'Chưa cập nhật'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày sinh</Text>
                <Text style={styles.infoValue}>
                  {formatDate(userProfile.dob)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Trạng thái tài khoản</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {color: userProfile.isVerified ? '#4CAF50' : '#FF9800'},
                  ]}>
                  {userProfile.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Text>
              </View>
              <View style={styles.infoItemRight}>
                <Text style={styles.infoLabel}>Trạng thái hoạt động</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        getUserStatus() === 'online'
                          ? '#4CAF50'
                          : getUserStatus() === 'away'
                          ? '#FF9800'
                          : '#9E9E9E',
                    },
                  ]}>
                  {getUserStatus() === 'online'
                    ? 'Trực tuyến'
                    : getUserStatus() === 'away'
                    ? 'Vắng mặt'
                    : 'Ngoại tuyến'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ✅ THAY THẾ: Modal sửa thông tin bằng CustomModal */}
      <CustomModal
        visible={editInfoModal}
        onClose={() => setEditInfoModal(false)}
        title="Sửa thông tin cá nhân"
        animationType="slide"
        position="bottom"
        maxHeight="85%">
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ tên *</Text>
            <TextInput
              style={styles.input}
              value={editForm.fullName}
              onChangeText={text => setEditForm({...editForm, fullName: text})}
              placeholder="Nhập họ tên"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={editForm.email}
              onChangeText={text => setEditForm({...editForm, email: text})}
              placeholder="Nhập email"
              keyboardType="email-address"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={editForm.phone}
              onChangeText={text => setEditForm({...editForm, phone: text})}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Địa chỉ</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editForm.address}
              onChangeText={text => setEditForm({...editForm, address: text})}
              placeholder="Nhập địa chỉ"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formatDateForInput(editForm.dob)}
              onChangeText={text => setEditForm({...editForm, dob: text})}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditInfoModal(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleUpdateInfo}
              disabled={isLoading}>
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      {/* ✅ THAY THẾ: Modal đổi mật khẩu bằng CustomModal */}
      <CustomModal
        visible={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
        title="Đổi mật khẩu"
        animationType="slide"
        position="bottom"
        maxHeight="70%">
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.currentPassword}
              onChangeText={text =>
                setPasswordForm({...passwordForm, currentPassword: text})
              }
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.newPassword}
              onChangeText={text =>
                setPasswordForm({...passwordForm, newPassword: text})
              }
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              secureTextEntry
              minLength={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
            <TextInput
              style={styles.input}
              value={passwordForm.confirmPassword}
              onChangeText={text =>
                setPasswordForm({...passwordForm, confirmPassword: text})
              }
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setChangePasswordModal(false)}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleChangePassword}
              disabled={isLoading}>
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      {/* CustomAlert component */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onBackdropPress={hideCustomAlert}
      />

      {renderAlert()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.white,
  },
  errorText: {
    fontSize: 16,
    color: appColors.danger,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  // Avatar styles
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4C68D7',
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: appColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: appColors.white,
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: appColors.black,
  },
  idContainer: {
    backgroundColor: '#E8EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  studentId: {
    fontSize: 14,
    color: '#4C68D7',
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },

  // Quick actions styles
  quickActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  quickActionText: {
    fontSize: 14,
    color: appColors.primary,
    fontWeight: '500',
    marginLeft: 6,
  },

  infoCard: {
    width: '90%',
    backgroundColor: appColors.white,
    borderRadius: 10,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    paddingRight: 10,
  },
  infoItemRight: {
    flex: 1,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: appColors.black,
    fontWeight: '500',
    flex: 1,
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneButton: {
    padding: 6,
    marginLeft: 10,
  },

  // GPA styles
  gpaHighlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8EFFF',
  },
  gpaIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  gpaContent: {
    flex: 1,
  },
  gpaTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '500',
  },
  gpaValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  gpaMainValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  gpaMaxValue: {
    fontSize: 18,
    color: '#888888',
    marginLeft: 2,
    fontWeight: '500',
  },
  gpaRank: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gpaProgressContainer: {
    width: 4,
    height: 60,
    marginLeft: 12,
  },
  gpaProgressBar: {
    width: 4,
    height: '100%',
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  gpaProgress: {
    height: '100%',
    borderRadius: 2,
  },

  // Form styles
  form: {
    gap: 16,
    paddingTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: appColors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: appColors.text,
    backgroundColor: appColors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: appColors.text,
  },
  saveButton: {
    backgroundColor: appColors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
});

export default Profile;
