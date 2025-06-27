import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../constants/appColors';

interface SearchBarProps {
  placeholder?: string;
  onPress?: () => void;
  onChangeText?: (text: string) => void;
  value?: string;
  editable?: boolean;
}

const SearchBar = ({
  placeholder = 'Tìm kiếm...',
  onPress,
  onChangeText,
  value,
  editable = true,
}: SearchBarProps) => {
  if (onPress && !onChangeText) {
    return (
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={onPress}
        activeOpacity={0.8}>
        <IconFeather name="search" size={18} color={appColors.gray2} />
        <Text style={styles.searchPlaceholder}>{placeholder}</Text>
      </TouchableOpacity>
    );
  }

  // Editable version
  return (
    <View style={styles.searchContainer}>
      <IconFeather name="search" size={18} color={appColors.gray2} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={appColors.gray2}
        onChangeText={onChangeText}
        value={value}
        editable={editable}
      />
      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText && onChangeText('')}
          hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
          <IconFeather name="x" size={18} color={appColors.gray2} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: appColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: appColors.gray2,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: appColors.black,
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    color: appColors.black,
    padding: 0,
  },
});

export default SearchBar;
