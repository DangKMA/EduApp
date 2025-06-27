import React, {ReactNode} from 'react';
import {StyleSheet, View, ViewStyle, TouchableOpacity} from 'react-native';
import {appColors} from '../constants/appColors';

interface CardProps {
  children: ReactNode;
  styles?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

const CardComponent: React.FC<CardProps> = ({
  children,
  styles: customStyles,
  onPress,
  disabled = false,
}) => {
  // Nếu có onPress, render TouchableOpacity, ngược lại render View
  if (onPress) {
    return (
      <TouchableOpacity
        style={[defaultStyles.container, customStyles]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  // Mặc định render View
  return (
    <View style={[defaultStyles.container, customStyles]}>{children}</View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
    borderColor: appColors.gray2 + '30',
  },
});

export default CardComponent;
