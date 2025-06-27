import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';

import {appColors} from '../../../constants/appColors';
import {
  CreateSessionRequest,
  ClassLocation,
} from '../../../types/attendanceType';

interface CreateSessionModalProps {
  visible: boolean;
  sessionData: Partial<CreateSessionRequest>;
  activeCourses: any[];
  classLocations: ClassLocation[];
  generateSessionTitle?: (courseName: string) => string;
  onClose: () => void;
  onUpdateData: (data: Partial<CreateSessionRequest>) => void;
  onCreate: () => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  visible,
  sessionData,
  activeCourses,
  classLocations,
  generateSessionTitle,
  onClose,
  onUpdateData,
  onCreate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Memoized values
  const selectedCourse = useMemo(() => {
    return activeCourses.find(course => course._id === sessionData.courseId);
  }, [activeCourses, sessionData.courseId]);

  const selectedLocation = useMemo(() => {
    return classLocations.find(loc => loc._id === sessionData.schoolLocationId);
  }, [classLocations, sessionData.schoolLocationId]);

  // Handlers
  const handleCourseChange = useCallback(
    (courseId: string) => {
      const course = activeCourses.find(c => c._id === courseId);
      const title =
        course && generateSessionTitle
          ? generateSessionTitle(course.name)
          : `Điểm danh ${course?.name || ''} - ${new Date().toLocaleDateString(
              'vi-VN',
            )}`;

      onUpdateData({
        ...sessionData,
        courseId,
        title,
      });
    },
    [sessionData, activeCourses, generateSessionTitle, onUpdateData],
  );

