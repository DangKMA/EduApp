import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {User} from '../../../redux/reducers/userReducer';
import SectionTitle from './SectionTitle';
import AssignmentItem from './AssignmentItem';
import UpcomingEvent from './UpcomingEvent';
import {useStudentAssignments} from '../../../hooks/useAssignment';
import {Assignment} from '../../../types/assignmentType';
import {appColors} from '../../../constants/appColors';

interface StudentDashboardProps {
  user: User | null;
  navigateToScreen: (screenName: string, params?: any) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  navigateToScreen,
}) => {
  // ✅ Memoize query object để tránh re-render
  const studentQuery = useMemo(
    () => ({
      status: 'all' as const,
    }),
    [],
  );

  // ✅ Sử dụng hook với stable query
  const {assignments, loading: assignmentsLoading} =
    useStudentAssignments(studentQuery);

  // ✅ State để track các assignment cần nộp và sắp tới hạn
  const [urgentAssignments, setUrgentAssignments] = useState<Assignment[]>([]);

  // ✅ Memoize urgent assignments calculation để tránh re-calculation
  const calculatedUrgentAssignments = useMemo(() => {
    if (!assignments || assignments.length === 0) {
      return [];
    }

    const now = new Date();
    const urgentOnes = assignments
      .filter(assignment => {
        // Chỉ lấy những bài chưa nộp hoặc quá hạn
        const isPending =
          assignment.status === 'pending' || assignment.status === 'overdue';

        // Tính số ngày còn lại
        const dueDate = new Date(assignment.dueDate);
        const daysLeft = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Ưu tiên những bài sắp tới hạn (trong 7 ngày) hoặc đã quá hạn
        return isPending && (daysLeft <= 7 || assignment.status === 'overdue');
      })
      .sort((a, b) => {
        // Sort by due date (sắp tới hạn trước)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 3); // Chỉ lấy 3 bài gần nhất

    return urgentOnes;
  }, [assignments]);

  // ✅ Update state only when calculated value changes
  useEffect(() => {
    setUrgentAssignments(calculatedUrgentAssignments);
  }, [calculatedUrgentAssignments]);

  // ✅ Memoize static data với navigation stack names đúng
  const STUDENT_DATA = useMemo(
    () => ({
      quickAccess: [
        {
          id: 1,
          icon: 'trending-up',
          iconType: 'feather',
          label: 'Điểm số',
          screen: 'GradeStack', // ✅ Sử dụng Stack name
          gradientColors: ['#4A6FFF', '#6A8CFF'],
        },
        {
          id: 2,
          icon: 'account-check',
          iconType: 'community',
          label: 'Điểm danh',
          screen: 'AttendanceStack', // ✅ Sửa: AttendanceStack thay vì Attendance
          gradientColors: ['#FF6B6B', '#FF8E8E'],
        },
        {
          id: 3,
          icon: 'book-open',
          iconType: 'feather',
          label: 'Tài liệu',
          screen: 'MaterialStack', // ✅ Sửa: MaterialStack thay vì Material
          gradientColors: ['#56CCF2', '#2F80ED'],
        },
        {
          id: 4,
          icon: 'google-classroom',
          iconType: 'community',
          label: 'Lớp học',
          screen: 'CourseStack', // ✅ Sửa: CourseStack thay vì Classes
          gradientColors: ['#6FCF97', '#27AE60'],
        },
      ],
      upcomingEvents: [
        {
          id: 1,
          title: 'Kiểm tra giữa kỳ - Mạng máy tính',
          date: 'Thg 6 15',
          time: '07:30 - 09:30',
          screen: 'ScheduleStack', // ✅ Sửa: Sử dụng ScheduleStack
          params: {
            screen: 'ScheduleMain',
            params: {eventId: 101},
          },
        },
        {
          id: 2,
          title: 'Hội thảo Khoa học dữ liệu',
          date: 'Thg 6 20',
          time: '14:00 - 16:30',
          screen: 'ScheduleStack', // ✅ Sửa: Sử dụng ScheduleStack
          params: {
            screen: 'ScheduleMain',
            params: {eventId: 102},
          },
        },
      ],
    }),
    [],
  );

  // ✅ Memoize helper function để format dueDate cho AssignmentItem
  const formatDueDate = useCallback((dueDate: string): number => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // ✅ Memoize navigation handlers với Stack navigation structure

  const handleAssignmentNavigation = useCallback(() => {
    // ✅ Navigate đến AssignmentStack
    navigateToScreen('AssignmentStack', {screen: 'AssignmentMain'});
  }, [navigateToScreen]);

  const handleAssignmentPress = useCallback(
    (assignmentId: string) => {
      // ✅ Navigate đến AssignmentStack với specific screen
      navigateToScreen('AssignmentStack', {
        screen: 'AssignmentDetail',
        params: {assignmentId},
      });
    },
    [navigateToScreen],
  );

  const handleEventsNavigation = useCallback(() => {
    // ✅ Navigate đến ScheduleStack để xem events
    navigateToScreen('ScheduleStack', {screen: 'ScheduleMain'});
  }, [navigateToScreen]);

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

  return (
    <>
      {/* Assignments Section - Using Real Data */}
      <SectionTitle
        title="Bài tập cần nộp"
        onSeeAll={handleAssignmentNavigation}
      />
      <View style={styles.assignmentsContainer}>
        {assignmentsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={appColors.primary} />
          </View>
        ) : urgentAssignments.length > 0 ? (
          urgentAssignments.map(assignment => (
            <AssignmentItem
              key={assignment._id}
              title={assignment.title}
              course={assignment.course.name}
              dueDate={formatDueDate(assignment.dueDate)}
              completed={
                assignment.status === 'graded' ||
                assignment.status === 'submitted'
              }
              status={assignment.status}
              onPress={() => handleAssignmentPress(assignment._id)}
            />
          ))
        ) : (
          <AssignmentItem
            title="Không có bài tập cần nộp"
            course="Tất cả bài tập đã hoàn thành"
            dueDate={0}
            completed={true}
            onPress={handleAssignmentNavigation}
          />
        )}
      </View>

      {/* Upcoming Events */}
      <SectionTitle title="Sự kiện sắp tới" onSeeAll={handleEventsNavigation} />
      <View style={styles.eventsContainer}>
        {STUDENT_DATA.upcomingEvents.map(item => (
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
  assignmentsContainer: {
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

export default StudentDashboard;
