import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AntDesign } from '@expo/vector-icons';

const BG = { uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop' };

const SolidButton = ({ onPress, text }) => (
  <TouchableOpacity onPress={onPress} style={[s.buttonContainer, s.solidButton]} activeOpacity={0.85}>
    <Text style={s.btnText}>{text}</Text>
  </TouchableOpacity>
);

const StyledInput = ({ placeholder, value, onChange, secure, keyboard, autoCap, style }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, style]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secure}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard || 'default'}
        autoCapitalize={autoCap || 'sentences'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const PasswordInput = ({ value, onChange, placeholder, autoCap = 'none' }) => {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, s.passwordInputContainer]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={!show}
        value={value}
        onChangeText={onChange}
        autoCapitalize={autoCap}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <TouchableOpacity style={s.eye} onPress={() => setShow(prev => !prev)} activeOpacity={0.8}>
        <Text style={s.eyeText}>{show ? '👁️' : '🔒'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const PhoneMaskInput = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, '');
    const truncatedDigits = digits.slice(0, 11);

    let maskedText = '';
    if (truncatedDigits.length > 0) {
      maskedText = `(${truncatedDigits.slice(0, 2)}`;
    }
    if (truncatedDigits.length >= 3) {
      maskedText = `(${truncatedDigits.slice(0, 2)}) ${truncatedDigits.slice(2, 7)}`;
    }
    if (truncatedDigits.length >= 8) {
      maskedText = `(${truncatedDigits.slice(0, 2)}) ${truncatedDigits.slice(2, 7)}-${truncatedDigits.slice(7)}`;
    }
    
    if (truncatedDigits.length === 0) {
      maskedText = '';
    } else if (truncatedDigits.length <= 2) {
        maskedText = `(${truncatedDigits}`;
    }

    onChange(maskedText);
  };

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused]}>
      <TextInput
        style={s.inputCore}
        placeholder="Telefone (com DDD)"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad"
        value={value}
        onChangeText={handlePhoneChange}
        maxLength={15}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const StrengthBar = ({ pw }) => {
  const scoreObj = (() => {
    if (!pw) return { score: 0, label: 'Muito fraca' };
    let s = 0;
    if (pw.length >= 8) s += 0.3;
    if (/[a-z]/.test(pw)) s += 0.15;
    if (/[A-Z]/.test(pw)) s += 0.2;
    if (/\d/.test(pw)) s += 0.2;
    if (/[^A-Za-z0-9]/.test(pw)) s += 0.15;
    s = Math.min(1, s);
    return { score: s, label: s > 0.7 ? 'Forte' : s > 0.4 ? 'Média' : 'Fraca' };
  })();

  const width = `${Math.round(scoreObj.score * 100)}%`;
  const color = scoreObj.score > 0.7 ? '#00C851' : scoreObj.score > 0.4 ? '#ffbb33' : '#ff4444';

  return (
    <View style={s.strengthWrap}>
      <View style={s.strengthBg}>
        <View style={[s.strengthFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={s.strLabel}>{scoreObj.label}</Text>
    </View>
  );
};

function CustomAlert({ visible, message, onClose }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible && anim._value === 0) {
    return null;
  }

  const overlayStyle = { opacity: anim };
  const boxStyle = {
    opacity: anim,
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }),
    }],
  };

  return (
    <Animated.View 
      style={[s.alertOverlay, overlayStyle]}
      pointerEvents={visible ? 'auto' : 'none'} // <-- CORREÇÃO APLICADA
    >
      <Animated.View style={[s.alertBox, boxStyle]}>
        <Text style={s.alertTitle}>Atenção</Text>
        <Text style={s.alertMessage}>{message}</Text>
        <TouchableOpacity style={s.alertButton} onPress={onClose} activeOpacity={0.8}>
          <Text style={s.alertButtonText}>OK</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const AuthCard = ({ style, pointerEvents, title, subtitle, children }) => (
  <Animated.View style={[s.card, style]} pointerEvents={pointerEvents}>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{subtitle}</Text>
    {children}
  </Animated.View>
);

function LoginCard({ onRegister, onLoginSuccess, style, pointerEvents, showAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert?.('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      // onLoginSuccess(); <-- Removido, pois onAuthStateChanged cuida disso
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showAlert?.('E-mail ou senha incorretos.');
      } else {
        showAlert?.('Ocorreu um erro ao fazer login.');
      }
      console.log(error.code, error.message);
    }
  };

  return (
    <AuthCard 
      style={style} 
      pointerEvents={pointerEvents}
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
      
      <View style={s.dividerContainer}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>OU</Text>
        <View style={s.dividerLine} />
      </View>
      
      {/* ----- 2. ÍCONES ADICIONADOS AQUI ----- */}
      <View style={s.socialContainer}>
        <TouchableOpacity style={s.socialButton} activeOpacity={0.8}>
          <AntDesign name="google" size={20} color="#fff" />
          <Text style={s.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.socialButton} activeOpacity={0.8}>
          <AntDesign name="apple" size={20} color="#fff" />
          <Text style={s.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onRegister}><Text style={s.link}>Não tem uma conta? Cadastre-se</Text></TouchableOpacity>
    </AuthCard>
  );
}

