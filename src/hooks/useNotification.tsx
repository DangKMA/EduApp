import {useEffect, useCallback, useRef} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';

const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      ('Android notification permission granted');
      return true;
    } else {
      ('Android notification permission denied');
      return false;
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      ('iOS notification permission granted');
      return true;
    } else {
      ('iOS notification permission denied');
      return false;
    }
  }
};

const createNotificationChannel = async () => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
  return channelId;
};

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

const displayNotification = async (title: string, body: string, data?: any) => {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
};

export const useNotification = () => {
  const notificationReceivedCallbackRef = useRef<
    ((notification: any) => void) | null
  >(null);
  const notificationOpenedCallbackRef = useRef<
    ((notification: any) => void) | null
  >(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      // Request permissions
      await requestUserPermission();

      // Create notification channel for Android
      await createNotificationChannel();

      // Get FCM token
      await getToken();

      // Handle foreground messages
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        if (remoteMessage.notification) {
          // Show local notification
          await displayNotification(
            remoteMessage.notification.title || 'Notification',
            remoteMessage.notification.body || 'You have a new message',
            remoteMessage.data,
          );

          // Call custom callback if exists
          if (notificationReceivedCallbackRef.current) {
            notificationReceivedCallbackRef.current({
              id: remoteMessage.messageId,
              title: remoteMessage.notification.title,
              body: remoteMessage.notification.body,
              data: remoteMessage.data,
              type: remoteMessage.data?.type || 'message',
              timestamp: Date.now(),
            });
          }
        }
      });

      // Handle notification opened app from background
      messaging().onNotificationOpenedApp(remoteMessage => {
        if (notificationOpenedCallbackRef.current && remoteMessage) {
          notificationOpenedCallbackRef.current({
            id: remoteMessage.messageId,
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            data: remoteMessage.data,
            type: remoteMessage.data?.type || 'message',
            timestamp: Date.now(),
          });
        }
      });

      // Check whether an initial notification is available (app opened from quit state)
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            if (notificationOpenedCallbackRef.current) {
              notificationOpenedCallbackRef.current({
                id: remoteMessage.messageId,
                title: remoteMessage.notification?.title,
                body: remoteMessage.notification?.body,
                data: remoteMessage.data,
                type: remoteMessage.data?.type || 'message',
                timestamp: Date.now(),
              });
            }
          }
        });

      // Handle background events (Notifee)
      const backgroundEventListener = notifee.onBackgroundEvent(
        async ({type, detail}) => {
          if (type === EventType.PRESS) {
            ('User pressed notification in background');
          }
        },
      );

      // Handle foreground events (Notifee)
      const foregroundEventListener = notifee.onForegroundEvent(
        ({type, detail}) => {
          if (type === EventType.PRESS) {
            ('User pressed notification in foreground');

            if (
              notificationOpenedCallbackRef.current &&
              detail.notification?.data
            ) {
              notificationOpenedCallbackRef.current({
                id: detail.notification.id,
                title: detail.notification.title,
                body: detail.notification.body,
                data: detail.notification.data,
                type: detail.notification.data.type || 'message',
                timestamp: Date.now(),
              });
            }
          }
        },
      );

      return () => {
        unsubscribe();
        backgroundEventListener();
        foregroundEventListener();
      };
    };

    initializeNotifications();
  }, []);

  // Subscribe to FCM topic
  const subscribeToTopic = useCallback(async (topic: string) => {
    try {
      await messaging().subscribeToTopic(topic);
      `✅ Subscribed to topic: ${topic}`;
    } catch (error) {
      console.error(`❌ Error subscribing to topic ${topic}:`, error);
    }
  }, []);

  // Unsubscribe from FCM topic
  const unsubscribeFromTopic = useCallback(async (topic: string) => {
    try {
      await messaging().unsubscribeFromTopic(topic);
      `✅ Unsubscribed from topic: ${topic}`;
    } catch (error) {
      console.error(`❌ Error unsubscribing from topic ${topic}:`, error);
    }
  }, []);

  // Set callback for notification received
  const onNotificationReceived = useCallback(
    (callback: (notification: any) => void) => {
      notificationReceivedCallbackRef.current = callback;
    },
    [],
  );

  // Set callback for notification opened
  const onNotificationOpened = useCallback(
    (callback: (notification: any) => void) => {
      notificationOpenedCallbackRef.current = callback;
    },
    [],
  );

  // Request permission
  const requestPermission = useCallback(async () => {
    return await requestUserPermission();
  }, []);

  // Get FCM Token
  const getFCMToken = useCallback(async () => {
    return await getToken();
  }, []);

  // Mark notification as read (placeholder - implement based on your backend)
  const markAsRead = useCallback(async (notificationId: string) => {
    `📖 Marking notification as read: ${notificationId}`;
    // Implement your logic to mark notification as read
  }, []);

  return {
    displayNotification,
    getToken: getFCMToken,
    subscribeToTopic,
    unsubscribeFromTopic,
    onNotificationReceived,
    onNotificationOpened,
    requestPermission,
    getFCMToken,
    markAsRead,
  };
};
