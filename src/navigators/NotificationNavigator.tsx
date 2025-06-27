import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import HeaderComponent from '../components/HeaderCompunent';
import {appColors} from '../constants/appColors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAnnouncement} from '../hooks/useAnnouncement';
import {formatDistanceToNow} from 'date-fns';
import {vi} from 'date-fns/locale/vi';
import {useFocusEffect} from '@react-navigation/native';
import {Announcement} from '../types/announcementType';

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

  // Lấy danh sách thông báo khi component được render
  useEffect(() => {
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tải lại thông báo khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const loadAnnouncements = async () => {
    try {
      await getAnnouncements({
        page: 1,
        limit: 50,
      });
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thông báo');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  // Xử lý đánh dấu đã đọc
  const handleNotificationPress = async (item: Announcement) => {
    try {
      if (!item.isRead) {
        await markAsRead(item._id);
        // Tải lại danh sách để cập nhật trạng thái đã đọc
        loadAnnouncements();
      }
      // Không điều hướng sang màn hình chi tiết nữa
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu thông báo đã đọc');
    }
  };

  // Xử lý đánh dấu đã đọc tất cả
  const handleMarkAllAsRead = async () => {
    try {
      if (unreadCount === 0) {
        Alert.alert('Thông báo', 'Tất cả thông báo đã được đọc');
        return;
      }

      await markAllAsRead();
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
      // Tải lại danh sách sau khi đánh dấu đã đọc
      loadAnnouncements();
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo là đã đọc');
    }
  };

  // Chuyển đổi kiểu thông báo sang loại biểu tượng
  const getIconNameByType = (type: string) => {
    switch (type) {
      case 'academic':
        return {name: 'school', color: appColors.primary};
      case 'urgent':
        return {name: 'priority-high', color: '#F44336'};
      case 'event':
        return {name: 'event', color: '#4CAF50'};
      case 'assignment':
        return {name: 'assignment', color: '#FFC107'};
      default:
        return {name: 'notifications', color: '#2196F3'};
    }
  };

  // Format thời gian
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

  // Lọc thông báo theo tab
  const filteredAnnouncements =
    activeTab === 'all'
      ? announcements
      : announcements.filter((item: {type: string}) => item.type === activeTab);

  const renderNotification = ({item}: {item: Announcement}) => {
    const icon = getIconNameByType(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.newNotification,
        ]}
        onPress={() => handleNotificationPress(item)}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Icon name={icon.name} size={24} color={icon.color} />
          </View>

          <View style={styles.notificationContent}>
            <View style={styles.titleRow}>
              <Text style={styles.notificationTitle}>
                {!item.isRead && <View style={styles.newDot} />}
                {item.title}
              </Text>
            </View>
            <Text style={styles.notificationTime}>
              {formatTime(item.createdAt)}
            </Text>
            <Text style={styles.notificationPreview} numberOfLines={3}>
              {item.content}
            </Text>
          </View>

          {/* Đã bỏ mũi tên */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        title={`Thông báo ${unreadCount > 0 ? `(${unreadCount})` : ''}`}
        navigation={navigation}
        leftIcons={[
          {
            name: 'arrow-back',
            onPress: () => navigation.goBack(),
          },
        ]}
        rightIcons={[
          {
            name: 'done-all',
            onPress: handleMarkAllAsRead,
          },
        ]}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'academic' && styles.activeTab]}
          onPress={() => setActiveTab('academic')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'academic' && styles.activeTabText,
            ]}>
            Học vụ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'announcement' && styles.activeTab]}
          onPress={() => setActiveTab('announcement')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'announcement' && styles.activeTabText,
            ]}>
            Thông báo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'urgent' && styles.activeTab]}
          onPress={() => setActiveTab('urgent')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'urgent' && styles.activeTabText,
            ]}>
            Khẩn cấp
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color={appColors.primary}
          style={styles.loader}
        />
      ) : filteredAnnouncements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnnouncements}
          renderItem={renderNotification}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: appColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: appColors.primary,
  },
  tabText: {
    fontSize: 14,
    color: appColors.text,
  },
  activeTabText: {
    color: appColors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 2,
  },
  newNotification: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: appColors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Thay đổi từ 'center' thành 'flex-start'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: appColors.text,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 4,
  },
  notificationPreview: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Notifications;
