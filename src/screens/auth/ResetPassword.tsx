import React, {useState} from 'react';
import {useRoute, RouteProp} from '@react-navigation/native';
import {ActivityIndicator} from 'react-native';
import {Lock, TickCircle} from 'iconsax-react-native';

import ContainerComponent from '../../components/ContainerCompunent';
import TextComponent from '../../components/TextComponent';
import SectionComponent from '../../components/SectionComponent';
import InputComponent from '../../components/InputComponent';
import ButtonComponent from '../../components/ButtonComponent';
import SpaceComponent from '../../components/SpaceComponenet';
import LoadingModal from '../../modals/Loading';
import usePasswordReset from '../../hooks/usePasswordReset';
import {appColors} from '../../constants/appColors';
import HeaderComponent from '../../components/HeaderCompunent';

// Define the type for route params
type ResetPasswordRouteProp = RouteProp<
  {
    ResetPassword: {
      email: string;
      otp: string;
    };
  },
  'ResetPassword'
>;

const ResetPassword = ({navigation}: any) => {
  const route = useRoute<ResetPasswordRouteProp>();
  const {email, otp} = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const {resetPassword, isLoading, renderAlert} = usePasswordReset(navigation);

  const passwordsMatch = newPassword === confirmPassword;
  const validPassword = newPassword.length >= 6;
  const canSubmit =
    validPassword && passwordsMatch && newPassword && confirmPassword;

  const handleResetPassword = async () => {
    if (!validPassword) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }

    await resetPassword(email, otp, newPassword);
  };

  return (
    <ContainerComponent isImageBackground>
      <LoadingModal visible={isLoading} />
      {renderAlert()}
      <HeaderComponent
        showBack
        navigation={navigation}
        title="Đặt lại mật khẩu"
      />

      <SectionComponent>
        <TextComponent text="Đặt lại mật khẩu" title />
        <TextComponent text="Vui lòng nhập mật khẩu mới cho tài khoản của bạn" />
        <SpaceComponent height={20} />

        <TextComponent text="Mật khẩu mới" />
        <InputComponent
          value={newPassword}
          onChange={setNewPassword}
          affix={<Lock size={20} color={appColors.gray} />}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          isPassword
        />

        <SpaceComponent height={10} />

        <TextComponent text="Xác nhận mật khẩu" />
        <InputComponent
          value={confirmPassword}
          onChange={setConfirmPassword}
          affix={<Lock size={20} color={appColors.gray} />}
          placeholder="Xác nhận mật khẩu mới"
          isPassword
        />

        {/* Hiển thị validation feedback */}
        {newPassword && !validPassword && (
          <TextComponent
            text="Mật khẩu phải có ít nhất 6 ký tự"
            color={appColors.danger}
            size={12}
          />
        )}

        {newPassword && confirmPassword && !passwordsMatch && (
          <TextComponent
            text="Mật khẩu xác nhận không khớp"
            color={appColors.danger}
            size={12}
          />
        )}
      </SectionComponent>

      <SectionComponent>
        <ButtonComponent
          onPress={handleResetPassword}
          text={isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          type="primary"
          disable={!canSubmit || isLoading}
          icon={
            isLoading ? (
              <ActivityIndicator color={appColors.white} />
            ) : (
              <TickCircle size={20} color={appColors.white} />
            )
          }
          iconFlex="right"
        />
      </SectionComponent>
    </ContainerComponent>
  );
};

export default ResetPassword;
