import React, {useState} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import ButtonComponent from '../../components/ButtonComponent';
import TextComponent from '../../components/TextComponent';
import {appColors} from '../../constants/appColors';
import InputComponent from '../../components/InputComponent';
import {Call, CallCalling, Lock, Mobile, Sms} from 'iconsax-react-native';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassWord] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.formContainer}>
        <TextComponent
          text="Đăng nhập"
          title
          styles={{textAlign: 'center', marginBottom: 20}}
        />
        <TextComponent text="Nhập số điện thoại" />
        <InputComponent
          value={phone}
          onChange={val => setPhone(val)}
          placeholder="Nhập số điện thoại"
          type="phone-pad"
          allowClear
          affix={<CallCalling size={22} color={appColors.gray2} />}
        />

        <TextComponent text="Nhập mật khẩu" />
        <InputComponent
          value={password}
          onChange={val => setPassWord(val)}
          placeholder="Nhập mật khẩu"
          type="default"
          isPassword
          allowClear
          affix={<Lock size={22} color={appColors.gray2} />}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 20,
            marginTop: -16,
          }}>
          <ButtonComponent text="Nhớ mật khẩu" type="link" />
          <ButtonComponent text="quên mật khẩu?" type="link" />
        </View>
        <ButtonComponent text="ĐĂNG NHẬP" type="primary" />
        <ButtonComponent
          text="ĐĂNG NHẬP BẰNG OTP"
          type="primary"
          textColor={appColors.text}
          color={appColors.white}
          styles={{borderColor: appColors.primary, borderWidth: 1}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
});

export default Login;
