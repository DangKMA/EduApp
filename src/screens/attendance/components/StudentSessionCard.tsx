import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {appColors} from '../../../constants/appColors';
import {
  AttendanceSession,
  Location,
  ClassLocation,
} from '../../../types/attendanceType';

interface StudentSessionCardProps {
  session: AttendanceSession;
  currentLocation: Location | null;
  attendingCourseId: string | null;
  attendedSessions: string[];
  attendanceSuccess: boolean;
  calculateDistanceToClass: (classLocation: ClassLocation) => number | null;
  isWithinClassLocation: (classLocation: ClassLocation) => boolean;
  formatTime: (time: string) => string;
  onAttendance: (sessionId: string) => void;
}

const StudentSessionCard: React.FC<StudentSessionCardProps> = ({
  session,
  currentLocation,
  attendingCourseId,
  attendedSessions,
  attendanceSuccess,
  calculateDistanceToClass,
  isWithinClassLocation,
  formatTime,
  onAttendance,
}) => {
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
    const isSessionOpen = session.isOpen;
    const hasAttended = attendedSessions.includes(session._id);

    if (hasAttended) {
      return {
        canAttend: false,
        status: 'attended',
        message: '✅ Đã điểm danh',
        color: appColors.success,
      };
    }

    if (!isToday) {
      return {
        canAttend: false,
        status: 'not_today',
        message: '📅 Không phải hôm nay',
        color: appColors.gray,
      };
    }

    if (!isSessionOpen) {
      return {
        canAttend: false,
        status: 'closed',
        message: '🔒 Chưa mở điểm danh',
        color: appColors.warning,
      };
    }

    if (!isSessionTime) {
      if (now < sessionStart) {
        return {
          canAttend: false,
          status: 'too_early',
          message: '⏰ Chưa đến giờ học',
          color: appColors.info,
        };
      } else {
        return {
          canAttend: false,
          status: 'too_late',
          message: '⏰ Đã hết giờ học',
          color: appColors.error,
        };
      }
    }

    return {
      canAttend: true,
      status: 'can_attend',
      message: '✅ Có thể điểm danh',
      color: appColors.success,
    };
  }, [session, attendedSessions]);

  const locationStatus = useMemo(() => {
    if (!currentLocation || !session.schoolLocationId?.location) {
      return {
        canAttend: false,
        message: '📍 Không xác định được vị trí',
        distance: null,
        color: appColors.gray,
      };
    }

    const distance = calculateDistanceToClass(session.schoolLocationId);
    const isWithinRange = isWithinClassLocation(session.schoolLocationId);

    if (distance === null) {
      return {
        canAttend: false,
        message: '📍 Không thể tính khoảng cách',
        distance: null,
        color: appColors.gray,
      };
    }

    return {
      canAttend: isWithinRange,
      message: isWithinRange
        ? `📍 Trong phạm vi (${Math.round(distance)}m)`
        : `📍 Ngoài phạm vi (${Math.round(distance)}m)`,
      distance: Math.round(distance),
      color: isWithinRange ? appColors.success : appColors.warning,
    };
  }, [
    currentLocation,
    session.schoolLocationId,
    calculateDistanceToClass,
    isWithinClassLocation,
  ]);

  const canAttend = sessionStatus.canAttend && locationStatus.canAttend;
  const isAttending = attendingCourseId === session._id;

  const handleAttendance = () => {
    if (canAttend && !isAttending) {
      onAttendance(session._id);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseCode}>{session.courseId?.code}</Text>
          <Text style={styles.courseName}>{session.courseId?.name}</Text>
        </View>
        <View
          style={[styles.statusBadge, {backgroundColor: sessionStatus.color}]}>
          <Text style={styles.statusText}>{sessionStatus.status}</Text>
        </View>
      </View>

      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.title}</Text>

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

        {session.schoolLocationId?._id && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{session.schoolLocationId.name}</Text>
          </View>
        )}
      </View>

      {/* Status Messages */}
      <View style={styles.statusMessages}>
        <View style={styles.statusMessage}>
          <Text
            style={[styles.statusMessageText, {color: sessionStatus.color}]}>
            {sessionStatus.message}
          </Text>
        </View>

        <View style={styles.statusMessage}>
          <Text
            style={[styles.statusMessageText, {color: locationStatus.color}]}>
            {locationStatus.message}
          </Text>
        </View>
      </View>

      {/* Attendance Button */}
      <TouchableOpacity
        style={[
          styles.attendanceButton,
          canAttend && styles.attendanceButtonActive,
          !canAttend && styles.attendanceButtonDisabled,
          attendanceSuccess && styles.attendanceButtonSuccess,
        ]}
        onPress={handleAttendance}
        disabled={!canAttend || isAttending}>
        {isAttending ? (
          <View style={styles.attendanceButtonContent}>
            <ActivityIndicator size="small" color={appColors.white} />
            <Text style={styles.attendanceButtonText}>Đang điểm danh...</Text>
          </View>
        ) : attendanceSuccess ? (
          <View style={styles.attendanceButtonContent}>
            <Text style={styles.attendanceButtonIcon}>🎉</Text>
            <Text style={styles.attendanceButtonText}>
              Điểm danh thành công!
            </Text>
          </View>
        ) : (
          <View style={styles.attendanceButtonContent}>
            <Text style={styles.attendanceButtonIcon}>
              {canAttend ? '✋' : '🚫'}
            </Text>
            <Text style={styles.attendanceButtonText}>
              {canAttend ? 'Điểm danh ngay' : 'Không thể điểm danh'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Additional Info */}
      {session.description && (
        <View style={styles.description}>
          <Text style={styles.descriptionText}>{session.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
    marginBottom: 2,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: appColors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: appColors.gray,
    flex: 1,
  },
  statusMessages: {
    marginBottom: 16,
  },
  statusMessage: {
    marginVertical: 4,
  },
  statusMessageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  attendanceButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceButtonActive: {
    backgroundColor: appColors.primary,
    shadowColor: appColors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  attendanceButtonDisabled: {
    backgroundColor: appColors.gray,
  },
  attendanceButtonSuccess: {
    backgroundColor: appColors.success,
  },
  attendanceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  attendanceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: appColors.white,
  },
  description: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  descriptionText: {
    fontSize: 14,
    color: appColors.gray,
    lineHeight: 20,
  },
});

export default StudentSessionCard;
