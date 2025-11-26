import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const HERO_IMG = { uri: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop' };

const FeatureItem = ({ icon, title, text }) => (
  <View style={s.featureItem}>
    <View style={s.iconBox}>
      <Ionicons name={icon} size={28} color="#00A79D" />
    </View>
    <View>
      <Text style={s.featureTitle}>{title}</Text>
      <Text style={s.featureText}>{text}</Text>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  return (
    <View style={s.container}>
      <ScrollView>
        {/* Hero Section */}
        <ImageBackground source={HERO_IMG} style={s.hero} resizeMode="cover">
          <View style={s.overlay} />
          <Text style={s.heroTitle}>ARTE QUE INSPIRA</Text>
          <Text style={s.heroSubtitle}>Transforme seu espaço com exclusividade.</Text>
          
          <TouchableOpacity 
            style={s.ctaButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Catálogo')}
          >
            <Text style={s.ctaText}>EXPLORAR COLEÇÃO</Text>
          </TouchableOpacity>
        </ImageBackground>

        {/* Pontos da Empresa */}
        <View style={s.content}>
          <Text style={s.sectionHeader}>Por que a Quadros?</Text>
          
          <FeatureItem 
            icon="diamond-outline" 
            title="Curadoria Premium" 
            text="Selecionamos apenas artistas com traços únicos e modernos."
          />
          <FeatureItem 
            icon="rocket-outline" 
            title="Entrega Rápida" 
            text="Receba sua obra de arte em qualquer lugar do Brasil."
          />
          <FeatureItem 
            icon="shield-checkmark-outline" 
            title="Garantia de Qualidade" 
            text="Materiais de alta durabilidade e acabamento impecável."
          />
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  hero: { height: 400, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 2, textAlign: 'center' },
  heroSubtitle: { fontSize: 16, color: '#ccc', marginTop: 10, marginBottom: 30, textAlign: 'center' },
  ctaButton: { backgroundColor: '#00A79D', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  content: { padding: 25 },
  sectionHeader: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, backgroundColor: '#1f1f1f', padding: 15, borderRadius: 12 },
  iconBox: { width: 50, alignItems: 'center' },
  featureTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  featureText: { color: '#aaa', fontSize: 14, maxWidth: '90%' },
});

export default HomeScreen;