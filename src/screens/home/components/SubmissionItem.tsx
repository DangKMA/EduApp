import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {appColors} from '../../../constants/appColors';

interface SubmissionItemProps {
  studentName: string;
  assignmentName: string;
  submittedDate: string;
  status: 'pending' | 'graded' | 'late';
  onPress: () => void;
}

// Component riêng cho trường hợp không có bài nộp - Sửa lại theo style Schedule
export const EmptySubmissionsCard: React.FC<{onPress: () => void}> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.emptyStateContainer} onPress={onPress}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>Tuyệt vời!</Text>
        <Text style={styles.emptyMessage}>
          Tất cả bài nộp đã được chấm điểm
        </Text>
        <Text style={styles.emptySubtext}>Nhấn để xem tất cả bài tập</Text>
      </View>
    </TouchableOpacity>
  );
};

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  studentName,
  assignmentName,
  submittedDate,
  status,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'graded':
        return '#4CAF50';
      case 'late':
        return '#FF6B6B';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Chờ chấm';
      case 'graded':
        return 'Đã chấm';
      case 'late':
        return 'Nộp trễ';
      default:
        return 'Không xác định';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'graded':
        return '#4CAF50';
      case 'late':
        return '#FF6B6B';
      default:
        return '#4A6FFF';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.submissionItem, {borderLeftColor: getBorderColor()}]}
      onPress={onPress}>
      <View style={styles.submissionMain}>
        {/* Tên bài tập - Nổi bật với chữ in đậm */}
        <Text style={styles.submissionAssignment}>{assignmentName}</Text>

        {/* Tên học sinh nếu có */}
        {studentName && (
          <Text style={styles.submissionStudent}>Học sinh: {studentName}</Text>
        )}

        {/* Ngày nộp */}
        {submittedDate && (
          <Text style={styles.submissionDate}>Ngày nộp: {submittedDate}</Text>
        )}
      </View>

      <View style={styles.submissionStatus}>
        <View
          style={[
            styles.statusChip,
            {backgroundColor: `${getStatusColor()}20`},
          ]}>
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  submissionItem: {
    flexDirection: 'row',
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(230, 235, 240, 0.6)',
    borderLeftWidth: 4,
    borderLeftColor: '#4A6FFF',
  },
  submissionMain: {
    flex: 1,
  },
  submissionAssignment: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    lineHeight: 24,
  },
  submissionStudent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  submissionStatus: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Styles cho empty state - Giống ScheduleSection
  emptyStateContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderStyle: 'dashed',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SubmissionItem;
