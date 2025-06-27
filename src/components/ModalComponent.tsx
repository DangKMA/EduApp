import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../constants/appColors';

interface SemesterPickerModalProps {
  visible: boolean;
  semesters: string[];
  selectedSemester: string;
  onSelect: (semester: string) => void;
  onClose: () => void;
  title?: string;
}

const SemesterPickerModal: React.FC<SemesterPickerModalProps> = ({
  visible,
  semesters,
  selectedSemester,
  onSelect,
  onClose,
  title = 'Chọn học kỳ',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={appColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {semesters.map((semester, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.semesterItem,
                  selectedSemester === semester && styles.semesterItemActive,
                ]}
                onPress={() => onSelect(semester)}>
                <Text
                  style={[
                    styles.semesterItemText,
                    selectedSemester === semester &&
                      styles.semesterItemTextActive,
                  ]}>
                  {semester}
                </Text>
                {selectedSemester === semester && (
                  <Icon name="check" size={20} color={appColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: appColors.text,
  },
  semesterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  semesterItemActive: {
    backgroundColor: `${appColors.primary}10`,
  },
  semesterItemText: {
    fontSize: 16,
    color: appColors.text,
  },
  semesterItemTextActive: {
    color: appColors.primary,
    fontWeight: '500',
  },
});

export default SemesterPickerModal;
