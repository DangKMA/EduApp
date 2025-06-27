import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {appColors} from '../../constants/appColors';
import {Avatar} from '../../components/Avatar';
import HeaderComponent from '../../components/HeaderCompunent';
import Icon from 'react-native-vector-icons/Ionicons';
import {useChat} from '../../hooks/useChat';
import {User} from '../../types/userType';

interface NavigationProps {
  navigation: {
    goBack(): void;
    navigate: (screen: string, params?: object) => void;
  };
}

const NewChat: React.FC<NavigationProps> = ({navigation}) => {
  const {
    createChat,
    loading: chatLoading,
    checkExistingChatBeforeCreate,
  } = useChat();
  const {getUsers, searchUsers, getUsersByRole} = useChat();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getUsers();

      if (fetchedUsers && fetchedUsers.length > 0) {
        setAllUsers(fetchedUsers);
        setUsers(fetchedUsers);
      } else {
        Alert.alert('Thông báo', 'Không có người dùng nào');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  const handleSearchUsers = useCallback(
    async (query: string) => {
      if (query.trim().length === 0) {
        setUsers(allUsers);
        return;
      }

      if (query.trim().length < 2) {
        const searchTerm = query.toLowerCase().trim();
        const filteredUsers = allUsers.filter(
          user =>
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.userID.toLowerCase().includes(searchTerm) ||
            (user.studentInfo?.className &&
              user.studentInfo.className.toLowerCase().includes(searchTerm)) ||
            (user.teacherInfo?.department &&
              user.teacherInfo.department.toLowerCase().includes(searchTerm)),
        );
        setUsers(filteredUsers);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await searchUsers(query);
        setUsers(searchResults);
      } catch (error) {
        const searchTerm = query.toLowerCase().trim();
        const filteredUsers = allUsers.filter(
          user =>
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.userID.toLowerCase().includes(searchTerm),
        );
        setUsers(filteredUsers);
      } finally {
        setLoading(false);
      }
    },
    [allUsers, searchUsers],
  );

  const filterByRole = useCallback(
    async (role: 'student' | 'teacher' | 'admin') => {
      setLoading(true);
      try {
        const roleUsers = await getUsersByRole(role);
        setUsers(roleUsers);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lọc người dùng');
      } finally {
        setLoading(false);
      }
    },
    [getUsersByRole],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearchUsers]);

  const toggleUserSelection = useCallback((user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  const handleCreateChat = useCallback(async () => {
    if (selectedUsers.length === 0) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn ít nhất một người để tạo cuộc trò chuyện',
      );
      return;
    }

    if (isGroupChat && !groupName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên nhóm');
      return;
    }

    try {
      if (!isGroupChat && selectedUsers.length === 1) {
        const existingChatId = await checkExistingChatBeforeCreate(
          selectedUsers[0]._id,
        );
        if (existingChatId) {
          Alert.alert(
            'Thông báo',
            'Đã có cuộc trò chuyện với người này. Chuyển đến cuộc trò chuyện?',
            [
              {text: 'Hủy', style: 'cancel'},
              {
                text: 'Đồng ý',
                onPress: () =>
                  navigation.navigate('Detail', {
                    chatId: existingChatId,
                    otherUserName: selectedUsers[0].fullName,
                    otherUserId: selectedUsers[0]._id,
                  }),
              },
            ],
          );
          return;
        }
      }

      const chatData = {
        participants: selectedUsers.map(user => user._id),
        isGroup: isGroupChat,
        groupName: isGroupChat ? groupName.trim() : undefined,
      };

      const result = await createChat(chatData);

      if (result) {
        navigation.navigate('Detail', {
          chatId: result.id,
          otherUserName: isGroupChat ? groupName : selectedUsers[0].fullName,
          otherUserId: isGroupChat ? null : selectedUsers[0]._id,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
    }
  }, [
    selectedUsers,
    isGroupChat,
    groupName,
    createChat,
    navigation,
    checkExistingChatBeforeCreate,
  ]);

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => filterByRole('student')}>
        <Icon name="school" size={16} color={appColors.primary} />
        <Text style={styles.filterText}>Sinh viên</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => filterByRole('teacher')}>
        <Icon name="person" size={16} color={appColors.primary} />
        <Text style={styles.filterText}>Giảng viên</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => filterByRole('admin')}>
        <Icon name="shield" size={16} color={appColors.danger} />
        <Text style={styles.filterText}>Admin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => fetchUsers()}>
        <Icon name="people" size={16} color={appColors.gray4} />
        <Text style={styles.filterText}>Tất cả</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserItem = ({item}: {item: User}) => {
    const isSelected = selectedUsers.some(u => u._id === item._id);
    const isOnline = item.status === 'online';

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => toggleUserSelection(item)}>
        <View style={styles.avatarContainer}>
          <Avatar size={48} uri={item.avatar} />
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userID}>ID: {item.userID}</Text>

          {item.role === 'student' && item.studentInfo && (
            <Text style={styles.userDetail}>
              {item.studentInfo.className &&
                `Lớp: ${item.studentInfo.className}`}
              {item.studentInfo.faculty && ` - ${item.studentInfo.faculty}`}
            </Text>
          )}

          {item.role === 'teacher' && item.teacherInfo && (
            <Text style={styles.userDetail}>
              {item.teacherInfo.position} - {item.teacherInfo.department}
            </Text>
          )}

          {item.role === 'admin' && (
            <Text style={styles.userDetail}>Quản trị viên</Text>
          )}
        </View>

        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <Icon name="checkmark-circle" size={24} color={appColors.primary} />
          ) : (
            <View style={styles.unselectedCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedUsers = () => {
    if (selectedUsers.length === 0) return null;

    return (
      <View style={styles.selectedUsersContainer}>
        <Text style={styles.selectedUsersTitle}>
          Đã chọn ({selectedUsers.length})
        </Text>
        <FlatList
          horizontal
          data={selectedUsers}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.selectedUserChip}
              onPress={() => toggleUserSelection(item)}>
              <Avatar size={32} uri={item.avatar} />
              <Text style={styles.selectedUserName} numberOfLines={1}>
                {item.fullName}
              </Text>
              <Icon name="close-circle" size={16} color={appColors.gray4} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedUsersList}
        />
      </View>
    );
  };

  const renderGroupChatOptions = () => {
    if (selectedUsers.length < 2) return null;

    return (
      <View style={styles.groupChatContainer}>
        <TouchableOpacity
          style={styles.groupChatToggle}
          onPress={() => setIsGroupChat(!isGroupChat)}>
          <Icon
            name={isGroupChat ? 'checkbox' : 'square-outline'}
            size={20}
            color={appColors.primary}
          />
          <Text style={styles.groupChatText}>Tạo nhóm chat</Text>
        </TouchableOpacity>

        {isGroupChat && (
          <TextInput
            style={styles.groupNameInput}
            placeholder="Nhập tên nhóm"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.emptyText}>Đang tải danh sách người dùng...</Text>
        </View>
      );
    }

    if (allUsers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={60} color={appColors.gray3} />
          <Text style={styles.emptyText}>Không có người dùng nào</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim().length > 0 && users.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search-outline" size={60} color={appColors.gray3} />
          <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
          <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Cuộc trò chuyện mới"
        leftIcons={[
          {
            name: 'arrow-back',
            onPress: () => navigation.goBack(),
          },
        ]}
        rightIcons={[
          {
            name: 'refresh',
            onPress: fetchUsers,
          },
        ]}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={20}
            color={appColors.gray4}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Tìm kiếm theo tên, email, ID..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={appColors.gray4} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderFilterButtons()}
      {renderSelectedUsers()}
      {renderGroupChatOptions()}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchUsers}
      />

      {selectedUsers.length > 0 && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateChat}
          disabled={chatLoading}>
          {chatLoading ? (
            <ActivityIndicator size="small" color={appColors.white} />
          ) : (
            <>
              <Icon name="chatbubble" size={20} color={appColors.white} />
              <Text style={styles.createButtonText}>Tạo cuộc trò chuyện</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: appColors.gray2,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12,
    color: appColors.textPrimary,
    marginLeft: 4,
  },
  selectedUsersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
  },
  selectedUsersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.textPrimary,
    marginBottom: 8,
  },
  selectedUsersList: {
    paddingRight: 16,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 140,
  },
  selectedUserName: {
    fontSize: 12,
    color: appColors.primary,
    marginHorizontal: 6,
    flex: 1,
  },
  groupChatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
  },
  groupChatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupChatText: {
    fontSize: 14,
    color: appColors.textPrimary,
    marginLeft: 8,
  },
  groupNameInput: {
    height: 40,
    borderWidth: 1,
    borderColor: appColors.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray2,
  },
  selectedUserItem: {
    backgroundColor: appColors.primaryLight,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: appColors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: appColors.gray4,
    marginBottom: 2,
  },
  userID: {
    fontSize: 12,
    color: appColors.primary,
    marginBottom: 2,
  },
  userDetail: {
    fontSize: 12,
    color: appColors.gray4,
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: appColors.gray3,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: appColors.gray4,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: appColors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: appColors.white,
    fontWeight: '600',
  },
  createButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 50,
    backgroundColor: appColors.primary,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonText: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NewChat;
