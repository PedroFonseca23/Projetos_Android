import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { getProducts, deleteProduct } from '../database/database';

function SelectEditScreen({ navigation, route }) {
  const { userRole, userId } = route.params;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const userProducts = await getProducts();
      setProducts(userProducts);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os quadros.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleEditPress = (product) => {
    navigation.navigate('EditProduct', { product: product });
  };
  
  const handleDeletePress = (product) => {
    Alert.alert(
      'Deletar Quadro',
      `Tem certeza que deseja deletar "${product.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Deletar', style: 'destructive', onPress: () => confirmDelete(product.id) }
      ]
    );
  };
  
  const confirmDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível deletar o quadro.');
    }
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard
      index={index}
      product={item}
      userRole={userRole}
      onPress={() => handleEditPress(item)}
      onDelete={() => handleDeletePress(item)}
      onEdit={() => handleEditPress(item)}
    />
  );
  
  return (
    <SafeAreaView style={s.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.listContent}
        columnWrapperStyle={s.listColumn}
        ListHeaderComponent={() => (
          <Text style={s.title}>Selecione um quadro para editar ou remover</Text>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 18,
    color: '#aaa',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
  listColumn: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

export default SelectEditScreen;