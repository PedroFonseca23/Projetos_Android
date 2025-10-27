import React, { useEffect, useRef, useState } from 'react';
// Importa as instâncias 'auth' e 'db' configuradas no firebaseConfig.js
import { auth, db } from './firebaseConfig';
// Importa funções específicas do Firebase Authentication
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'; // Adicionado signOut
// Importa funções específicas do Firebase Firestore
import { setDoc, doc, getDoc } from 'firebase/firestore'; // Adicionado getDoc
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
import { AntDesign } from '@expo/vector-icons'; // Para ícones

// URL da imagem de fundo
const BG = { uri: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop' };

// --- Componentes Reutilizáveis ---

// Botão sólido padrão
const SolidButton = ({ onPress, text }) => (
  <TouchableOpacity onPress={onPress} style={[s.buttonContainer, s.solidButton]} activeOpacity={0.85}>
    <Text style={s.btnText}>{text}</Text>
  </TouchableOpacity>
);

// Input de texto estilizado com feedback visual de foco
const StyledInput = ({ placeholder, value, onChange, secure, keyboard, autoCap, style }) => {
  const [isFocused, setIsFocused] = useState(false); // Estado para controlar se o input está focado

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, style]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa" // Cor do texto de placeholder
        secureTextEntry={secure} // Esconde o texto (para senhas)
        value={value} // Valor atual do input (controlado pelo estado)
        onChangeText={onChange} // Função chamada quando o texto muda
        keyboardType={keyboard || 'default'} // Tipo de teclado (email, numérico, etc.)
        autoCapitalize={autoCap || 'sentences'} // Como o texto é capitalizado automaticamente
        onFocus={() => setIsFocused(true)} // Ação quando o input ganha foco
        onBlur={() => setIsFocused(false)} // Ação quando o input perde foco
      />
    </View>
  );
};

