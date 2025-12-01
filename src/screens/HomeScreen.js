import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ImageBackground, 
  TouchableOpacity, Dimensions, FlatList, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

// Altura do Carrossel: 65% da altura da tela (fica ótimo em Mobile e Web)
const CAROUSEL_HEIGHT = height * 0.65;

// Dados atualizados com textos profissionais
const CAROUSEL_IMAGES = [
  { 
    id: '1', 
    title: 'COLEÇÃO ATEMPORAL', 
    subtitle: 'A harmonia perfeita entre natureza e design', 
    uri: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?q=80&w=2070' 
  },
  { 
    id: '2', 
    title: 'ARTE ABSTRATA', 
    subtitle: 'Peças únicas que transformam seu ambiente', 
    uri: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070' 
  },
  { 
    id: '3', 
    title: 'DESIGN RÚSTICO', 
    subtitle: 'O toque acolhedor que sua casa merece', 
    uri: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2070' 
  },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const flatListRef = useRef(null);
  const { theme } = useTheme();
  
  // Auto-Scroll
  useEffect(() => {
    const timer = setInterval(() => {
      if (flatListRef.current) {
        let nextIndex = (carouselIndex + 1) % CAROUSEL_IMAGES.length;
        setCarouselIndex(nextIndex);
        try {
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        } catch (e) {
          // Ignora erro se o usuário estiver interagindo
        }
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselIndex]);

  const renderCarouselItem = ({ item }) => (
    <View style={{ width, height: CAROUSEL_HEIGHT }}>
      <ImageBackground 
        source={{ uri: item.uri }} 
        style={s.heroImage} 
        resizeMode="cover" // Garante que a imagem preencha tudo sem distorcer
      >
        {/* Overlay escuro gradiente simulado para leitura do texto */}
        <View style={s.heroOverlay}>
          
          <View style={s.heroContent}>
            <View style={s.tagContainer}>
                <Text style={s.tagText}>LANÇAMENTO</Text>
            </View>

            <Text style={s.heroTitle}>{item.title}</Text>
            <Text style={s.heroSubtitle}>{item.subtitle}</Text>
            
            <TouchableOpacity 
              style={[s.ctaButton, { backgroundColor: theme.primary }]} 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Catálogo')}
            >
              <Text style={s.ctaText}>EXPLORAR COLEÇÃO</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  // Dots indicadores do carrossel
  const renderDots = () => (
    <View style={s.dotsContainer}>
      {CAROUSEL_IMAGES.map((_, index) => (
        <View 
          key={index} 
          style={[
            s.dot, 
            { backgroundColor: index === carouselIndex ? '#fff' : 'rgba(255,255,255,0.4)',
              width: index === carouselIndex ? 20 : 8 }
          ]} 
        />
      ))}
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
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
          />
          {renderDots()}
        </View>

        {/* CONTEÚDO INFERIOR */}
        <View style={[s.content, { backgroundColor: theme.background }]}>
          
          <Text style={[s.sectionHeader, { color: theme.text }]}>Diferenciais Edem</Text>
          
          <View style={[s.featureGrid]}>
            <View style={[s.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[s.iconCircle, { backgroundColor: 'rgba(0, 167, 157, 0.15)' }]}>
                <Ionicons name="hammer-outline" size={28} color="#00A79D" />
              </View>
              <Text style={[s.featureTitle, { color: theme.text }]}>Feito à Mão</Text>
              <Text style={[s.featureDesc, { color: theme.textSecondary }]}>
                Produção artesanal com madeira nobre certificada.
              </Text>
            </View>

            <View style={[s.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
               <View style={[s.iconCircle, { backgroundColor: 'rgba(255, 187, 51, 0.15)' }]}>
                <Ionicons name="diamond-outline" size={28} color="#ffbb33" />
               </View>
              <Text style={[s.featureTitle, { color: theme.text }]}>Exclusividade</Text>
              <Text style={[s.featureDesc, { color: theme.textSecondary }]}>
                Design único. Nenhuma peça é igual a outra.
              </Text>
            </View>
          </View>

          {/* Banner Promocional Pequeno */}
          <TouchableOpacity 
            style={[s.promoBanner, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('Catálogo')}
          >
             <View>
                <Text style={[s.promoTitle, { color: theme.text }]}>Quadros Personalizados</Text>
                <Text style={[s.promoSub, { color: theme.textSecondary }]}>Encomende do seu jeito</Text>
             </View>
             <Ionicons name="color-palette-outline" size={40} color={theme.primary} />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  
  // Hero / Carrossel
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.3)', // Escurece um pouco a imagem inteira
    justifyContent: 'flex-end',
    paddingBottom: 60
  },
  heroContent: { 
    paddingHorizontal: 25,
  },
  
  tagContainer: { 
    backgroundColor: '#000', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 4, 
    marginBottom: 10 
  },
  tagText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  heroTitle: { 
    fontSize: 38, 
    fontWeight: '800', 
    color: '#fff', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 10
  },
  heroSubtitle: { 
    color: '#eee', 
    fontSize: 16, 
    fontWeight: '500', 
    marginBottom: 25, 
    opacity: 0.9 
  },
  
  ctaButton: { 
    flexDirection: 'row', 
    paddingVertical: 14, 
    paddingHorizontal: 35, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 4}
  },
  ctaText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

  dotsContainer: {
    position: 'absolute',
    bottom: 30, // Acima do "Content"
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },

  // Conteúdo
  content: { 
    padding: 20, 
    marginTop: -20, // Sobe um pouco sobre a imagem
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    minHeight: 500
  },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, marginTop: 5 },

  // Grid de Features
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  featureCard: { 
    width: '48%',
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    alignItems: 'flex-start'
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  featureTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  featureDesc: { fontSize: 13, lineHeight: 18 },

  // Banner Promo
  promoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5
  }
});

export default HomeScreen;