import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HERO_IMAGE_SOBRE = { uri: 'https://images.unsplash.com/photo-1482160549825-59ac1b23cb6e?q=80&w=2070&auto=format&fit=crop' };

const CustomHeader = () => (
  <View style={s.headerContainer}>
    <View style={s.headerLogo}>
      <Ionicons name="apps-outline" size={24} color="#00A79D" />
      <Text style={s.headerLogoText}>MAIS</Text>
    </View>
  </View>
);

const MenuRow = ({ icon, title, onPress, color = "#aaa" }) => (
  <TouchableOpacity style={s.menuRow} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[s.menuRowText, { color: color === "#aaa" ? "#fff" : color }]}>{title}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#555" />
  </TouchableOpacity>
);

const MoreScreen = ({ navigation, route }) => {
  const handleLogoutPress = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {
          if (route.params?.onLogout) {
             route.params.onLogout();
          } else {
             Alert.alert("Info", "Reinicie o app para trocar de conta.");
          }
      }} 
    ]);
  };

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <CustomHeader />
      <ScrollView>
        
        <View style={s.heroContainer}>
            <ImageBackground source={HERO_IMAGE_SOBRE} resizeMode="cover" style={s.heroImage}>
            <View style={s.heroOverlay} />
            <Text style={s.heroTitle}>Sobre Nós</Text>
            </ImageBackground>
        </View>

        <View style={s.content}>
          <Text style={s.sectionTitle}>Informações</Text>
          <Text style={s.text}>
            O Projeto Quadros é uma iniciativa dedicada a conectar artistas talentosos a colecionadores e amantes da arte.
            {'\n'}{'\n'}
            Nossa missão é tornar a arte acessível, oferecendo uma curadoria premium e uma experiência de compra simplificada.
            {'\n'}{'\n'}
            Versão do App: 4.1.0
          </Text>

          <Text style={s.sectionTitle}>Opções</Text>
          <MenuRow icon="log-out-outline" title="Sair da Conta" onPress={handleLogoutPress} color="#ff4444" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#1f1f1f' },
  headerLogo: { flexDirection: 'row', alignItems: 'center' },
  headerLogoText: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 8 },
  heroContainer: { height: 150, marginVertical: 20 },
  heroImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  heroTitle: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#777', marginBottom: 10, marginTop: 20 },
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1f', padding: 15, borderRadius: 8, marginBottom: 10 },
  menuRowText: { flex: 1, fontSize: 16, marginLeft: 15 },
  text: { color: '#aaa', lineHeight: 22, fontSize: 15 },
});

export default MoreScreen;