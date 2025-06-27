import React, {createContext, useContext, useState, ReactNode} from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'warning' | 'error' | 'info' | 'question';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions>({});

  const showAlert = (options: AlertOptions) => {
    setAlertOptions(options);
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
    // Reset options sau khi ẩn
    setTimeout(() => {
      setAlertOptions({});
    }, 300);
  };

  // Xử lý nút với auto-hide
  const processedButtons = alertOptions.buttons?.map(button => ({
    ...button,
    onPress: () => {
      if (button.onPress) {
        button.onPress();
      }
      hideAlert();
    },
  })) || [{text: 'OK', onPress: hideAlert}];

  return (
    <AlertContext.Provider value={{showAlert, hideAlert}}>
      {children}
      <CustomAlert
        visible={alertVisible}
        title={alertOptions.title}
        message={alertOptions.message}
        buttons={processedButtons}
        type={alertOptions.type}
        onBackdropPress={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useCustomAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useCustomAlert must be used within AlertProvider');
  }
  return context;
};

// Helper functions để sử dụng nhanh
export const showSuccessAlert = (
  showAlert: (options: AlertOptions) => void,
  title: string,
  message?: string,
  onOk?: () => void,
) => {
  showAlert({
    type: 'success',
    title,
    message,
    buttons: [{text: 'OK', onPress: onOk}],
  });
};

export const showErrorAlert = (
  showAlert: (options: AlertOptions) => void,
  title: string,
  message?: string,
  onOk?: () => void,
) => {
  showAlert({
    type: 'error',
    title,
    message,
    buttons: [{text: 'OK', onPress: onOk}],
  });
};

export const showConfirmAlert = (
  showAlert: (options: AlertOptions) => void,
  title: string,
  message?: string,
  onConfirm?: () => void,
  onCancel?: () => void,
) => {
  showAlert({
    type: 'question',
    title,
    message,
    buttons: [
      {text: 'Hủy', style: 'cancel', onPress: onCancel},
      {text: 'Xác nhận', style: 'destructive', onPress: onConfirm},
    ],
  });
};
