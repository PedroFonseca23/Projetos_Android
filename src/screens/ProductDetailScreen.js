import React, { useState } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, Dimensions, 
  TouchableOpacity, StatusBar, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SolidButton from '../components/SolidButton';
import { addToCart } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.55;

const ProductDetailScreen = ({ route, navigation }) => {
  const { product, userId } = route.params;
  const { theme, isDark } = useTheme();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Novo estado

  const handleAddToCart = async () => {
    if (!userId) return alert('Faça login para comprar.');

    try {
        const added = await addToCart(userId, product.id);
        if (added) {
            setShowSuccessModal(true); // Abre o modal bonito
        } else {
            alert('Este item já está no carrinho.');
        }
    } catch (e) {
        console.error(e);
    }
  };

  const SuccessModal = () => (
    <Modal animationType="fade" transparent={true} visible={showSuccessModal} onRequestClose={() => setShowSuccessModal(false)}>
        <View style={s.modalOverlay}>
            <View style={[s.modalContent, { backgroundColor: theme.card }]}>
                <View style={s.checkCircle}>
                    <Ionicons name="checkmark" size={40} color="#fff" />
                </View>
                <Text style={[s.modalTitle, { color: theme.text }]}>Adicionado!</Text>
                <Text style={[s.modalMsg, { color: theme.textSecondary }]}>O quadro foi para o seu carrinho.</Text>
                
                <TouchableOpacity 
                    style={[s.modalBtn, { backgroundColor: theme.primary }]}
                    onPress={() => { setShowSuccessModal(false); navigation.navigate('CartScreen'); }}
                >
                    <Text style={s.modalBtnText}>Ir para o Carrinho</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[s.modalBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border, marginTop: 10 }]}
                    onPress={() => { setShowSuccessModal(false); navigation.goBack(); }}
                >
                    <Text style={[s.modalBtnText, { color: theme.text }]}>Continuar Comprando</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
  );

  const DimensionBadge = ({ icon, label, value }) => (
    <View style={[s.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
        <View style={{ marginLeft: 8 }}>
            <Text style={[s.badgeLabel, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[s.badgeValue, { color: theme.text }]}>{value}</Text>
        </View>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SuccessModal />

      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={s.fixedImageContainer}>
         <View style={s.artBackground}>
             <Image source={{ uri: product.imageUri }} style={s.image} resizeMode="contain" />
         </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: IMG_HEIGHT - 40 }} style={{ flex: 1 }}>
        <View style={[s.sheet, { backgroundColor: theme.card }]}>
            <View style={s.dragHandle} />
            <View style={s.headerRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={[s.title, { color: theme.text }]}>{product.title}</Text>
                    <Text style={[s.subtitle, { color: theme.textSecondary }]}>Obra Original</Text>
                </View>
                <Text style={[s.price, { color: theme.primary }]}>{product.price}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: theme.border }]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>Especificações</Text>
            <View style={s.dimensionsRow}>
                <DimensionBadge icon="resize" label="Largura" value={`${product.width} cm`} />
                <DimensionBadge icon="swap-vertical" label="Altura" value={`${product.height} cm`} />
            </View>
            <View style={[s.divider, { backgroundColor: theme.border }]} />
            <Text style={[s.sectionTitle, { color: theme.text }]}>Detalhes</Text>
            <Text style={[s.description, { color: theme.textSecondary }]}>
                Acabamento premium em madeira nobre. Vidro de proteção não incluso na visualização.
            </Text>
            <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[s.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[s.favButton, { borderColor: theme.border }]} onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#ff4444" : theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 15 }}>
            <SolidButton text="ADICIONAR AO CARRINHO" onPress={handleAddToCart} />
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  fixedImageContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: IMG_HEIGHT, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  artBackground: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingBottom: 40 },
  image: { width: '90%', height: '90%' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 50, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, minHeight: height * 0.6, shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 10 },
  dragHandle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20, opacity: 0.5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 30 },
  subtitle: { fontSize: 14, marginTop: 4 },
  price: { fontSize: 24, fontWeight: 'bold' },
  divider: { height: 1, marginVertical: 20, opacity: 0.5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  dimensionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, width: '48%' },
  badgeLabel: { fontSize: 11, textTransform: 'uppercase', marginBottom: 2 },
  badgeValue: { fontSize: 15, fontWeight: 'bold' },
  description: { fontSize: 16, lineHeight: 26 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, paddingBottom: 30, borderTopWidth: 1, elevation: 20 },
  favButton: { width: 55, height: 55, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', padding: 25, borderRadius: 24, alignItems: 'center', elevation: 10 },
  checkCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  modalMsg: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalBtn: { width: '100%', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProductDetailScreen;