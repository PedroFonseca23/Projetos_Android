import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser } from '../database/database';
import AuthCard from '../components/AuthCard';
import SolidButton from '../components/SolidButton';
import { StyledInput, PasswordInput } from '../components/Inputs';

function LoginScreen({ navigation, onLoginSuccess, showAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert?.('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const user = await loginUser(email.toLowerCase(), password);
      if (user) {
        onLoginSuccess(user);
      } else {
        showAlert?.('E-mail ou senha incorretos.');
      }
    } catch (error) {
      showAlert?.('Ocorreu um erro ao fazer login.');
      console.log(error.message);
    }
  };

  return (
    <AuthCard 
      title="Bem-vindo"
      subtitle="Entre para continuar"
    >
      <StyledInput
        placeholder="E-mail"
        keyboard="email-address"
        autoCap="none"
        value={email}
        onChange={setEmail} 
      />
      <PasswordInput
        placeholder="Senha"
        value={password}
        onChange={setPassword} 
        autoCap="none"
      />
      
      <SolidButton text="Entrar" onPress={handleLogin} />
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={s.link}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </AuthCard>
  );
}

const s = StyleSheet.create({
  link: { color: '#fff', textAlign: 'center', marginTop: 16 },
});

export default LoginScreen;