function RegisterCard({ onBack, style, pointerEvents, showAlert }) {
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
      return Alert.alert('E-mail Inválido', 'Por favor, insira um endereço de e-mail válido.');
    }
    if (phoneDigits.length < 10) { 
        return Alert.alert('Telefone InválIDO', 'Por favor, insira um número válido com DDD (mínimo 10 dígitos).');
    }
    if (pw !== repeat) return Alert.alert('Senhas Diferentes', 'As senhas não coincidem.');
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(pw)) {
      return Alert.alert(
        'Senha Inválida',
        'Senha deve ter mínimo 8 caracteres, conter ao menos uma letra maiúscula, um número e um caractere especial.'
      );
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), pw);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email.toLowerCase(),
        phone: phoneDigits
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      onBack();

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert?.('Este e-mail já está em uso.');
      } else if (error.code === 'auth/weak-password') {
        showAlert?.('A senha é muito fraca.');
      } else {
        showAlert?.('Ocorreu um erro ao cadastrar.');
      }
      console.log(error.code, error.message);
    }
  };

  return (
    <AuthCard
      style={style}
      pointerEvents={pointerEvents}
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
      <TouchableOpacity onPress={onBack}><Text style={s.link}>Voltar para o login</Text></TouchableOpacity>
    </AuthCard>
  );
  
}

function AuthScreen({ onLoginSuccess }) {
  const transition = useRef(new Animated.Value(0)).current; 
  const entrance = useRef(new Animated.Value(0)).current; 
  const [screen, setScreen] = useState('login'); 

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const closeAlert = () => setAlertVisible(false);

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    Animated.timing(transition, { toValue: screen === 'register' ? 1 : 0, duration: 380, useNativeDriver: true }).start();
  }, [screen]);

  const commonEntranceTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  const loginCardStyle = {
    opacity: Animated.multiply(entrance, transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })),
    transform: [
      { translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) },
      { translateY: commonEntranceTranslateY }
    ],
  };

  const registerCardStyle = {
    opacity: Animated.multiply(entrance, transition.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })),
    transform: [
      { translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
      { translateY: commonEntranceTranslateY }
    ],
  };

  const loginPointer = screen === 'login' ? 'auto' : 'none';
  const regPointer = screen === 'register' ? 'auto' : 'none';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ImageBackground source={BG} resizeMode="cover" style={s.image}>
        <View style={s.overlay} />
        
        <LoginCard 
          onRegister={() => setScreen('register')} 
          onLoginSuccess={onLoginSuccess} 
          style={loginCardStyle} 
          pointerEvents={loginPointer} 
          showAlert={showAlert} 
        />
        <RegisterCard 
          onBack={() => setScreen('login')} 
          style={registerCardStyle} 
          pointerEvents={regPointer} 
          showAlert={showAlert} 
        />

        <CustomAlert visible={alertVisible} message={alertMessage} onClose={closeAlert} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

function HomeScreen() {
  return (
    <View style={s.homeContainer}>
      <Text style={s.homeTitle}>Login bem-sucedido!</Text>
      <Text style={s.homeSubtitle}>Bem-vindo à próxima página.</Text>
    </View>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserToken(user.uid);
      } else {
        setUserToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={s.homeContainer}>
        <Text style={s.homeTitle}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      {userToken == null ? (
        <AuthScreen onLoginSuccess={() => {}} />
      ) : (
        <HomeScreen />
      )}
      <StatusBar style="light" />
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' }, 
  
  card: { position: 'absolute', left: 20, right: 20, padding: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  title: { fontSize: 32, color: '#fff', textAlign: 'center', marginBottom: 10, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 18 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12 },
  inputContainerFocused: { borderColor: '#2575FC', borderWidth: 1.5, backgroundColor: 'rgba(0,0,0,0.8)' },
  inputCore: { flex: 1, height: '100%', color: '#fff', fontSize: 16 },
  
  passwordInputContainer: { paddingHorizontal: 0 }, 
  eye: { paddingHorizontal: 12, height: '100%', justifyContent: 'center', alignItems: 'center' }, 
  eyeText: { fontSize: 18, color: '#fff' },
  
  strengthWrap: { marginTop: -5, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  strengthBg: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  strengthFill: { height: 8, borderRadius: 4 },
  strLabel: { color: '#fff', fontSize: 12 },
  
  btnText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  buttonContainer: { marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 6 },
  solidButton: { backgroundColor: '#4A37C2', paddingVertical: 15, borderRadius: 5, alignItems: 'center' },
  
  link: { color: '#fff', textAlign: 'center', marginTop: 16 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 15 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerText: { color: 'rgba(255,255,255,0.5)', marginHorizontal: 10 },
  
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginHorizontal: 5 },
  socialText: { color: '#fff', fontSize: 14, fontWeight: '500', marginLeft: 10 },
  
  alertOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1000 },
  alertBox: { width: '86%', backgroundColor: '#1f1f1f', borderRadius: 12, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  alertTitle: { color: '#fff', fontSize: 18, marginBottom: 8, fontWeight: '700' },
  alertMessage: { color: '#ddd', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  alertButton: { backgroundColor: '#2575FC', paddingVertical: 10, paddingHorizontal: 26, borderRadius: 8 },
  alertButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  homeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  homeTitle: { fontSize: 24, color: '#fff', fontWeight: '700' },
  homeSubtitle: { fontSize: 16, color: '#aaa', marginTop: 8 }
});