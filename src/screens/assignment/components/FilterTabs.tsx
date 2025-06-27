import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {appColors} from '../../../constants/appColors';
import {FilterTab} from '../../../types/assignmentType';

interface FilterTabsProps {
  filterTabs: FilterTab[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  filterTabs,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              activeFilter === tab.key && styles.activeFilterTab,
            ]}
            onPress={() => onFilterChange(tab.key)}
            activeOpacity={0.7}>
            <View style={styles.filterTabContent}>
              <Icon
                name={tab.icon}
                size={16}
                color={
                  activeFilter === tab.key ? appColors.white : appColors.primary
                }
              />
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab.key && styles.activeFilterTabText,
                ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    activeFilter === tab.key && styles.activeFilterBadge,
                  ]}>
                  <Text
                    style={[
                      styles.filterBadgeText,
                      activeFilter === tab.key && styles.activeFilterBadgeText,
                    ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 20,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterTab: {
    backgroundColor: appColors.white,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: appColors.primary + '30',
  },
  activeFilterTab: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  filterTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.primary,
  },
  activeFilterTabText: {
    color: appColors.white,
  },
  filterBadge: {
    backgroundColor: appColors.primary + '20',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  activeFilterBadge: {
    backgroundColor: appColors.white + '30',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: appColors.primary,
  },
  activeFilterBadgeText: {
    color: appColors.white,
  },
});

export default FilterTabs;
