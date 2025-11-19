import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  ImageBackground,
  Modal,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView as ContextSafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../components/ProductCard';
import SolidButton from '../components/SolidButton';
import { StyledInput } from '../components/Inputs';
import { getProducts, logProductView, deleteProduct, getAppSetting, setAppSetting } from '../database/database';

const HERO_IMAGE = { uri: 'https://images.unsplash.com/photo-1506806732259-39c2d02a0463?q=80&w=2070&auto=format&fit=crop' };

const CustomHeader = ({ onLogout }) => (
  <View style={s.headerContainer}>
    <View style={s.headerLogo}>
      <Ionicons name="images-outline" size={24} color="#00A79D" />
      <Text style={s.headerLogoText}>QUADROS</Text>
    </View>
    <View style={s.headerIcons}>
      <TouchableOpacity 
        style={s.iconButton} 
        onPress={() => Alert.alert('Carrinho', 'O carrinho ainda será implementado.')}
      >
        <Ionicons name="cart-outline" size={26} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={[s.iconButton, {marginRight: 0}]} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

const HeroBanner = ({ title, subtitle }) => (
  <View style={s.heroContainer}>
    <ImageBackground source={HERO_IMAGE} resizeMode="cover" style={s.heroImage}>
      <View style={s.heroOverlay} />
      <Text style={s.heroTitle}>{title}</Text>
      <Text style={s.heroSubtitle}>{subtitle}</Text>
    </ImageBackground>
  </View>
);

const ListHeader = ({ title, subtitle }) => (
  <View>
    <HeroBanner title={title} subtitle={subtitle} />
    <Text style={s.sectionTitle}>Nossos Quadros</Text>
  </View>
);

const AdminMenu = ({ visible, onClose, navigation, onEditBanner }) => {
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
        <TouchableOpacity style={s.menuButton} onPress={onEditBanner}>
          <Ionicons name="document-text-outline" size={22} color="#fff" />
          <Text style={s.menuButtonText}>Editar Texto do Banner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuButton} onPress={() => navigate('AddProduct')}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={s.menuButtonText}>Adicionar Quadro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuButton} onPress={() => navigate('SelectEditScreen')}>
          <Ionicons name="pencil-outline" size={22} color="#fff" />
          <Text style={s.menuButtonText}>Editar/Remover Quadros</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const EditBannerModal = ({ visible, onClose, initialTitle, initialSubtitle, onSave }) => {
  const [title, setTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState(initialSubtitle);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setSubtitle(initialSubtitle);
    }
  }, [visible, initialTitle, initialSubtitle]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.modalOverlay} onPress={onClose} activeOpacity={1} />
      <View style={s.editModalContainer}>
        <Text style={s.editModalTitle}>Editar Banner</Text>
        <StyledInput
          placeholder="Título"
          value={title}
          onChange={setTitle}
        />
        <StyledInput
          placeholder="Subtítulo"
          value={subtitle}
          onChange={setSubtitle}
        />
        <SolidButton text="Salvar" onPress={() => onSave(title, subtitle)} />
      </View>
    </Modal>
  );
};

function HomeScreen({ navigation, userId, userRole, onLogout }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editBannerVisible, setEditBannerVisible] = useState(false);
  
  const [heroTitle, setHeroTitle] = useState('Carregando...');
  const [heroSubtitle, setHeroSubtitle] = useState('...');

  const loadAppData = async () => {
    try {
      setIsLoading(true);
      const [dbTitle, dbSubtitle, dbProducts] = await Promise.all([
        getAppSetting('heroTitle'),
        getAppSetting('heroSubtitle'),
        getProducts()
      ]);
      setHeroTitle(dbTitle || 'Bem vindo');
      setHeroSubtitle(dbSubtitle || 'Obras de arte que transformam ambientes.');
      setProducts(dbProducts);
      setFilteredProducts(dbProducts);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadAppData();
    }, [userId])
  );

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleProductPress = async (product) => {
    try {
      await logProductView(product.id, userId);
      navigation.navigate('ProductDetailScreen', { product: product });
    } catch (e) {
      console.error('Erro ao logar view:', e);
      navigation.navigate('ProductDetailScreen', { product: product });
    }
  };

  const handleSaveBanner = async (title, subtitle) => {
    try {
      await setAppSetting('heroTitle', title);
      await setAppSetting('heroSubtitle', subtitle);
      setHeroTitle(title);
      setHeroSubtitle(subtitle);
      setEditBannerVisible(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard
      index={index}
      product={item}
      userRole={userRole}
      onPress={() => handleProductPress(item)}
    />
  );
  
  const renderEmptyList = () => {
    if (isLoading) return null;
    
    return (
      <View style={s.emptyContainer}>
        <Ionicons name="images-outline" size={60} color="#555" />
        <Text style={s.emptyText}>Nenhum quadro adicionado.</Text>
        {userRole === 'admin' && (
          <Text style={s.emptySubtext}>Clique no botão '+' para adicionar o primeiro.</Text>
        )}
      </View>
    );
  };

  return (
    <ContextSafeAreaView style={s.container}>
      <CustomHeader onLogout={onLogout} />
      
      <View style={s.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Pesquisar quadros..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={<ListHeader title={heroTitle} subtitle={heroSubtitle} />}
        contentContainerStyle={s.listContent}
        columnWrapperStyle={s.listColumn}
        ListEmptyComponent={renderEmptyList}
      />
      
      {userRole === 'admin' && (
        <TouchableOpacity style={s.fab} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      <AdminMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
        navigation={navigation}
        onEditBanner={() => {
          setMenuVisible(false);
          setEditBannerVisible(true);
        }}
      />
      
      <EditBannerModal
        visible={editBannerVisible}
        onClose={() => setEditBannerVisible(false)}
        initialTitle={heroTitle}
        initialSubtitle={heroSubtitle}
        onSave={handleSaveBanner}
      />
    </ContextSafeAreaView>
  );
}

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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  heroContainer: {
    width: '100%',
    height: 250,
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
    fontSize: 34,
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
  listColumn: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    paddingTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
  editModalContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default HomeScreen;