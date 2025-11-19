import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ImageBackground,
  TouchableOpacity
} from 'react-native';
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

const HeroBanner = () => (
  <View style={s.heroContainer}>
    <ImageBackground source={HERO_IMAGE_SOBRE} resizeMode="cover" style={s.heroImage}>
      <View style={s.heroOverlay} />
      <Text style={s.heroTitle}>Nossa História</Text>
      <Text style={s.heroSubtitle}>Conectando artistas e amantes da arte.</Text>
    </ImageBackground>
  </View>
);

const ValueCard = ({ icon, title, text }) => (
  <View style={s.valueCard}>
    <View style={s.valueIcon}>
      <Ionicons name={icon} size={24} color="#00A79D" />
    </View>
    <View style={s.valueTextContainer}>
      <Text style={s.valueTitle}>{title}</Text>
      <Text style={s.valueText}>{text}</Text>
    </View>
  </View>
);

const MenuRow = ({ icon, title, onPress }) => (
  <TouchableOpacity style={s.menuRow} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#aaa" />
    <Text style={s.menuRowText}>{title}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#555" />
  </TouchableOpacity>
);

const MoreScreen = ({ navigation, route }) => {
  const { userRole } = route.params;

  return (
    <SafeAreaView style={s.container} edges={['top', 'left', 'right']}>
      <CustomHeader />
      <ScrollView>
        {userRole === 'admin' && (
          <View style={s.adminSection}>
            <Text style={s.sectionTitle}>Painel de Admin</Text>
            <MenuRow 
              icon="stats-chart-outline" 
              title="Dashboard" 
              onPress={() => navigation.navigate('Início', { screen: 'DashboardScreen' })}
            />
          </View>
        )}
        
        <HeroBanner />
        <View style={s.content}>
          <Text style={s.title}>Sobre o Projeto Quadros</Text>
          <Text style={s.text}>
            Este é um aplicativo dedicado à exibição e comercialização de arte. Nossa missão é conectar artistas talentosos com amantes da arte, oferecendo uma plataforma moderna e intuitiva.
          </Text>

          <Text style={s.sectionTitle}>Nossos Valores</Text>
          <ValueCard 
            icon="diamond-outline" 
            title="Qualidade" 
            text="Curadoria impecável e materiais de alta qualidade." 
          />
          <ValueCard 
            icon="heart-outline" 
            title="Paixão" 
            text="Amamos arte e queremos compartilhar essa paixão com o mundo." 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1f1f1f',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginLeft: 8,
  },
  heroContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  adminSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  valueIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  menuRowText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
});

export default MoreScreen;