// Input específico para senha com botão de mostrar/esconder
const PasswordInput = ({ value, onChange, placeholder, autoCap = 'none' }) => {
  const [show, setShow] = useState(false); // Estado para controlar a visibilidade da senha
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused, s.passwordInputContainer]}>
      <TextInput
        style={s.inputCore}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={!show} // Mostra/esconde baseado no estado 'show'
        value={value}
        onChangeText={onChange}
        autoCapitalize={autoCap}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {/* Botão para alternar a visibilidade da senha */}
      <TouchableOpacity style={s.eye} onPress={() => setShow(prev => !prev)} activeOpacity={0.8}>
        <Text style={s.eyeText}>{show ? '👁️' : '🔒'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Input com máscara para número de telefone (formato brasileiro)
const PhoneMaskInput = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Função para aplicar a máscara ao texto digitado
  const handlePhoneChange = (text) => {
    const digits = text.replace(/\D/g, ''); // Remove tudo que não for dígito
    const truncatedDigits = digits.slice(0, 11); // Limita a 11 dígitos (DDD + 9 dígitos)

    // Aplica a formatação (XX) XXXXX-XXXX
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

    onChange(maskedText); // Atualiza o estado com o texto mascarado
  };

  return (
    <View style={[s.inputContainer, isFocused && s.inputContainerFocused]}>
      <TextInput
        style={s.inputCore}
        placeholder="Telefone (com DDD)"
        placeholderTextColor="#aaa"
        keyboardType="phone-pad" // Teclado numérico
        value={value}
        onChangeText={handlePhoneChange} // Usa a função de máscara
        maxLength={15} // Limite máximo do texto formatado "(XX) XXXXX-XXXX"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

// Barra de força da senha
const StrengthBar = ({ pw }) => {
  // Calcula a força da senha (lógica simplificada)
  const scoreObj = (() => {
    if (!pw) return { score: 0, label: 'Muito fraca' };
    let s = 0;
    if (pw.length >= 8) s += 0.3; // Comprimento
    if (/[a-z]/.test(pw)) s += 0.15; // Letra minúscula
    if (/[A-Z]/.test(pw)) s += 0.2; // Letra maiúscula
    if (/\d/.test(pw)) s += 0.2; // Número
    if (/[^A-Za-z0-9]/.test(pw)) s += 0.15; // Caractere especial
    s = Math.min(1, s); // Garante que a pontuação não passe de 1
    // Define o rótulo baseado na pontuação
    return { score: s, label: s > 0.7 ? 'Forte' : s > 0.4 ? 'Média' : 'Fraca' };
  })();

  const width = `${Math.round(scoreObj.score * 100)}%`; // Largura da barra
  const color = scoreObj.score > 0.7 ? '#00C851' : scoreObj.score > 0.4 ? '#ffbb33' : '#ff4444'; // Cor da barra

  return (
    <View style={s.strengthWrap}>
      <View style={s.strengthBg}>
        <View style={[s.strengthFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={s.strLabel}>{scoreObj.label}</Text>
    </View>
  );
};

// Componente de Alerta customizado com animação
function CustomAlert({ visible, message, onClose }) {
  const anim = useRef(new Animated.Value(0)).current; // Valor animado para opacidade e escala

  // Anima a entrada/saída do alerta quando a visibilidade muda
  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0, // Anima para 1 (visível) ou 0 (invisível)
      duration: 250,
      useNativeDriver: true, // Usa o driver nativo para melhor performance
    }).start();
  }, [visible]);

  // Não renderiza nada se não estiver visível e a animação tiver terminado
  if (!visible && anim._value === 0) {
    return null;
  }

  // Estilos animados
  const overlayStyle = { opacity: anim }; // Anima a opacidade do fundo escuro
  const boxStyle = {
    opacity: anim, // Anima a opacidade da caixa
    transform: [{
      scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }), // Anima a escala (efeito de zoom)
    }],
  };

  return (
    <Animated.View
      style={[s.alertOverlay, overlayStyle]}
      // Permite cliques apenas quando visível para não bloquear a tela por baixo
      pointerEvents={visible ? 'auto' : 'none'}
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

// Card base para as telas de Login e Cadastro
const AuthCard = ({ style, pointerEvents, title, subtitle, children }) => (
  <Animated.View style={[s.card, style]} pointerEvents={pointerEvents}>
    <Text style={s.title}>{title}</Text>
    <Text style={s.subtitle}>{subtitle}</Text>
    {children}
  </Animated.View>
);

// --- Componentes de Tela ---

// Card específico para Login
function LoginCard({ onRegister, style, pointerEvents, showAlert }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Função para lidar com o processo de login
  const handleLogin = async () => {
    // Validação simples de campos vazios
    if (!email || !password) {
      showAlert?.('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Tenta fazer login com e-mail e senha usando o Firebase Auth
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      // O sucesso do login será tratado pelo onAuthStateChanged no App principal
    } catch (error) {
      // Tratamento de erros específicos do Firebase Auth
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showAlert?.('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/invalid-email') {
         showAlert?.('Formato de e-mail inválido.');
      } else {
        // Erro genérico (pode ser rede, etc.)
        showAlert?.(`Erro no login: ${error.message}`); // Mostra a mensagem do Firebase
      }
      console.error("Erro de Login:", error.code, error.message); // Log detalhado no console
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

      {/* Botões de login social (funcionalidade não implementada) */}
      <View style={s.socialContainer}>
        <TouchableOpacity style={s.socialButton} activeOpacity={0.8} onPress={() => Alert.alert('Login Google', 'Funcionalidade ainda não implementada.')}>
          <AntDesign name="google" size={20} color="#fff" />
          <Text style={s.socialText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.socialButton} activeOpacity={0.8} onPress={() => Alert.alert('Login Apple', 'Funcionalidade ainda não implementada.')}>
          <AntDesign name="apple" size={20} color="#fff" />
          <Text style={s.socialText}>Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Link para navegar para a tela de cadastro */}
      <TouchableOpacity onPress={onRegister}><Text style={s.link}>Não tem uma conta? Cadastre-se</Text></TouchableOpacity>
    </AuthCard>
  );
}

// Card específico para Cadastro
function RegisterCard({ onBack, style, pointerEvents, showAlert }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [repeat, setRepeat] = useState('');

  // Função para lidar com o processo de cadastro
  const handleRegister = async () => {
    const phoneDigits = phone.replace(/\D/g, ''); // Pega apenas os dígitos do telefone

    // --- Validações locais antes de chamar o Firebase ---
    if (!name || !email || !phone || !pw || !repeat) { // Verifica se todos os campos estão preenchidos
      return showAlert?.('Por favor, preencha todos os campos antes de continuar.');
    }
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return showAlert?.('Por favor, insira um endereço de e-mail válido.'); // Verifica formato do email
    }
    if (phoneDigits.length < 10) { // Verifica se o telefone tem pelo menos 10 dígitos (DDD + 8 ou 9 dígitos)
      return showAlert?.('Por favor, insira um número válido com DDD (mínimo 10 dígitos).');
    }
    if (pw !== repeat) { // Verifica se as senhas digitadas são iguais
      return showAlert?.('As senhas não coincidem.');
    }
    // Verifica a força da senha (exemplo: mínimo 8 chars, 1 maiúscula, 1 número, 1 especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(pw)) {
      return showAlert?.(
        'Senha deve ter mínimo 8 caracteres, conter ao menos uma letra maiúscula, um número e um caractere especial.'
      );
    }
    // --- Fim das validações locais ---

    try {
      // 1. Tenta criar o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pw);
      const user = userCredential.user;

      // 2. Se a criação no Auth foi bem-sucedida, grava informações adicionais no Firestore
      // Cria uma referência para um novo documento na coleção 'users' com o ID do usuário recém-criado
      const userDocRef = doc(db, "users", user.uid);
      // Grava os dados (nome, email, telefone) nesse documento
      await setDoc(userDocRef, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits // Salva apenas os dígitos
      });

      // 3. Informa o usuário sobre o sucesso e volta para a tela de login
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça o login.');
      onBack(); // Chama a função para voltar à tela de login

    } catch (error) {
      // --- Tratamento de erros específicos do Firebase ---
      let friendlyMessage = 'Ocorreu um erro ao cadastrar.'; // Mensagem padrão

      // Mapeia códigos de erro comuns para mensagens mais amigáveis
      switch (error.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = 'Este e-mail já está em uso por outra conta.';
          break;
        case 'auth/invalid-email':
          friendlyMessage = 'O formato do e-mail fornecido não é válido.';
          break;
        case 'auth/operation-not-allowed':
          friendlyMessage = 'Cadastro por e-mail/senha não está habilitado. Contacte o suporte.';
          break;
        case 'auth/weak-password':
          friendlyMessage = 'A senha fornecida é muito fraca.';
          break;
        case 'permission-denied': // Erro comum do Firestore
           friendlyMessage = 'Não foi possível salvar os dados do usuário. Verifique as permissões (Regras de Segurança).';
           break;
        default:
           // Para outros erros, mostra a mensagem original do Firebase se disponível
           friendlyMessage = `Erro não identificado: ${error.message || error.code}`;
      }

      showAlert?.(friendlyMessage); // Mostra a mensagem de erro amigável (ou original)
      console.error("Erro no Cadastro:", error.code, error.message); // Log detalhado no console
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
      <StrengthBar pw={pw} /> {/* Barra de força da senha */}
      <PasswordInput placeholder="Repetir senha" value={repeat} onChange={setRepeat} />

      <SolidButton text="Cadastrar" onPress={handleRegister} />
      {/* Link para voltar à tela de login */}
      <TouchableOpacity onPress={onBack}><Text style={s.link}>Já tem uma conta? Faça login</Text></TouchableOpacity>
    </AuthCard>
  );
}

