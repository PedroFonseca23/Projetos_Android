import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, 
  Image, TouchableOpacity, TextInput, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getProducts, deleteProduct } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const SelectEditScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { theme, isDark } = useTheme();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data); // Inicializa lista filtrada
    } catch (e) {
      console.error("Erro ao carregar:", e);
      Alert.alert("Erro", "Não foi possível carregar a lista.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
      setSearch(''); // Limpa busca ao voltar
    }, [])
  );

  // Filtro de Busca em Tempo Real
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, products]);

  const executeDelete = async (id) => {
    try {
        await deleteProduct(id);
        // Atualiza a lista localmente sem precisar recarregar tudo do banco (mais rápido visualmente)
        setProducts(prev => prev.filter(p => p.id !== id));
        Alert.alert("Sucesso", "Quadro removido.");
    } catch (e) {
        Alert.alert("Erro", "Falha ao excluir.");
    }
  };

  const handleDelete = (product) => {
    // Verificação de plataforma para garantir que o popup apareça
    if (Platform.OS === 'web') {
        if (window.confirm(`Tem certeza que deseja excluir "${product.title}"?`)) {
            executeDelete(product.id);
        }
    } else {
        Alert.alert(
          'Excluir Quadro',
          `Tem certeza que deseja excluir "${product.title}"?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Excluir', 
              style: 'destructive', 
              onPress: () => executeDelete(product.id)
            }
          ]
        );
    }
  };

  const handleEdit = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  // Componente de Item da Lista (Admin Row)
  const renderItem = ({ item }) => (
    <View style={[s.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Miniatura */}
      <Image source={{ uri: item.imageUri }} style={s.thumbnail} />
      
      {/* Informações */}
      <View style={s.infoContainer}>
        <Text style={[s.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[s.itemPrice, { color: theme.primary }]}>{item.price}</Text>
        <Text style={[s.itemDim, { color: theme.textSecondary }]}>{item.width} x {item.height} cm</Text>
      </View>

      {/* Ações */}
      <View style={s.actionsContainer}>
        <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: theme.border }]} 
            onPress={() => handleEdit(item)}
        >
            <Ionicons name="pencil" size={20} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: theme.danger + '20' }]} // +20 adiciona transparência no hex
            onPress={() => handleDelete(item)}
        >
            <Ionicons name="trash" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Carregando estoque...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      
      {/* Cabeçalho e Busca */}
      <View style={[s.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[s.title, { color: theme.text }]}>Gerenciar Estoque</Text>
        <Text style={[s.subtitle, { color: theme.textSecondary }]}>{products.length} quadros cadastrados</Text>
        
        <View style={[s.searchBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textSecondary} />
            <TextInput 
                style={[s.input, { color: theme.text }]}
                placeholder="Buscar quadro..."
                placeholderTextColor={theme.textSecondary}
                value={search}
                onChangeText={setSearch}
            />
            {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="albums-outline" size={60} color={theme.textSecondary} />
            <Text style={[s.empty, { color: theme.text }]}>Nenhum quadro encontrado.</Text>
            {search === '' && (
                <Text style={[s.emptySub, { color: theme.textSecondary }]}>Adicione novos produtos no menu anterior.</Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  header: { padding: 20, paddingBottom: 15, borderBottomWidth: 1, elevation: 2, shadowColor: "#000", shadowOffset: {width:0, height: 2}, shadowOpacity: 0.1, shadowRadius: 2, zIndex: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 15 },
  
  searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, height: 45 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },

  // Lista
  list: { padding: 15 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 12, borderRadius: 12, borderWidth: 1, elevation: 1 },
  
  thumbnail: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '600' },
  itemDim: { fontSize: 12, marginTop: 4 },

  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // Empty State
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  empty: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  emptySub: { fontSize: 14, marginTop: 5, textAlign: 'center', paddingHorizontal: 40 },
});

export default SelectEditScreen;