import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {appColors} from '../../../constants/appColors';

interface SectionTitleProps {
  title: string;
  onSeeAll?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({title, onSeeAll}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    position: 'relative',
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: appColors.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: appColors.primary,
    fontWeight: '500',
  },
});

export default SectionTitle;