// Tela principal de Autenticação que gerencia a transição entre Login e Cadastro
function AuthScreen({ onLoginSuccess }) { // onLoginSuccess não é mais necessário aqui
  const transition = useRef(new Animated.Value(0)).current; // Valor animado para a transição entre cards
  const entrance = useRef(new Animated.Value(0)).current; // Valor animado para a entrada inicial
  const [screen, setScreen] = useState('login'); // Estado para controlar qual card ('login' ou 'register') está ativo

  // Estados para o alerta customizado
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Funções para mostrar/esconder o alerta
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setAlertVisible(true);
  };
  const closeAlert = () => setAlertVisible(false);

  // Animação de entrada quando a tela é montada
  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Animação de transição quando o estado 'screen' muda
  useEffect(() => {
    Animated.timing(transition, {
      toValue: screen === 'register' ? 1 : 0, // 1 para register, 0 para login
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [screen]);

  // Interpolação para a animação de entrada vertical
  const commonEntranceTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  // Estilos animados para o card de Login (opacidade e translação horizontal)
  const loginCardStyle = {
    opacity: Animated.multiply(entrance, transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })), // Desaparece quando 'transition' vai para 1
    transform: [
      { translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }, // Move para a esquerda
      { translateY: commonEntranceTranslateY } // Animação de entrada
    ],
  };

  // Estilos animados para o card de Cadastro
  const registerCardStyle = {
    opacity: Animated.multiply(entrance, transition.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })), // Aparece quando 'transition' vai para 1
    transform: [
      { translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }, // Move da direita para o centro
      { translateY: commonEntranceTranslateY } // Animação de entrada
    ],
  };

  // Controla qual card pode receber eventos de toque
  const loginPointer = screen === 'login' ? 'auto' : 'none';
  const regPointer = screen === 'register' ? 'auto' : 'none';

  return (
    // Usa KeyboardAvoidingView para ajustar a tela quando o teclado abre
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      <ImageBackground source={BG} resizeMode="cover" style={s.image}>
        {/* Camada escura sobre a imagem de fundo */}
        <View style={s.overlay} />

        {/* Renderiza os dois cards, a animação controla a visibilidade */}
        <LoginCard
          onRegister={() => setScreen('register')} // Passa a função para mudar para a tela de registro
          // onLoginSuccess não é mais necessário passar aqui
          style={loginCardStyle}
          pointerEvents={loginPointer}
          showAlert={showAlert} // Passa a função para mostrar alertas
        />
        <RegisterCard
          onBack={() => setScreen('login')} // Passa a função para voltar à tela de login
          style={registerCardStyle}
          pointerEvents={regPointer}
          showAlert={showAlert} // Passa a função para mostrar alertas
        />

        {/* Renderiza o componente de alerta */}
        <CustomAlert visible={alertVisible} message={alertMessage} onClose={closeAlert} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// Tela exibida após o login bem-sucedido
function HomeScreen() {
  const [userData, setUserData] = useState(null); // Estado para guardar dados do usuário
  const [loading, setLoading] = useState(true); // Estado para indicar carregamento

  // Busca os dados do usuário no Firestore quando a tela é montada
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // Pega o usuário logado atualmente
      if (user) {
        // Cria uma referência para o documento do usuário no Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef); // Tenta buscar o documento
          if (docSnap.exists()) {
            setUserData(docSnap.data()); // Guarda os dados (ex: { name: '...', email: '...', phone: '...' })
          } else {
            console.warn("Documento do usuário não encontrado no Firestore!"); // Aviso se o doc não existir
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário do Firestore:", error);
          Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
        } finally {
          setLoading(false); // Termina o carregamento (com sucesso ou erro)
        }
      } else {
         // Se não houver usuário logado (pouco provável chegar aqui devido à lógica no App), para de carregar
         setLoading(false);
      }
    };

    fetchUserData();
  }, []); // O array vazio [] significa que este efeito executa apenas uma vez, quando o componente monta

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // O onAuthStateChanged no App cuidará de redirecionar para AuthScreen
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  // Mostra mensagem de carregamento enquanto busca dados
  if (loading) {
    return (
      <View style={s.homeContainer}>
        <Text style={s.homeTitle}>Carregando dados...</Text>
      </View>
    );
  }

  // Tela principal após carregar
  return (
    <View style={s.homeContainer}>
      <Text style={s.homeTitle}>Login bem-sucedido!</Text>
      {/* Mostra o nome do usuário se os dados foram carregados */}
      {userData ? (
        <Text style={s.homeSubtitle}>Bem-vindo(a), {userData.name}!</Text>
      ) : (
        <Text style={s.homeSubtitle}>Bem-vindo à próxima página.</Text>
      )}
       {/* Botão de Logout */}
       <TouchableOpacity onPress={handleLogout} style={s.logoutButton}>
          <Text style={s.logoutButtonText}>Sair</Text>
       </TouchableOpacity>
    </View>
  );
}

