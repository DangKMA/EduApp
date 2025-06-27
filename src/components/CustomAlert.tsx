import React, {useRef, useEffect} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import {
  TickCircle,
  Warning2,
  CloseCircle,
  MessageQuestion,
  InfoCircle,
  Logout,
} from 'iconsax-react-native';
import {appColors} from '../constants/appColors';
import TextComponent from './TextComponent';
import SpaceComponent from './SpaceComponenet';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  icon?: React.ReactNode;
}

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'warning' | 'error' | 'info' | 'question' | 'logout';
  onBackdropPress?: () => void;
  showCloseButton?: boolean;
  customIcon?: React.ReactNode;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{text: 'OK'}],
  type = 'info',
  onBackdropPress,
  showCloseButton = false,
  customIcon,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleValue, opacityValue]);

  const getAlertConfig = () => {
    const configs = {
      success: {
        icon: <TickCircle size={36} color={appColors.success} variant="Bold" />,
        color: appColors.success,
        backgroundColor: appColors.success + '15',
        borderColor: appColors.success + '30',
      },
      warning: {
        icon: <Warning2 size={36} color={appColors.warning} variant="Bold" />,
        color: appColors.warning,
        backgroundColor: appColors.warning + '15',
        borderColor: appColors.warning + '30',
      },
      error: {
        icon: <CloseCircle size={36} color={appColors.danger} variant="Bold" />,
        color: appColors.danger,
        backgroundColor: appColors.danger + '15',
        borderColor: appColors.danger + '30',
      },
      question: {
        icon: (
          <MessageQuestion size={36} color={appColors.primary} variant="Bold" />
        ),
        color: appColors.primary,
        backgroundColor: appColors.primary + '15',
        borderColor: appColors.primary + '30',
      },
      logout: {
        icon: <Logout size={36} color={appColors.danger} variant="Bold" />,
        color: appColors.danger,
        backgroundColor: appColors.danger + '15',
        borderColor: appColors.danger + '30',
      },
      info: {
        icon: <InfoCircle size={36} color={appColors.info} variant="Bold" />,
        color: appColors.info,
        backgroundColor: appColors.info + '15',
        borderColor: appColors.info + '30',
      },
    };

    return configs[type] || configs.info;
  };

  const getButtonConfig = (buttonStyle?: string) => {
    const configs = {
      cancel: {
        backgroundColor: appColors.gray + '20',
        textColor: appColors.text,
        borderColor: appColors.gray + '40',
      },
      destructive: {
        backgroundColor: appColors.danger,
        textColor: appColors.white,
        borderColor: appColors.danger,
      },
      primary: {
        backgroundColor: appColors.primary,
        textColor: appColors.white,
        borderColor: appColors.primary,
      },
      default: {
        backgroundColor: appColors.primary,
        textColor: appColors.white,
        borderColor: appColors.primary,
      },
    };

    return configs[buttonStyle as keyof typeof configs] || configs.default;
  };

  const alertConfig = getAlertConfig();

  const handleClose = () => {
    onBackdropPress?.();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.5)"
        barStyle="light-content"
      />

      <Animated.View style={[styles.overlay, {opacity: opacityValue}]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}>
          <Animated.View
            style={[
              styles.alertContainer,
              {
                transform: [{scale: scaleValue}],
                borderColor: alertConfig.borderColor,
              },
            ]}>
            <TouchableOpacity activeOpacity={1} style={styles.contentContainer}>
              {/* Close Button */}
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}>
                  <CloseCircle size={24} color={appColors.gray} />
                </TouchableOpacity>
              )}

              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: alertConfig.backgroundColor},
                ]}>
                {customIcon || alertConfig.icon}
              </View>

              <SpaceComponent height={20} />

              {/* Title */}
              {title && (
                <>
                  <TextComponent
                    text={title}
                    title
                    size={22}
                    color={appColors.text}
                    styles={styles.titleText}
                  />
                  <SpaceComponent height={12} />
                </>
              )}

              {/* Message */}
              {message && (
                <>
                  <TextComponent
                    text={message}
                    size={16}
                    color={appColors.gray}
                    styles={styles.messageText}
                  />
                  <SpaceComponent height={32} />
                </>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.length === 1 ? (
                  // Single Button
                  <TouchableOpacity
                    style={[
                      styles.singleButton,
                      {
                        backgroundColor: getButtonConfig(buttons[0].style)
                          .backgroundColor,
                        borderColor: getButtonConfig(buttons[0].style)
                          .borderColor,
                      },
                    ]}
                    onPress={buttons[0].onPress}
                    activeOpacity={0.8}>
                    {buttons[0].icon && (
                      <>
                        {buttons[0].icon}
                        <SpaceComponent width={8} />
                      </>
                    )}
                    <TextComponent
                      text={buttons[0].text}
                      color={getButtonConfig(buttons[0].style).textColor}
                      font="medium"
                      size={16}
                    />
                  </TouchableOpacity>
                ) : (
                  // Multiple Buttons
                  <View style={styles.multipleButtonsContainer}>
                    {buttons.map((button, index) => {
                      const buttonConfig = getButtonConfig(button.style);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.multipleButton,
                            {
                              backgroundColor: buttonConfig.backgroundColor,
                              borderColor: buttonConfig.borderColor,
                            },
                            index === 0 && styles.firstButton,
                          ]}
                          onPress={button.onPress}
                          activeOpacity={0.8}>
                          <View style={styles.buttonContent}>
                            {button.icon && (
                              <>
                                {button.icon}
                                <SpaceComponent width={6} />
                              </>
                            )}
                            <TextComponent
                              text={button.text}
                              color={buttonConfig.textColor}
                              font="medium"
                              size={15}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: appColors.white,
    borderRadius: 24,
    width: width * 0.88,
    maxWidth: 380,
    maxHeight: height * 0.8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
  },
  contentContainer: {
    padding: 28,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  messageText: {
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  buttonContainer: {
    width: '100%',
  },
  singleButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    minHeight: 52,
  },
  multipleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  multipleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 48,
  },
  firstButton: {
    marginRight: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomAlert;
