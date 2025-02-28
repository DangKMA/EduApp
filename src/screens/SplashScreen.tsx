import React from 'react';
import {View, Image, ActivityIndicator, StyleSheet} from 'react-native';
import {appColors} from '../constants/appColors';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/splashscreen.png')}
        style={styles.image}
      />
      <ActivityIndicator
        style={styles.loader}
        size="large"
        color={appColors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    bottom: 300,
    alignSelf: 'center',
  },
});

export default SplashScreen;