// Componente principal do App
export default function App() {
  const [userToken, setUserToken] = useState(null); // Estado para guardar o ID do usuário logado (ou null)
  const [isLoading, setIsLoading] = useState(true); // Estado para mostrar tela de carregamento inicial

  // Efeito que executa na montagem do App para verificar o estado de autenticação
  useEffect(() => {
    // onAuthStateChanged é um 'listener' do Firebase que notifica
    // sempre que o estado de login do usuário muda (login, logout, token refresh)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se existe um usuário (logado), guarda seu ID único (uid)
        setUserToken(user.uid);
        console.log("Usuário logado:", user.uid);
      } else {
        // Se não existe usuário (deslogado), define o token como null
        setUserToken(null);
        console.log("Nenhum usuário logado.");
      }
      // Marca que a verificação inicial terminou
      setIsLoading(false);
    });

    // Função de limpeza: remove o 'listener' quando o componente App for desmontado
    // Isso evita vazamentos de memória
    return () => unsubscribe();
  }, []); // O array vazio [] garante que este efeito só rode uma vez

  // Mostra uma tela de carregamento enquanto o Firebase verifica o estado de auth
  if (isLoading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  // Renderização condicional:
  // Se userToken for null, mostra a tela de Autenticação (Login/Cadastro)
  // Se userToken tiver um valor (ID do usuário), mostra a HomeScreen
  return (
    <>
      {userToken == null ? (
        <AuthScreen /> // Não precisa mais passar onLoginSuccess
      ) : (
        <HomeScreen />
      )}
      {/* Barra de status do celular (hora, bateria, etc.) */}
      <StatusBar style="light" />
    </>
  );
}

