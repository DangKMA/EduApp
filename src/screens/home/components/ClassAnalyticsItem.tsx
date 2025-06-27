import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {appColors} from '../../../constants/appColors';

interface ClassAnalyticsItemProps {
  className: string;
  studentCount: number;
  averageScore: number;
  completionRate: number;
  onPress: () => void;
}

const ClassAnalyticsItem: React.FC<ClassAnalyticsItemProps> = ({
  className,
  studentCount,
  averageScore,
  completionRate,
  onPress,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4CAF50';
    if (score >= 7) return '#2196F3';
    if (score >= 5.5) return '#FFC107';
    if (score >= 4) return '#FF9800';
    return '#F44336';
  };

  return (
    <TouchableOpacity style={styles.analyticsItem} onPress={onPress}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsClass}>{className}</Text>
        <Text style={styles.analyticsCount}>{studentCount} sinh viên</Text>
      </View>
      <View style={styles.analyticsStats}>
        <View style={styles.analyticsScoreContainer}>
          <Text
            style={[
              styles.analyticsScore,
              {color: getScoreColor(averageScore)},
            ]}>
            {averageScore.toFixed(1)}
          </Text>
          <Text style={styles.analyticsLabel}>Điểm TB</Text>
        </View>
        <View style={styles.analyticsDivider} />
        <View style={styles.analyticsRateContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${completionRate}%`,
                  backgroundColor:
                    completionRate >= 70
                      ? '#4CAF50'
                      : completionRate >= 40
                      ? '#FFC107'
                      : '#F44336',
                },
              ]}
            />
          </View>
          <Text style={styles.analyticsRate}>{completionRate}% hoàn thành</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  analyticsItem: {
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
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsClass: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  analyticsCount: {
    fontSize: 13,
    color: '#64748B',
  },
  analyticsStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyticsScoreContainer: {
    width: 70,
    alignItems: 'center',
  },
  analyticsScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  analyticsDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  analyticsRateContainer: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#EDF2F7',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  analyticsRate: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
});

export default ClassAnalyticsItem;
