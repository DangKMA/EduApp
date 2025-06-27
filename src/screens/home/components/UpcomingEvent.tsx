import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {appColors} from '../../../constants/appColors';

interface UpcomingEventProps {
  title: string;
  date: string;
  time: string;
  onPress: () => void;
}

const UpcomingEvent: React.FC<UpcomingEventProps> = ({
  title,
  date,
  time,
  onPress,
}) => (
  <TouchableOpacity style={styles.eventItem} onPress={onPress}>
    <View style={styles.eventItemLeft}>
      <Text style={styles.eventDate}>{date}</Text>
    </View>
    <View style={styles.eventItemRight}>
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventTime}>{time}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  eventItem: {
    flexDirection: 'row',
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
  eventItemLeft: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 111, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    color: appColors.primary,
    textAlign: 'center',
  },
  eventItemRight: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: '#64748B',
  },
});

export default UpcomingEvent;
