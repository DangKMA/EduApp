import React from 'react';
import {StyleSheet, Text, View, Image, TextInput} from 'react-native';

const Login = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />
      <View style={styles.formContainer}>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Login</Text>
        <Text>Username</Text>
        <TextInput placeholder="Username" />
        <Text>Password</Text>
        <TextInput placeholder="Password" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50,
    width: 300,
    height: 300,
  },
  formContainer: {
    padding: 20,
  },
});

export default Login;
