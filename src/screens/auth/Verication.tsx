import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Clipboard,
  AppState,
  ActivityIndicator,
} from 'react-native';
import {ArrowRight} from 'iconsax-react-native';
import {useRoute, RouteProp} from '@react-navigation/native';

import ContainerComponent from '../../components/ContainerCompunent';
import TextComponent from '../../components/TextComponent';
import SectionComponent from '../../components/SectionComponent';
import ButtonComponent from '../../components/ButtonComponent';
import SpaceComponent from '../../components/SpaceComponenet';
import RowComponent from '../../components/RowComponent';
import HeaderComponent from '../../components/HeaderCompunent';
import LoadingModal from '../../modals/Loading';
import usePasswordReset from '../../hooks/usePasswordReset';

import {appColors} from '../../constants/appColors';
import {fontfamilies} from '../../constants/fontfamilies';

// Define the type for route params
type VerificationRouteProp = RouteProp<
  {
    Verification: {
      email: string;
    };
  },
  'Verification'
>;

const Verification = ({navigation}: any) => {
  const route = useRoute<VerificationRouteProp>();
  const {email} = route.params;
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState<number>(300); // 5 minutes
  const [canResend, setCanResend] = useState<boolean>(false);
  const [autoFillAttempted, setAutoFillAttempted] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  const inputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  const appState = useRef(AppState.currentState);

  const {requestPasswordReset, verifyOTP, isLoading, renderAlert} =
    usePasswordReset(navigation);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-fill in development mode
    if (__DEV__ && !autoFillAttempted) {
      setTimeout(() => {
        setAutoFillAttempted(true);
      }, 1500);
    }

    const clipboardListener = setInterval(checkClipboardForOTP, 1000);

    const appStateSubscription = AppState.addEventListener(
      'change',
      nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          checkClipboardForOTP();
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      clearInterval(timer);
      clearInterval(clipboardListener);
      appStateSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFillAttempted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const checkClipboardForOTP = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      const otpRegex = /\b\d{6}\b/;
      const match = clipboardContent.match(otpRegex);

      if (match && match[0]) {
        autofillOTP(match[0]);
      }
    } catch (error) {
      'Clipboard error:', error;
    }
  };

  const autofillOTP = (code: string) => {
    if (code.length === 6) {
      const digits = code.split('');
      setOtp(digits);

      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }

      // Tự động xác minh OTP khi autofill
      setTimeout(() => {
        handleVerifyOTP();
      }, 500);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Trường hợp dán nhiều chữ số
      if (value.length === 6 && /^\d{6}$/.test(value)) {
        autofillOTP(value);
        return;
      }
      value = value.charAt(0);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === 5 && value) {
      // Tự động xác nhận khi đã nhập đủ 6 số
      setTimeout(() => {
        const completeOtp = [...newOtp];
        completeOtp[index] = value;
        if (completeOtp.join('').length === 6) {
          handleVerifyOTP();
        }
      }, 100);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendCooldown(300);
    setOtp(Array(6).fill(''));

    await requestPasswordReset(email);

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length === 6) {
      setVerifying(true);
      await verifyOTP(email, otpCode);
      setVerifying(false);
    }
  };

  return (
    <ContainerComponent isImageBackground>
      <LoadingModal visible={isLoading || verifying} />
      {renderAlert()}

      <HeaderComponent showBack navigation={navigation} title="Xác thực OTP" />

      <SectionComponent>
        <TextComponent text="Xác thực mã OTP" title />
        <TextComponent text="Chúng tôi đã gửi mã xác thực đến email của bạn" />
        <TextComponent text={email} color={appColors.primary} />
        <TextComponent
          text={`Mã xác thực sẽ hết hạn sau: ${formatTime(resendCooldown)}`}
          color={appColors.danger}
        />
        <SpaceComponent height={20} />
      </SectionComponent>

      <SectionComponent>
        <RowComponent justify="space-between">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={styles.input}
              keyboardType="numeric"
              maxLength={6}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={({nativeEvent}) => {
                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
              textContentType={
                Platform.OS === 'ios' ? 'oneTimeCode' : undefined
              }
            />
          ))}
        </RowComponent>

        <SpaceComponent height={20} />

        <ButtonComponent
          onPress={handleVerifyOTP}
          text={verifying ? 'Đang xác thực...' : 'Xác thực'}
          type="primary"
          disable={otp.join('').length !== 6 || isLoading || verifying}
          icon={
            isLoading || verifying ? (
              <ActivityIndicator color={appColors.white} />
            ) : (
              <ArrowRight size={20} color={appColors.white} />
            )
          }
          iconFlex="right"
        />

        <View style={styles.resendContainer}>
          <ButtonComponent
            onPress={handleResendOTP}
            text={
              canResend
                ? 'Gửi lại mã'
                : `Gửi lại mã (${formatTime(resendCooldown)})`
            }
            type="link"
            disable={!canResend || isLoading || verifying}
            color={canResend ? appColors.primary : appColors.gray}
          />
        </View>
      </SectionComponent>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 55,
    width: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: appColors.gray2,
    fontSize: 24,
    fontFamily: fontfamilies.Bold,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});

export default Verification;
