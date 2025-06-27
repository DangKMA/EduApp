import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../../constants/appColors';
import {Assignment as AssignmentData} from '../../../types/assignmentType';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';

interface TeacherAssignmentCardProps {
  assignment: AssignmentData;
  onPress: (assignment: AssignmentData) => void;
}

const TeacherAssignmentCard: React.FC<TeacherAssignmentCardProps> = ({
  assignment,
  onPress,
}) => {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue =
    assignment.isOverdue ||
    (dueDate < new Date() && assignment.status === 'pending');

  const getStatusColor = (status: AssignmentData['status']) => {
    switch (status) {
      case 'pending':
        return appColors.warning;
      case 'submitted':
        return appColors.info;
      case 'graded':
        return appColors.success;
      case 'overdue':
        return appColors.danger;
      default:
        return appColors.gray;
    }
  };

  const getStatusLabel = (status: AssignmentData['status']) => {
    switch (status) {
      case 'pending':
        return 'Chưa nộp';
      case 'submitted':
        return 'Đã nộp';
      case 'graded':
        return 'Đã chấm điểm';
      case 'overdue':
        return 'Quá hạn';
      default:
        return 'Không xác định';
    }
  };

  const statusColor = isOverdue
    ? appColors.danger
    : getStatusColor(assignment.status);
  const statusLabel = isOverdue ? 'Quá hạn' : getStatusLabel(assignment.status);

  return (
    <TouchableOpacity
      style={styles.assignmentCard}
      onPress={() => onPress(assignment)}
      activeOpacity={0.7}>
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentTitleContainer}>
          <View style={styles.titleRow}>
            <Icon
              name={
                assignment.type === 'photo' ? 'photo-camera' : 'description'
              }
              size={20}
              color={appColors.primary}
              style={styles.typeIcon}
            />
            <Text style={styles.assignmentTitle} numberOfLines={2}>
              {assignment.title}
            </Text>
          </View>

          <View style={styles.assignmentMeta}>
            <View style={styles.typeTag}>
              <Icon
                name={assignment.type === 'photo' ? 'image' : 'description'}
                size={12}
                color={appColors.primary}
              />
              <Text style={styles.typeTagText}>
                {assignment.type === 'photo' ? 'Ảnh' : 'Tài liệu'}
              </Text>
            </View>
            <View
              style={[styles.statusTag, {backgroundColor: statusColor + '20'}]}>
              <Text style={[styles.statusTagText, {color: statusColor}]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.maxScore}>{assignment.maxScore}</Text>
          <Text style={styles.scoreLabel}>điểm</Text>
        </View>
      </View>

      <Text style={styles.assignmentDescription} numberOfLines={3}>
        {assignment.description}
      </Text>

      <View style={styles.assignmentFooter}>
        <View style={styles.dueDateContainer}>
          <Icon
            name="schedule"
            size={16}
            color={isOverdue ? appColors.danger : appColors.gray}
          />
          <Text
            style={[
              styles.dueDate,
              {color: isOverdue ? appColors.danger : appColors.gray},
            ]}>
            Hạn nộp:{' '}
            {assignment.formattedDueDate ||
              format(dueDate, 'dd/MM/yyyy HH:mm', {locale: vi})}
          </Text>
        </View>

        {assignment.submissionStats && (
          <View style={styles.submissionStats}>
            <Icon name="people" size={16} color={appColors.primary} />
            <Text style={styles.submissionText}>
              {assignment.submissionStats.total || 0}/
              {assignment.stats?.totalStudents || 0}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  assignmentCard: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: appColors.gray2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    marginRight: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    flex: 1,
  },
  assignmentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    backgroundColor: appColors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeTagText: {
    fontSize: 12,
    color: appColors.primary,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  maxScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: appColors.gray,
  },
  assignmentDescription: {
    fontSize: 14,
    color: appColors.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  submissionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submissionText: {
    fontSize: 13,
    color: appColors.primary,
    fontWeight: '600',
  },
});

export default TeacherAssignmentCard;
