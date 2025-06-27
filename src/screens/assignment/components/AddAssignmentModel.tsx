import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../../constants/appColors';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';

interface AddAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (assignmentData: AssignmentFormData) => void;
  courseId: string;
}

interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  courseId: string;
}

const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  visible,
  onClose,
  onSubmit,
  courseId,
}) => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    maxScore: 10,
    courseId,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const {type} = event;

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }

    if (type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      setFormData(prev => ({...prev, dueDate: selectedDate}));

      // Trên Android, sau khi chọn date thì hiện time picker
      if (Platform.OS === 'android' && !showTimePicker) {
        setTimeout(() => setShowTimePicker(true), 100);
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const {type} = event;

    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (type === 'dismissed') {
      return;
    }

    if (selectedTime) {
      // Kết hợp date hiện tại với time mới chọn
      const newDateTime = new Date(formData.dueDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());

      setFormData(prev => ({...prev, dueDate: newDateTime}));
    }
  };

  const showDatePickerModal = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(!showDatePicker);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài tập');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả bài tập');
      return false;
    }
    if (formData.dueDate <= new Date()) {
      Alert.alert('Lỗi', 'Hạn nộp phải sau thời điểm hiện tại');
      return false;
    }
    if (formData.maxScore <= 0) {
      Alert.alert('Lỗi', 'Điểm tối đa phải lớn hơn 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 10,
        courseId,
      });
      onClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo bài tập. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    // Reset form khi đóng modal
    setFormData({
      title: '',
      description: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 10,
      courseId,
    });
    setShowDatePicker(false);
    setShowTimePicker(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetAndClose} style={styles.cancelButton}>
            <IconFeather name="x" size={24} color={appColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài tập mới</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            disabled={isSubmitting}>
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiêu đề bài tập</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={text =>
                setFormData(prev => ({...prev, title: text}))
              }
              placeholder="Nhập tiêu đề bài tập..."
              placeholderTextColor={appColors.gray}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả bài tập</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={text =>
                setFormData(prev => ({...prev, description: text}))
              }
              placeholder="Nhập mô tả chi tiết về bài tập..."
              placeholderTextColor={appColors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Due Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hạn nộp</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={showDatePickerModal}>
              <IconFeather
                name="calendar"
                size={20}
                color={appColors.primary}
              />
              <Text style={styles.dateText}>
                {format(formData.dueDate, 'dd/MM/yyyy HH:mm', {locale: vi})}
              </Text>
              <IconFeather
                name="chevron-right"
                size={20}
                color={appColors.gray}
              />
            </TouchableOpacity>
          </View>

          {/* Max Score */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Điểm tối đa</Text>
            <TextInput
              style={styles.textInput}
              value={formData.maxScore.toString()}
              onChangeText={text => {
                const score = parseFloat(text) || 0;
                setFormData(prev => ({...prev, maxScore: score}));
              }}
              placeholder="10"
              placeholderTextColor={appColors.gray}
              keyboardType="numeric"
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Hướng dẫn:</Text>
            <Text style={styles.instructionsText}>
              • Tiêu đề nên ngắn gọn và mô tả rõ nội dung bài tập
            </Text>
            <Text style={styles.instructionsText}>
              • Mô tả chi tiết yêu cầu và hướng dẫn làm bài
            </Text>
            <Text style={styles.instructionsText}>
              • Đặt hạn nộp hợp lý để học sinh có đủ thời gian hoàn thành
            </Text>
          </View>
        </ScrollView>

        {/* Date Picker - Chỉ hiển thị khi cần */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker - Chỉ cho Android */}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={formData.dueDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* iOS DateTime Picker */}
        {showDatePicker && Platform.OS === 'ios' && (
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.iosPickerButton}>Xong</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={formData.dueDate}
              mode="datetime"
              display="spinner"
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.iosDatePicker}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
  },
  submitButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: appColors.gray,
  },
  submitButtonText: {
    color: appColors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: appColors.text,
    backgroundColor: appColors.white,
  },
  textArea: {
    height: 100,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appColors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: appColors.white,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: appColors.text,
    marginLeft: 8,
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: appColors.lightGray,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: appColors.gray,
    marginBottom: 4,
  },
  iosPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: appColors.white,
    borderTopWidth: 1,
    borderTopColor: appColors.lightGray,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.lightGray,
  },
  iosPickerButton: {
    color: appColors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  iosDatePicker: {
    height: 200,
  },
});

export default AddAssignmentModal;