  const handleLocationChange = useCallback(
    (locationId: string) => {
      onUpdateData({
        ...sessionData,
        schoolLocationId: locationId,
      });
    },
    [sessionData, onUpdateData],
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      onUpdateData({
        ...sessionData,
        date: date.toISOString().split('T')[0],
      });
      setShowDatePicker(false);
    },
    [sessionData, onUpdateData],
  );

  const handleStartTimeChange = useCallback(
    (date: Date) => {
      const timeString = date.toTimeString().slice(0, 5);
      onUpdateData({
        ...sessionData,
        startTime: timeString,
      });
      setShowStartTimePicker(false);
    },
    [sessionData, onUpdateData],
  );

  const handleEndTimeChange = useCallback(
    (date: Date) => {
      const timeString = date.toTimeString().slice(0, 5);
      onUpdateData({
        ...sessionData,
        endTime: timeString,
      });
      setShowEndTimePicker(false);
    },
    [sessionData, onUpdateData],
  );

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      onUpdateData({
        ...sessionData,
        [field]: value,
      });
    },
    [sessionData, onUpdateData],
  );

  const validateForm = useCallback(() => {
    const errors = [];

    if (!sessionData.courseId) errors.push('Vui lòng chọn khóa học');
    if (!sessionData.title?.trim()) errors.push('Vui lòng nhập tiêu đề');
    if (!sessionData.date) errors.push('Vui lòng chọn ngày');
    if (!sessionData.startTime) errors.push('Vui lòng chọn giờ bắt đầu');
    if (!sessionData.endTime) errors.push('Vui lòng chọn giờ kết thúc');
    if (!sessionData.schoolLocationId) errors.push('Vui lòng chọn địa điểm');

    // Validate time range
    if (sessionData.startTime && sessionData.endTime) {
      const [startHour, startMin] = sessionData.startTime
        .split(':')
        .map(Number);
      const [endHour, endMin] = sessionData.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (startMinutes >= endMinutes) {
        errors.push('Giờ kết thúc phải sau giờ bắt đầu');
      }
    }

    return errors;
  }, [sessionData]);

  const handleCreate = useCallback(() => {
    const errors = validateForm();

    if (errors.length > 0) {
      Alert.alert('Lỗi xác thực', errors.join('\n'));
      return;
    }

    onCreate();
  }, [validateForm, onCreate]);

  const parseDateString = (dateStr: string) => {
    try {
      return new Date(dateStr + 'T12:00:00');
    } catch {
      return new Date();
    }
  };

  const parseTimeString = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    } catch {
      return new Date();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo phiên điểm danh</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
            <Text style={styles.createButtonText}>Tạo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Course Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khóa học *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sessionData.courseId || ''}
                onValueChange={handleCourseChange}
                style={styles.picker}>
                <Picker.Item label="Chọn khóa học" value="" />
                {activeCourses.map(course => (
                  <Picker.Item
                    key={course._id}
                    label={`${course.name} (${course.code})`}
                    value={course._id}
                  />
                ))}
              </Picker>
            </View>
            {selectedCourse && (
              <Text style={styles.courseInfo}>
                👨‍🏫 {selectedCourse.instructor?.fullName || 'N/A'}
              </Text>
            )}
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiêu đề *</Text>
            <TextInput
              style={styles.textInput}
              value={sessionData.title || ''}
              onChangeText={value => handleFieldChange('title', value)}
              placeholder="Nhập tiêu đề phiên điểm danh"
              placeholderTextColor={appColors.gray}
            />
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngày *</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateTimeButtonText}>
                {sessionData.date
                  ? new Date(sessionData.date).toLocaleDateString('vi-VN')
                  : 'Chọn ngày'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Range */}
          <View style={styles.timeSection}>
            <View style={styles.timeColumn}>
              <Text style={styles.sectionTitle}>Giờ bắt đầu *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartTimePicker(true)}>
                <Text style={styles.dateTimeButtonText}>
                  {sessionData.startTime || 'Chọn giờ'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeColumn}>
              <Text style={styles.sectionTitle}>Giờ kết thúc *</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}>
                <Text style={styles.dateTimeButtonText}>
                  {sessionData.endTime || 'Chọn giờ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa điểm *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sessionData.schoolLocationId || ''}
                onValueChange={handleLocationChange}
                style={styles.picker}>
                <Picker.Item label="Chọn địa điểm" value="" />
                {classLocations.map(location => (
                  <Picker.Item
                    key={location._id}
                    label={location.name}
                    value={location._id}
                  />
                ))}
              </Picker>
            </View>
            {selectedLocation && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationInfoText}>
                  📍 {selectedLocation.address}
                </Text>
                <Text style={styles.locationInfoText}>
                  📏 Bán kính: {selectedLocation.radius}m
                </Text>
              </View>
            )}
          </View>

          {/* Classroom */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phòng học</Text>
            <TextInput
              style={styles.textInput}
              value={sessionData.classroom || ''}
              onChangeText={value => handleFieldChange('classroom', value)}
              placeholder="Nhập phòng học (tùy chọn)"
              placeholderTextColor={appColors.gray}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={sessionData.description || ''}
              onChangeText={value => handleFieldChange('description', value)}
              placeholder="Nhập mô tả (tùy chọn)"
              placeholderTextColor={appColors.gray}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Advanced Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tùy chọn nâng cao</Text>

            <View style={styles.advancedOption}>
              <Text style={styles.advancedOptionLabel}>
                Cho phép điểm danh muộn
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  sessionData.allowLateCheckIn && styles.toggleActive,
                ]}
                onPress={() =>
                  handleFieldChange(
                    'allowLateCheckIn',
                    !sessionData.allowLateCheckIn,
                  )
                }>
                <View
                  style={[
                    styles.toggleThumb,
                    sessionData.allowLateCheckIn && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.advancedOption}>
              <Text style={styles.advancedOptionLabel}>
                Tự động đóng khi hết giờ
              </Text>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  sessionData.autoClose && styles.toggleActive,
                ]}
                onPress={() =>
                  handleFieldChange('autoClose', !sessionData.autoClose)
                }>
                <View
                  style={[
                    styles.toggleThumb,
                    sessionData.autoClose && styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Date Pickers */}
        <DatePicker
          modal
          open={showDatePicker}
          date={
            sessionData.date ? parseDateString(sessionData.date) : new Date()
          }
          mode="date"
          onConfirm={handleDateChange}
          onCancel={() => setShowDatePicker(false)}
          locale="vi"
          title="Chọn ngày"
        />

        <DatePicker
          modal
          open={showStartTimePicker}
          date={
            sessionData.startTime
              ? parseTimeString(sessionData.startTime)
              : new Date()
          }
          mode="time"
          onConfirm={handleStartTimeChange}
          onCancel={() => setShowStartTimePicker(false)}
          locale="vi"
          title="Chọn giờ bắt đầu"
        />

        <DatePicker
          modal
          open={showEndTimePicker}
          date={
            sessionData.endTime
              ? parseTimeString(sessionData.endTime)
              : new Date()
          }
          mode="time"
          onConfirm={handleEndTimeChange}
          onCancel={() => setShowEndTimePicker(false)}
          locale="vi"
          title="Chọn giờ kết thúc"
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: appColors.gray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: appColors.primary,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: appColors.white,
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: appColors.text,
    backgroundColor: appColors.white,
  },
  multilineInput: {
    height: 80,
  },
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: appColors.white,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: appColors.text,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeColumn: {
    flex: 0.48,
  },
  courseInfo: {
    marginTop: 8,
    fontSize: 14,
    color: appColors.gray,
  },
  locationInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: appColors.gray,
    marginVertical: 2,
  },
  advancedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  advancedOptionLabel: {
    fontSize: 16,
    color: appColors.text,
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: appColors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: appColors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{translateX: 20}],
  },
});

export default CreateSessionModal;