// --- Estilos ---
const s = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, justifyContent: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },

  card: { position: 'absolute', left: 20, right: 20, padding: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 }, // Adicionado sombra
  title: { fontSize: 28, color: '#fff', textAlign: 'center', marginBottom: 8, fontWeight: '700' }, // Ajustado tamanho
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 20 }, // Ajustado cor e margem

  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 15 }, // Ajustado estilo
  inputContainerFocused: { borderColor: '#5D47C8', borderWidth: 1.5, backgroundColor: 'rgba(0,0,0,0.7)' }, // Cor de foco
  inputCore: { flex: 1, height: '100%', color: '#fff', fontSize: 16 },

  passwordInputContainer: { paddingHorizontal: 0, paddingLeft: 15 }, // Ajuste para alinhar com outros inputs
  eye: { paddingHorizontal: 15, height: '100%', justifyContent: 'center', alignItems: 'center' }, // Aumentado padding
  eyeText: { fontSize: 20, color: '#ccc' }, // Ajustado estilo

  strengthWrap: { marginTop: -8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 }, // Ajustado espaçamento
  strengthBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginRight: 8 }, // Ajustado estilo
  strengthFill: { height: 6, borderRadius: 3 },
  strLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' }, // Ajustado estilo
  buttonContainer: { marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 }, // Sombra mais suave
  solidButton: { backgroundColor: '#5D47C8', paddingVertical: 14, borderRadius: 8, alignItems: 'center' }, // Ajustado estilo

  link: { color: '#B0A8E0', textAlign: 'center', marginTop: 18, fontSize: 14 }, // Cor ajustada
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 }, // Ajustado margem
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerText: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 12, fontSize: 12 }, // Ajustado estilo

  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginHorizontal: 6 }, // Ajustado estilo
  socialText: { color: '#fff', fontSize: 14, fontWeight: '500', marginLeft: 10 },

  alertOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 }, // Fundo mais escuro
  alertBox: { width: '88%', maxWidth: 350, backgroundColor: '#2a2a2a', borderRadius: 10, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 15 }, // Estilo melhorado
  alertTitle: { color: '#eee', fontSize: 18, marginBottom: 10, fontWeight: '600' },
  alertMessage: { color: '#ccc', fontSize: 15, textAlign: 'center', marginBottom: 18, lineHeight: 21 }, // Melhorado espaçamento
  alertButton: { backgroundColor: '#5D47C8', paddingVertical: 11, paddingHorizontal: 30, borderRadius: 6 },
  alertButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  homeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181818', padding: 20 }, // Fundo ligeiramente diferente
  homeTitle: { fontSize: 26, color: '#eee', fontWeight: '700', textAlign: 'center' },
  homeSubtitle: { fontSize: 17, color: '#aaa', marginTop: 10, textAlign: 'center' },
  logoutButton: { marginTop: 30, paddingVertical: 10, paddingHorizontal: 25, backgroundColor: '#B73E3E', borderRadius: 8 }, // Estilo do botão Sair
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { fontSize: 18, color: '#aaa' }
});
