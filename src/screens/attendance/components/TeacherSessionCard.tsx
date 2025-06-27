import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {appColors} from '../../../constants/appColors';
import {
  AttendanceSession,
  AttendanceStatusType,
} from '../../../types/attendanceType';
import StudentList from './StudentList';

interface TeacherSessionCardProps {
  session: AttendanceSession;
  courseParams?: any;
  selectedStudents: {[key: string]: AttendanceStatusType};
  formatTime: (time: string) => string;
  getStatusLabel: (status: AttendanceStatusType) => string;
  onToggleSessionStatus: (sessionId: string, currentStatus: boolean) => void;
  onStudentStatusChange: (
    studentId: string,
    status: AttendanceStatusType,
  ) => void;
  onManualAttendance: (sessionId: string) => void;
  onViewDetails: (sessionId: string, courseName: string) => void;
}

const TeacherSessionCard: React.FC<TeacherSessionCardProps> = ({
  session,
  courseParams,
  selectedStudents,
  formatTime,
  getStatusLabel,
  onToggleSessionStatus,
  onStudentStatusChange,
  onManualAttendance,
  onViewDetails,
}) => {
  const [showStudentList, setShowStudentList] = useState(false);

  const sessionStats = useMemo(() => {
    if (!session.attendanceSummary) {
      return {
        total: 0,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        notMarked: 0,
        attendanceRate: 0,
      };
    }

    const {total, present, late, absent, excused, notMarked} =
      session.attendanceSummary;
    const attendedCount = present + late;
    const attendanceRate = total > 0 ? (attendedCount / total) * 100 : 0;

    return {
      total,
      present,
      late,
      absent,
      excused,
      notMarked,
      attendanceRate: Math.round(attendanceRate),
    };
  }, [session.attendanceSummary]);

  const sessionStatus = useMemo(() => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const [startHour, startMin] = session.startTime.split(':').map(Number);
    const [endHour, endMin] = session.endTime.split(':').map(Number);

    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHour, startMin, 0, 0);

    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHour, endMin, 0, 0);

    const isToday = sessionDate.toDateString() === now.toDateString();
    const isSessionTime = now >= sessionStart && now <= sessionEnd;
    const isPast = now > sessionEnd;

    if (!isToday) {
      return {
        status: 'scheduled',
        message: '📅 Đã lên lịch',
        color: appColors.info,
      };
    }

    if (isPast) {
      return {
        status: 'completed',
        message: '✅ Đã hoàn thành',
        color: appColors.success,
      };
    }

    if (session.isOpen) {
      return {
        status: 'active',
        message: '🔴 Đang mở điểm danh',
        color: appColors.success,
      };
    }

    if (isSessionTime) {
      return {
        status: 'can_open',
        message: '⏰ Có thể mở điểm danh',
        color: appColors.warning,
      };
    }

    return {
      status: 'waiting',
      message: '⏱️ Chờ đến giờ',
      color: appColors.gray,
    };
  }, [session]);

  const hasManualChanges = Object.keys(selectedStudents).length > 0;

  const handleToggleSession = () => {
    const action = session.isOpen ? 'đóng' : 'mở';
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action} buổi điểm danh này?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => onToggleSessionStatus(session._id, session.isOpen),
        },
      ],
    );
  };

  const handleViewStudents = () => {
    setShowStudentList(true);
  };

  const handleViewDetails = () => {
    onViewDetails(session._id, session.course?.name || 'Không xác định');
  };

  const handleManualSave = () => {
    Alert.alert(
      'Lưu thay đổi',
      `Bạn có chắc chắn muốn lưu ${
        Object.keys(selectedStudents).length
      } thay đổi điểm danh thủ công?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Lưu',
          onPress: () => {
            onManualAttendance(session._id);
            setShowStudentList(false);
          },
        },
      ],
    );
  };

  const canToggleSession = useMemo(() => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const isToday = sessionDate.toDateString() === now.toDateString();

    return isToday || sessionStatus.status === 'can_open';
  }, [sessionStatus]);

  return (
    <>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseCode}>{session.course?.code}</Text>
            <Text style={styles.courseName}>{session.course?.name}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: sessionStatus.color},
            ]}>
            <Text style={styles.statusText}>{sessionStatus.message}</Text>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoText}>
                {new Date(session.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoText}>
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </Text>
            </View>

            {session.classroom && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🏫</Text>
                <Text style={styles.infoText}>{session.classroom}</Text>
              </View>
            )}

            {session.schoolLocation && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>
                  {session.schoolLocation.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.stats}>
          <Text style={styles.statsTitle}>📊 Thống kê điểm danh</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sessionStats.total}</Text>
              <Text style={styles.statLabel}>Tổng SV</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: appColors.success}]}>
                {sessionStats.late}
              </Text>
              <Text style={styles.statLabel}>Có mặt</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: appColors.warning}]}>
                {sessionStats.present}
              </Text>
              <Text style={styles.statLabel}>Muộn</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: appColors.error}]}>
                {sessionStats.absent}
              </Text>
              <Text style={styles.statLabel}>Vắng</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, {color: appColors.info}]}>
                {sessionStats.excused}
              </Text>
              <Text style={styles.statLabel}>Có phép</Text>
            </View>

            {sessionStats.notMarked > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, {color: appColors.gray}]}>
                  {sessionStats.notMarked}
                </Text>
                <Text style={styles.statLabel}>Chưa điểm danh</Text>
              </View>
            )}
          </View>

          <View style={styles.attendanceRate}>
            <Text style={styles.attendanceRateText}>
              Tỷ lệ tham gia: {sessionStats.attendanceRate}%
            </Text>
            <View style={styles.attendanceRateBar}>
              <View
                style={[
                  styles.attendanceRateProgress,
                  {
                    width: `${sessionStats.attendanceRate}%`,
                    backgroundColor:
                      sessionStats.attendanceRate >= 80
                        ? appColors.success
                        : sessionStats.attendanceRate >= 60
                        ? appColors.warning
                        : appColors.error,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>
              {session.isOpen ? '🔴 Đang mở điểm danh' : '⚫ Đã đóng điểm danh'}
            </Text>
            <Switch
              value={session.isOpen}
              onValueChange={handleToggleSession}
              disabled={!canToggleSession}
              trackColor={{
                false: appColors.gray,
                true: appColors.primary,
              }}
              thumbColor={session.isOpen ? appColors.white : appColors.white}
            />
          </View>
        </View>

        {/* Manual Changes Indicator */}
        {hasManualChanges && (
          <View style={styles.manualChanges}>
            <Text style={styles.manualChangesText}>
              ✏️ Có {Object.keys(selectedStudents).length} thay đổi thủ công
            </Text>
            <TouchableOpacity
              style={styles.saveChangesButton}
              onPress={handleManualSave}>
              <Text style={styles.saveChangesButtonText}>💾 Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Student List Modal */}
      <Modal
        visible={showStudentList}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStudentList(false)}>
              <Text style={styles.modalCloseText}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <StudentList
              sessionId={session._id}
              students={session.students || []}
              selectedStudents={selectedStudents}
              onStudentStatusChange={onStudentStatusChange}
              getStatusLabel={getStatusLabel}
              editable={true}
            />
          </ScrollView>

          {hasManualChanges && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSaveFooterButton}
                onPress={handleManualSave}>
                <Text style={styles.modalSaveFooterText}>
                  💾 Lưu {Object.keys(selectedStudents).length} thay đổi
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: appColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.text,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.white,
  },
  sessionInfo: {
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appColors.text,
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: appColors.textSecondary,
    flex: 1,
  },
  stats: {
    backgroundColor: appColors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '18%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: appColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: appColors.textSecondary,
    textAlign: 'center',
  },
  attendanceRate: {
    marginTop: 8,
  },
  attendanceRateText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 8,
  },
  attendanceRateBar: {
    height: 6,
    backgroundColor: appColors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  attendanceRateProgress: {
    height: '100%',
    borderRadius: 3,
  },
  controls: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: appColors.background,
    borderRadius: 12,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.primary,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: appColors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  primaryButtonText: {
    color: appColors.white,
  },
  manualChanges: {
    backgroundColor: appColors.warning + '20',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: appColors.warning,
  },
  manualChangesText: {
    fontSize: 14,
    color: appColors.warning,
    fontWeight: '600',
    flex: 1,
  },
  saveChangesButton: {
    backgroundColor: appColors.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveChangesButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: appColors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    backgroundColor: appColors.white,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 16,
    color: appColors.error,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: appColors.text,
  },
  modalSaveButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.white,
  },
  modalContent: {
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: appColors.white,
    borderTopWidth: 1,
    borderTopColor: appColors.border,
  },
  modalSaveFooterButton: {
    backgroundColor: appColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
});

export default TeacherSessionCard;
