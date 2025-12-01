import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { loginUser, checkEmail } from '../database/database';
import AuthCard from '../components/AuthCard';
import SolidButton from '../components/SolidButton';
import { StyledInput, PasswordInput } from '../components/Inputs';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

function LoginScreen({ navigation, onLoginSuccess, showAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [forgotVisible, setForgotVisible] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverStatus, setRecoverStatus] = useState(null);

  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert?.('Preencha seus dados para continuar.');
      return;
    }
    try {
      const user = await loginUser(email.toLowerCase(), password);
      if (user) {
        onLoginSuccess(user);
      } else {
        showAlert?.('Credenciais inválidas.');
      }
    } catch (error) {
      showAlert?.('Erro de conexão. Tente novamente.');
    }
  };

  const handleRecover = async () => {
    if (!recoverEmail) return;
    setRecoverStatus('loading');
    
    setTimeout(async () => {
        const exists = await checkEmail(recoverEmail.toLowerCase());
        if (exists) {
            setRecoverStatus('success');
        } else {
            setRecoverStatus('error');
        }
    }, 1500);
  };

  const closeRecover = () => {
      setForgotVisible(false);
      setRecoverStatus(null);
      setRecoverEmail('');
  };

  return (
    <>
      <AuthCard title="Bem-vindo de volta" subtitle="Acesse sua conta para gerenciar seus quadros." icon="log-in-outline">
        <View style={s.form}>
          <StyledInput placeholder="E-mail" keyboard="email-address" autoCap="none" value={email} onChange={setEmail} />
          <PasswordInput placeholder="Senha" value={password} onChange={setPassword} autoCap="none" />
          
          <TouchableOpacity onPress={() => setForgotVisible(true)} style={s.forgotBtn}>
            <Text style={[s.forgotText, { color: theme.textSecondary }]}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          
          <SolidButton text="ENTRAR" onPress={handleLogin} />
          
          <View style={s.footer}>
              <Text style={{ color: theme.textSecondary }}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[s.link, { color: theme.primary }]}> Criar conta</Text>
              </TouchableOpacity>
          </View>
        </View>
      </AuthCard>

      <Modal animationType="fade" transparent={true} visible={forgotVisible} onRequestClose={closeRecover}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: theme.card }]}>
                {recoverStatus === 'success' ? (
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="mail-open-outline" size={50} color="#34C759" style={{ marginBottom: 15 }} />
                        <Text style={[s.modalTitle, { color: theme.text }]}>E-mail Enviado!</Text>
                        <Text style={[s.modalMsg, { color: theme.textSecondary }]}>
                            Enviamos um link de recuperação para {recoverEmail}. Verifique sua caixa de entrada.
                        </Text>
                        <SolidButton text="FECHAR" onPress={closeRecover} />
                    </View>
                ) : (
                    <>
                        <View style={s.modalHeader}>
                            <Text style={[s.modalTitle, { color: theme.text, marginBottom: 0 }]}>Recuperar Senha</Text>
                            <TouchableOpacity onPress={closeRecover}><Ionicons name="close" size={24} color={theme.textSecondary} /></TouchableOpacity>
                        </View>
                        
                        <Text style={[s.modalMsg, { color: theme.textSecondary, marginTop: 10, textAlign: 'left' }]}>
                            Digite seu e-mail cadastrado para receber as instruções.
                        </Text>

                        <StyledInput placeholder="Seu e-mail" keyboard="email-address" value={recoverEmail} onChange={setRecoverEmail} autoCap="none" />

                        {recoverStatus === 'error' && (
                            <Text style={{ color: '#ff4444', marginBottom: 10, textAlign: 'center' }}>E-mail não encontrado.</Text>
                        )}

                        <SolidButton 
                            text={recoverStatus === 'loading' ? "VERIFICANDO..." : "ENVIAR LINK"} 
                            onPress={handleRecover} 
                        />
                    </>
                )}
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  form: { width: '100%' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -5 },
  forgotText: { fontSize: 13, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  link: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalMsg: { fontSize: 14, marginBottom: 20, textAlign: 'center', lineHeight: 20 },
});

export default LoginScreen;