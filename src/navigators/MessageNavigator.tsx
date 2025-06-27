import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Message from '../screens/message/Message';
import Detail from '../screens/message/Detail';
import NewChat from '../screens/message/NewChat';

// Định nghĩa type cho params
export type MessageStackParamList = {
  MessageMain: undefined;
  Detail: {
    chatId: string;
    otherUserName: string;
    otherUserId: string;
  };
  NewChat: undefined;
};

const Stack = createNativeStackNavigator<MessageStackParamList>();

const MessageNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MessageMain" component={Message} />
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="NewChat" component={NewChat} />
    </Stack.Navigator>
  );
};

export default MessageNavigator;
