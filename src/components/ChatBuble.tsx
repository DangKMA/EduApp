import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {appColors} from '../constants/appColors';

interface ChatBubbleProps {
  message: string;
  isMine: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({message, isMine}) => {
  return (
    <View
      style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {padding: 10, borderRadius: 20, margin: 5, maxWidth: '75%'},
  myBubble: {backgroundColor: appColors.primary, alignSelf: 'flex-end'},
  theirBubble: {backgroundColor: appColors.gray3, alignSelf: 'flex-start'},
  text: {color: appColors.white},
});
