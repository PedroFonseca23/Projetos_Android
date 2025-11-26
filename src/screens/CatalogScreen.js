import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import { getProducts, logProductView } from '../database/database';

// Componente do Menu Admin (Pop-up)
const AdminMenu = ({ visible, onClose, navigation }) => {
  const navigate = (screen) => {
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1} />
      <View style={s.menuContainer}>
        <Text style={s.menuTitle}>Menu Administrador</Text>
        
        <TouchableOpacity style={s.menuButton} onPress={() => navigate('AddProduct')}>
          <Ionicons name="add-circle-outline" size={24} color="#00A79D" />
          <Text style={s.menuButtonText}>Adicionar Novo Quadro</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuButton} onPress={() => navigate('SelectEditScreen')}>
          <Ionicons name="pencil-outline" size={24} color="#fff" />
          <Text style={s.menuButtonText}>Editar/Remover Quadros</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.menuButton} onPress={() => navigate('DashboardScreen')}>
          <Ionicons name="stats-chart-outline" size={24} color="#fff" />
          <Text style={s.menuButtonText}>Ver Dashboard</Text>
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
  const [menuVisible, setMenuVisible] = useState(false); // Estado para controlar o menu

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    if (searchQuery === '') setFilteredProducts(data);
  };

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery, products]);

  const handleProductPress = async (product) => {
    await logProductView(product.id, userId);
    navigation.navigate('ProductDetailScreen', { product });
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Catálogo</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
            <Ionicons name="cart-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={s.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={{marginRight: 10}} />
        <TextInput 
          style={s.input} 
          placeholder="Buscar obra..." 
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({ item, index }) => (
          <ProductCard 
            product={item} 
            index={index} 
            userRole={userRole}
            onPress={() => handleProductPress(item)} 
          />
        )}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Nenhum quadro encontrado.</Text>}
      />

      {/* Botão "+" que abre o Menu */}
      {userRole === 'admin' && (
        <>
          <TouchableOpacity 
            style={s.fab} 
            onPress={() => setMenuVisible(true)} 
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>

          <AdminMenu 
            visible={menuVisible} 
            onClose={() => setMenuVisible(false)} 
            navigation={navigation} 
          />
        </>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1f1f1f', margin: 15, padding: 10, borderRadius: 8, alignItems: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  list: { paddingBottom: 100, paddingHorizontal: 10 },
  empty: { color: '#777', textAlign: 'center', marginTop: 50 },
  
  // Botão Flutuante
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A79D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },

  // Estilos do Menu Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1f1f1f',
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  menuTitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
});

export default CatalogScreen;