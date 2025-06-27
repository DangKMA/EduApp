import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {appColors} from '../../../constants/appColors';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  instructions: Array<{
    icon: string;
    text: string;
  }>;
}

const InfoCard: React.FC<InfoCardProps> = ({title, subtitle, instructions}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.instructionsList}>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionIcon}>{instruction.icon}</Text>
            <Text style={styles.instructionText}>{instruction.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: appColors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: appColors.gray,
    marginBottom: 12,
  },
  instructionsList: {
    marginTop: 8,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  instructionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: appColors.text,
    flex: 1,
    lineHeight: 20,
  },
});

export default InfoCard;
