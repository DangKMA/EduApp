import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import {appColors} from '../constants/appColors';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  position?: 'bottom' | 'center';
  maxHeight?: number | string;
  backgroundColor?: string;
  overlayColor?: string;
}

const {height: screenHeight} = Dimensions.get('window');

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  animationType = 'slide',
  position = 'bottom',
  maxHeight = '80%',
  backgroundColor = appColors.white,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
}) => {
  const modalStyles =
    position === 'center'
      ? styles.modalContainerCenter
      : styles.modalContainerBottom;

  const containerStyles =
    position === 'center' ? styles.overlayCenter : styles.overlayBottom;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}>
      <View style={[containerStyles, {backgroundColor: overlayColor}]}>
        <View
          style={[
            modalStyles,
            {
              backgroundColor,
              maxHeight:
                typeof maxHeight === 'string'
                  ? screenHeight * (parseInt(maxHeight) / 100)
                  : maxHeight,
            },
          ]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconFeather name="x" size={24} color={appColors.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainerBottom: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainerCenter: {
    borderRadius: 16,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: appColors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 10,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default CustomModal;
