import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
// ✅ SỬA ĐỔI: Chỉ sử dụng React Native Firebase
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {chatService} from '../services/chatService';
import {
  FormattedMessage,
  SendMessageParams,
  UploadFileData,
  UploadChatFileResponse,
  FileValidation,
  MessageFile,
} from '../types/chatType';

// ✅ CẬP NHẬT: Enhanced Message interface with file support
export interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name?: string;
    avatar?: string;
  };
  image?: string | null;
  file?: MessageFile | null; // ✅ THÊM MỚI: Enhanced file object
  read?: boolean;
  pending?: boolean;
}

interface CurrentUser {
  _id: string;
  fullName?: string;
  avatar?: string;
  email?: string;
}

export const useChatDetail = (chatId: string, currentUserId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false); // ✅ THÊM MỚI
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  const listenerRef = useRef<(() => void) | null>(null);
  const isListenerSetupRef = useRef<boolean>(false);
  const mountedRef = useRef(true);

  // ✅ SỬA ĐỔI: Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const response = JSON.parse(userInfoString);

          let userInfo;
          if (response.success && response.data) {
            userInfo = response.data.user || response.data;
          } else if (response.user) {
            userInfo = response.user;
          } else {
            userInfo = response;
          }

          if (mountedRef.current) {
            setCurrentUser(userInfo);
          }
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };

    getCurrentUser();
  }, []);

  const activeUserId = currentUser?._id || currentUserId;

  // ✅ SỬA ĐỔI: Check Firebase connection với React Native Firebase
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // ✅ Test Firebase connection
        await firestore().settings({
          persistence: true,
        });

        if (mountedRef.current) {
          setIsFirebaseReady(true);
          console.log('✅ Firebase ready for chat detail');
        }
      } catch (error) {
        console.error('❌ Firebase connection failed:', error);
        if (mountedRef.current) {
          setIsFirebaseReady(false);
        }
      }
    };

    checkFirebaseConnection();
  }, []);

  // ✅ CẬP NHẬT: Enhanced convert function với file support
  const convertToMessage = useCallback(
    (msg: FormattedMessage): Message => ({
      _id: msg._id,
      text: msg.text,
      createdAt:
        typeof msg.createdAt === 'string'
          ? new Date(msg.createdAt)
          : msg.createdAt,
      user: {
        _id: msg.user._id,
        name: msg.user.name || '',
        avatar: msg.user.avatar || '',
      },
      image: msg.image || null,
      file: msg.file || null, // ✅ THÊM MỚI: File object
      read: msg.read || false,
    }),
    [],
  );

  // ✅ CẬP NHẬT: Load initial messages
  const loadInitialMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Loading initial messages for chat:', chatId);

      const response = await chatService.getChatMessages(chatId);

      if (response.success && response.data) {
        const convertedMessages = response.data.map(convertToMessage);

        if (mountedRef.current) {
          setMessages(convertedMessages);
          console.log('✅ Initial messages loaded:', convertedMessages.length);
        }
      } else {
        console.warn('⚠️ Failed to load initial messages:', response.message);
      }
    } catch (err: any) {
      console.error('❌ Error loading initial messages:', err);
      if (mountedRef.current) {
        setError('Không thể tải tin nhắn từ API');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [chatId, convertToMessage]);

  // ✅ SỬA ĐỔI: Setup Firestore listener với React Native Firebase
  const setupFirestoreListener = useCallback(() => {
    if (!chatId || !isFirebaseReady || !activeUserId) {
      console.log('❌ Cannot setup Firestore listener - missing requirements');
      return null;
    }

    if (isListenerSetupRef.current) {
      console.log('⚠️ Listener already setup');
      return null;
    }

    isListenerSetupRef.current = true;

    try {
      console.log('🔥 Setting up Firestore listener for chat:', chatId);

      // ✅ SỬA ĐỔI: React Native Firebase syntax
      const messagesRef = firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(100);

      const unsubscribe = messagesRef.onSnapshot(
        snapshot => {
          if (!snapshot.empty && mountedRef.current) {
            console.log(
              '📱 Firestore snapshot received:',
              snapshot.size,
              'messages',
            );

            const firestoreMessages: Message[] = [];

            snapshot.forEach(doc => {
              const data = doc.data();
              // ✅ CẬP NHẬT: Enhanced message parsing với file support
              firestoreMessages.push({
                _id: doc.id,
                text: data.content || data.text || '',
                createdAt:
                  data.createdAt?.toDate() ||
                  data.timestamp?.toDate() ||
                  new Date(),
                user: {
                  _id: data.sender || data.senderId || '',
                  name: data.senderName || '',
                  avatar:
                    data.senderAvatar ||
                    'https://www.gravatar.com/avatar/default',
                },
                image: data.fileUrl || data.file || null,
                // ✅ THÊM MỚI: Enhanced file object
                file:
                  data.file || data.fileUrl
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
                read: data.readBy?.includes(activeUserId) || false,
              });
            });

            setMessages(prevMessages => {
              // ✅ So sánh thông minh để tránh re-render không cần thiết
              if (prevMessages.length !== firestoreMessages.length) {
                return firestoreMessages;
              }

              const lastPrev = prevMessages[0];
              const lastNew = firestoreMessages[0];

              if (!lastPrev || !lastNew || lastPrev._id !== lastNew._id) {
                return firestoreMessages;
              }

              return prevMessages;
            });

            if (loading && mountedRef.current) {
              setLoading(false);
            }
          }
        },
        err => {
          console.error('❌ Firestore listener error:', err);
          isListenerSetupRef.current = false;

          if (mountedRef.current && messages.length === 0) {
            setError('Không thể kết nối Firestore');
          }
        },
      );

      listenerRef.current = unsubscribe;
      return unsubscribe;
    } catch (err) {
      console.error('❌ Error setting up Firestore listener:', err);
      isListenerSetupRef.current = false;
      return null;
    }
  }, [chatId, activeUserId, isFirebaseReady, loading, messages.length]);

  // ✅ SỬA ĐỔI: Load initial messages khi component mount
  useEffect(() => {
    if (!chatId) {
      return;
    }

    loadInitialMessages();
  }, [chatId, loadInitialMessages]);

  // ✅ SỬA ĐỔI: Setup listener khi conditions met
  useEffect(() => {
    if (
      chatId &&
      activeUserId &&
      isFirebaseReady &&
      !isListenerSetupRef.current
    ) {
      const unsubscribe = setupFirestoreListener();

      return () => {
        console.log('🧹 Cleaning up Firestore listener');
        if (unsubscribe) {
          unsubscribe();
        }
        if (listenerRef.current) {
          listenerRef.current();
          listenerRef.current = null;
        }
        isListenerSetupRef.current = false;
      };
    }
  }, [chatId, activeUserId, isFirebaseReady, setupFirestoreListener]);

  // ✅ THÊM MỚI: Helper function để clean data trước khi gửi Firestore
  const cleanDataForFirestore = useCallback((data: any) => {
    const cleaned: any = {};

    Object.keys(data).forEach(key => {
      const value = data[key];

      // ✅ Convert undefined to null, keep other values
      if (value === undefined) {
        cleaned[key] = null;
      } else if (value === '') {
        cleaned[key] = ''; // Keep empty strings
      } else if (value !== null) {
        cleaned[key] = value;
      }
      // Skip null values entirely or set them explicitly
    });

    return cleaned;
  }, []);

  // ✅ SỬA ĐỔI: Safe Firestore message creation
  const createFirestoreMessage = useCallback(
    (content: string, uploadData?: UploadFileData) => {
      const baseMessage = {
        content: content || '',
        text: content || '',
        sender: activeUserId || '',
        senderId: activeUserId || '',
        senderName: currentUser?.fullName || 'Unknown',
        senderAvatar:
          currentUser?.avatar || 'https://www.gravatar.com/avatar/default',
        createdAt: firestore.FieldValue.serverTimestamp(),
        timestamp: firestore.FieldValue.serverTimestamp(),
        readBy: [activeUserId || ''],
      };

      // ✅ Only add file fields if uploadData exists
      if (uploadData) {
        return {
          ...baseMessage,
          file: uploadData.url || '',
          fileUrl: uploadData.url || '',
          fileName: uploadData.name || 'Unknown File',
          fileSize: uploadData.size || 0,
          fileType: uploadData.type || 'file',
          fileMimeType: uploadData.mimeType || 'application/octet-stream',
          thumbnail: uploadData.thumbnail || null,
        };
      }

      return baseMessage;
    },
    [activeUserId, currentUser],
  );

  // ✅ CẬP NHẬT: Enhanced Firestore send với proper null handling
  const sendMessageToFirestore = useCallback(
    async (content: string, uploadData?: UploadFileData) => {
      if (!activeUserId || !currentUser || !isFirebaseReady) {
        console.log('❌ Cannot send to Firestore - missing requirements');
        return false;
      }

      try {
        console.log('🔥 Sending message to Firestore (safe)...');

        const messagesRef = firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages');

        // ✅ Create clean message data
        const messageData = createFirestoreMessage(content, uploadData);

        // ✅ Clean any undefined values
        const cleanedData = cleanDataForFirestore(messageData);

        console.log('🔍 Cleaned message data:', {
          hasContent: !!cleanedData.content,
          hasFile: !!cleanedData.file,
          keys: Object.keys(cleanedData),
        });

        await messagesRef.add(cleanedData);

        // Update chat document
        try {
          const chatRef = firestore().collection('chats').doc(chatId);
          const lastMessage = content || (uploadData ? '📎 File đính kèm' : '');

          await chatRef.update({
            lastMessage,
            lastMessageTime: firestore.FieldValue.serverTimestamp(),
          });
        } catch (updateErr) {
          console.warn('Warning: Could not update chat document:', updateErr);
        }

        console.log('✅ Message sent to Firestore successfully (safe)');
        return true;
      } catch (err: any) {
        console.error('❌ Error sending message to Firestore (safe):', err);
        return false;
      }
    },
    [
      chatId,
      activeUserId,
      currentUser,
      isFirebaseReady,
      createFirestoreMessage,
      cleanDataForFirestore,
    ],
  );

  // ✅ THÊM MỚI: Upload file method
  const uploadFile = useCallback(
    async (file: File): Promise<UploadFileData | null> => {
      if (!chatId || uploading) {
        console.log('❌ Cannot upload - missing chatId or already uploading');
        return null;
      }

      if (!file || !(file instanceof File)) {
        console.log('❌ Invalid file object');
        return null;
      }

      try {
        setUploading(true);
        setError(null);

        console.log('📤 Uploading file:', {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        // Validate file
        const validation: FileValidation = chatService.validateFileType(file);
        if (!validation.isValid) {
          throw new Error(validation.error || 'File không hợp lệ');
        }

        // Create FormData
        const formData = chatService.createUploadFormData(file);

        // Upload file
        const response: UploadChatFileResponse =
          await chatService.uploadChatMedia(chatId, formData);

        if (response.success && response.data) {
          console.log('✅ File uploaded successfully:', {
            url: response.data.url,
            name: response.data.name,
            size: response.data.size,
          });
          return response.data;
        } else {
          throw new Error(
            response.error || response.message || 'Không thể tải lên file',
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || 'Không thể tải lên file';
        console.error('❌ Upload error:', errorMessage);

        if (mountedRef.current) {
          setError(errorMessage);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setUploading(false);
        }
      }
    },
    [chatId, uploading],
  );

  // ✅ CẬP NHẬT: Enhanced send message với better undefined handling
  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      // ✅ SỬA ĐỔI: Better validation
      const hasContent = content && content.trim().length > 0;
      const hasFile = file && file instanceof File;

      if (!hasContent && !hasFile) {
        console.log('❌ Cannot send message - no content and no file');
        return false;
      }

      if (sending) {
        console.log('❌ Already sending message');
        return false;
      }

      try {
        setSending(true);
        setError(null);

        console.log('📤 Sending message:', {
          hasContent,
          hasFile,
          contentLength: content?.length || 0,
        });

        let uploadData: UploadFileData | null = null;

        // Upload file if provided
        if (hasFile) {
          uploadData = await uploadFile(file);
          if (!uploadData) {
            throw new Error('Không thể tải lên file');
          }
        }

        // ✅ SỬA ĐỔI: Create message params với proper null handling
        const messageContent = hasContent ? content.trim() : '';
        const params: SendMessageParams = chatService.createSendMessageParams(
          chatId,
          messageContent || undefined, // ✅ Only pass if has content
          uploadData || undefined, // ✅ Only pass if has upload data
        );

        // Send via API first
        const response = await chatService.sendMessage(params);

        if (response.success) {
          console.log('✅ Message sent via API');

          // Also send to Firestore for real-time updates
          if (isFirebaseReady) {
            // ✅ SỬA ĐỔI: Pass safe values to Firestore
            await sendMessageToFirestore(
              messageContent, // ✅ Always string, never undefined
              uploadData || undefined, // ✅ Proper undefined handling
            );
          }
          return true;
        } else {
          console.warn('⚠️ API failed, trying Firestore only');

          // Fallback to Firestore only
          if (isFirebaseReady) {
            return await sendMessageToFirestore(
              messageContent, // ✅ Always string
              uploadData || undefined, // ✅ Proper undefined handling
            );
          } else {
            throw new Error(response.message || 'Không thể gửi tin nhắn');
          }
        }
      } catch (err: any) {
        console.error('❌ Send message error:', err);

        // Last resort: try Firestore only
        if (isFirebaseReady && (hasContent || hasFile)) {
          console.log('⚠️ Trying Firestore as last resort...');

          let fallbackUploadData: UploadFileData | undefined;
          if (hasFile) {
            fallbackUploadData = await uploadFile(file);
          }

          const messageContent = hasContent ? content.trim() : '';
          return await sendMessageToFirestore(
            messageContent, // ✅ Always string
            fallbackUploadData, // ✅ Can be undefined safely here
          );
        }

        const errorMessage =
          err.response?.data?.error || err.message || 'Không thể gửi tin nhắn';

        if (mountedRef.current) {
          setError(errorMessage);
        }
        return false;
      } finally {
        if (mountedRef.current) {
          setSending(false);
        }
      }
    },
    [chatId, sending, isFirebaseReady, sendMessageToFirestore, uploadFile],
  );

  // ✅ CẬP NHẬT: Send text message only
  const sendTextMessage = useCallback(
    async (content: string) => {
      return await sendMessage(content);
    },
    [sendMessage],
  );

  // ✅ THÊM MỚI: Send file message
  const sendFileMessage = useCallback(
    async (file: File, caption?: string) => {
      return await sendMessage(caption || '', file);
    },
    [sendMessage],
  );

  // ✅ SỬA ĐỔI: Mark as read trong Firestore
  const markAsReadFirestore = useCallback(async () => {
    if (!activeUserId || !chatId || !isFirebaseReady) {
      return;
    }

    try {
      console.log('🔥 Marking messages as read in Firestore...');

      // ✅ SỬA ĐỔI: React Native Firebase syntax
      const messagesRef = firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .where('sender', '!=', activeUserId);

      const unreadSnapshot = await messagesRef.get();

      const updatePromises = unreadSnapshot.docs.map(async messageDoc => {
        const messageData = messageDoc.data();
        const readBy = messageData.readBy || [];

        if (!readBy.includes(activeUserId)) {
          return messageDoc.ref.update({
            readBy: [...readBy, activeUserId],
          });
        }
      });

      await Promise.all(updatePromises.filter(Boolean));
      console.log('✅ Messages marked as read in Firestore');
    } catch (err: any) {
      console.error('❌ Error marking as read in Firestore:', err);
    }
  }, [chatId, activeUserId, isFirebaseReady]);

  // ✅ CẬP NHẬT: Mark as read method
  const markAsRead = useCallback(async () => {
    try {
      console.log('📖 Marking messages as read...');

      // Try API first
      const response = await chatService.markMessagesAsRead(chatId);

      if (response.success) {
        console.log('✅ Messages marked as read via API');

        // Also update Firestore
        if (isFirebaseReady) {
          await markAsReadFirestore();
        }

        // Update local state
        if (mountedRef.current) {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.user._id !== activeUserId ? {...msg, read: true} : msg,
            ),
          );
        }
      } else {
        console.warn('⚠️ API failed, trying Firestore only');

        // Fallback to Firestore only
        if (isFirebaseReady) {
          await markAsReadFirestore();
        }
      }
    } catch (err) {
      console.error('❌ Mark as read error:', err);

      // Last resort: Firestore only
      if (isFirebaseReady) {
        await markAsReadFirestore();
      }
    }
  }, [chatId, activeUserId, isFirebaseReady, markAsReadFirestore]);

  // ✅ CẬP NHẬT: Retry method
  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    loadInitialMessages();
  }, [loadInitialMessages]);

  // ✅ Helper methods
  const getMessageTime = useCallback((message: Message) => {
    return message.createdAt.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getOtherUser = useCallback(() => {
    if (!messages.length || !activeUserId) return null;

    const otherUserMessage = messages.find(
      msg => msg.user._id !== activeUserId,
    );
    return otherUserMessage?.user || null;
  }, [messages, activeUserId]);

  // ✅ Computed values
  const unreadCount = useMemo(() => {
    return messages.filter(msg => msg.user._id !== activeUserId && !msg.read)
      .length;
  }, [messages, activeUserId]);

  const hasUnreadMessages = useMemo(() => {
    return unreadCount > 0;
  }, [unreadCount]);

  // ✅ THÊM MỚI: Get file messages
  const fileMessages = useMemo(() => {
    return messages.filter(msg => msg.file || msg.image);
  }, [messages]);

  // ✅ THÊM MỚI: Get image messages
  const imageMessages = useMemo(() => {
    return messages.filter(msg => msg.file?.type === 'image' || msg.image);
  }, [messages]);

  // ✅ THÊM MỚI: Validate file before sending
  const validateFileForSending = useCallback(
    (file: File): {isValid: boolean; error?: string} => {
      return chatService.validateFileType(file);
    },
    [],
  );

  // ✅ Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      console.log('🧹 Chat detail unmounting, cleaning up...');
      mountedRef.current = false;

      // Cleanup listener
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
      isListenerSetupRef.current = false;
    };
  }, []);

  return {
    // State
    messages,
    loading,
    error,
    sending,
    uploading,
    unreadCount,
    hasUnreadMessages,
    currentUser,
    activeUserId,
    isFirebaseReady,
    fileMessages,
    imageMessages,

    // ✅ CẬP NHẬT: Enhanced methods with safe Firestore
    sendMessage,
    sendTextMessage,
    sendFileMessage,
    uploadFile,
    validateFileForSending,
    markAsRead,
    retry,
    getMessageTime,
    getOtherUser,
    sendMessageToFirestore, // ✅ Use safe version
    markAsReadFirestore,

    // ✅ THÊM: Debug helpers
    cleanDataForFirestore,
    createFirestoreMessage,
  };
};

export default useChatDetail;
