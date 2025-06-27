import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../../constants/appColors';

interface AssignmentItemProps {
  title: string;
  course: string;
  dueDate: number;
  completed: boolean;
  onPress: () => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({
  title,
  course,
  dueDate,
  completed,
  onPress,
}) => {
  const getDueDateColor = () => {
    if (dueDate <= 1) return '#FF6B6B';
    if (dueDate <= 3) return '#FF9800';
    if (dueDate <= 5) return '#FFC107';
    return '#4CAF50';
  };

  return (
    <TouchableOpacity
      style={[styles.assignmentItem, completed && styles.completedAssignment]}
      onPress={onPress}>
      <View style={styles.assignmentCheckbox}>
        <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
          {completed && <IconFeather name="check" size={12} color="#FFFFFF" />}
        </View>
      </View>
      <View style={styles.assignmentInfo}>
        <Text
          style={[styles.assignmentTitle, completed && styles.completedText]}>
          {title}
        </Text>
        <Text style={styles.assignmentCourse}>{course}</Text>
      </View>
      <View style={styles.assignmentDue}>
        <View
          style={[
            styles.dueDateChip,
            {backgroundColor: `${getDueDateColor()}20`},
            completed && styles.completedChip,
          ]}>
          <Text
            style={[
              styles.dueDateText,
              {color: completed ? '#9E9E9E' : getDueDateColor()},
            ]}>
            {dueDate === 0
              ? 'Hôm nay'
              : dueDate === 1
              ? 'Ngày mai'
              : `${dueDate} ngày nữa`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  assignmentItem: {
    flexDirection: 'row',
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(230, 235, 240, 0.8)',
  },
  completedAssignment: {
    backgroundColor: '#F8F9FA',
    borderColor: 'rgba(230, 235, 240, 0.4)',
  },
  assignmentCheckbox: {
    width: 24,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: appColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: appColors.primary,
  },
  assignmentInfo: {
    flex: 1,
    paddingRight: 10,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  assignmentCourse: {
    fontSize: 12,
    color: '#64748B',
  },
  assignmentDue: {
    justifyContent: 'center',
  },
  dueDateChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  completedChip: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
});

export default AssignmentItem;
