import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../../../constants/appColors';

const DateDisplay: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [weekday, setWeekday] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const today = new Date();

      // Định dạng ngày
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      };
      const formattedDate = today.toLocaleDateString('vi-VN', dateOptions);

      // Định dạng thứ
      const weekdayOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
      };
      const formattedWeekday = today.toLocaleDateString(
        'vi-VN',
        weekdayOptions,
      );

      // Định dạng giờ
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      };
      const formattedTime = today.toLocaleTimeString('vi-VN', timeOptions);

      setCurrentDate(formattedDate);
      setWeekday(
        formattedWeekday.charAt(0).toUpperCase() + formattedWeekday.slice(1),
      );
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.dateContainer}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <IconFeather name="calendar" size={24} color="white" />
        </View>
        <View style={styles.dateInfo}>
          <Text style={styles.weekdayText}>{weekday}</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        <IconFeather name="clock" size={18} color="white" />
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: appColors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateInfo: {
    flex: 1,
  },
  weekdayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: appColors.white,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.white,
    marginLeft: 6,
  },
});

export default DateDisplay;
