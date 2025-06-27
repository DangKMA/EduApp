import React, {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {appColors} from '../../constants/appColors';
import {Avatar} from '../../components/Avatar';
import HeaderComponent from '../../components/HeaderCompunent';
import {useChatDetail, Message} from '../../hooks/useChatDetail';
import useUserProfile from '../../hooks/useUser';
import {useNotification} from '../../hooks/useNotification';
import Icon from 'react-native-vector-icons/Ionicons';

const Detail = ({navigation, route}: any) => {
  const {chatId, otherUserName, otherUserId} = route.params;

  const {
    messages,
    loading,
    error,
    sending,
    currentUser,
    activeUserId,
    isFirebaseReady,
    hasUnreadMessages,
    sendMessage,
    markAsRead,
    retry,
    getMessageTime,
    getOtherUser,
  } = useChatDetail(chatId, otherUserId);

  const {
    isLoading: userLoading,
    userData: otherUserData,
    getUserById,
  } = useUserProfile();

  // ✅ SỬA ĐỔI: Sử dụng useNotification hook đúng cách
  const {
    subscribeToTopic,
    unsubscribeFromTopic,
    onNotificationReceived,
    onNotificationOpened,
    requestPermission,
    getFCMToken,
    markAsRead: markNotificationAsRead,
  } = useNotification();

  const [inputText, setInputText] = useState<string>('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Refs để tránh re-render loop
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const currentOtherUserIdRef = useRef<string | null>(null);
  const isNotificationInitializedRef = useRef<boolean>(false);

  // ✅ THÊM LOG: Component mount
  useEffect(() => {
    console.log(
      '🚀==================== COMPONENT MOUNTED ====================',
    );
    console.log('🚀 Detail component mounted');
    console.log('🚀 Route params:', JSON.stringify(route.params, null, 2));
    console.log('🚀 Initial state:', {
      chatId,
      otherUserName,
      otherUserId,
      activeUserId,
      isFirebaseReady,
    });
    console.log(
      '🚀==================== END COMPONENT MOUNTED ====================',
    );
  }, []);

  // ✅ THÊM LOG: Messages state change
  useEffect(() => {
    console.log('📬==================== MESSAGES UPDATED ====================');
    console.log('📬 Messages updated:', {
      count: messages.length,
      loading,
      error,
      hasUnreadMessages,
    });

    if (messages.length > 0) {
      console.log('📬 Latest message from server:', {
        id: messages[0]._id,
        text: messages[0].text.substring(0, 50) + '...',
        from: messages[0].user.name,
        time: messages[0].createdAt,
      });
    }
    console.log(
      '📬==================== END MESSAGES UPDATED ====================',
    );
  }, [messages, loading, error, hasUnreadMessages]);

  // ✅ SỬA ĐỔI: Initialize notification system với log chi tiết
  useEffect(() => {
    const initializeNotifications = async () => {
      console.log(
        '🔄==================== NOTIFICATION INIT START ====================',
      );
      console.log('🔄 Starting notification initialization...');
      console.log('🔍 Current state:', {
        activeUserId,
        chatId,
        otherUserId,
        isInitialized: isNotificationInitializedRef.current,
      });

      if (isNotificationInitializedRef.current) {
        console.log('ℹ️ Notifications already initialized, skipping...');
        console.log(
          '🔄==================== NOTIFICATION INIT END (SKIPPED) ====================',
        );
        return;
      }

      try {
        console.log('🔐 Requesting notification permission...');
        // Request permission
        const hasPermission = await requestPermission();
        console.log('🔐 Permission result:', hasPermission);

        if (hasPermission) {
          console.log('🔔 Getting FCM token...');
          // Get FCM token
          const token = await getFCMToken();
          console.log('🔔 FCM Token received:', token ? 'Yes' : 'No');
          console.log('🔔 FCM Token value:', token);

          // Subscribe to topics
          if (activeUserId) {
            console.log(`📝 Subscribing to user topic: user_${activeUserId}`);
            await subscribeToTopic(`user_${activeUserId}`);
            console.log(`✅ Successfully subscribed to user_${activeUserId}`);
          }

          if (chatId) {
            console.log(`📝 Subscribing to chat topic: chat_${chatId}`);
            await subscribeToTopic(`chat_${chatId}`);
            console.log(`✅ Successfully subscribed to chat_${chatId}`);
          }

          isNotificationInitializedRef.current = true;
          console.log('✅ Notification system fully initialized');
        } else {
          console.log(
            '❌ Notification permission denied - notifications will not work',
          );
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      }
      console.log(
        '🔄==================== NOTIFICATION INIT END ====================',
      );
    };

    if (activeUserId && chatId) {
      console.log('🚀 Prerequisites met, initializing notifications...');
      initializeNotifications();
    } else {
      console.log('⏳ Waiting for prerequisites:', {
        hasActiveUserId: !!activeUserId,
        hasChatId: !!chatId,
      });
    }

    // Cleanup on unmount
    return () => {
      console.log(
        '🧹==================== NOTIFICATION CLEANUP START ====================',
      );
      console.log('🧹 Starting notification cleanup...');
      if (chatId) {
        console.log(`🧹 Unsubscribing from chat_${chatId}`);
        unsubscribeFromTopic(`chat_${chatId}`).catch(err =>
          console.error('❌ Error unsubscribing from chat:', err),
        );
      }
      if (activeUserId) {
        console.log(`🧹 Unsubscribing from user_${activeUserId}`);
        unsubscribeFromTopic(`user_${activeUserId}`).catch(err =>
          console.error('❌ Error unsubscribing from user:', err),
        );
      }
      console.log('🧹 Notification cleanup completed');
      console.log(
        '🧹==================== NOTIFICATION CLEANUP END ====================',
      );
    };
  }, [
    activeUserId,
    chatId,
    requestPermission,
    getFCMToken,
    subscribeToTopic,
    unsubscribeFromTopic,
  ]);

  // ✅ SỬA ĐỔI: Handle notification callbacks với log chi tiết
  useEffect(() => {
    console.log(
      '🔧==================== CALLBACK SETUP START ====================',
    );
    console.log('🔧 Setting up notification callbacks...');

    // Handle notification received while in chat
    const handleNotificationReceived = (notification: any) => {
      console.log(
        '==================== NOTIFICATION RECEIVED ====================',
      );
      console.log(
        '📱 Raw notification data:',
        JSON.stringify(notification, null, 2),
      );
      console.log('📱 Notification type:', typeof notification);
      console.log('📱 Current chat context:', {
        currentChatId: chatId,
        currentActiveUserId: activeUserId,
      });

      // Validate notification structure
      if (!notification) {
        console.log('❌ Null notification received');
        console.log(
          '==================== END NOTIFICATION RECEIVED ====================',
        );
        return;
      }

      if (!notification.data) {
        console.log('❌ Notification missing data field');
        console.log('📱 Available fields:', Object.keys(notification));
        console.log(
          '==================== END NOTIFICATION RECEIVED ====================',
        );
        return;
      }

      const {
        chatId: notifChatId,
        senderId,
        senderName,
        type,
        messageText,
        timestamp,
      } = notification.data;

      console.log('📱 Parsed notification data:', {
        notifChatId,
        senderId,
        senderName,
        type,
        messageText,
        timestamp,
        notificationId: notification.id,
        notificationBody: notification.body,
      });

      // Check if notification is for this chat
      const isForCurrentChat = notifChatId === chatId;
      const isFromDifferentUser = senderId !== activeUserId;
      const isMessageType = type === 'chat_message';

      console.log('📱 Notification validation:', {
        isForCurrentChat,
        isFromDifferentUser,
        isMessageType,
        shouldProcess: isForCurrentChat && isFromDifferentUser && isMessageType,
      });

      if (isForCurrentChat && isFromDifferentUser && isMessageType) {
        console.log('✅ Processing notification for current chat');

        // Auto mark as read since user is viewing this chat
        if (notification.id) {
          console.log('📖 Marking notification as read:', notification.id);
          markNotificationAsRead(notification.id);
        }

        // Create new message object
        const newMessage: Message = {
          _id: notification.id || `notification_${Date.now()}`,
          text: notification.body || messageText || '',
          createdAt: new Date(
            timestamp || notification.timestamp || Date.now(),
          ),
          user: {
            _id: senderId || 'unknown',
            name: senderName || 'Unknown User',
            avatar:
              notification.data.senderAvatar ||
              'https://www.gravatar.com/avatar/default',
          },
          pending: false,
        };

        console.log(
          '✉️ Created message object:',
          JSON.stringify(newMessage, null, 2),
        );

        // Add message to local state
        setLocalMessages(prev => {
          console.log('🔍 Checking for duplicate messages...');
          console.log('🔍 Current local messages count:', prev.length);

          const exists = prev.some(msg => {
            const sameId = msg._id === newMessage._id;
            const sameTextAndUser =
              msg.text === newMessage.text &&
              msg.user._id === newMessage.user._id;
            const timeDiff = Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(newMessage.createdAt).getTime(),
            );
            const withinTimeWindow = timeDiff < 5000;

            return sameId || (sameTextAndUser && withinTimeWindow);
          });

          if (!exists) {
            console.log('✅ Adding new message to local state');
            console.log('✅ New local messages count:', prev.length + 1);
            return [newMessage, ...prev];
          } else {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
        });
      } else if (!isForCurrentChat && isMessageType) {
        console.log('📬 Showing alert for message from different chat');

        // Show alert for messages from other chats
        Alert.alert(
          '💬 Tin nhắn mới',
          `Từ: ${senderName || 'Unknown'}\n${notification.body || messageText}`,
          [
            {
              text: 'Bỏ qua',
              style: 'cancel',
              onPress: () => console.log('User dismissed notification alert'),
            },
            {
              text: 'Xem',
              onPress: () => {
                console.log('User chose to view notification');
                if (notification.id) {
                  markNotificationAsRead(notification.id);
                }
                navigation.navigate('Detail', {
                  chatId: notifChatId,
                  otherUserId: senderId,
                  otherUserName: senderName,
                });
              },
            },
          ],
        );
      } else {
        console.log('ℹ️ Notification not relevant for current context');
      }

      console.log(
        '==================== END NOTIFICATION RECEIVED ====================',
      );
    };

    // Handle notification opened
    const handleNotificationOpened = (notification: any) => {
      console.log(
        '==================== NOTIFICATION OPENED ====================',
      );
      console.log(
        '📱 Notification opened:',
        JSON.stringify(notification, null, 2),
      );

      if (!notification) {
        console.log('❌ Null notification in opened handler');
        console.log(
          '==================== END NOTIFICATION OPENED ====================',
        );
        return;
      }

      if (notification.id) {
        console.log('📖 Marking opened notification as read:', notification.id);
        markNotificationAsRead(notification.id);
      }

      if (!notification.data) {
        console.log('❌ Opened notification missing data field');
        console.log(
          '==================== END NOTIFICATION OPENED ====================',
        );
        return;
      }

      const {
        chatId: notifChatId,
        senderId,
        senderName,
        type,
      } = notification.data;

      console.log('📱 Opened notification data:', {
        notifChatId,
        senderId,
        senderName,
        type,
        currentChatId: chatId,
      });

      // Navigate to specific chat if different from current
      if (notifChatId && notifChatId !== chatId && type === 'chat_message') {
        console.log('🚀 Navigating to different chat from opened notification');
        navigation.navigate('Detail', {
          chatId: notifChatId,
          otherUserId: senderId,
          otherUserName: senderName,
        });
      } else {
        console.log('ℹ️ Staying on current chat (same chat or invalid data)');
      }

      console.log(
        '==================== END NOTIFICATION OPENED ====================',
      );
    };

    // Set callbacks
    console.log('📞 Registering notification callbacks...');
    onNotificationReceived(handleNotificationReceived);
    onNotificationOpened(handleNotificationOpened);
    console.log('✅ Notification callbacks registered');
    console.log(
      '🔧==================== CALLBACK SETUP END ====================',
    );

    // Cleanup callbacks when component unmounts or dependencies change
    return () => {
      console.log('🧹 Cleaning up notification callbacks...');
      onNotificationReceived(() => {});
      onNotificationOpened(() => {});
      console.log('🧹 Notification callbacks cleaned up');
    };
  }, [
    chatId,
    activeUserId,
    navigation,
    onNotificationReceived,
    onNotificationOpened,
    markNotificationAsRead,
  ]);

  // Memoize getOtherUserId
  const getOtherUserId = useMemo((): string | null => {
    if (otherUserId) return otherUserId;

    if (!messages.length || !activeUserId) return null;

    const otherUserMessage = messages.find(
      msg => msg.user._id !== activeUserId,
    );
    return otherUserMessage?.user._id || null;
  }, [otherUserId, messages, activeUserId]);

  // Memoize fetch function
  const fetchOtherUserData = useCallback(
    async (userId: string, force = false) => {
      const now = Date.now();

      if (!force && now - lastFetchTimeRef.current < 5000) {
        return;
      }

      lastFetchTimeRef.current = now;

      try {
        await getUserById(userId);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },
    [getUserById],
  );

  // Setup polling for user data
  useEffect(() => {
    const userId = getOtherUserId;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!userId) {
      currentOtherUserIdRef.current = null;
      return;
    }

    if (currentOtherUserIdRef.current !== userId || !otherUserData) {
      currentOtherUserIdRef.current = userId;

      fetchOtherUserData(userId, true);

      intervalRef.current = setInterval(() => {
        fetchOtherUserData(userId, true);
      }, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [getOtherUserId, fetchOtherUserData, otherUserData]);

  // Memoize status text
  const getOnlineStatusText = useMemo(() => {
    if (userLoading) return 'Đang tải...';
    if (!otherUserData) return 'Không rõ';

    if (otherUserData.status === 'online') {
      if (otherUserData.lastActive) {
        const now = new Date();
        const lastActive = new Date(otherUserData.lastActive);
        const diffInMinutes = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60),
        );

        if (diffInMinutes <= 5) {
          return 'Đang hoạt động';
        }
      }
    }

    if (otherUserData.lastActive) {
      const now = new Date();
      const lastActive = new Date(otherUserData.lastActive);
      const diffInMinutes = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) {
        return 'Vừa mới hoạt động';
      } else if (diffInMinutes < 60) {
        return `Hoạt động ${diffInMinutes} phút trước`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `Hoạt động ${hours} giờ trước`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days === 1) {
          return 'Hoạt động hôm qua';
        } else if (days < 7) {
          return `Hoạt động ${days} ngày trước`;
        } else {
          return lastActive.toLocaleDateString('vi-VN');
        }
      }
    }

    return 'Không rõ';
  }, [otherUserData, userLoading]);

  // Memoize online status
  const isOtherUserOnline = useMemo(() => {
    if (!otherUserData || otherUserData.status !== 'online') return false;

    if (otherUserData.lastActive) {
      const now = new Date();
      const lastActive = new Date(otherUserData.lastActive);
      const diffInMinutes = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60),
      );
      return diffInMinutes <= 5;
    }

    return false;
  }, [otherUserData]);

  // Check chat ID on mount
  useEffect(() => {
    if (!chatId) {
      Alert.alert('Lỗi', 'Không tìm thấy cuộc trò chuyện', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
  }, [chatId, navigation]);

  // Mark messages as read
  useEffect(() => {
    if (hasUnreadMessages && activeUserId) {
      const timer = setTimeout(() => {
        markAsRead();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasUnreadMessages, activeUserId, markAsRead]);

  // ✅ THÊM LOG: Format messages với log
  const formattedMessages = useMemo(() => {
    console.log(
      '🔄==================== FORMATTING MESSAGES ====================',
    );
    console.log('🔄 Formatting messages...');
    console.log('📊 Input data:', {
      localMessagesCount: localMessages.length,
      messagesCount: messages.length,
      totalBeforeFormatting: localMessages.length + messages.length,
    });

    const combinedMessages = [...localMessages, ...messages];
    console.log('📊 Combined messages count:', combinedMessages.length);

    const uniqueMessages = combinedMessages.reduce((acc, current) => {
      const isDuplicate = acc.find(
        item =>
          item._id === current._id ||
          (item.text === current.text &&
            Math.abs(
              new Date(item.createdAt).getTime() -
                new Date(current.createdAt).getTime(),
            ) < 5000),
      );

      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as Message[]);

    console.log('📊 Unique messages count:', uniqueMessages.length);

    const sortedMessages = uniqueMessages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    console.log('📊 Final formatted messages count:', sortedMessages.length);
    console.log(
      '📊 Latest message:',
      sortedMessages[0]
        ? {
            id: sortedMessages[0]._id,
            text: sortedMessages[0].text.substring(0, 50) + '...',
            from: sortedMessages[0].user.name,
            pending: sortedMessages[0].pending,
          }
        : 'No messages',
    );
    console.log(
      '🔄==================== END FORMATTING MESSAGES ====================',
    );

    return sortedMessages;
  }, [messages, localMessages]);

  // ✅ SỬA ĐỔI: handleSendMessage với log chi tiết
  const handleSendMessage = useCallback(async () => {
    console.log('==================== SENDING MESSAGE ====================');
    console.log('📤 Send message triggered');
    console.log('📤 Input validation:', {
      hasInputText: !!inputText.trim(),
      hasActiveUserId: !!activeUserId,
      hasCurrentUser: !!currentUser,
      inputLength: inputText.length,
    });

    if (!inputText.trim() || !activeUserId || !currentUser) {
      console.log('❌ Send message validation failed');
      console.log(
        '==================== END SENDING MESSAGE ====================',
      );
      return;
    }

    const messageText = inputText.trim();
    console.log('📤 Preparing to send message:', {
      messageText,
      messageLength: messageText.length,
      chatId,
      senderId: activeUserId,
      recipientId: otherUserId,
    });

    setInputText('');
    console.log('✅ Input text cleared');

    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      text: messageText,
      createdAt: new Date(),
      user: {
        _id: activeUserId,
        name: currentUser.fullName || 'You',
        avatar: currentUser.avatar || 'https://www.gravatar.com/avatar/default',
      },
      pending: true,
    };

    console.log(
      '📤 Created temporary message:',
      JSON.stringify(tempMessage, null, 2),
    );
    setLocalMessages(prev => {
      console.log(
        '📤 Adding temp message to local state (current count:',
        prev.length,
        ')',
      );
      return [tempMessage, ...prev];
    });

    try {
      // Prepare notification data
      const notificationData = {
        type: 'chat_message',
        chatId: chatId,
        senderId: activeUserId,
        senderName: currentUser.fullName || 'Người dùng',
        senderAvatar: currentUser.avatar || '',
        recipientId: otherUserId,
        recipientName: otherUserData?.fullName || otherUserName,
        messageText: messageText,
        timestamp: Date.now(),
      };

      console.log(
        '📤 Notification data prepared:',
        JSON.stringify(notificationData, null, 2),
      );
      console.log('📤 Calling sendMessage function...');

      // Send message with notification data
      const result = await sendMessage(messageText, notificationData);

      console.log('📤 Send message result:', result);

      if (result) {
        console.log('✅ Message sent successfully');
        // Remove temp message after successful send
        setTimeout(() => {
          console.log('🧹 Removing temporary message from local state');
          setLocalMessages(prev => {
            const filtered = prev.filter(msg => msg._id !== tempMessage._id);
            console.log('🧹 Local messages after cleanup:', filtered.length);
            return filtered;
          });
        }, 1000);
      } else {
        throw new Error('Send message failed - no result returned');
      }
    } catch (err) {
      console.error('❌ Send message error:', err);
      console.error('❌ Error type:', typeof err);
      console.error(
        '❌ Error message:',
        err instanceof Error ? err.message : 'Unknown error',
      );

      Alert.alert('Lỗi', 'Không thể gửi tin nhắn, vui lòng thử lại');

      console.log('🧹 Removing failed temp message from local state');
      setLocalMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }

    console.log(
      '==================== END SENDING MESSAGE ====================',
    );
  }, [
    inputText,
    activeUserId,
    currentUser,
    sendMessage,
    chatId,
    otherUserId,
    otherUserData,
    otherUserName,
  ]);

  // Render message item
  const renderMessage = useCallback(
    ({item}: {item: Message}) => {
      const isCurrentUser = item.user._id === activeUserId;
      const messageTime = getMessageTime
        ? getMessageTime(item)
        : new Date(item.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          });

      return (
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.messageRight : styles.messageLeft,
          ]}>
          {!isCurrentUser && (
            <View style={styles.avatar}>
              <Avatar size={32} uri={item.user.avatar} />
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
              item.pending && styles.bubblePending,
            ]}>
            <Text
              style={[
                styles.messageText,
                isCurrentUser ? styles.textRight : styles.textLeft,
              ]}>
              {item.text}
            </Text>

            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isCurrentUser ? styles.timeRight : styles.timeLeft,
                ]}>
                {messageTime}
                {item.pending && ' (Đang gửi...)'}
              </Text>

              {isCurrentUser && !item.pending && (
                <Text
                  style={[
                    styles.readStatus,
                    item.read ? styles.readStatusRead : styles.readStatusUnread,
                  ]}>
                  {item.read ? '✓✓' : '✓'}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    },
    [activeUserId, getMessageTime],
  );

  // Memoize header
  const renderHeader = useMemo(() => {
    const otherUser = getOtherUser?.();
    const displayName =
      otherUserData?.fullName ||
      otherUserName ||
      otherUser?.name ||
      'Unknown User';

    const avatarUri = otherUserData?.avatar || otherUser?.avatar;

    return (
      <HeaderComponent
        title="Nhắn tin"
        userName={displayName}
        userStatus={getOnlineStatusText}
        isOnline={isOtherUserOnline}
        showAvatar
        avatarUri={avatarUri}
        leftIcons={[
          {
            name: 'arrow-back',
            onPress: () => navigation.goBack(),
          },
        ]}
        rightIcons={[
          {
            name: 'call',
            onPress: () => {
              Alert.alert(
                'Thông báo',
                'Tính năng gọi điện đang được phát triển',
              );
            },
          },
          {
            name: 'videocam',
            onPress: () => {
              Alert.alert(
                'Thông báo',
                'Tính năng gọi video đang được phát triển',
              );
            },
          },
        ]}
      />
    );
  }, [
    otherUserData,
    otherUserName,
    getOtherUser,
    getOnlineStatusText,
    isOtherUserOnline,
    navigation,
  ]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Loading state
  if (loading && formattedMessages.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
          <Text style={styles.loadingSubtext}>
            Firebase: {isFirebaseReady ? 'Đã kết nối' : 'Đang kết nối...'}
          </Text>
          {userLoading && (
            <Text style={styles.loadingSubtext}>
              Đang tải thông tin người dùng...
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Error state
  if (error && formattedMessages.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {renderHeader}

      {formattedMessages.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
          <Text style={styles.emptySubtext}>
            Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên
          </Text>
          {otherUserData && (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoText}>
                Trò chuyện với: {otherUserData.fullName}
              </Text>
              <Text style={styles.userInfoSubtext}>
                {otherUserData.userID} •{' '}
                {otherUserData.role === 'student' ? 'Sinh viên' : 'Giảng viên'}
              </Text>
              <View style={styles.onlineStatusContainer}>
                <View
                  style={[
                    styles.onlineDot,
                    {
                      backgroundColor: isOtherUserOnline
                        ? '#4CAF50'
                        : '#9E9E9E',
                    },
                  ]}
                />
                <Text style={styles.onlineStatusText}>
                  {getOnlineStatusText}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={formattedMessages}
          renderItem={renderMessage}
          keyExtractor={item => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={appColors.gray4}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
          editable={!sending}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || sending}>
          {sending ? (
            <ActivityIndicator size={16} color={appColors.white} />
          ) : (
            <Icon
              name="send"
              size={20}
              color={
                !inputText.trim() || sending ? appColors.gray4 : appColors.white
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: appColors.gray4,
    fontSize: 14,
  },
  loadingSubtext: {
    marginTop: 5,
    color: appColors.gray3,
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: appColors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: appColors.gray4,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: appColors.gray4,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: appColors.gray3,
    textAlign: 'center',
    marginBottom: 16,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: appColors.gray || '#f8f8f8',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.text,
    marginBottom: 4,
  },
  userInfoSubtext: {
    fontSize: 14,
    color: appColors.gray4,
    marginBottom: 8,
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineStatusText: {
    fontSize: 12,
    color: appColors.gray4,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleLeft: {
    backgroundColor: appColors.gray2 || '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: appColors.primary,
    borderBottomRightRadius: 4,
  },
  bubblePending: {
    opacity: 0.7,
  },
  imageContainer: {
    marginBottom: 4,
  },
  imageText: {
    fontSize: 14,
    color: appColors.primary,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  textLeft: {
    color: appColors.text,
  },
  textRight: {
    color: appColors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  timeLeft: {
    color: appColors.gray4,
  },
  timeRight: {
    color: appColors.white,
    opacity: 0.8,
  },
  readStatus: {
    fontSize: 10,
    marginLeft: 4,
  },
  readStatusRead: {
    color: appColors.white,
    opacity: 0.8,
  },
  readStatusUnread: {
    color: appColors.white,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: appColors.gray2 || '#f0f0f0',
    backgroundColor: appColors.white,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: appColors.gray2 || '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    color: appColors.text,
    maxHeight: 100,
    backgroundColor: appColors.gray || '#f8f8f8',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: appColors.gray3 || '#ccc',
  },
});

export default Detail;
