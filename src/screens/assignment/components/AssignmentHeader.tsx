import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../../constants/appColors';

interface AssignmentHeaderProps {
  isTeacher: boolean;
  formattedDate: string;
  assignmentStats: {
    total: number;
    submitted: number;
    pending: number;
    graded: number;
  };
}

const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  isTeacher,
  formattedDate,
  assignmentStats,
}) => {
  return (
    <LinearGradient
      colors={[appColors.primary, '#1A73E8']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.headerCard}>
      <View style={styles.headerContent}>
        <Icon name="assignment" size={32} color={appColors.white} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {isTeacher ? 'Quản lý bài tập' : 'Bài tập của bạn'}
          </Text>
          <Text style={styles.headerSubtitle}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{assignmentStats.total}</Text>
          <Text style={styles.statLabel}>Tổng bài tập</Text>
        </View>
        {isTeacher ? (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{assignmentStats.graded}</Text>
              <Text style={styles.statLabel}>Đã chấm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {assignmentStats.submitted - assignmentStats.graded}
              </Text>
              <Text style={styles.statLabel}>Chờ chấm</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{assignmentStats.submitted}</Text>
              <Text style={styles.statLabel}>Đã nộp</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{assignmentStats.pending}</Text>
              <Text style={styles.statLabel}>Chưa nộp</Text>
            </View>
          </>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: appColors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.white,
  },
  statLabel: {
    fontSize: 12,
    color: appColors.white,
    opacity: 0.9,
    marginTop: 4,
  },
});

export default AssignmentHeader;
