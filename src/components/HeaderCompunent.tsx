import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../constants/appColors';
import SpaceComponent from './SpaceComponenet';
import CircleComponent from './CircleCompunent';

interface CustomIconProps {
  name: string;
  onPress?: () => void;
  color?: string;
  size?: number;
  badge?: number;
}

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  navigation?: any;
  showMore?: boolean;
  onMorePress?: () => void;
  showNotification?: boolean;
  onNotificationPress?: () => void;
  leftIcons?: CustomIconProps[];
  rightIcons?: CustomIconProps[];
  titleStyle?: object;
  containerStyle?: object;
  showAvatar?: boolean;
  avatarSource?: string;
  avatarUri?: string; // ✅ THÊM: Prop này được dùng từ Detail.tsx
  userName?: string;
  userStatus?: string; // ✅ SỬA: Từ union type sang string để accept bất kỳ text nào
  isOnline?: boolean; // ✅ THÊM: Prop để override status indicator
  showPhoneCall?: boolean;
  onPhoneCallPress?: () => void;
  onBackPress?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  navigation,
  showMore = false,
  onMorePress,
  showNotification = false,
  onNotificationPress,
  leftIcons = [],
  rightIcons = [],
  titleStyle = {},
  containerStyle = {},
  showAvatar = false,
  avatarSource = '',
  avatarUri, // ✅ THÊM: Destructure avatarUri
  userName = '',
  userStatus, // ✅ SỬA: Bỏ default value và type error
  isOnline = false, // ✅ THÊM: Default false
  showPhoneCall = false,
  onPhoneCallPress,
  onBackPress,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else if (navigation) {
      navigation.navigate('Notifications');
    }
  };

  const handlePhoneCallPress = () => {
    if (onPhoneCallPress) {
      onPhoneCallPress();
    } else {
      ('Phone call pressed');
    }
  };

  const renderIcon = (iconProps: CustomIconProps) => {
    return (
      <TouchableOpacity
        key={iconProps.name}
        style={styles.iconContainer}
        onPress={iconProps.onPress}>
        <CircleComponent
          size={34}
          color={appColors.white}
          styles={styles.iconCircle}>
          <Icon
            name={iconProps.name}
            size={iconProps.size || 24}
            color={iconProps.color || appColors.black}
          />
          {iconProps.badge && iconProps.badge > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {iconProps.badge > 99 ? '99+' : iconProps.badge}
              </Text>
            </View>
          ) : null}
        </CircleComponent>
      </TouchableOpacity>
    );
  };

  // ✅ SỬA: Cải thiện logic hiển thị status
  const getStatusColor = () => {
    if (isOnline) {
      return '#4CAF50'; // Xanh lá = online
    }

    // Fallback: check userStatus text
    if (
      userStatus?.includes('Đang hoạt động') ||
      userStatus?.includes('Vừa mới hoạt động')
    ) {
      return '#4CAF50'; // Xanh lá = online
    } else if (userStatus?.includes('Đang tải')) {
      return '#FFC107'; // Vàng = loading/away
    } else {
      return '#9E9E9E'; // Xám = offline
    }
  };

  const renderUserInfo = () => {
    if (!showAvatar) return null;

    // ✅ SỬA: Ưu tiên avatarUri từ props, fallback về avatarSource
    const displayAvatar = avatarUri || avatarSource;

    return (
      <View style={styles.userContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={
              displayAvatar
                ? {uri: displayAvatar}
                : require('../assets/images/logo.png')
            }
            style={styles.avatar}
          />
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          {/* ✅ SỬA: Hiển thị userStatus text trực tiếp */}
          <Text style={styles.userStatus} numberOfLines={1}>
            {userStatus || 'Không rõ'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <SpaceComponent height={30} />
      <View style={[styles.container, containerStyle]}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleBackPress}>
              <Icon name="arrow-back" size={24} color={appColors.black} />
            </TouchableOpacity>
          ) : null}
          {leftIcons.map(iconProps => renderIcon(iconProps))}
        </View>

        {showAvatar ? (
          renderUserInfo()
        ) : title ? (
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.titlePlaceholder} />
        )}

        <View style={styles.rightSection}>
          {showPhoneCall && (
            <TouchableOpacity
              style={styles.phoneCallButton}
              onPress={handlePhoneCallPress}>
              <CircleComponent
                size={40}
                color={appColors.primary}
                styles={styles.phoneCallCircle}>
                <IconFeather name="phone" size={20} color="#FFFFFF" />
              </CircleComponent>
            </TouchableOpacity>
          )}

          {rightIcons.map(iconProps => renderIcon(iconProps))}

          {showNotification ? (
            <CircleComponent
              size={34}
              color={appColors.white}
              onPress={handleNotificationPress}
              styles={styles.notificationCircle}>
              <Icon name="notifications" size={24} color={appColors.black} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </CircleComponent>
          ) : null}

          {showMore ? (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={onMorePress}>
              <Icon name="more-vert" size={24} color={appColors.black} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  iconContainer: {
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    borderColor: appColors.gray,
  },
  notificationCircle: {
    borderColor: appColors.gray,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.black,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  titlePlaceholder: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: appColors.red,
    borderRadius: 20,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: appColors.white,
    fontSize: 10,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: appColors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
  },
  userStatus: {
    fontSize: 12,
    color: appColors.gray2,
  },
  phoneCallButton: {
    marginHorizontal: 5,
  },
  phoneCallCircle: {
    borderColor: 'transparent',
  },
});

export default HeaderComponent;
