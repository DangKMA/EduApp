import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';

interface GridItemProps {
  icon: string;
  iconType?: string;
  label: string;
  gradientColors: string[];
  onPress: () => void;
}

const GridItem: React.FC<GridItemProps> = ({
  icon,
  iconType = 'feather',
  label,
  gradientColors,
  onPress,
}) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gridItemBg}>
      {iconType === 'feather' ? (
        <IconFeather name={icon} size={20} color="#FFFFFF" />
      ) : iconType === 'community' ? (
        <IconCommunity name={icon} size={20} color="#FFFFFF" />
      ) : (
        <Icon name={icon} size={20} color="#FFFFFF" />
      )}
    </LinearGradient>
    <Text style={styles.gridItemLabel}>{label}</Text>
  </TouchableOpacity>
);

const {width} = Dimensions.get('window');
const gridItemWidth = (width - 56) / 4;

const styles = StyleSheet.create({
  gridItem: {
    width: gridItemWidth,
    alignItems: 'center',
    marginBottom: 16,
  },
  gridItemBg: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  gridItemLabel: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default GridItem;
