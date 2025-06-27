import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {pick, types, isCancel} from '@react-native-documents/picker';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';

import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import {
  AssignmentDetailParams,
  SubmitAssignmentRequest,
  UpdateAssignmentRequest,
} from '../../types/assignmentType';
import {
  useAssignmentDetail,
  useSubmission,
  useAssignmentCRUD,
} from '../../hooks/useAssignment';
import assignmentService from '../../services/assignmentService';

type AssignmentDetailProps = NativeStackScreenProps<
  RootStackParamList,
  'AssignmentDetail'
>;

interface FileItem {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

const AssignmentDetail = ({navigation, route}: AssignmentDetailProps) => {
  const {assignmentId} = route.params as AssignmentDetailParams;

  const [userRole, setUserRole] = useState<string>('student');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editMaxScore, setEditMaxScore] = useState('');

  // Hooks
  const {assignment, loading, error, canSubmit, refetch} =
    useAssignmentDetail(assignmentId);
  const {submitAssignment, submitting} = useSubmission(assignmentId);
  const {
    updateAssignment,
    deleteAssignment,
    loading: crudLoading,
  } = useAssignmentCRUD();

  const isTeacher = userRole === 'teacher';

  // Load user info
  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const userString = await AsyncStorage.getItem('userInfo');
        if (userString) {
          const userData = JSON.parse(userString);
          let userInfo;
          if (userData.data && userData.data.user) {
            userInfo = userData.data.user;
          } else if (userData.role || userData._id) {
            userInfo = userData;
          } else {
            userInfo = userData;
          }
          setUserRole(userInfo?.role || 'student');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUserRole('student');
      }
    };
    getUserFromStorage();
  }, []);

  // Initialize edit form data
  useEffect(() => {
    if (assignment && showEditModal) {
      setEditTitle(assignment.title);
      setEditDescription(assignment.description);
      setEditInstructions(assignment.instructions || '');
      setEditMaxScore(assignment.maxScore.toString());
    }
  }, [assignment, showEditModal]);

  // Computed values
  const dueDate = assignment ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate ? dueDate < new Date() : false;
  const daysUntilDue = assignment
    ? assignmentService.getDaysUntilDue(assignment.dueDate)
    : 0;
  const formattedDueDate = dueDate
    ? format(dueDate, 'dd/MM/yyyy HH:mm', {locale: vi})
    : '';

  // Status info
  const getStatusInfo = () => {
    if (!assignment)
      return {text: '', color: appColors.gray, icon: 'help-outline'};

    const status = assignment.status || 'pending';
    return {
      text: assignmentService.getStatusDisplayText(status),
      color: assignmentService.getStatusColor(status),
      icon: assignmentService.getStatusIcon(status),
    };
  };

  const statusInfo = getStatusInfo();

  // File picker functions
  const pickImages = () => {
    Alert.alert('Chọn ảnh', 'Bạn muốn chọn ảnh từ đâu?', [
      {text: 'Hủy', style: 'cancel'},
      {text: 'Thư viện', onPress: () => selectFromLibrary()},
      {text: 'Camera', onPress: () => openCamera()},
    ]);
  };

  const selectFromLibrary = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 5,
      },
      response => {
        if (response.assets) {
          const newFiles = response.assets.map(asset => ({
            uri: asset.uri!,
            name: asset.fileName || `image_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          }));
          setSelectedFiles(prev => [...prev, ...newFiles]);
        }
      },
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      response => {
        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const newFile = {
            uri: asset.uri!,
            name: asset.fileName || `photo_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
          };
          setSelectedFiles(prev => [...prev, newFile]);
        }
      },
    );
  };

  // Updated pickDocuments function using @react-native-documents/picker
  const pickDocuments = async () => {
    try {
      const results = await pick({
        type: [
          types.allFiles,
          types.pdf,
          types.doc,
          types.docx,
          types.plainText,
          types.images,
          types.video,
          types.audio,
        ],
        allowMultiSelection: true,
        mode: 'import', // 'import' | 'open' | 'copy'
      });

      const newFiles = results.map(result => ({
        uri: result.uri,
        name: result.name || 'document',
        type: result.type || 'application/octet-stream',
        size: result.size,
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      if (!isCancel(err)) {
        console.error('Error picking document:', err);
        Alert.alert('Lỗi', 'Không thể chọn tệp tin. Vui lòng thử lại.');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submission
  const handleSubmit = async () => {
    try {
      if (!submissionContent.trim() && selectedFiles.length === 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập nội dung hoặc chọn file để nộp bài');
        return;
      }

      const submissionData: SubmitAssignmentRequest = {
        content: submissionContent.trim(),
      };

      const result = await submitAssignment(submissionData, selectedFiles);

      if (result) {
        setShowSubmissionModal(false);
        setSubmissionContent('');
        setSelectedFiles([]);
        refetch(); // Refresh assignment data
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  // Handle edit assignment
  const handleEdit = async () => {
    try {
      if (!editTitle.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài tập');
        return;
      }

      const maxScore = parseInt(editMaxScore);
      if (isNaN(maxScore) || maxScore <= 0) {
        Alert.alert('Lỗi', 'Điểm tối đa phải là số dương');
        return;
      }

      const updateData: UpdateAssignmentRequest = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        instructions: editInstructions.trim(),
        maxScore: maxScore,
      };

      const result = await updateAssignment(assignmentId, updateData);

      if (result) {
        setShowEditModal(false);
        refetch(); // Refresh assignment data
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  // Handle delete assignment
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteAssignment(assignmentId);
            if (success) {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Chi tiết bài tập"
          navigation={navigation}
          showBack
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết bài tập...</Text>
        </View>
      </View>
    );
  }

  if (error || !assignment) {
    return (
      <View style={styles.container}>
        <HeaderComponent
          title="Chi tiết bài tập"
          navigation={navigation}
          showBack
        />
        <View style={styles.errorContainer}>
          <IconFeather name="alert-circle" size={48} color={appColors.error} />
          <Text style={styles.errorText}>
            {error || 'Không tìm thấy bài tập'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderComponent
        title="Chi tiết bài tập"
        navigation={navigation}
        showBack
        rightIcon={
          isTeacher ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={() => setShowEditModal(true)}>
                <IconFeather name="edit-2" size={20} color={appColors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerActionButton, styles.deleteButton]}
                onPress={handleDelete}>
                <IconFeather name="trash-2" size={20} color={appColors.white} />
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Assignment Header */}
        <View style={styles.headerCard}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{assignment.title}</Text>
            <View
              style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
              <IconMaterial
                name={statusInfo.icon}
                size={16}
                color={appColors.white}
              />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>

          <Text style={styles.courseName}>{assignment.course.name}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <IconFeather name="calendar" size={16} color={appColors.gray} />
              <Text style={styles.metaText}>Hạn nộp: {formattedDueDate}</Text>
            </View>
            <View style={styles.metaItem}>
              <IconFeather name="star" size={16} color={appColors.gray} />
              <Text style={styles.metaText}>
                Điểm tối đa: {assignment.maxScore}
              </Text>
            </View>
            {isOverdue && (
              <View style={styles.overdueWarning}>
                <IconFeather
                  name="alert-triangle"
                  size={16}
                  color={appColors.error}
                />
                <Text style={styles.overdueText}>
                  Quá hạn {Math.abs(daysUntilDue)} ngày
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Assignment Content */}
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Mô tả bài tập</Text>
          <Text style={styles.description}>{assignment.description}</Text>

          {assignment.instructions && (
            <>
              <Text style={styles.sectionTitle}>Hướng dẫn</Text>
              <Text style={styles.instructions}>{assignment.instructions}</Text>
            </>
          )}

          {assignment.attachments && assignment.attachments.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
              {assignment.attachments.map((file, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <IconFeather
                    name="paperclip"
                    size={16}
                    color={appColors.primary}
                  />
                  <Text style={styles.attachmentName}>{file.name}</Text>
                  <Text style={styles.attachmentSize}>{file.fileSize}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Student Submission Section */}
        {!isTeacher && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Bài nộp của bạn</Text>

            {assignment.mySubmission ? (
              <View style={styles.submissionInfo}>
                <View style={styles.submissionHeader}>
                  <Text style={styles.submissionStatus}>
                    {assignmentService.getStatusDisplayText(
                      assignment.mySubmission.status,
                    )}
                  </Text>
                  <Text style={styles.submissionDate}>
                    Nộp lúc:{' '}
                    {format(
                      new Date(assignment.mySubmission.submissionDate),
                      'dd/MM/yyyy HH:mm',
                      {locale: vi},
                    )}
                  </Text>
                </View>

                {assignment.mySubmission.content && (
                  <Text style={styles.submissionContent}>
                    {assignment.mySubmission.content}
                  </Text>
                )}

                {assignment.mySubmission.images &&
                  assignment.mySubmission.images.length > 0 && (
                    <View style={styles.submissionFiles}>
                      <Text style={styles.fileLabel}>Ảnh đã nộp:</Text>
                      {assignment.mySubmission.images.map((image, index) => (
                        <Text key={index} style={styles.fileName}>
                          {image.name}
                        </Text>
                      ))}
                    </View>
                  )}

                {assignment.mySubmission.files &&
                  assignment.mySubmission.files.length > 0 && (
                    <View style={styles.submissionFiles}>
                      <Text style={styles.fileLabel}>File đã nộp:</Text>
                      {assignment.mySubmission.files.map((file, index) => (
                        <Text key={index} style={styles.fileName}>
                          {file.name}
                        </Text>
                      ))}
                    </View>
                  )}

                {assignment.mySubmission.score !== undefined && (
                  <View style={styles.gradeInfo}>
                    <Text style={styles.gradeText}>
                      Điểm: {assignment.mySubmission.score}/
                      {assignment.maxScore}
                    </Text>
                    {assignment.mySubmission.feedback && (
                      <Text style={styles.feedbackText}>
                        Nhận xét: {assignment.mySubmission.feedback}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.noSubmissionText}>Chưa nộp bài</Text>
            )}

            {canSubmit?.can && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setShowSubmissionModal(true)}>
                <IconFeather name="upload" size={20} color={appColors.white} />
                <Text style={styles.submitButtonText}>
                  {assignment.mySubmission ? 'Nộp lại bài' : 'Nộp bài'}
                </Text>
              </TouchableOpacity>
            )}

            {!canSubmit?.can && canSubmit?.reason && (
              <View style={styles.cannotSubmitContainer}>
                <IconFeather name="info" size={16} color={appColors.warning} />
                <Text style={styles.cannotSubmitText}>{canSubmit.reason}</Text>
              </View>
            )}
          </View>
        )}

        {/* Teacher Statistics Section */}
        {isTeacher && assignment.stats && (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Thống kê bài tập</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {assignment.stats.totalSubmissions}
                </Text>
                <Text style={styles.statLabel}>Tổng bài nộp</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {assignment.stats.gradedSubmissions}
                </Text>
                <Text style={styles.statLabel}>Đã chấm điểm</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {assignment.stats.averageScore.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Điểm trung bình</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {assignment.stats.onTimeSubmissions}
                </Text>
                <Text style={styles.statLabel}>Nộp đúng hạn</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewSubmissionsButton}
              onPress={() =>
                navigation.navigate('SubmissionList', {assignmentId})
              }>
              <Text style={styles.viewSubmissionsText}>
                Xem danh sách bài nộp
              </Text>
              <IconFeather
                name="arrow-right"
                size={16}
                color={appColors.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Submission Modal */}
      <Modal
        visible={showSubmissionModal}
        animationType="slide"
        onRequestClose={() => setShowSubmissionModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSubmissionModal(false)}>
              <IconFeather name="x" size={24} color={appColors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nộp bài tập</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={appColors.primary} />
              ) : (
                <Text style={styles.modalSubmitText}>Nộp</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Nội dung bài làm</Text>
            <TextInput
              style={styles.textArea}
              value={submissionContent}
              onChangeText={setSubmissionContent}
              placeholder="Nhập nội dung bài làm của bạn..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.fileSection}>
              <Text style={styles.inputLabel}>Tệp đính kèm</Text>
              <View style={styles.fileActions}>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={pickImages}>
                  <IconFeather
                    name="camera"
                    size={20}
                    color={appColors.primary}
                  />
                  <Text style={styles.fileButtonText}>Chọn ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={pickDocuments}>
                  <IconFeather
                    name="paperclip"
                    size={20}
                    color={appColors.primary}
                  />
                  <Text style={styles.fileButtonText}>Chọn file</Text>
                </TouchableOpacity>
              </View>

              {selectedFiles.length > 0 && (
                <View style={styles.selectedFiles}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.selectedFile}>
                      <View style={styles.fileInfo}>
                        <Text style={styles.selectedFileName}>{file.name}</Text>
                        {file.size && (
                          <Text style={styles.selectedFileSize}>
                            {assignmentService.formatFileSize(file.size)}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <IconFeather
                          name="x"
                          size={16}
                          color={appColors.error}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <IconFeather name="x" size={24} color={appColors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chỉnh sửa bài tập</Text>
            <TouchableOpacity onPress={handleEdit} disabled={crudLoading}>
              {crudLoading ? (
                <ActivityIndicator size="small" color={appColors.primary} />
              ) : (
                <Text style={styles.modalSubmitText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Tiêu đề</Text>
            <TextInput
              style={styles.textInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Nhập tiêu đề bài tập"
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={styles.textArea}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Nhập mô tả bài tập"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Hướng dẫn</Text>
            <TextInput
              style={styles.textArea}
              value={editInstructions}
              onChangeText={setEditInstructions}
              placeholder="Nhập hướng dẫn làm bài"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Điểm tối đa</Text>
            <TextInput
              style={styles.textInput}
              value={editMaxScore}
              onChangeText={setEditMaxScore}
              placeholder="Nhập điểm tối đa"
              keyboardType="numeric"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: appColors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: appColors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: appColors.white,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    backgroundColor: appColors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: appColors.error,
  },
  headerCard: {
    backgroundColor: appColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.text,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: appColors.white,
  },
  courseName: {
    fontSize: 16,
    color: appColors.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  metaInfo: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: appColors.gray,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: appColors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  overdueText: {
    fontSize: 12,
    color: appColors.error,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: appColors.text,
  },
  attachmentSize: {
    fontSize: 12,
    color: appColors.gray,
  },
  submissionInfo: {
    backgroundColor: appColors.lightGray,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  submissionStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  submissionDate: {
    fontSize: 12,
    color: appColors.gray,
  },
  submissionContent: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  submissionFiles: {
    marginBottom: 12,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.gray,
    marginBottom: 4,
  },
  fileName: {
    fontSize: 12,
    color: appColors.text,
    marginLeft: 8,
  },
  gradeInfo: {
    borderTopWidth: 1,
    borderTopColor: appColors.border,
    paddingTop: 12,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
  },
  noSubmissionText: {
    fontSize: 14,
    color: appColors.gray,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
  cannotSubmitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.warningLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  cannotSubmitText: {
    flex: 1,
    fontSize: 14,
    color: appColors.warning,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
    backgroundColor: appColors.lightGray,
    padding: 16,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: appColors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  viewSubmissionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewSubmissionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: appColors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: appColors.text,
    minHeight: 100,
  },
  fileSection: {
    marginTop: 16,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  fileButtonText: {
    fontSize: 14,
    color: appColors.primary,
    fontWeight: '500',
  },
  selectedFiles: {
    gap: 8,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appColors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  fileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    color: appColors.text,
    fontWeight: '500',
  },
  selectedFileSize: {
    fontSize: 12,
    color: appColors.gray,
    marginTop: 2,
  },
});

export default AssignmentDetail;
