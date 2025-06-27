import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../types/navigation';

// Import components
import AssignmentHeader from './components/AssignmentHeader';
import FilterTabs from './components/FilterTabs';
import StudentAssignmentCard from './components/StudentAssignmentCard';
import TeacherAssignmentCard from './components/TeacherAssignmentCard';
import AddAssignmentModal from './components/AddAssignmentModel';

// Import types and hooks
import {
  Assignment as AssignmentData,
  FilterTab,
  AssignmentNavigationParams,
  UseAssignmentsResult,
  CreateAssignmentRequest,
} from '../../types/assignmentType';
import {useAssignments, useAssignmentCRUD} from '../../hooks/useAssignment';

type AssignmentProps = NativeStackScreenProps<RootStackParamList, 'Assignment'>;

interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: Date;
  maxScore: number;
  courseId: string;
}

const Assignment = ({navigation, route}: AssignmentProps) => {
  const courseParams = route?.params as AssignmentNavigationParams | undefined;
  const [userRole, setUserRole] = useState<string>('student');
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    assignments,
    loading,
    refreshing,
    filteredAssignments,
    activeFilter,
    assignmentCounts,
    setActiveFilter,
    onRefresh,
  }: UseAssignmentsResult = useAssignments(courseParams?.courseId);

  const {createAssignment, loading: creating} = useAssignmentCRUD();

  const isTeacher = userRole === 'teacher';

  // Load user from AsyncStorage
  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const userString = await AsyncStorage.getItem('userInfo');
        if (userString) {
          const userData = JSON.parse(userString);
          let userInfo;
          if (userData.data && userData.data.user) {
            userInfo = userData.data.user;
          } else if (userData.role || userData._id) {
            userInfo = userData;
          } else {
            userInfo = userData;
          }
          setUserRole(userInfo?.role || 'student');
        }
      } catch (error) {
        setUserRole('student');
      }
    };
    getUserFromStorage();
  }, []);

  // Get filter tabs
  const getFilterTabs = (): FilterTab[] => {
    return [
      {
        key: 'all',
        label: 'Tất cả',
        icon: 'apps',
        count: assignments.length,
      },
      {
        key: 'pending',
        label: 'Chưa nộp',
        icon: 'schedule',
        count: assignmentCounts?.pending || 0,
      },
      {
        key: 'submitted',
        label: 'Đã nộp',
        icon: 'check-circle-outline',
        count: assignmentCounts?.submitted || 0,
      },
      {
        key: 'graded',
        label: 'Đã chấm',
        icon: 'star-outline',
        count: assignmentCounts?.graded || 0,
      },
      {
        key: 'overdue',
        label: 'Quá hạn',
        icon: 'warning-amber',
        count: assignmentCounts?.overdue || 0,
      },
    ];
  };

  // Statistics from real data
  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const submitted = assignments.filter(
      a => a.status === 'submitted' || a.status === 'graded',
    ).length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const graded = assignments.filter(a => a.status === 'graded').length;

    return {total, submitted, pending, graded};
  }, [assignments]);

  const handleAssignmentPress = (assignment: AssignmentData) => {
    navigation.navigate('AssignmentDetail', {
      assignmentId: assignment._id,
      assignment: assignment,
      userRole: userRole,
    });
  };

  const handleAddAssignment = async (assignmentData: AssignmentFormData) => {
    try {
      const createData: CreateAssignmentRequest = {
        title: assignmentData.title,
        description: assignmentData.description,
        course: assignmentData.courseId,
        dueDate: assignmentData.dueDate.toISOString(),
        maxScore: assignmentData.maxScore,
        weight: 100,
        type: 'photo',
        allowLateSubmission: false,
        maxAttempts: 1,
        instructions: assignmentData.description,
      };

      const result = await createAssignment(createData);

      if (result) {
        onRefresh();
        setShowAddModal(false);
      }
    } catch (error) {
      throw error;
    }
  };

  const today = new Date();
  const formattedDate = format(today, 'EEEE, dd/MM/yyyy', {locale: vi});

  return (
    <View style={styles.container}>
      <HeaderComponent
        title={
          courseParams?.courseName
            ? `Bài tập - ${courseParams.courseName}`
            : 'Bài tập'
        }
        navigation={navigation}
        showBack
        rightIcons={
          isTeacher
            ? [
                {
                  name: 'add',
                  onPress: () => setShowAddModal(true),
                  color: appColors.white,
                  size: 24,
                },
              ]
            : []
        }
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <AssignmentHeader
          isTeacher={isTeacher}
          formattedDate={formattedDate}
          assignmentStats={assignmentStats}
        />

        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isTeacher ? 'Danh sách bài tập' : 'Bài tập được giao'}
            </Text>
            {isTeacher && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}>
                <IconFeather name="plus" size={18} color={appColors.primary} />
                <Text style={styles.addButtonText}>Thêm bài tập</Text>
              </TouchableOpacity>
            )}
          </View>

          <FilterTabs
            filterTabs={getFilterTabs()}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {loading || creating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={appColors.primary} />
              <Text style={styles.loadingText}>
                {creating
                  ? 'Đang tạo bài tập...'
                  : 'Đang tải danh sách bài tập...'}
              </Text>
            </View>
          ) : filteredAssignments.length > 0 ? (
            <View style={styles.assignmentsList}>
              {filteredAssignments.map(assignment => {
                return isTeacher ? (
                  <TeacherAssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onPress={handleAssignmentPress}
                  />
                ) : (
                  <StudentAssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onPress={handleAssignmentPress}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <IconFeather name="file-text" size={48} color={appColors.gray} />
              <Text style={styles.emptyText}>
                {activeFilter === 'all'
                  ? isTeacher
                    ? 'Chưa có bài tập nào được tạo'
                    : 'Chưa có bài tập nào được giao'
                  : `Không có bài tập nào ${getFilterTabs()
                      .find(tab => tab.key === activeFilter)
                      ?.label.toLowerCase()}`}
              </Text>
              {isTeacher && activeFilter === 'all' && (
                <TouchableOpacity
                  style={styles.createFirstButton}
                  onPress={() => setShowAddModal(true)}>
                  <Text style={styles.createFirstButtonText}>
                    Tạo bài tập đầu tiên
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {isTeacher && (
        <AddAssignmentModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAssignment}
          courseId={courseParams?.courseId || ''}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: appColors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    marginLeft: 6,
    color: appColors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: appColors.gray,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: appColors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  createFirstButton: {
    marginTop: 20,
    backgroundColor: appColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: appColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  assignmentsList: {
    gap: 16,
  },
});

export default Assignment;
