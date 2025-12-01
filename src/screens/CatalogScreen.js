import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { getProducts, logProductView } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const AdminMenu = ({ visible, onClose, navigation }) => {
  const { theme } = useTheme();
  const navigate = (screen) => { onClose(); navigation.navigate(screen); };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1} />
      <View style={[s.menuContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <Text style={[s.menuTitle, { color: theme.textSecondary }]}>Menu Administrador</Text>
        
        <TouchableOpacity style={[s.menuButton, { borderBottomColor: theme.border }]} onPress={() => navigate('AddProduct')}>
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          <Text style={[s.menuButtonText, { color: theme.text }]}>Adicionar Novo Quadro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.menuButton, { borderBottomColor: theme.border }]} onPress={() => navigate('SelectEditScreen')}>
          <Ionicons name="pencil-outline" size={24} color={theme.text} />
          <Text style={[s.menuButtonText, { color: theme.text }]}>Editar/Remover Quadros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.menuButton, { borderBottomColor: theme.border }]} onPress={() => navigate('DashboardScreen')}>
          <Ionicons name="stats-chart-outline" size={24} color={theme.text} />
          <Text style={[s.menuButtonText, { color: theme.text }]}>Ver Dashboard</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const CatalogScreen = ({ navigation, route }) => {
  const { userId, userRole } = route.params || {};
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const { theme } = useTheme();

  useFocusEffect(useCallback(() => { loadProducts(); }, []));

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    if (searchQuery === '') setFilteredProducts(data);
  };

  useEffect(() => {
    if (searchQuery === '') setFilteredProducts(products);
    else setFilteredProducts(products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, products]);

  const handleProductPress = async (product) => {
    await logProductView(product.id, userId);
    navigation.navigate('ProductDetailScreen', { product });
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: theme.text }]}>Catálogo</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Ionicons name="cart-outline" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={[s.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={{marginRight: 10}} />
        <TextInput 
          style={[s.input, { color: theme.text }]} 
          placeholder="Buscar obra..." 
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <ProductCard product={item} index={index} userRole={userRole} onPress={() => handleProductPress(item)} />
        )}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={[s.empty, { color: theme.textSecondary }]}>Nenhum quadro encontrado.</Text>}
      />

      {userRole === 'admin' && (
        <>
          <TouchableOpacity style={[s.fab, { backgroundColor: theme.primary }]} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
          <AdminMenu visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />
        </>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', margin: 15, padding: 10, borderRadius: 8, alignItems: 'center' },
  input: { flex: 1, fontSize: 16 },
  list: { paddingBottom: 100, paddingHorizontal: 10 },
  empty: { textAlign: 'center', marginTop: 50 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  menuContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingBottom: 40, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1 },
  menuTitle: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  menuButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1 },
  menuButtonText: { fontSize: 18, marginLeft: 15 },
});

export default CatalogScreen;