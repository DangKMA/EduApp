import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {appColors} from '../../constants/appColors';
import {Avatar} from '../../components/Avatar';
import HeaderComponent from '../../components/HeaderCompunent';
import Icon from 'react-native-vector-icons/Ionicons';
import {useChat} from '../../hooks/useChat';
import {useNotification} from '../../hooks/useNotification';
import {ChatListItem} from '../../types/chatType';
import {MessageStackParamList} from '../../navigators/MessageNavigator';

type MessageScreenNavigationProp = NativeStackNavigationProp<
  MessageStackParamList,
  'Message'
>;

interface Props {
  navigation: MessageScreenNavigationProp;
}

const Message: React.FC<Props> = ({navigation}) => {
  const {chats, loading, error, getChats, searchChats} = useChat();
  const {
    onNotificationReceived,
    onNotificationOpened,
    requestPermission,
    getFCMToken,
    markAsRead,
  } = useNotification();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);

  // Initialize notifications when component mounts
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request permission
      await requestPermission();

      // Get FCM token
      const token = await getFCMToken();
      if (token) {
        ('📱 FCM Token obtained in Message screen');
      }

      // Subscribe to user-specific topic (if you have user ID)
      // await subscribeToTopic(`user_${userId}`);
    };

    initializeNotifications();
  }, [requestPermission, getFCMToken]);

  // Handle notification received while in message list
  useEffect(() => {
    const handleNotificationReceived = (notification: any) => {
      if (notification.type === 'message') {
        // Show alert for new message
        Alert.alert(
          '💬 Tin nhắn mới',
          `Từ: ${notification.data?.senderName || 'Unknown'}\n${
            notification.body
          }`,
          [
            {text: 'Bỏ qua', style: 'cancel'},
            {
              text: 'Xem',
              onPress: () => {
                markAsRead(notification.id);
                navigation.navigate('Detail', {
                  chatId: notification.data?.chatId,
                  otherUserId: notification.data?.senderId,
                  otherUserName: notification.data?.senderName,
                });
              },
            },
          ],
        );

        // Refresh chat list to show new message
        getChats();
      }
    };

    const handleNotificationOpened = (notification: any) => {
      if (notification.type === 'message') {
        markAsRead(notification.id);
        navigation.navigate('Detail', {
          chatId: notification.data?.chatId,
          otherUserId: notification.data?.senderId,
          otherUserName: notification.data?.senderName,
        });
      }
    };

    onNotificationReceived(handleNotificationReceived);
    onNotificationOpened(handleNotificationOpened);
  }, [
    navigation,
    onNotificationReceived,
    onNotificationOpened,
    markAsRead,
    getChats,
  ]);

  useEffect(() => {
    const searchResults = searchChats(searchQuery);
    if (activeTab === 'unread') {
      setFilteredChats(searchResults.filter(chat => chat.unread > 0));
    } else {
      setFilteredChats(searchResults);
    }
  }, [searchQuery, activeTab, chats, searchChats]);

  const handleRefresh = useCallback(() => {
    getChats();
  }, [getChats]);

  const createNewChat = useCallback(() => {
    navigation.navigate('NewChat');
  }, [navigation]);

  const renderChatItem = ({item}: {item: ChatListItem}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('Detail', {
          chatId: item.id,
          otherUserName: item.name,
          otherUserId: item.userInfo.id,
        })
      }>
      <View style={styles.avatarContainer}>
        <Avatar size={56} uri={item.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>

        <View style={styles.chatFooter}>
          <Text
            style={[
              styles.chatMessage,
              item.unread > 0 && styles.chatMessageUnread,
            ]}
            numberOfLines={1}>
            {item.lastMessage}
          </Text>

          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.emptySubtext}>Đang tải...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon
            name="alert-circle-outline"
            size={60}
            color={appColors.danger}
          />
          <Text style={styles.emptyText}>Có lỗi xảy ra</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'unread' && filteredChats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon
            name="checkmark-circle-outline"
            size={60}
            color={appColors.gray3}
          />
          <Text style={styles.emptyText}>Không có tin nhắn chưa đọc</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="chatbubble-ellipses-outline"
          size={60}
          color={appColors.gray3}
        />
        <Text style={styles.emptyText}>Không có cuộc trò chuyện nào</Text>
        <Text style={styles.emptySubtext}>Bắt đầu cuộc trò chuyện mới</Text>
      </View>
    );
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Icon
          name="search"
          size={20}
          color={appColors.gray4}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Tìm kiếm"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={appColors.gray4} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
        onPress={() => setActiveTab('all')}>
        <Text
          style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
          Tất cả
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
        onPress={() => setActiveTab('unread')}>
        <Text
          style={[
            styles.tabText,
            activeTab === 'unread' && styles.activeTabText,
          ]}>
          Chưa đọc
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Nhắn tin"
        leftIcons={[
          {
            name: 'arrow-back',
            onPress: () => navigation.goBack(),
          },
        ]}
        showMore
      />

      {renderSearchBar()}
      {renderTabs()}

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshing={loading}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity style={styles.newChatButton} onPress={createNewChat}>
        <Icon name="create" size={24} color={appColors.white} />
      </TouchableOpacity>
    </View>
  );
};

// Styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: appColors.gray2,
    paddingHorizontal: 16,
    borderRadius: 23,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: appColors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    color: appColors.gray4,
  },
  activeTabText: {
    color: appColors.primary,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: appColors.white,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
    paddingBottom: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontWeight: '600',
    fontSize: 16,
    color: appColors.textPrimary,
  },
  chatTime: {
    fontSize: 12,
    color: appColors.gray4,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: appColors.gray4,
    marginRight: 8,
  },
  chatMessageUnread: {
    color: appColors.textPrimary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: appColors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: appColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: appColors.gray4,
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: appColors.primary,
    borderRadius: 20,
  },
  retryText: {
    color: appColors.white,
    fontWeight: '500',
  },
  newChatButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Message;
