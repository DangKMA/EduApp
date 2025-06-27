import React from 'react';
import {Image, StyleSheet} from 'react-native';

interface AvatarProps {
  uri?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({uri, size = 40}) => {
  return (
    <Image
      source={{uri: uri || 'https://via.placeholder.com/150'}}
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2},
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {borderWidth: 1, borderColor: '#ccc'},
});
