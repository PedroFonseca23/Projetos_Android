import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ImageBackground, 
  TouchableOpacity, Dimensions, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// CARROSSEL: Imagens atualizadas
const CAROUSEL_IMAGES = [
  { 
    id: '1', 
    title: 'THOR E VIADO', 
    subtitle: 'A harmonia perfeita de texturas naturais', 
    uri: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=2070' 
  },
  { 
    id: '2', 
    title: 'PEÇAS ÚNICAS', 
    subtitle: 'Nenhum quadro é igual ao outro', 
    uri: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070' 
  },
  { 
    id: '3', 
    title: 'DESIGN RÚSTICO', 
    subtitle: 'O toque acolhedor que sua casa merece', 
    // CORREÇÃO: Troquei a imagem por uma mais estável e de alta qualidade
    uri: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070' 
  },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Auto-Scroll Robusto
  useEffect(() => {
    const timer = setInterval(() => {
      if (flatListRef.current) {
        let nextIndex = (carouselIndex + 1) % CAROUSEL_IMAGES.length;
        setCarouselIndex(nextIndex);
        try {
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        } catch (e) {
          console.log("Erro ao rolar carrossel:", e);
        }
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselIndex]);

  const renderCarouselItem = ({ item }) => (
    <View style={{ width, height: 450 }}>
      <ImageBackground source={{ uri: item.uri }} style={s.heroImage} resizeMode="cover">
        <View style={s.heroOverlay} />
        
        <View style={s.heroContent}>
          <Text style={s.heroSubtitle}>{item.subtitle}</Text>
          <Text style={s.heroTitle}>{item.title}</Text>
          
          <TouchableOpacity 
            style={s.ctaButton} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Catálogo')}
          >
            <Text style={s.ctaText}>VER COLEÇÃO</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{marginLeft: 5}} />
          </TouchableOpacity>

        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* CARROSSEL */}
        <View>
          <FlatList
            ref={flatListRef}
            data={CAROUSEL_IMAGES}
            renderItem={renderCarouselItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={(ev) => {
               const index = Math.floor(ev.nativeEvent.contentOffset.x / width);
               setCarouselIndex(index);
            }}
            onScrollToIndexFailed={info => {
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
        </View>

        <View style={s.content}>
          {/* REMOVIDO: Seção de Estilos de Acabamento */}

          {/* DESTAQUES */}
          <Text style={s.sectionHeader}>A Arte da Marcenaria</Text>
          
          <View style={s.featureCard}>
            <Ionicons name="hammer" size={32} color="#00A79D" />
            <View style={s.featureTextContainer}>
              <Text style={s.featureTitle}>Produção Artesanal</Text>
              <Text style={s.featureDesc}>Cada quadro é montado manualmente, unindo madeira nobre e tecidos selecionados.</Text>
            </View>
          </View>

          <View style={s.featureCard}>
            <Ionicons name="finger-print" size={32} color="#ffbb33" />
            <View style={s.featureTextContainer}>
              <Text style={s.featureTitle}>Peça Exclusiva</Text>
              <Text style={s.featureDesc}>Devido aos veios da madeira e corte do tecido, você terá uma obra irreplicável.</Text>
            </View>
          </View>

          <View style={{height: 100}} /> 
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  
  // Hero
  heroImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  // Ajuste no overlay para evitar problemas na web
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }, 
  heroContent: { padding: 25, paddingBottom: 60 },
  
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  heroSubtitle: { color: '#00A79D', fontSize: 14, fontWeight: 'bold', marginBottom: 5, letterSpacing: 2, textTransform: 'uppercase' },
  
  // Botão CTA
  ctaButton: { 
    flexDirection: 'row', 
    backgroundColor: '#00A79D', 
    paddingVertical: 14, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    alignSelf: 'flex-start', 
    alignItems: 'center', 
    shadowColor: '#00A79D', 
    shadowOpacity: 0.4, 
    shadowRadius: 10, 
    elevation: 10 
  },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  // Conteúdo
  content: { padding: 20, marginTop: -20, borderTopLeftRadius: 25, borderTopRightRadius: 25, backgroundColor: '#121212' },
  sectionHeader: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 10 },

  // Cards de Info
  featureCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f1f1f', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2a2a2a' },
  featureTextContainer: { marginLeft: 15, flex: 1 },
  featureTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  featureDesc: { color: '#888', fontSize: 13 },
});

export default HomeScreen;