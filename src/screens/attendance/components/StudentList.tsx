import React, {useMemo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {appColors} from '../../../constants/appColors';
import {
  AttendanceStatusType,
  getAttendanceStatusColor,
  getAttendanceStatusLabel,
} from '../../../types/attendanceType';

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar?: string;
  studentId: string;
  userID: string;
  attendanceStatus: {
    hasCheckedIn: boolean;
    attendanceStatus: string;
    status: AttendanceStatusType;
    checkInTime?: string;
    checkInMethod?: string;
    distanceFromSchool?: number;
    isValidLocation?: boolean;
    note?: string;
    markedBy?: string;
    markedTime?: string;
  };
}

interface StudentListProps {
  students: Student[];
  selectedStudents: {[key: string]: AttendanceStatusType};
  onStudentStatusChange: (
    studentId: string,
    status: AttendanceStatusType,
  ) => void;
  // ✅ SỬA: Sử dụng functions từ hook thay vì props
  formatTime?: (time: string) => string;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  selectedStudents,
  onStudentStatusChange,
  formatTime,
}) => {
  // ✅ SỬA: Sử dụng functions từ types thay vì props
  const getStatusLabel = (status: AttendanceStatusType): string => {
    return getAttendanceStatusLabel(status);
  };

  const getStatusColor = (status: AttendanceStatusType): string => {
    return getAttendanceStatusColor(status);
  };

  // ✅ SỬA: Default format time function nếu không được truyền vào
  const defaultFormatTime = (time: string): string => {
    try {
      return new Date(time).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return time;
    }
  };

  const formatTimeDisplay = formatTime || defaultFormatTime;

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      // Ưu tiên hiển thị những sinh viên chưa điểm danh
      const aChecked = a.attendanceStatus.hasCheckedIn;
      const bChecked = b.attendanceStatus.hasCheckedIn;

      if (aChecked !== bChecked) {
        return aChecked ? 1 : -1;
      }

      // Sắp xếp theo tên
      return a.fullName.localeCompare(b.fullName);
    });
  }, [students]);

  const getStatusIcon = (status: AttendanceStatusType) => {
    switch (status) {
      case 'present':
        return '✅';
      case 'late':
        return '⏰';
      case 'absent':
        return '❌';
      case 'excused':
        return '📝';
      default:
        return '❓';
    }
  };

  // ✅ SỬA: Format check-in method display
  const formatCheckInMethod = (method?: string): string => {
    if (!method) return '';

    switch (method) {
      case 'location':
        return 'Vị trí GPS';
      case 'manual':
        return 'Thủ công';
      case 'qr_code':
        return 'QR Code';
      default:
        return method;
    }
  };

  // ✅ SỬA: Format distance display
  const formatDistance = (distance?: number): string => {
    if (typeof distance !== 'number') return '';
    return `${Math.round(distance)}m`;
  };

  const renderStudentItem = ({item: student}: {item: Student}) => {
    const currentStatus =
      selectedStudents[student._id] || student.attendanceStatus.status;
    const hasCheckedIn = student.attendanceStatus.hasCheckedIn;

    return (
      <View style={styles.studentItem}>
        <View style={styles.studentInfo}>
          <View style={styles.studentHeader}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <Text style={styles.studentId}>({student.studentId})</Text>
          </View>

          <Text style={styles.studentEmail}>{student.email}</Text>

          {/* ✅ SỬA: Cải thiện hiển thị thông tin check-in */}
          {hasCheckedIn && student.attendanceStatus.checkInTime && (
            <View style={styles.checkInInfo}>
              <Text style={styles.checkInTime}>
                ⏰ {formatTimeDisplay(student.attendanceStatus.checkInTime)}
              </Text>

              {student.attendanceStatus.checkInMethod && (
                <Text style={styles.checkInMethod}>
                  📱{' '}
                  {formatCheckInMethod(student.attendanceStatus.checkInMethod)}
                </Text>
              )}

              {typeof student.attendanceStatus.distanceFromSchool ===
                'number' && (
                <Text style={styles.checkInDistance}>
                  📍{' '}
                  {formatDistance(student.attendanceStatus.distanceFromSchool)}
                </Text>
              )}

              {/* ✅ THÊM: Hiển thị trạng thái vị trí hợp lệ */}
              {typeof student.attendanceStatus.isValidLocation ===
                'boolean' && (
                <Text
                  style={[
                    styles.locationValidation,
                    {
                      color: student.attendanceStatus.isValidLocation
                        ? appColors.success
                        : appColors.warning,
                    },
                  ]}>
                  {student.attendanceStatus.isValidLocation
                    ? '✓ Vị trí hợp lệ'
                    : '⚠ Vị trí xa'}
                </Text>
              )}
            </View>
          )}

          {/* ✅ SỬA: Cải thiện hiển thị ghi chú */}
          {student.attendanceStatus.note && (
            <Text style={styles.studentNote}>
              💬 {student.attendanceStatus.note}
            </Text>
          )}

          {/* ✅ THÊM: Hiển thị thông tin người đánh dấu (cho manual attendance) */}
          {hasCheckedIn && student.attendanceStatus.markedBy && (
            <Text style={styles.markedByInfo}>
              👤 Đánh dấu bởi: {student.attendanceStatus.markedBy}
              {student.attendanceStatus.markedTime && (
                <Text style={styles.markedTime}>
                  {' '}
                  lúc {formatTimeDisplay(student.attendanceStatus.markedTime)}
                </Text>
              )}
            </Text>
          )}
        </View>

        <View style={styles.statusSection}>
          {/* ✅ SỬA: Sử dụng getStatusColor từ types */}
          <View
            style={[
              styles.currentStatusBadge,
              {backgroundColor: getStatusColor(currentStatus)},
            ]}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(currentStatus)}
            </Text>
            <Text style={styles.currentStatusText}>
              {getStatusLabel(currentStatus)}
            </Text>
          </View>

          {/* ✅ SỬA: Chỉ hiển thị buttons khi chưa check-in */}
          {!hasCheckedIn && (
            <View style={styles.statusButtons}>
              {(
                [
                  'present',
                  'late',
                  'absent',
                  'excused',
                ] as AttendanceStatusType[]
              ).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    currentStatus === status && styles.statusButtonActive,
                    {borderColor: getStatusColor(status)},
                    // ✅ THÊM: Active state background
                    currentStatus === status && {
                      backgroundColor: getStatusColor(status),
                    },
                  ]}
                  onPress={() => onStudentStatusChange(student._id, status)}>
                  <Text
                    style={[
                      styles.statusButtonText,
                      currentStatus === status && {color: appColors.white},
                      currentStatus !== status && {
                        color: getStatusColor(status),
                      },
                    ]}>
                    {getStatusIcon(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ✅ SỬA: Cải thiện label cho auto check-in */}
          {hasCheckedIn && (
            <View style={styles.autoCheckedContainer}>
              <Text style={styles.autoCheckedLabel}>
                {student.attendanceStatus.checkInMethod === 'location' &&
                  '📍 Tự động điểm danh'}
                {student.attendanceStatus.checkInMethod === 'manual' &&
                  '👤 Điểm danh thủ công'}
                {student.attendanceStatus.checkInMethod === 'qr_code' &&
                  '📱 Quét QR'}
                {!student.attendanceStatus.checkInMethod && '✨ Đã điểm danh'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ✅ SỬA: Cải thiện header với thống kê chi tiết hơn
  const renderHeader = () => {
    const totalStudents = students.length;
    const checkedInCount = students.filter(
      s => s.attendanceStatus.hasCheckedIn,
    ).length;
    const notCheckedInCount = totalStudents - checkedInCount;

    const presentCount = students.filter(
      s => s.attendanceStatus.status === 'present',
    ).length;
    const lateCount = students.filter(
      s => s.attendanceStatus.status === 'late',
    ).length;
    const absentCount = students.filter(
      s => s.attendanceStatus.status === 'absent',
    ).length;
    const excusedCount = students.filter(
      s => s.attendanceStatus.status === 'excused',
    ).length;

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Danh sách sinh viên ({totalStudents})
        </Text>

        {/* ✅ THÊM: Thống kê tổng quan */}
        <View style={styles.overallStats}>
          <Text style={styles.overallStatsText}>
            📊 Đã điểm danh: {checkedInCount}/{totalStudents}
          </Text>
          {notCheckedInCount > 0 && (
            <Text style={[styles.overallStatsText, {color: appColors.warning}]}>
              ⏳ Chưa điểm danh: {notCheckedInCount}
            </Text>
          )}
        </View>

        {/* ✅ SỬA: Cải thiện summary với màu sắc */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryText, {color: getStatusColor('present')}]}>
              ✅ Có mặt: {presentCount}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={[styles.summaryText, {color: getStatusColor('late')}]}>
              ⏰ Muộn: {lateCount}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryText, {color: getStatusColor('absent')}]}>
              ❌ Vắng: {absentCount}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text
              style={[styles.summaryText, {color: getStatusColor('excused')}]}>
              📝 Có phép: {excusedCount}
            </Text>
          </View>
        </View>

        {/* ✅ THÊM: Tỷ lệ điểm danh */}
        {totalStudents > 0 && (
          <View style={styles.attendanceRate}>
            <Text style={styles.attendanceRateText}>
              📈 Tỷ lệ điểm danh:{' '}
              {Math.round((checkedInCount / totalStudents) * 100)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ✅ THÊM: Empty state component
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>Chưa có sinh viên</Text>
      <Text style={styles.emptyStateMessage}>
        Danh sách sinh viên trống hoặc chưa được tải
      </Text>
    </View>
  );

  return (
    <FlatList
      data={sortedStudents}
      keyExtractor={item => item._id}
      renderItem={renderStudentItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        sortedStudents.length === 0 && styles.emptyContainer,
      ]}
      // ✅ THÊM: Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      getItemLayout={(data, index) => ({
        length: 120, // Approximate item height
        offset: 120 * index,
        index,
      })}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  // ✅ THÊM: Styles cho overall stats
  overallStats: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  overallStatsText: {
    fontSize: 14,
    fontWeight: '500',
    color: appColors.text,
    marginVertical: 2,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  // ✅ SỬA: Cải thiện summary item
  summaryItem: {
    marginVertical: 2,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // ✅ THÊM: Attendance rate styles
  attendanceRate: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attendanceRateText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  studentItem: {
    backgroundColor: appColors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
  },
  studentId: {
    fontSize: 14,
    color: appColors.gray,
    marginLeft: 8,
  },
  studentEmail: {
    fontSize: 14,
    color: appColors.gray,
    marginBottom: 8,
  },
  checkInInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 4,
  },
  checkInTime: {
    fontSize: 12,
    color: appColors.success,
    fontWeight: '500',
  },
  checkInMethod: {
    fontSize: 12,
    color: appColors.info,
    fontWeight: '500',
  },
  checkInDistance: {
    fontSize: 12,
    color: appColors.warning,
    fontWeight: '500',
  },
  // ✅ THÊM: Location validation style
  locationValidation: {
    fontSize: 12,
    fontWeight: '500',
  },
  studentNote: {
    fontSize: 14,
    color: appColors.gray,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  // ✅ THÊM: Marked by info styles
  markedByInfo: {
    fontSize: 12,
    color: appColors.gray,
    marginTop: 4,
  },
  markedTime: {
    fontSize: 12,
    color: appColors.gray,
    fontStyle: 'italic',
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  currentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.white,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: appColors.white,
  },
  statusButtonActive: {
    // Color will be set dynamically
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // ✅ SỬA: Cải thiện auto checked container
  autoCheckedContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.success,
  },
  autoCheckedLabel: {
    fontSize: 12,
    color: appColors.success,
    fontWeight: '500',
    textAlign: 'center',
  },
  // ✅ THÊM: Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: appColors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StudentList;
