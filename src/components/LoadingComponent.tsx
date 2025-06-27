import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {appColors} from '../constants/appColors';
import TextComponent from './TextComponent';
import SpaceComponent from './SpaceComponenet';

type Props = {
  message?: string;
  fullScreen?: boolean;
};

const LoadingComponent = ({
  message = 'Đang tải...',
  fullScreen = false,
}: Props) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <SpaceComponent height={16} />
        <TextComponent text={message} color={appColors.gray} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={appColors.primary} />
      <SpaceComponent height={16} />
      <TextComponent text={message} color={appColors.gray} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.white,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
});

export default LoadingComponent;
