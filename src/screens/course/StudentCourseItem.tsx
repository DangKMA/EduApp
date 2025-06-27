import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../constants/appColors';
import {Course as CourseType} from '../../types/courseType';

const DEFAULT_GRADIENTS = [
  ['#4A6FFF', '#6A8CFF'],
  ['#FF6B6B', '#FF8E8E'],
  ['#43A047', '#66BB6A'],
  ['#7E57C2', '#9575CD'],
  ['#FF9800', '#FFB74D'],
  ['#26A69A', '#4DB6AC'],
];

const isValidHexColor = (color: string): boolean => {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
};

interface StudentCourseItemProps {
  item: CourseType;
  index: number;
  onPress: (course: CourseType) => void;
  loadingId: string | null;
  shadeColorFn: (color: string, percent: number) => string;
  getCourseColorFn: (index: number) => string[];
  cardWidth: number;
  cardHeight: number;
}

const StudentCourseItem: React.FC<StudentCourseItemProps> = ({
  item,
  index,
  onPress,
  loadingId,
  shadeColorFn,
  getCourseColorFn,
  cardWidth,
  cardHeight,
}) => {
  const statusColors = {
    ongoing: '#4CAF50',
    upcoming: '#2196F3',
    completed: '#9E9E9E',
  };

  const statusText = {
    ongoing: 'Đang diễn ra',
    upcoming: 'Sắp tới',
    completed: 'Đã hoàn thành',
  };

  // Xử lý màu cho LinearGradient
  let courseColor = DEFAULT_GRADIENTS[0];

  try {
    if (item.color) {
      if (Array.isArray(item.color) && item.color.length >= 2) {
        const validColors = item.color.every(
          color => typeof color === 'string' && isValidHexColor(color),
        );

        if (validColors) {
          courseColor = item.color;
        } else {
          courseColor = getCourseColorFn(index);
        }
      } else if (Array.isArray(item.color) && item.color.length === 1) {
        if (
          typeof item.color[0] === 'string' &&
          isValidHexColor(item.color[0])
        ) {
          courseColor = [item.color[0], item.color[0]];
        } else {
          courseColor = getCourseColorFn(index);
        }
      } else if (
        typeof item.color === 'string' &&
        isValidHexColor(item.color)
      ) {
        try {
          const shadedColor = shadeColorFn(item.color, -20);
          courseColor = [item.color, shadedColor];
        } catch (e) {
          courseColor = getCourseColorFn(index);
        }
      } else {
        courseColor = getCourseColorFn(index);
      }
    } else {
      courseColor = getCourseColorFn(index);
    }
  } catch (error) {
    console.error(`Lỗi xử lý màu cho khóa học ${item.id}:`, error);
    courseColor = getCourseColorFn(index);
  }

  const progress = item.progress || 0;
  const isLoading = loadingId === item.id;

  return (
    <TouchableOpacity
      style={[styles.courseCard, {width: cardWidth, height: cardHeight}]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      disabled={isLoading}>
      <LinearGradient
        colors={courseColor}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.courseCardHeader}>
        <Image
          source={{uri: item.image || 'https://i.imgur.com/jRVDeI8.jpg'}}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseHeaderOverlay} />
        <View style={styles.courseInfo}>
          <Text style={styles.courseId}>{item.code || item.id}</Text>
          <Text style={styles.courseName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
      </LinearGradient>

      <View style={styles.courseCardBody}>
        <View style={styles.instructorContainer}>
          <IconFeather name="user" size={14} color={appColors.gray2} />
          <Text style={styles.instructorText} numberOfLines={1}>
            {typeof item.instructorId === 'object' &&
            item.instructorId?.fullName
              ? item.instructorId.fullName
              : typeof item.instructorId === 'string'
              ? item.instructorId
              : 'Không có thông tin'}
          </Text>
        </View>

        <View style={styles.courseCardFooter}>
          <View style={styles.creditsContainer}>
            <IconFeather name="book" size={14} color={appColors.gray2} />
            <Text style={styles.creditsText}>{item.credits} tín chỉ</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColors[item.status] || '#9E9E9E'}20`,
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {color: statusColors[item.status] || '#9E9E9E'},
              ]}>
              {statusText[item.status] || 'Không xác định'}
            </Text>
          </View>
        </View>

        {item.status !== 'upcoming' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: courseColor[0],
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: appColors.white,
    overflow: 'hidden',
  },
  courseCardHeader: {
    height: 120,
    width: '100%',
    overflow: 'hidden',
  },
  courseImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  courseHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  courseInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  courseId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white,
    height: 40,
  },
  courseCardBody: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructorText: {
    marginLeft: 4,
    fontSize: 13,
    color: appColors.gray2,
  },
  courseCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsText: {
    marginLeft: 4,
    fontSize: 12,
    color: appColors.gray2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    flex: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: appColors.text,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(StudentCourseItem);
