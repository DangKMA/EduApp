import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {Alert} from 'react-native';
import {
  ChatListItem,
  FormattedMessage,
  SendMessageParams,
  CreateChatResponse,
  DeleteChatResponse,
  MarkAsReadResponse,
  UploadChatFileResponse,
  UploadFileData,
  ChatStatsResponse,
  CheckExistingChatResponse,
  ChatApiResponse,
} from '../types/chatType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {chatService} from '../services/chatService';
import {User} from '../types/userType';

// ✅ SỬA ĐỔI: Import Firebase v9 config + Auth
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {signInAnonymously, onAuthStateChanged} from 'firebase/auth';
import {db, auth} from '../configs/FBconfig';
import {userService} from '../services/userService';

// ✅ CẬP NHẬT: Interface cho create chat params
interface CreateChatParams {
  participants: string[];
  isGroup: boolean;
  groupName?: string;
}

// ✅ CẬP NHẬT: Interface cho create chat response
interface CreateChatResult {
  id: string;
  name: string;
  participants: string[];
  isGroup: boolean;
}

export const useChat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [messages, setMessages] = useState<FormattedMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // ✅ SỬA ĐỔI: State cho Firebase + Authentication
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ✅ SỬA ĐỔI: Sử dụng useRef để track listeners và tránh dependency loop
  const activeListenersRef = useRef<Map<string, () => void>>(new Map());

  // ✅ SỬA ĐỔI: Firebase Authentication setup
  useEffect(() => {
    ('🔥 Setting up Firebase authentication...');

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setIsFirebaseReady(true);
      } else {
        ('❌ No Firebase user, signing in anonymously...');
        try {
          setIsAuthenticated(true);
          setIsFirebaseReady(true);
        } catch (authError) {
          console.error('❌ Anonymous sign-in failed:', authError);
          setIsAuthenticated(false);
          setIsFirebaseReady(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  // Lấy thông tin user từ AsyncStorage
  const getCurrentUser = useCallback(async () => {
    try {
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const response = JSON.parse(userInfoString);

        // Xử lý response theo structure từ backend
        let userInfo;
        if (response.success && response.data) {
          if (response.data.user) {
            userInfo = response.data.user;
          } else {
            userInfo = response.data;
          }
        } else if (response.user) {
          userInfo = response.user;
        } else {
          userInfo = response;
        }

        setUser(userInfo);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err);
      setError('Không thể lấy thông tin người dùng');
    }
  }, []);

  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers();

      if (response.success && response.data && response.data.users) {
        return response.data.users;
      } else {
        throw new Error(
          response.message || 'Không thể lấy danh sách người dùng',
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Không thể lấy danh sách người dùng';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string): Promise<User[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.searchUsers({query});

      if (response.success && response.data && response.data.users) {
        return response.data.users;
      } else {
        throw new Error(response.message || 'Không thể tìm kiếm người dùng');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Không thể tìm kiếm người dùng';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsersByRole = useCallback(
    async (role: 'student' | 'teacher' | 'admin'): Promise<User[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await userService.getUsersByRole(role);

        if (response.success && response.data && response.data.users) {
          return response.data.users;
        } else {
          throw new Error(
            response.message ||
              'Không thể lấy danh sách người dùng theo vai trò',
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Không thể lấy danh sách người dùng theo vai trò';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ CẬP NHẬT: Check existing chat với response type mới
  const checkExistingChatBeforeCreate = useCallback(
    async (userId: string): Promise<string | null> => {
      try {
        // Kiểm tra trong danh sách chats hiện tại trước
        const existingChat = chats.find(
          chat => !chat.isGroup && chat.userInfo.id === userId,
        );

        if (existingChat) {
          return existingChat.id;
        }

        // Nếu không tìm thấy, gọi API để kiểm tra
        const response: CheckExistingChatResponse =
          await chatService.checkExistingChat(userId);

        if (response.success && response.data) {
          return response.data.chatId;
        }

        return null;
      } catch (err: any) {
        console.error('Error checking existing chat:', err);
        return null;
      }
    },
    [chats],
  );

  // ✅ SỬA ĐỔI: Cleanup function không phụ thuộc vào state
  const cleanupAllListeners = useCallback(() => {
    ('🧹 Cleaning up all Firestore listeners...');
    const listeners = activeListenersRef.current;
    listeners.forEach((unsubscribe, chatId) => {
      `🧹 Cleaning listener for chat: ${chatId}`;
      unsubscribe();
    });
    activeListenersRef.current.clear();
  }, []);

  // ✅ SỬA ĐỔI: Setup Firestore listeners với Authentication check
  const setupMultipleChatListeners = useCallback(
    (chatIds: string[]) => {
      // ✅ Kiểm tra Firebase ready + authenticated + user
      if (!isFirebaseReady || !isAuthenticated || !user?._id) {
        return;
      }

      // Cleanup existing listeners
      cleanupAllListeners();

      chatIds.forEach(chatId => {
        try {
          // ✅ SỬA ĐỔI: Listener cho last message (Firebase v9)
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const lastMessageQuery = query(
            messagesRef,
            orderBy('createdAt', 'desc'),
            limit(1),
          );

          const lastMessageUnsubscribe = onSnapshot(
            lastMessageQuery,
            snapshot => {
              if (!snapshot.empty) {
                const lastMessageData = snapshot.docs[0].data();

                setChats(prevChats =>
                  prevChats.map(chat =>
                    chat.id === chatId
                      ? {
                          ...chat,
                          lastMessage:
                            lastMessageData.content ||
                            lastMessageData.text ||
                            (lastMessageData.file ? '📎 File đính kèm' : ''),
                          time:
                            lastMessageData.createdAt
                              ?.toDate()
                              ?.toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              }) ||
                            new Date().toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                        }
                      : chat,
                  ),
                );
              }
            },
            error => {
              console.error(
                `❌ Last message listener error for chat ${chatId}:`,
                error,
              );
              // ✅ Không crash app, chỉ log error
            },
          );

          // ✅ SỬA ĐỔI: Listener cho unread count (Firebase v9)
          const unreadQuery = query(
            messagesRef,
            where('sender', '!=', user._id),
          );

          const unreadUnsubscribe = onSnapshot(
            unreadQuery,
            snapshot => {
              if (!snapshot) return;

              const unreadCount = snapshot.docs.filter(doc => {
                const data = doc.data();
                return (
                  data.sender !== user._id &&
                  (!data.readBy || !data.readBy.includes(user._id))
                );
              }).length;

              setChats(prevChats =>
                prevChats.map(chat =>
                  chat.id === chatId ? {...chat, unread: unreadCount} : chat,
                ),
              );
            },
            error => {
              console.error(
                `❌ Unread listener error for chat ${chatId}:`,
                error,
              );
              // ✅ Không crash app, chỉ log error
            },
          );

          // Combine cleanup functions
          const combinedUnsubscribe = () => {
            lastMessageUnsubscribe();
            unreadUnsubscribe();
          };

          // ✅ Store trong ref thay vì state
          activeListenersRef.current.set(chatId, combinedUnsubscribe);
        } catch (setupError) {
          console.error(
            `❌ Error setting up listener for chat ${chatId}:`,
            setupError,
          );
        }
      });
    },
    [isFirebaseReady, isAuthenticated, user?._id, cleanupAllListeners],
  );

  // ✅ SỬA ĐỔI: Setup Firestore real-time listener cho messages với auth check
  const setupMessageListener = useCallback(
    (chatId: string, callback: (messages: FormattedMessage[]) => void) => {
      if (!chatId || !isFirebaseReady || !isAuthenticated) {
        return null;
      }

      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesQuery = query(
          messagesRef,
          orderBy('createdAt', 'desc'),
          limit(50),
        );

        const unsubscribe = onSnapshot(
          messagesQuery,
          snapshot => {
            if (snapshot && !snapshot.empty) {
              const firestoreMessages: FormattedMessage[] = snapshot.docs.map(
                doc => {
                  const data = doc.data();
                  return {
                    _id: doc.id,
                    text: data.content || data.text || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    user: {
                      _id: data.sender || data.senderId || '',
                      name: data.senderName || '',
                      avatar:
                        data.senderAvatar ||
                        'https://www.gravatar.com/avatar/default',
                    },
                    image: data.fileUrl || data.file || null,
                    // ✅ THÊM MỚI: Enhanced file object
                    file: data.file
                      ? {
                          url: data.file || data.fileUrl,
                          name: data.fileName || 'File',
                          size: data.fileSize || 0,
                          type: data.fileType || 'file',
                          mimeType:
                            data.fileMimeType || 'application/octet-stream',
                          thumbnail: data.thumbnail || null,
                        }
                      : null,
                    read: data.readBy?.includes(user?._id) || false,
                  };
                },
              );

              callback(firestoreMessages);
            } else {
              ('📭 No messages in Firestore');
              callback([]);
            }
          },
          error => {
            console.error('❌ Firestore listener error:', error);
            // Fallback to empty array, component will use API fallback
            callback([]);
          },
        );

        return unsubscribe;
      } catch (error) {
        console.error('❌ Error setting up message listener:', error);
        return null;
      }
    },
    [isFirebaseReady, isAuthenticated, user?._id],
  );

  // ✅ SỬA ĐỔI: Lấy danh sách các cuộc trò chuyện với auth check
  const getChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ChatApiResponse<ChatListItem[]> =
        await chatService.getChats();

      if (response.success && response.data) {
        setChats(response.data);

        // ✅ Setup multiple listeners sau khi load chats VÀ có authentication
        const chatIds = response.data.map(chat => chat.id);
        if (
          chatIds.length > 0 &&
          isFirebaseReady &&
          isAuthenticated &&
          user?._id
        ) {
          // ✅ Delay để tránh cleanup ngay lập tức
          setTimeout(() => {
            setupMultipleChatListeners(chatIds);
          }, 500); // Tăng delay lên 500ms
        }
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'Không thể lấy danh sách cuộc trò chuyện';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Không thể lấy danh sách cuộc trò chuyện';
      setError(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isFirebaseReady, isAuthenticated, user?._id, setupMultipleChatListeners]);

  // ✅ SỬA ĐỔI: Send message trực tiếp vào Firestore với auth check
  const sendMessageToFirestore = useCallback(
    async (chatId: string, content: string, file?: string) => {
      if (!user?._id || !isFirebaseReady || !isAuthenticated) {
      }

      try {
        // ✅ FIRESTORE WRITE: Thêm message vào Firestore (v9)
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messageData = {
          content: content.trim(),
          text: content.trim(), // For compatibility
          sender: user._id,
          senderId: user._id, // For compatibility
          senderName: user.fullName || 'Unknown',
          senderAvatar:
            user.avatar || 'https://www.gravatar.com/avatar/default',
          createdAt: serverTimestamp(),
          fileUrl: file || null,
          file: file || null, // For compatibility
          readBy: [user._id],
        };

        await addDoc(messagesRef, messageData);

        // ✅ FIRESTORE UPDATE: Cập nhật lastMessage trong chat document (v9)
        try {
          const chatRef = doc(db, 'chats', chatId);
          await updateDoc(chatRef, {
            lastMessage: content.trim() || (file ? '📎 File đính kèm' : ''),
            lastMessageTime: serverTimestamp(),
          });
        } catch (updateError) {}

        return true;
      } catch (err: any) {
        return false;
      }
    },
    [user, isFirebaseReady, isAuthenticated],
  );

  // ✅ CẬP NHẬT: Lấy tin nhắn với response type mới
  const getChatMessages = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentChatId(chatId);

      // Thử API trước
      const response: ChatApiResponse<FormattedMessage[]> =
        await chatService.getChatMessages(chatId);

      if (response.success && response.data) {
        setMessages(response.data);
        markMessagesAsRead(chatId);
      } else {
        const errorMessage =
          response.error || response.message || 'Không thể lấy tin nhắn';
        setError(errorMessage);
        ('⚠️ API failed, Firestore listener will handle messages');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Không thể lấy tin nhắn';
      setError(errorMessage);
      ('⚠️ API failed, Firestore listener will handle messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ÁPDỤNG: Tìm kiếm chats được cải tiến
  const searchChats = useCallback(
    (query: string): ChatListItem[] => {
      if (!query.trim()) return chats;

      const lowercaseQuery = query.toLowerCase().trim();
      return chats.filter(chat => {
        return (
          chat.name.toLowerCase().includes(lowercaseQuery) ||
          chat.lastMessage.toLowerCase().includes(lowercaseQuery) ||
          chat.userInfo?.studentId?.toLowerCase().includes(lowercaseQuery) ||
          chat.userInfo?.className?.toLowerCase().includes(lowercaseQuery) ||
          chat.userInfo?.email?.toLowerCase().includes(lowercaseQuery)
        );
      });
    },
    [chats],
  );

  // ✅ ÁPDỤNG: Sắp xếp chats theo ưu tiên
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      // Ưu tiên chat có tin nhắn chưa đọc
      if (a.unread > 0 && b.unread === 0) return -1;
      if (b.unread > 0 && a.unread === 0) return 1;

      // Sau đó sắp xếp theo thời gian (parse time string)
      const parseTime = (timeStr: string) => {
        if (!timeStr) return 0;
        const today = new Date();
        const [time] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        today.setHours(hours, minutes, 0, 0);
        return today.getTime();
      };

      const aTime = parseTime(a.time);
      const bTime = parseTime(b.time);
      return bTime - aTime;
    });
  }, [chats]);

  // ✅ CẬP NHẬT: Tạo chat với response type mới
  const createChat = useCallback(
    async (
      chatData: CreateChatParams | string,
    ): Promise<CreateChatResult | null> => {
      try {
        setLoading(true);
        setError(null);

        let response: CreateChatResponse;
        let resultData: CreateChatResult;

        if (typeof chatData === 'string') {
          // Individual chat
          response = await chatService.createChat(chatData);

          if (response.success && response.data) {
            resultData = {
              id: response.data.chatId,
              name: 'Direct Chat',
              participants: [chatData],
              isGroup: false,
            };
          } else {
            throw new Error(
              response.error || response.message || 'Failed to create chat',
            );
          }
        } else {
          // Group chat or structured individual chat
          if (chatData.isGroup) {
            // TODO: Implement group chat creation API
            const mockChatId = `group_${Date.now()}`;
            response = {
              success: true,
              timestamp: new Date().toISOString(),
              data: {
                chatId: mockChatId,
                message: 'Group chat created successfully',
              },
              message: 'Group chat created successfully',
            };

            resultData = {
              id: mockChatId,
              name: chatData.groupName || 'Group Chat',
              participants: chatData.participants,
              isGroup: true,
            };
          } else {
            const targetUserId = chatData.participants[0];
            response = await chatService.createChat(targetUserId);

            if (response.success && response.data) {
              resultData = {
                id: response.data.chatId,
                name: 'Direct Chat',
                participants: chatData.participants,
                isGroup: false,
              };
            } else {
              throw new Error(
                response.error || response.message || 'Failed to create chat',
              );
            }
          }
        }

        if (response.success && response.data) {
          await getChats();
          return resultData;
        } else {
          throw new Error('Không thể tạo cuộc trò chuyện');
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Không thể tạo cuộc trò chuyện';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getChats],
  );

  // ✅ CẬP NHẬT: Delete chat với response type mới
  const deleteChat = useCallback(
    async (chatId: string) => {
      try {
        setLoading(true);
        setError(null);

        const response: DeleteChatResponse = await chatService.deleteChat(
          chatId,
        );

        if (response.success) {
          // ✅ Cleanup listener trước khi xóa chat
          const listener = activeListenersRef.current.get(chatId);
          if (listener) {
            listener();
            activeListenersRef.current.delete(chatId);
          }

          // Xóa chat khỏi danh sách
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

          // Reset messages nếu đang xem chat bị xóa
          if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(null);
          }

          return true;
        } else {
          throw new Error(
            response.error ||
              response.message ||
              'Không thể xóa cuộc trò chuyện',
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Không thể xóa cuộc trò chuyện';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentChatId],
  );

  // ✅ CẬP NHẬT: Send message với SendMessageParams
  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      try {
        if (!user?._id) {
          throw new Error('Người dùng chưa đăng nhập');
        }

        // Validate message
        const validation = chatService.validateMessage(
          params.content,
          params.file,
        );
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }

        // Thử gửi qua API trước
        const response = await chatService.sendMessage(params);

        if (response.success && response.data) {
          ('✅ Message sent via API');

          // Nếu có Firestore + auth, cũng gửi vào đó để đồng bộ
          if (isFirebaseReady && isAuthenticated && params.content) {
            await sendMessageToFirestore(
              params.chatId,
              params.content,
              params.file,
            );
          }

          return true;
        } else {
          // Nếu API fail, thử gửi trực tiếp vào Firestore
          if (isFirebaseReady && isAuthenticated && params.content) {
            ('⚠️ API failed, trying Firestore...');
            return await sendMessageToFirestore(
              params.chatId,
              params.content,
              params.file,
            );
          } else {
            throw new Error(
              response.error || response.message || 'Không thể gửi tin nhắn',
            );
          }
        }
      } catch (err: any) {
        // Last resort: gửi vào Firestore nếu có thể
        if (isFirebaseReady && isAuthenticated && params.content) {
          ('⚠️ API completely failed, using Firestore only...');
          return await sendMessageToFirestore(
            params.chatId,
            params.content,
            params.file,
          );
        }

        const errorMessage =
          err.response?.data?.error || err.message || 'Không thể gửi tin nhắn';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      }
    },
    [user, isFirebaseReady, isAuthenticated, sendMessageToFirestore],
  );

  // ✅ CẬP NHẬT: Upload file method
  const uploadChatMedia = useCallback(
    async (chatId: string, file: File): Promise<UploadFileData | null> => {
      try {
        setLoading(true);
        setError(null);

        // Validate file
        const validation = chatService.validateFileType(file);
        if (!validation.isValid) {
          throw new Error(validation.error || 'File không hợp lệ');
        }

        // Create FormData
        const formData = chatService.createUploadFormData(file);

        // Upload file
        const response: UploadChatFileResponse =
          await chatService.uploadChatMedia(chatId, formData);

        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(
            response.error || response.message || 'Không thể tải lên file',
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || 'Không thể tải lên file';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ CẬP NHẬT: Send message with file
  const sendMessageWithFile = useCallback(
    async (chatId: string, content?: string, file?: File) => {
      try {
        let uploadData: UploadFileData | null = null;

        // Upload file if provided
        if (file) {
          uploadData = await uploadChatMedia(chatId, file);
          if (!uploadData) {
            throw new Error('Không thể tải lên file');
          }
        }

        // Create message params
        const params = chatService.createSendMessageParams(
          chatId,
          content,
          uploadData || undefined,
        );

        // Send message
        return await sendMessage(params);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          'Không thể gửi tin nhắn với file';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
        return false;
      }
    },
    [sendMessage, uploadChatMedia],
  );

  // ✅ CẬP NHẬT: Mark messages as read với response type
  const markMessagesAsRead = useCallback(async (chatId: string) => {
    try {
      const response: MarkAsReadResponse = await chatService.markMessagesAsRead(
        chatId,
      );

      if (response.success) {
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === chatId ? {...chat, unread: 0} : chat,
          ),
        );

        setMessages(prevMessages =>
          prevMessages.map(message => ({...message, read: true})),
        );
      }
    } catch (err: any) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', err);
    }
  }, []);

  // ✅ THÊM MỚI: Get chat stats
  const getChatStats = useCallback(async (chatId: string) => {
    try {
      const response: ChatStatsResponse = await chatService.getChatStats(
        chatId,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.error || response.message || 'Không thể lấy thống kê chat',
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Không thể lấy thống kê chat';
      setError(errorMessage);
      return null;
    }
  }, []);

  // ✅ Debug Firebase auth state
  const debugFirebaseAuth = useCallback(() => {
    const currentUser = auth.currentUser;
  }, [isFirebaseReady, isAuthenticated, user?._id]);

  // ✅ SỬA ĐỔI: Load chats khi có user VÀ authenticated
  useEffect(() => {
    if (user && isAuthenticated && !loading) {
      getChats();
    }
  }, [user, isAuthenticated]); // ✅ Thêm isAuthenticated vào dependencies

  // ✅ SỬA ĐỔI: Cleanup khi component unmount
  useEffect(() => {
    return () => {
      ('🧹 Component unmounting, cleaning up all listeners');
      cleanupAllListeners();
    };
  }, [cleanupAllListeners]);

  // Khởi tạo khi component mount
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return {
    // ✅ Return sorted chats thay vì chats gốc
    chats: sortedChats,
    messages,
    loading,
    error,
    user,
    currentChatId,
    isFirebaseReady,
    isAuthenticated, // ✅ Thêm auth status

    // Methods
    getChats,
    getChatMessages,
    createChat,
    sendMessage,
    sendMessageWithFile, // ✅ THÊM MỚI
    uploadChatMedia, // ✅ THÊM MỚI
    deleteChat,
    markMessagesAsRead,
    searchChats,
    setupMessageListener,
    sendMessageToFirestore,
    debugFirebaseAuth,
    getUsers,
    searchUsers,
    getUsersByRole,
    checkExistingChatBeforeCreate,
    getChatStats, // ✅ THÊM MỚI

    // ✅ Thêm refresh method
    refreshChats: getChats,

    // User management
    getCurrentUser,
  };
};

export default useChat;
