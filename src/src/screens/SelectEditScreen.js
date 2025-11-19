import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, deleteProduct } from '../database/database';
import ProductCard from '../components/ProductCard';

const SelectEditScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    console.log("🔄 Carregando produtos para edição...");
    try {
      const data = await getProducts();
      console.log("📋 Produtos carregados na tela:", data.length);
      setProducts(data);
    } catch (e) {
      console.error("Erro ao carregar na tela:", e);
      Alert.alert("Erro", "Não foi possível carregar a lista.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleDelete = (product) => {
    Alert.alert(
      'Excluir Quadro',
      `Tem certeza que deseja excluir "${product.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            await deleteProduct(product.id);
            loadProducts();
          }
        }
      ]
    );
  };

  const handleEdit = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#00A79D" />
        <Text style={s.loadingText}>Buscando quadros...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <Text style={s.headerInfo}>
        {products.length > 0 
          ? "Toque no lápis para editar ou na lixeira para excluir." 
          : "Nenhum produto encontrado no banco de dados."}
      </Text>
      
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.list}
        renderItem={({ item, index }) => (
          <ProductCard 
            product={item} 
            index={index} 
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item)}
            onPress={() => {}} 
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Text style={s.empty}>O banco de dados está vazio.</Text>
            <Text style={s.emptySub}>Tente adicionar um quadro novo e verifique o log do terminal.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  loadingText: { color: '#fff', marginTop: 10 },
  headerInfo: { color: '#aaa', textAlign: 'center', padding: 15, fontSize: 14 },
  list: { paddingHorizontal: 10, paddingBottom: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  empty: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySub: { color: '#777', fontSize: 14, marginTop: 5, textAlign: 'center', paddingHorizontal: 20 }
});

export default SelectEditScreen;