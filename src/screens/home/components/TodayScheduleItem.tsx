import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../../constants/appColors';
import {ScheduleItem} from '../../../types/scheduleType';

interface TodayScheduleItemProps {
  schedule: ScheduleItem;
  onPress: () => void;
}

const TodayScheduleItem: React.FC<TodayScheduleItemProps> = ({
  schedule,
  onPress,
}) => {
  const getCurrentStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (currentTime >= startMinutes && currentTime <= endMinutes) {
      return 'ongoing';
    } else if (currentTime < startMinutes) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  };

  const status = getCurrentStatus();
  const timeDisplay = `${schedule.startTime} - ${schedule.endTime}`;

  return (
    <TouchableOpacity
      style={[
        styles.scheduleItem,
        status === 'ongoing' && styles.scheduleItemOngoing,
        status === 'completed' && styles.scheduleItemCompleted,
      ]}
      onPress={onPress}>
      <View style={styles.scheduleItemLeft}>
        <View
          style={[
            styles.timeIndicator,
            status === 'ongoing' && styles.timeIndicatorOngoing,
            status === 'completed' && styles.timeIndicatorCompleted,
          ]}
        />
        <Text
          style={[
            styles.scheduleTime,
            status === 'ongoing' && styles.scheduleTimeOngoing,
            status === 'completed' && styles.scheduleTimeCompleted,
          ]}>
          {timeDisplay}
        </Text>
        <View style={styles.roomContainer}>
          <Icon
            name="location-on"
            size={14}
            color={status === 'completed' ? '#9E9E9E' : appColors.primary}
          />
          <Text
            style={[
              styles.scheduleRoom,
              status === 'completed' && styles.scheduleRoomCompleted,
            ]}>
            {schedule.room || schedule.location || 'TBA'}
          </Text>
        </View>
      </View>
      <View style={styles.scheduleItemRight}>
        <Text
          style={[
            styles.scheduleSubject,
            status === 'completed' && styles.scheduleSubjectCompleted,
          ]}>
          {schedule.courseName}
        </Text>
        <View style={styles.lecturerContainer}>
          <Icon
            name="person"
            size={14}
            color={status === 'completed' ? '#9E9E9E' : '#64748B'}
          />
          <Text
            style={[
              styles.scheduleLecturer,
              status === 'completed' && styles.scheduleLecturerCompleted,
            ]}>
            {schedule.instructorName || 'TBA'}
          </Text>
        </View>
        {status === 'ongoing' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Đang diễn ra</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scheduleItem: {
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
    borderColor: 'rgba(230, 235, 240, 0.8)',
  },
  scheduleItemOngoing: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  scheduleItemCompleted: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  scheduleItemLeft: {
    width: 100,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
    position: 'relative',
  },
  timeIndicator: {
    position: 'absolute',
    left: -16,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: appColors.primary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  timeIndicatorOngoing: {
    backgroundColor: '#4CAF50',
  },
  timeIndicatorCompleted: {
    backgroundColor: '#9E9E9E',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
    marginBottom: 8,
  },
  scheduleTimeOngoing: {
    color: '#4CAF50',
  },
  scheduleTimeCompleted: {
    color: '#9E9E9E',
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleRoom: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  scheduleRoomCompleted: {
    color: '#9E9E9E',
  },
  scheduleItemRight: {
    flex: 1,
    paddingLeft: 12,
  },
  scheduleSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 20,
  },
  scheduleSubjectCompleted: {
    color: '#9E9E9E',
  },
  lecturerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleLecturer: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  scheduleLecturerCompleted: {
    color: '#9E9E9E',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default TodayScheduleItem;
