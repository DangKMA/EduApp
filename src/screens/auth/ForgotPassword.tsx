import React, {useState} from 'react';
import ContainerComponent from '../../components/ContainerCompunent';
import TextComponent from '../../components/TextComponent';
import SectionComponent from '../../components/SectionComponent';
import InputComponent from '../../components/InputComponent';
import {ArrowRight, Message} from 'iconsax-react-native';
import {appColors} from '../../constants/appColors';
import ButtonComponent from '../../components/ButtonComponent';
import SpaceComponent from '../../components/SpaceComponenet';
import {ActivityIndicator} from 'react-native';
import usePasswordReset from '../../hooks/usePasswordReset';
import HeaderComponent from '../../components/HeaderCompunent';
import {useRoute, RouteProp} from '@react-navigation/native';
import LoadingModal from '../../modals/Loading';

// Define the type for route params
type ForgotPasswordRouteProp = RouteProp<
  {
    ForgotPassword: {
      email?: string;
    };
  },
  'ForgotPassword'
>;

const ForgotPassword = ({navigation}: any) => {
  const route = useRoute<ForgotPasswordRouteProp>();
  const emailFromLogin = route.params?.email || '';
  const [email, setEmail] = useState(emailFromLogin);

  const {requestPasswordReset, isLoading, renderAlert} =
    usePasswordReset(navigation);

  const handleSubmit = async () => {
    if (!email.trim()) {
      // Có thể thêm validation
      return;
    }
    await requestPasswordReset(email);
  };

  return (
    <ContainerComponent isImageBackground>
      <LoadingModal visible={isLoading} />
      {renderAlert()}
      <HeaderComponent showBack navigation={navigation} title="Quên mật khẩu" />

      <SectionComponent>
        <TextComponent text="Đổi mật khẩu" title />
        <TextComponent text="Vui lòng nhập email để yêu cầu đổi mật khẩu" />
        <SpaceComponent height={20} />
        <InputComponent
          value={email}
          onChange={val => setEmail(val)}
          affix={<Message size={20} color={appColors.gray} />}
          placeholder="Nhập email"
          type="email-address"
        />
      </SectionComponent>

      <SectionComponent>
        <ButtonComponent
          onPress={handleSubmit}
          text={isLoading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lại mật khẩu'}
          type="primary"
          disable={isLoading || !email.trim()}
          icon={
            isLoading ? (
              <ActivityIndicator color={appColors.white} />
            ) : (
              <ArrowRight size={20} color={appColors.white} />
            )
          }
          iconFlex="right"
        />
      </SectionComponent>
    </ContainerComponent>
  );
};

export default ForgotPassword;
