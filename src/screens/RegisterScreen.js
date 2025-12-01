import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import { addUser } from '../database/database';
import AuthCard from '../components/AuthCard';
import SolidButton from '../components/SolidButton';
import { StyledInput, PasswordInput, PhoneMaskInput } from '../components/Inputs';
import StrengthBar from '../components/StrengthBar';
import { useTheme } from '../context/ThemeContext';

function RegisterScreen({ navigation, showAlert, showSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [repeat, setRepeat] = useState('');
  const { theme } = useTheme();

  const handleRegister = async () => {
    const phoneDigits = phone.replace(/\D/g, '');

    if (!name || !email || !phone || !pw) return showAlert?.('Preencha todos os campos.');
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) return showAlert?.('E-mail inválido.');
    
    if (phoneDigits.length < 10) return showAlert?.('Telefone inválido.');
    
    if (pw !== repeat) return showAlert?.('As senhas não coincidem.');
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(pw)) return showAlert?.('Senha fraca: use Maiúscula, Número e Símbolo.');

    try {
      await addUser(name, email.toLowerCase(), phoneDigits, pw);
      showSuccess('Conta criada com sucesso!');
      navigation.goBack();
    } catch (error) {
      const msg = error.message || String(error);
      if (msg.includes('UNIQUE') || msg.includes('Email em uso')) {
        Alert.alert("Atenção", "Este e-mail já possui uma conta cadastrada. Tente fazer login ou recupere sua senha.");
      } else {
        showAlert?.('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <AuthCard title="Criar Conta" subtitle="Junte-se a nós e transforme seu ambiente." icon="person-add-outline">
      <View style={s.form}>
        <StyledInput placeholder="Nome completo" value={name} onChange={setName} />
        <StyledInput placeholder="E-mail" keyboard="email-address" autoCap="none" value={email} onChange={setEmail} />
        <PhoneMaskInput value={phone} onChange={setPhone} />
        <PasswordInput placeholder="Senha" value={pw} onChange={setPw} />
        <StrengthBar pw={pw} />
        <View style={{ marginTop: 10 }}>
            <PasswordInput placeholder="Confirmar senha" value={repeat} onChange={setRepeat} />
        </View>
        <SolidButton text="CADASTRAR" onPress={handleRegister} />
        <View style={s.footer}>
            <Text style={{ color: theme.textSecondary }}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={[s.link, { color: theme.primary }]}> Fazer Login</Text>
            </TouchableOpacity>
        </View>
      </View>
    </AuthCard>
  );
}

const s = StyleSheet.create({
  form: { width: '100%' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  link: { fontWeight: 'bold' },
});

export default RegisterScreen;