import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput, KeyboardAvoidingView, Switch, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const MoreScreen = ({ navigation, route }) => {
  const { userId, userRole, onLogout } = route.params || {}; 
  const { isDark, toggleTheme, theme } = useTheme();
  
  const [profile, setProfile] = useState({ name: 'Usuário', role: userRole === 'admin' ? 'Administrador' : 'Cliente' });
  const [modalVisible, setModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  const openEditModal = () => { setTempName(profile.name); setModalVisible(true); };
  const saveProfile = () => { if (tempName.trim() === '') return; setProfile({ ...profile, name: tempName }); setModalVisible(false); };
  const handleBackup = async () => { Alert.alert("Backup", "Backup enviado para nuvem (Demo).") };
  const handleRestore = async () => { Alert.alert("Restaurar", "Restauração concluída (Demo).") };

  const SettingItem = ({ icon, color, label, type, value, onToggle, onPress, isDestructive, last }) => (
    <TouchableOpacity style={[s.item, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={onPress} activeOpacity={type === 'switch' ? 1 : 0.7} disabled={type === 'switch'}>
      <View style={[s.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={[s.itemLabel, { color: isDestructive ? theme.danger : theme.text }]}>{label}</Text>
      {type === 'switch' ? ( <Switch value={value} onValueChange={onToggle} trackColor={{ false: "#ccc", true: theme.primary }} thumbColor={"#fff"} style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }} /> ) : ( <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ opacity: 0.5 }} /> )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => ( <Text style={[s.sectionHeader, { color: theme.textSecondary }]}>{title}</Text> );

  const InfoModal = ({ visible, onClose, title, children }) => (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.infoModalContent, { backgroundColor: theme.card }]}>
          <View style={[s.infoModalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[s.infoModalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.textSecondary} /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );

  const ConfirmModal = ({ visible, onCancel, onConfirm, title, message }) => (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onCancel}>
        <View style={s.centerOverlay}>
            <View style={[s.confirmBox, { backgroundColor: theme.card }]}>
                <Ionicons name="log-out-outline" size={48} color={theme.danger} style={{ marginBottom: 15 }} />
                <Text style={[s.confirmTitle, { color: theme.text }]}>{title}</Text>
                <Text style={[s.confirmMessage, { color: theme.textSecondary }]}>{message}</Text>
                <View style={s.confirmButtons}>
                    <TouchableOpacity onPress={onCancel} style={[s.btn, { backgroundColor: theme.border }]}>
                        <Text style={{ color: theme.text }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onConfirm} style={[s.btn, { backgroundColor: theme.danger }]}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sair</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
  );

  const FAQItem = ({ question, answer }) => ( <View style={{ marginBottom: 20 }}><Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{question}</Text><Text style={{ color: theme.textSecondary, lineHeight: 22 }}>{answer}</Text></View> );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <Text style={[s.headerTitle, { color: theme.text }]}>Ajustes</Text>
      </View>
      <Animated.ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity style={[s.profileCard, { backgroundColor: theme.card }]} onPress={openEditModal} activeOpacity={0.9}>
            <View style={s.profileInner}>
                <View style={[s.avatarRing, { borderColor: theme.primary }]}>
                    <View style={[s.avatar, { backgroundColor: theme.border }]}>
                         <Text style={[s.avatarText, { color: theme.textSecondary }]}>{profile.name.charAt(0)}</Text>
                    </View>
                </View>
                <View style={s.profileInfo}>
                    <Text style={[s.profileName, { color: theme.text }]}>{profile.name}</Text>
                    <Text style={[s.profileRole, { color: theme.primary }]}>{profile.role}</Text>
                </View>
                <Ionicons name="pencil" size={16} color={theme.text} style={{ opacity: 0.5 }} />
            </View>
        </TouchableOpacity>

        <SectionHeader title="PREFERÊNCIAS" />
        <View style={[s.section, { backgroundColor: theme.card }]}>
            <SettingItem icon="moon" color="#5856D6" label="Modo Escuro" type="switch" value={isDark} onToggle={toggleTheme} />
            <SettingItem icon="notifications" color="#FF9500" label="Notificações" type="switch" value={notificationsEnabled} onToggle={setNotificationsEnabled} last />
        </View>

        {userRole === 'admin' && (
            <>
                <SectionHeader title="ADMINISTRAÇÃO" />
                <View style={[s.section, { backgroundColor: theme.card }]}>
                    <SettingItem icon="receipt" color="#FF9500" label="Gerenciar Pedidos Personalizados" onPress={() => navigation.navigate('AdminOrdersScreen')} />
                    <SettingItem icon="cloud-download" color="#007AFF" label="Exportar Backup" onPress={handleBackup} />
                    <SettingItem icon="cloud-upload" color="#34C759" label="Restaurar Backup" onPress={handleRestore} last />
                </View>
            </>
        )}

        {userRole !== 'admin' && (
            <>
                <SectionHeader title="SERVIÇOS" />
                <View style={[s.section, { backgroundColor: theme.card }]}>
                    <SettingItem icon="color-palette" color="#5856D6" label="Pedir Quadro Personalizado" onPress={() => navigation.navigate('CustomOrderScreen', { userId })} last />
                </View>
            </>
        )}

        <SectionHeader title="SUPORTE" />
        <View style={[s.section, { backgroundColor: theme.card }]}>
            <SettingItem icon="help-buoy" color="#FF2D55" label="Ajuda e FAQ" onPress={() => setHelpVisible(true)} />
            <SettingItem icon="document-text" color="#8E8E93" label="Termos de Uso" onPress={() => setTermsVisible(true)} last />
        </View>

        <TouchableOpacity style={[s.logoutButton, { backgroundColor: theme.card }]} onPress={() => setLogoutVisible(true)}>
            <Text style={[s.logoutText, { color: theme.danger }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: theme.textSecondary }]}>v5.3.0 (Build 2025)</Text>
        <View style={{height: 40}} />
      </Animated.ScrollView>

      <ConfirmModal visible={logoutVisible} title="Sair da Conta" message="Tem certeza que deseja desconectar? Você precisará fazer login novamente." onCancel={() => setLogoutVisible(false)} onConfirm={() => { setLogoutVisible(false); onLogout?.(); }} />

      <InfoModal visible={helpVisible} onClose={() => setHelpVisible(false)} title="Ajuda">
        <Text style={{ color: theme.textSecondary, marginBottom: 20 }}>Tire suas dúvidas sobre o funcionamento da Edem Quadros e processo de compra.</Text>
        <FAQItem question="Como comprar um quadro?" answer="Navegue pelo catálogo, selecione a obra desejada e clique em 'Adicionar ao Carrinho'. No carrinho, prossiga para o checkout." />
        <FAQItem question="Quais as formas de pagamento?" answer="Aceitamos Cartão de Crédito, Pix e Boleto Bancário. O processamento é imediato para Pix e Cartão." />
        <FAQItem question="Enviam para todo o Brasil?" answer="Sim! Contamos com transportadoras parceiras que entregam em todo o território nacional com seguro." />
        <FAQItem question="Posso devolver se não gostar?" answer="Claro. Você tem até 7 dias após o recebimento para solicitar a devolução gratuita por arrependimento." />
      </InfoModal>

      <InfoModal visible={termsVisible} onClose={() => setTermsVisible(false)} title="Termos">
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>1. Sobre a Edem Quadros</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 20, lineHeight: 22 }}>A Edem Quadros é uma empresa especializada no comércio de decoração, oferecendo produtos de alta qualidade e design exclusivo para transformar seus ambientes.</Text>
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>2. Privacidade e Segurança</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 20, lineHeight: 22 }}>A segurança dos seus dados é nossa prioridade. Utilizamos criptografia de ponta para proteger suas informações pessoais e de pagamento, em total conformidade com a LGPD.</Text>
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>3. Produção e Imagens</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 20, lineHeight: 22 }}>Os produtos comercializados pela Edem Quadros são itens de decoração produzidos artesanalmente. Não se tratam de obras de arte pintadas à mão por artistas.</Text>
      </InfoModal>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.centerOverlay}>
            <View style={[s.editBox, { backgroundColor: theme.card }]}>
                <Text style={[s.confirmTitle, { color: theme.text, marginBottom: 20 }]}>Editar Nome</Text>
                <TextInput style={[s.input, { backgroundColor: theme.background, color: theme.text }]} value={tempName} onChangeText={setTempName} placeholder="Seu Nome" />
                <View style={s.confirmButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={[s.btn, { backgroundColor: theme.border }]}>
                        <Text style={{color: theme.text}}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={saveProfile} style={[s.btn, { backgroundColor: theme.primary }]}>
                        <Text style={{color: '#fff', fontWeight: 'bold'}}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 0 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  profileCard: { borderRadius: 20, padding: 20, marginBottom: 25, marginTop: 10, elevation: 4 },
  profileInner: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, padding: 3, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: '100%', height: '100%', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: 'bold' },
  profileRole: { fontSize: 14, fontWeight: '600' },
  sectionHeader: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 10, marginTop: 15, opacity: 0.7 },
  section: { borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconContainer: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  logoutButton: { marginTop: 20, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontSize: 16, fontWeight: 'bold' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 30, opacity: 0.4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  infoModalContent: { height: '85%', width: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
  infoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  infoModalTitle: { fontSize: 20, fontWeight: 'bold' },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  confirmBox: { width: '80%', padding: 25, borderRadius: 24, alignItems: 'center', elevation: 10 },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  confirmMessage: { fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  confirmButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  editBox: { width: '85%', padding: 25, borderRadius: 24, elevation: 10 },
  input: { padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16 },
});

export default MoreScreen;