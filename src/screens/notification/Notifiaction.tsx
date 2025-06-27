import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import HeaderComponent from '../../components/HeaderCompunent';
import {appColors} from '../../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAnnouncement} from '../../hooks/useAnnouncement';
import {formatDistanceToNow} from 'date-fns';
import {vi} from 'date-fns/locale/vi';
import {useFocusEffect} from '@react-navigation/native';
import {Announcement} from '../../types/announcementType';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const Notifications = ({navigation}: any) => {
  const {
    loading,
    announcements,
    unreadCount,
    getAnnouncements,
    markAsRead,
    markAllAsRead,
  } = useAnnouncement();

  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
    }, []),
  );

  const loadAnnouncements = async () => {
    try {
      await getAnnouncements({
        page: 1,
        limit: 50,
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách thông báo');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (unreadCount === 0) {
        Alert.alert('Thông báo', 'Tất cả thông báo đã được đọc');
        return;
      }

      await markAllAsRead();
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo là đã đọc');
    }
  };

  const getIconNameByType = (type: string) => {
    switch (type) {
      case 'academic':
        return {
          name: 'school',
          color: appColors.primary,
          bgGradient: [appColors.primary + '15', appColors.primary + '05'],
        };
      case 'urgent':
        return {
          name: 'priority-high',
          color: '#F44336',
          bgGradient: ['#F4433615', '#F4433605'],
        };
      case 'event':
        return {
          name: 'event',
          color: '#4CAF50',
          bgGradient: ['#4CAF5015', '#4CAF5005'],
        };
      case 'assignment':
        return {
          name: 'assignment',
          color: '#FF9800',
          bgGradient: ['#FF980015', '#FF980005'],
        };
      default:
        return {
          name: 'notifications',
          color: '#2196F3',
          bgGradient: ['#2196F315', '#2196F305'],
        };
    }
  };

  const formatTime = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  const filteredAnnouncements =
    activeTab === 'all'
      ? announcements
      : announcements.filter((item: {type: string}) => item.type === activeTab);

  const hasNotifications = filteredAnnouncements.length > 0;

  const renderNotification = ({item}: {item: Announcement; index: number}) => {
    const icon = getIconNameByType(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        activeOpacity={0.8}>
        {/* Accent border */}
        <View style={[styles.accentBorder, {backgroundColor: icon.color}]} />

        {/* Icon container */}
        <LinearGradient colors={icon.bgGradient} style={styles.iconContainer}>
          <Icon name={icon.name} size={24} color={icon.color} />
          {!item.isRead && (
            <View style={[styles.newDot, {backgroundColor: icon.color}]} />
          )}
        </LinearGradient>

        {/* Content */}
        <View style={styles.contentBlock}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                !item.isRead && styles.unreadTitle,
              ]}
              numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTime(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.notificationPreview} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.bottomRow}>
            <View
              style={[styles.typeTag, {backgroundColor: icon.color + '15'}]}>
              <Text style={[styles.typeText, {color: icon.color}]}>
                {item.type === 'academic'
                  ? 'Học vụ'
                  : item.type === 'urgent'
                  ? 'Khẩn cấp'
                  : item.type === 'event'
                  ? 'Sự kiện'
                  : item.type === 'assignment'
                  ? 'Bài tập'
                  : 'Thông báo'}
              </Text>
            </View>
            {!item.isRead && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>Mới</Text>
              </View>
            )}
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowBlock}>
          <Icon name="chevron-right" size={20} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyNotifications = () => (
    <View style={styles.emptyBlock}>
      <LinearGradient
        colors={[appColors.primary + '10', appColors.primary + '05']}
        style={styles.emptyIconBlock}>
        <IconCommunity
          name="bell-off-outline"
          size={48}
          color={appColors.primary}
        />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Không có thông báo</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'all'
          ? 'Bạn chưa có thông báo nào'
          : `Không có thông báo loại ${
              activeTab === 'academic'
                ? 'học vụ'
                : activeTab === 'announcement'
                ? 'thông báo'
                : activeTab === 'urgent'
                ? 'khẩn cấp'
                : activeTab
            }`}
      </Text>
    </View>
  );

  const TabButton = ({
    tabKey,
    title,
    count,
  }: {
    tabKey: string;
    title: string;
    count?: number;
  }) => {
    const isActive = activeTab === tabKey;
    const tabCount =
      count ||
      (tabKey === 'all'
        ? announcements.length
        : announcements.filter(item => item.type === tabKey).length);

    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(tabKey)}
        activeOpacity={0.7}>
        <View style={styles.tabContent}>
          <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {title}
          </Text>
          {tabCount > 0 && (
            <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  isActive && styles.activeTabBadgeText,
                ]}>
                {tabCount > 99 ? '99+' : tabCount}
              </Text>
            </View>
          )}
        </View>
        {isActive && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        title={`Thông báo ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
        navigation={navigation}
        showBack={true}
        titleStyle={{color: appColors.black}}
        rightIcons={[
          {
            name: 'done-all',
            onPress: handleMarkAllAsRead,
            color: unreadCount > 0 ? appColors.primary : '#94A3B8',
          },
          {name: 'refresh', onPress: handleRefresh},
        ]}
      />

      {/* Tab container with modern design */}
      <View style={styles.tabContainer}>
        <View style={styles.tabScrollView}>
          <TabButton tabKey="all" title="Tất cả" />
          <TabButton tabKey="academic" title="Học vụ" />
          <TabButton tabKey="announcement" title="Thông báo" />
          <TabButton tabKey="urgent" title="Khẩn cấp" />
        </View>
      </View>

      {/* Notification list */}
      <View style={styles.notificationBlock}>
        {loading && !refreshing ? (
          <View style={styles.loadingBlock}>
            <LinearGradient
              colors={[appColors.primary + '10', appColors.primary + '05']}
              style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>Đang tải thông báo...</Text>
            </LinearGradient>
          </View>
        ) : hasNotifications ? (
          <FlatList
            data={filteredAnnouncements}
            renderItem={renderNotification}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <EmptyNotifications />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Tab styles
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabScrollView: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // Active tab styling handled by indicator
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: appColors.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: appColors.primary + '20',
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  activeTabBadgeText: {
    color: appColors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: appColors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Notification list styles
  notificationBlock: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  unreadNotification: {
    backgroundColor: '#FEFEFE',
    borderColor: appColors.primary + '20',
    shadowColor: appColors.primary,
    shadowOpacity: 0.1,
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  // Icon styles
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  newDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Content styles
  contentBlock: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  unreadTitle: {
    color: '#0F172A',
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  notificationPreview: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Arrow styles
  arrowBlock: {
    paddingLeft: 8,
    justifyContent: 'center',
  },

  // Separator
  itemSeparator: {
    height: 12,
  },

  // Empty state
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconBlock: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: appColors.primary + '20',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Loading state
  loadingBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appColors.primary + '20',
  },
  loadingText: {
    fontSize: 16,
    color: appColors.primary,
    marginTop: 16,
    fontWeight: '600',
  },
});

export default Notifications;
