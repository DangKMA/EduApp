import React from 'react';
import {View, StyleSheet} from 'react-native';
import TextComponent from './TextComponent';
import SpaceComponent from './SpaceComponenet';
import {appColors} from '../constants/appColors';

type Props = {
  icon?: React.ReactNode;
  message: string;
  subMessage?: string;
};

const EmptyListMessage = ({icon, message, subMessage}: Props) => {
  return (
    <View style={styles.container}>
      {icon}
      <SpaceComponent height={16} />
      <TextComponent text={message} size={16} color={appColors.gray} />
      {subMessage && (
        <TextComponent
          text={subMessage}
          size={14}
          color={appColors.gray}
          styles={{textAlign: 'center', marginTop: 8}}
        />
      )}
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
});

export default EmptyListMessage;
