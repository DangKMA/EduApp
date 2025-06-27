import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {User} from '../../../redux/reducers/userReducer';
import SectionTitle from './SectionTitle';
import GridItem from './GridItem';
import SubmissionItem from './SubmissionItem';
import ClassAnalyticsItem from './ClassAnalyticsItem';
import UpcomingEvent from './UpcomingEvent';
import {useTeacherAssignments} from '../../../hooks/useAssignment';
import {Submission} from '../../../types/assignmentType';
import {appColors} from '../../../constants/appColors';

interface TeacherDashboardProps {
  user: User | null;
  navigateToScreen: (screenName: string, params?: any) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  navigateToScreen,
}) => {
  // ✅ Debug user role - add dependency để tránh infinite loop
  useEffect(() => {
    if (user) {
      '🔍 Teacher Dashboard User Debug:',
        {
          userId: user?._id,
          role: user?.role,
          email: user?.email,
        };
    }
  }, [user?._id, user?.role]); // ✅ Specific dependencies

  // ✅ Memoize query object để tránh re-render
  const teacherQuery = useMemo(
    () => ({
      status: 'all' as const,
    }),
    [],
  );

  // ✅ Sử dụng hook với stable query
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useTeacherAssignments(teacherQuery);

  // ✅ State để track pending submissions
  const [pendingSubmissions, setPendingSubmissions] = useState<
    Array<{
      id: string;
      studentName: string;
      assignmentName: string;
      submittedDate: string;
      status: 'pending' | 'late' | 'graded';
      assignmentId: string;
      submissionId: string;
    }>
  >([]);

  // ✅ Memoize pending submissions calculation để tránh re-calculation
  const calculatedPendingSubmissions = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return [];
    }

    const pending: any[] = [];

    assignments.forEach(assignment => {
      if (assignment.submissions && assignment.submissions.length > 0) {
        assignment.submissions.forEach((submission: Submission) => {
          // Chỉ lấy những submission cần chấm điểm
          if (
            submission.status === 'submitted' ||
            submission.status === 'late'
          ) {
            pending.push({
              id: `${assignment._id}_${submission.student._id}`,
              studentName: submission.student.fullName,
              assignmentName: assignment.title,
              submittedDate: new Date(
                submission.submissionDate,
              ).toLocaleDateString('vi-VN'),
              status: submission.status,
              assignmentId: assignment._id,
              submissionId: submission._id || '',
            });
          }
        });
      }
    });

    // Sort by submission date (mới nhất trước)
    pending.sort(
      (a, b) =>
        new Date(b.submittedDate).getTime() -
        new Date(a.submittedDate).getTime(),
    );

    return pending.slice(0, 3); // Chỉ lấy 3 bài mới nhất
  }, [assignments]);

  // ✅ Update state only when calculated value changes
  useEffect(() => {
    setPendingSubmissions(calculatedPendingSubmissions);
  }, [calculatedPendingSubmissions]);

  // ✅ Memoize static data với Stack navigation names đúng
  const TEACHER_DATA = useMemo(
    () => ({
      quickAccess: [
        {
          id: 1,
          icon: 'clipboard-list',
          iconType: 'community',
          label: 'Chấm điểm',
          screen: 'GradeStack', // ✅ Sửa: GradeStack thay vì Grade
          gradientColors: ['#4A6FFF', '#6A8CFF'],
        },
        {
          id: 2,
          icon: 'account-group',
          iconType: 'community',
          label: 'Quản lý lớp',
          screen: 'CourseStack', // ✅ Sửa: CourseStack thay vì Course
          gradientColors: ['#FF6B6B', '#FF8E8E'],
        },
        {
          id: 3,
          icon: 'file-document-edit',
          iconType: 'community',
          label: 'Tài liệu',
          screen: 'MaterialStack', // ✅ Sửa: MaterialStack thay vì Material
          gradientColors: ['#56CCF2', '#2F80ED'],
        },
        {
          id: 4,
          icon: 'calendar-check',
          iconType: 'community',
          label: 'Điểm danh',
          screen: 'AttendanceStack', // ✅ Sửa: AttendanceStack thay vì Attendance
          gradientColors: ['#6FCF97', '#27AE60'],
        },
      ],
      classAnalytics: [
        {
          id: 1,
          className: 'CNTT01 - Kỹ thuật lập trình',
          studentCount: 35,
          averageScore: 7.8,
          completionRate: 72,
          screen: 'CourseStack', // ✅ Sửa: CourseStack thay vì Course
          params: {
            screen: 'CourseDetail',
            params: {classId: 101},
          },
        },
        {
          id: 2,
          className: 'CNTT02 - Cơ sở dữ liệu',
          studentCount: 42,
          averageScore: 6.5,
          completionRate: 58,
          screen: 'CourseStack', // ✅ Sửa: CourseStack thay vì Course
          params: {
            screen: 'CourseDetail',
            params: {classId: 102},
          },
        },
      ],
      upcomingEvents: [
        {
          id: 1,
          title: 'Họp Khoa CNTT',
          date: 'Thg 6 18',
          time: '14:00 - 16:00',
          screen: 'ScheduleStack', // ✅ Sửa: ScheduleStack thay vì Schedule
          params: {
            screen: 'ScheduleMain',
            params: {eventId: 201},
          },
        },
        {
          id: 2,
          title: 'Seminar Khoa học máy tính',
          date: 'Thg 6 25',
          time: '09:00 - 11:30',
          screen: 'ScheduleStack', // ✅ Sửa: ScheduleStack thay vì Schedule
          params: {
            screen: 'ScheduleMain',
            params: {eventId: 202},
          },
        },
      ],
    }),
    [],
  );

  // ✅ Memoize navigation handlers với Stack navigation structure
  const handleQuickAccessPress = useCallback(
    (screen: string) => {
      // ✅ Navigate đến stack với screen mặc định
      switch (screen) {
        case 'GradeStack':
          navigateToScreen('GradeStack', {screen: 'GradeMain'});
          break;
        case 'CourseStack':
          navigateToScreen('CourseStack', {screen: 'CourseMain'});
          break;
        case 'MaterialStack':
          navigateToScreen('MaterialStack', {screen: 'MaterialMain'});
          break;
        case 'AttendanceStack':
          navigateToScreen('AttendanceStack', {screen: 'AttendanceMain'});
          break;
        default:
          navigateToScreen(screen);
      }
    },
    [navigateToScreen],
  );

  const handleAssignmentNavigation = useCallback(() => {
    // ✅ Sửa: Navigate đến AssignmentStack
    navigateToScreen('AssignmentStack', {screen: 'AssignmentMain'});
  }, [navigateToScreen]);

  const handleSubmissionPress = useCallback(
    (assignmentId: string) => {
      // ✅ Sửa: Navigate đến AssignmentStack với proper nested structure
      navigateToScreen('AssignmentStack', {
        screen: 'AssignmentDetail',
        params: {assignmentId},
      });
    },
    [navigateToScreen],
  );

  const handleCourseNavigation = useCallback(() => {
    // ✅ Sửa: Navigate đến CourseStack
    navigateToScreen('CourseStack', {screen: 'CourseMain'});
  }, [navigateToScreen]);

  const handleScheduleNavigation = useCallback(() => {
    // ✅ Sửa: Navigate đến ScheduleStack
    navigateToScreen('ScheduleStack', {screen: 'ScheduleMain'});
  }, [navigateToScreen]);

  const handleClassAnalyticsPress = useCallback(
    (screen: string, params?: any) => {
      // ✅ Navigate với proper stack structure
      navigateToScreen(screen, params);
    },
    [navigateToScreen],
  );

  const handleEventPress = useCallback(
    (screen: string, params?: any) => {
      // ✅ Navigate với proper stack structure
      navigateToScreen(screen, params);
    },
    [navigateToScreen],
  );

  // ✅ Early return với loading state
  if (!user) {
    return null;
  }

  if (user.role !== 'teacher') {
    '❌ User is not teacher:',
      {
        user: user,
        role: user?.role,
      };
    return null;
  }

  return (
    <>
      {/* Pending Submissions - Using Real Data */}
      <SectionTitle
        title="Bài nộp cần chấm"
        onSeeAll={handleAssignmentNavigation}
      />
      <View style={styles.submissionsContainer}>
        {assignmentsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={appColors.primary} />
          </View>
        ) : pendingSubmissions.length > 0 ? (
          pendingSubmissions.map(item => (
            <SubmissionItem
              key={item.id}
              assignmentName={item.assignmentName}
              studentName={item.studentName}
              submittedDate={item.submittedDate}
              status={item.status}
              onPress={() => handleSubmissionPress(item.assignmentId)}
            />
          ))
        ) : (
          <SubmissionItem
            assignmentName="Tất cả bài nộp đã được chấm"
            studentName="Không có bài nộp nào cần chấm"
            submittedDate=""
            status="graded"
            onPress={handleAssignmentNavigation}
          />
        )}
      </View>

      {/* Class Analytics */}
      <SectionTitle
        title="Thống kê lớp học"
        onSeeAll={handleCourseNavigation}
      />
      <View style={styles.analyticsContainer}>
        {TEACHER_DATA.classAnalytics.map(item => (
          <ClassAnalyticsItem
            key={item.id}
            className={item.className}
            studentCount={item.studentCount}
            averageScore={item.averageScore}
            completionRate={item.completionRate}
            onPress={() => handleClassAnalyticsPress(item.screen, item.params)}
          />
        ))}
      </View>

      {/* Upcoming Events */}
      <SectionTitle
        title="Sự kiện sắp tới"
        onSeeAll={handleScheduleNavigation}
      />
      <View style={styles.eventsContainer}>
        {TEACHER_DATA.upcomingEvents.map(item => (
          <UpcomingEvent
            key={item.id}
            title={item.title}
            date={item.date}
            time={item.time}
            onPress={() => handleEventPress(item.screen, item.params)}
          />
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  submissionsContainer: {
    marginBottom: 24,
  },
  analyticsContainer: {
    marginBottom: 24,
  },
  eventsContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TeacherDashboard;
