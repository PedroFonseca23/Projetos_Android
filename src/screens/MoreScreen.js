import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, 
  Modal, TextInput, KeyboardAvoidingView, Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import SolidButton from '../components/SolidButton'; 

// Importação condicional do DB Mobile
import * as dbMobile from '../database/database';

const MoreScreen = ({ navigation, route }) => {
  const isWeb = Platform.OS === 'web';
  
  // --- ESTADOS ---
  const [profile, setProfile] = useState({ name: 'Administrador', role: 'Gestão Global' });
  const [modalVisible, setModalVisible] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempRole, setTempRole] = useState('');

  // Estados de Configuração (Simulados)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // --- LÓGICA DO MODAL (PERFIL) ---
  const openEditModal = () => {
    setTempName(profile.name);
    setTempRole(profile.role);
    setModalVisible(true);
  };

  const saveProfile = () => {
    if (tempName.trim() === '') return alert("O nome não pode estar vazio.");
    setProfile({ name: tempName, role: tempRole });
    setModalVisible(false);
  };

  // --- LÓGICA DE AÇÕES ---
  const handleLogout = () => {
    if (isWeb) {
        if (window.confirm('Tem certeza que deseja desconectar?')) {
            route.params?.onLogout ? route.params.onLogout() : window.location.reload();
        }
    } else {
        Alert.alert('Desconectar', 'Deseja realmente sair?', [
          { text: 'Ficar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => route.params?.onLogout && route.params.onLogout() } 
        ]);
    }
  };

  const handleBackup = async () => {
    try {
      if (isWeb) {
        const dbWeb = require('../database/database.web');
        const dataStr = await dbWeb.exportFullDatabase();
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "backup_quadros.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const dataStr = await dbMobile.exportFullDatabase();
        const fileUri = FileSystem.documentDirectory + 'backup_quadros.json';
        await FileSystem.writeAsStringAsync(fileUri, dataStr);
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
        else Alert.alert("Erro", "Compartilhamento indisponível.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao criar backup.");
    }
  };

  const handleRestore = async () => {
    try {
      if (isWeb) {
        const dbWeb = require('../database/database.web');
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";
        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (e) => {
            const success = await dbWeb.importFullDatabase(e.target.result);
            if (success) { alert("Sucesso! Recarregando..."); window.location.reload(); }
          };
          reader.readAsText(file);
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
        if (!result.canceled) {
            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const success = await dbMobile.importFullDatabase(fileContent);
            if (success) Alert.alert("Sucesso", "Dados restaurados. Reinicie o app.");
            else Alert.alert("Erro", "Arquivo inválido.");
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao restaurar.");
    }
  };

  // --- COMPONENTES AUXILIARES ---

  // Linha de Configuração Reutilizável
  const SettingRow = ({ icon, color, label, type, value, onToggle, onPress, isDestructive }) => (
    <TouchableOpacity 
        style={s.settingRow} 
        onPress={onPress} 
        activeOpacity={type === 'switch' ? 1 : 0.7}
        disabled={type === 'switch'}
    >
      <View style={[s.iconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[s.settingLabel, isDestructive && { color: '#ff4444' }]}>{label}</Text>
      
      {type === 'switch' ? (
        <Switch 
            value={value} 
            onValueChange={onToggle}
            trackColor={{ false: "#333", true: "#00A79D" }}
            thumbColor={"#fff"}
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#444" />
      )}
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }) => (
    <Text style={s.sectionTitle}>{title}</Text>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      
      {/* MODAL EDITAR PERFIL */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalOverlay}>
            <View style={s.modalContent}>
                <Text style={s.modalTitle}>Editar Perfil</Text>
                <Text style={s.label}>Nome</Text>
                <View style={s.inputContainer}>
                    <TextInput style={s.input} value={tempName} onChangeText={setTempName} />
                </View>
                <Text style={s.label}>Cargo</Text>
                <View style={s.inputContainer}>
                    <TextInput style={s.input} value={tempRole} onChangeText={setTempRole} />
                </View>
                <SolidButton text="Salvar" onPress={saveProfile} />
                <TouchableOpacity onPress={() => setModalVisible(false)} style={s.cancelBtn}>
                    <Text style={s.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.screenTitle}>Ajustes</Text>
        
        {/* CARTÃO DE PERFIL */}
        <View style={s.profileCard}>
            <View style={s.avatar}><Text style={s.avatarText}>{profile.name.charAt(0)}</Text></View>
            <View style={{flex: 1}}>
                <Text style={s.profileName}>{profile.name}</Text>
                <Text style={s.profileEmail}>{profile.role}</Text>
            </View>
            <TouchableOpacity style={s.editProfileBtn} onPress={openEditModal}>
                <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* SEÇÃO 1: PREFERÊNCIAS */}
        <SectionTitle title="Preferências" />
        <View style={s.sectionContainer}>
            <SettingRow 
                icon="notifications" color="#ffbb33" label="Notificações" 
                type="switch" value={notificationsEnabled} onToggle={setNotificationsEnabled} 
            />
            <View style={s.divider} />
            <SettingRow 
                icon="moon" color="#9d4edd" label="Modo Escuro" 
                type="switch" value={darkMode} onToggle={setDarkMode} 
            />
        </View>

        {/* SEÇÃO 2: DADOS (SYNC) */}
        <SectionTitle title="Sincronização & Dados" />
        <View style={s.sectionContainer}>
            <SettingRow 
                icon="cloud-download" color="#00A79D" label="Baixar Backup (Exportar)" 
                onPress={handleBackup} 
            />
            <View style={s.divider} />
            <SettingRow 
                icon="cloud-upload" color="#00A79D" label="Restaurar Backup (Importar)" 
                onPress={handleRestore} 
            />
        </View>

        {/* SEÇÃO 3: SOBRE */}
        <SectionTitle title="Sobre" />
        <View style={s.sectionContainer}>
            <SettingRow 
                icon="information-circle" color="#aaa" label="Versão do App" 
                type="switch" value={true} onToggle={() => {}} // Switch fake apenas visual (disabled) ou texto
            />
            <View style={s.divider} />
            <TouchableOpacity style={s.settingRow} activeOpacity={1}>
                 <View style={[s.iconBox, { backgroundColor: '#333' }]}>
                    <Ionicons name="code-slash" size={20} color="#aaa" />
                 </View>
                 <Text style={[s.settingLabel, {color: '#888'}]}>Build: 5.0.2 (Sync)</Text>
            </TouchableOpacity>
        </View>

        {/* SEÇÃO 4: CONTA */}
        <SectionTitle title="Conta" />
        <View style={s.sectionContainer}>
            <SettingRow 
                icon="log-out" color="#ff4444" label="Sair da Conta" 
                isDestructive onPress={handleLogout} 
            />
        </View>

        <Text style={s.footerText}>ID do Usuário: {route.params?.userId || 'Visitante'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 20 },
  screenTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginVertical: 20 },
  
  // Perfil
  profileCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00A79D', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 14, color: '#888' },
  editProfileBtn: { marginLeft: 'auto', backgroundColor: '#333', padding: 8, borderRadius: 20 },

  // Seções
  sectionTitle: { color: '#888', fontSize: 13, textTransform: 'uppercase', marginBottom: 8, marginLeft: 10, fontWeight: '600', marginTop: 15 },
  sectionContainer: { backgroundColor: '#1f1f1f', borderRadius: 12, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#2a2a2a', marginLeft: 50 }, // Linha separadora
  
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingLabel: { flex: 1, fontSize: 16, color: '#fff' },

  footerText: { textAlign: 'center', color: '#444', marginTop: 30, fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { width: '85%', backgroundColor: '#1f1f1f', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  label: { color: '#aaa', marginBottom: 5, marginTop: 10 },
  inputContainer: { backgroundColor: '#2a2a2a', borderRadius: 8, paddingHorizontal: 15, height: 45, justifyContent: 'center' },
  input: { color: '#fff', fontSize: 16 },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 5 },
  cancelText: { color: '#aaa' },
});

export default MoreScreen;