import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import {useSubmission} from '../../hooks/useAssignment';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';

type SubmitAssignmentProps = NativeStackScreenProps<
  RootStackParamList,
  'SubmitAssignment'
>;

const SubmitAssignment = ({navigation, route}: SubmitAssignmentProps) => {
  const {assignmentId, assignment} = route.params;
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  const {submitting, submitAssignment} = useSubmission(assignmentId);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài làm');
      return;
    }

    try {
      const submissionData = {
        content: content.trim(),
        attachments: attachments,
      };

      const result = await submitAssignment(submissionData, attachments);

      if (result) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const handleAddAttachment = () => {
    // TODO: Implement file picker
    Alert.alert('Thông báo', 'Tính năng đính kèm file sẽ được cập nhật sau');
  };

  return (
    <View style={styles.container}>
      <HeaderComponent title="Nộp bài tập" navigation={navigation} showBack />

      <ScrollView style={styles.content}>
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <Text style={styles.assignmentDescription}>
            {assignment.description}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung bài làm *</Text>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="Nhập nội dung bài làm của bạn..."
            placeholderTextColor={appColors.gray}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đính kèm file</Text>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAddAttachment}>
            <IconFeather name="paperclip" size={20} color={appColors.primary} />
            <Text style={styles.attachmentButtonText}>Thêm file đính kèm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.submitButtonText}>
            {submitting ? 'Đang nộp...' : 'Nộp bài'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightGray,
  },
  content: {
    flex: 1,
  },
  assignmentInfo: {
    backgroundColor: appColors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  assignmentDescription: {
    fontSize: 14,
    color: appColors.gray,
    lineHeight: 20,
  },
  section: {
    backgroundColor: appColors.white,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: appColors.text,
    height: 120,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: appColors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
  },
  attachmentButtonText: {
    marginLeft: 8,
    color: appColors.primary,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: appColors.white,
    borderTopWidth: 1,
    borderTopColor: appColors.lightGray,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.gray,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: appColors.gray,
  },
  cancelButtonText: {
    color: appColors.gray,
    fontWeight: '600',
  },
  submitButtonText: {
    color: appColors.white,
    fontWeight: '600',
  },
});

export default SubmitAssignment;
