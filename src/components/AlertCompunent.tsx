// Alert.tsx
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, ViewStyle, Animated} from 'react-native';
import {Warning2, InfoCircle, CloseCircle} from 'iconsax-react-native';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({type, message, duration = 3000}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, duration]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CloseCircle size={24} color="#fff" />;
      case 'error':
        return <CloseCircle size={24} color="#fff" />;
      case 'warning':
        return <Warning2 size={24} color="#fff" />;
      case 'info':
        return <InfoCircle size={24} color="#fff" />;
      default:
        return <InfoCircle size={24} color="#fff" />;
    }
  };

  const getAlertStyle = (): ViewStyle => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      case 'info':
        return styles.info;
      default:
        return styles.info;
    }
  };

  return (
    <Animated.View
      style={[styles.container, getAlertStyle(), {opacity: fadeAnim}]}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  success: {
    backgroundColor: '#28a745',
  },
  error: {
    backgroundColor: '#dc3545',
  },
  warning: {
    backgroundColor: '#ffc107',
  },
  info: {
    backgroundColor: '#17a2b8',
  },
});

export default Alert;
