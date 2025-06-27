import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {appColors} from '../../../constants/appColors';
import {ScheduleItem} from '../../../types/scheduleType';
import SectionTitle from './SectionTitle';
import TodayScheduleItem from './TodayScheduleItem';

interface ScheduleSectionProps {
  scheduleLoading: boolean;
  todayScheduleData: {
    date: string;
    schedules: ScheduleItem[];
    hasSchedule: boolean;
  };
  navigateToScreen: (screenName: string, params?: any) => void;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  scheduleLoading,
  todayScheduleData,
  navigateToScreen,
}) => (
  <>
    <SectionTitle
      title="Thời khóa biểu hôm nay"
      onSeeAll={() => navigateToScreen('Schedule')}
    />
    <View style={styles.scheduleContainer}>
      {scheduleLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={appColors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch học...</Text>
        </View>
      ) : todayScheduleData.hasSchedule &&
        todayScheduleData.schedules.length > 0 ? (
        todayScheduleData.schedules.map((schedule, index) => (
          <TodayScheduleItem
            key={schedule._id || index}
            schedule={schedule}
            onPress={() =>
              navigateToScreen('ClassDetail', {
                classId: schedule.courseId,
                scheduleId: schedule._id,
              })
            }
          />
        ))
      ) : (
        <TouchableOpacity
          style={styles.emptyStateContainer}
          onPress={() => navigateToScreen('Schedule')}>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Hôm nay là ngày nghỉ!</Text>
            <Text style={styles.emptyMessage}>
              Bạn không có lịch học nào hôm nay
            </Text>
            <Text style={styles.emptySubtext}>
              Nhấn để xem lịch học tuần này
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </>
);

const styles = StyleSheet.create({
  scheduleContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  emptyStateContainer: {
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fed7d7',
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
    color: '#e53e3e',
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

export default ScheduleSection;
