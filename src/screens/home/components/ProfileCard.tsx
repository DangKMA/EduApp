import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../../constants/appColors';
import {User} from '../../../redux/reducers/userReducer';

interface ProfileCardProps {
  user: User | null;
  onPress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({user, onPress}) => {
  const getAvatarSource = () => {
    if (
      user?.avatar &&
      user.avatar !== 'https://www.gravatar.com/avatar/default'
    ) {
      return {uri: user.avatar};
    }
    return require('../../../assets/images/logo.png');
  };

  const getClassName = () => {
    if (user?.role === 'student' && user?.studentInfo?.className) {
      return user.studentInfo.className;
    }
    if (user?.role === 'teacher' && user?.teacherInfo?.department) {
      return user.teacherInfo.department;
    }
    return 'Chưa cập nhật';
  };

  // ✅ Function để tạo greeting thông minh theo vai trò
  const getSmartGreeting = () => {
    const currentHour = new Date().getHours();
    const firstName = user?.fullName?.split(' ').pop() || 'bạn';

    // Xác định vai trò
    let rolePrefix = '';
    if (user?.role === 'teacher') {
      rolePrefix = 'thầy ';
    } else if (user?.role === 'student') {
      rolePrefix = 'bạn ';
    } else {
      rolePrefix = '';
    }

    // Tạo greeting theo thời gian
    if (currentHour >= 5 && currentHour < 12) {
      return `Chào buổi sáng, ${rolePrefix}${firstName} 🌅`;
    } else if (currentHour >= 12 && currentHour < 17) {
      return `Chào buổi chiều, ${rolePrefix}${firstName} ☀️`;
    } else if (currentHour >= 17 && currentHour < 21) {
      return `Chào buổi tối, ${rolePrefix}${firstName} 🌆`;
    } else {
      return `Chúc ngủ ngon, ${rolePrefix}${firstName} 🌙`;
    }
  };

  const getGPA = () => {
    if (user?.studentInfo?.gpa && user.studentInfo.gpa > 0) {
      return user.studentInfo.gpa.toFixed(2);
    }
    return '0.00';
  };

  const getCoursesCount = () => {
    return user?.courses?.length || 0;
  };

  const getFailedCoursesCount = () => {
    return user?.studentInfo?.failedCourses || 0;
  };

  const getTotalCredits = () => {
    return user?.studentInfo?.totalCredits || 0;
  };

  const renderStats = () => {
    if (user?.role === 'student') {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="book" size={20} color="#4A6FFF" />
            <Text style={styles.statValue}>{getCoursesCount()}</Text>
            <Text style={styles.statLabel}>Môn học</Text>
          </View>
          <View style={styles.statCard}>
            <Icon
              name="grade"
              size={20}
              color={getGPA() === '0.00' ? '#FF9800' : '#4CAF50'}
            />
            <Text
              style={[
                styles.statValue,
                {color: getGPA() === '0.00' ? '#FF9800' : '#2D3748'},
              ]}>
              {getGPA()}
            </Text>
            <Text style={styles.statLabel}>GPA</Text>
          </View>
          <View style={styles.statCard}>
            <Icon
              name="stars"
              size={20}
              color={getTotalCredits() > 0 ? '#4CAF50' : '#FF9800'}
            />
            <Text
              style={[
                styles.statValue,
                {color: getTotalCredits() > 0 ? '#4CAF50' : '#FF9800'},
              ]}>
              {getTotalCredits()}
            </Text>
            <Text style={styles.statLabel}>Tín chỉ</Text>
          </View>
        </View>
      );
    } else if (user?.role === 'teacher') {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="class" size={20} color="#4A6FFF" />
            <Text style={styles.statValue}>{getCoursesCount()}</Text>
            <Text style={styles.statLabel}>Môn học</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="people" size={20} color="#6FCF97" />
            <Text style={styles.statValue}>
              {(user?.teacherInfo as any)?.studentCount || '0'}
            </Text>
            <Text style={styles.statLabel}>Học viên</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="assignment" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Nhiệm vụ</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="info" size={20} color="#9E9E9E" />
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statLabel}>Thông tin</Text>
        </View>
      </View>
    );
  };

  const renderStudentWarnings = () => {
    if (user?.role === 'student') {
      const failedCourses = getFailedCoursesCount();
      const gpa = parseFloat(getGPA());

      if (failedCourses > 0 || gpa < 2.0) {
        return (
          <View style={styles.warningContainer}>
            {failedCourses > 0 && (
              <View style={styles.warningCard}>
                <Icon name="warning" size={16} color="#FF6B6B" />
                <Text style={styles.warningText}>
                  {failedCourses} môn chưa đạt
                </Text>
              </View>
            )}
            {gpa < 2.0 && gpa > 0 && (
              <View style={styles.warningCard}>
                <Icon name="trending-down" size={16} color="#FF9800" />
                <Text style={styles.warningText}>GPA cần cải thiện</Text>
              </View>
            )}
          </View>
        );
      }
    }
    return null;
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={styles.profileCard}>
        {/* Header với gradient */}
        <LinearGradient
          colors={[appColors.primary, '#1A73E8']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>{getSmartGreeting()}</Text>
            <View style={styles.studentInfoContainer}>
              <Text style={styles.studentId}>
                {user?.role === 'student' ? 'MSSV: ' : 'ID: '}
                {user?.userID || 'N/A'}
              </Text>
              <View style={styles.dotSeparator} />
              <Text style={styles.studentClass}>{getClassName()}</Text>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Image source={getAvatarSource()} style={styles.avatar} />
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    user?.status === 'online'
                      ? '#4CAF50'
                      : user?.status === 'away'
                      ? '#FFC107'
                      : '#9E9E9E',
                },
              ]}
            />
          </View>
        </LinearGradient>

        {/* Stats section với background trắng */}
        <View style={styles.statsSection}>
          {renderStats()}
          {renderStudentWarnings()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: appColors.white,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    lineHeight: 22,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: appColors.white,
    marginBottom: 6,
  },
  studentInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentId: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 8,
  },
  studentClass: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: appColors.white,
  },
  statsSection: {
    backgroundColor: appColors.white,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  warningContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  warningText: {
    fontSize: 12,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default ProfileCard;
