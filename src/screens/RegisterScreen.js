import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { addUser } from '../database/database';
import AuthCard from '../components/AuthCard';
import SolidButton from '../components/SolidButton';
import { StyledInput, PasswordInput, PhoneMaskInput } from '../components/Inputs';
import StrengthBar from '../components/StrengthBar';

function RegisterScreen({ navigation, showAlert, showSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [repeat, setRepeat] = useState('');

  const handleRegister = async () => {
    const phoneDigits = phone.replace(/\D/g, '');

    if (!name || !email || !phone || !pw) {
      return showAlert?.('Por favor, preencha todos os campos antes de continuar.');
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return showAlert?.('E-mail Inválido. Por favor, insira um endereço de e-mail válido.');
    }
    if (phoneDigits.length < 10) { 
        return showAlert?.('Telefone InválIDO. Por favor, insira um número válido com DDD (mínimo 10 dígitos).');
    }
    if (pw !== repeat) return showAlert?.('As senhas não coincidem.');
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(pw)) {
      return showAlert?.(
        'Senha fraca. Use 8+ caracteres, uma maiúscula, um número e um símbolo.'
      );
    }

    try {
      await addUser(name, email.toLowerCase(), phoneDigits, pw);
      showSuccess('Conta criada com sucesso!');
      navigation.goBack();

    } catch (error) {
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        showAlert?.('Este e-mail já está em uso.');
      } else {
        showAlert?.('Ocorreu um erro ao cadastrar.');
      }
      console.log(error.message);
    }
  };

  return (
    <AuthCard
      title="Cadastro"
      subtitle="Crie sua conta"
    >
      <StyledInput
        placeholder="Nome completo"
        value={name}
        onChange={setName}
      />
      <StyledInput
        placeholder="E-mail"
        keyboard="email-address"
        autoCap="none"
        value={email}
        onChange={setEmail}
      />
      
      <PhoneMaskInput
        value={phone}
        onChange={setPhone}
      />
      
      <PasswordInput placeholder="Senha" value={pw} onChange={setPw} />
      <StrengthBar pw={pw} />
      <PasswordInput placeholder="Repetir senha" value={repeat} onChange={setRepeat} />
      
      <SolidButton text="Cadastrar" onPress={handleRegister} />
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.link}>Voltar para o login</Text></TouchableOpacity>
    </AuthCard>
  );
}

const s = StyleSheet.create({
  link: { color: '#fff', textAlign: 'center', marginTop: 16 },
});

export default RegisterScreen;