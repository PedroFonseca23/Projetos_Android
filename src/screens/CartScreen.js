import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCartItems, removeFromCart, clearCart } from '../database/database';
import SolidButton from '../components/SolidButton';

const CartScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    if (!userId) return;
    const cartData = await getCartItems(userId);
    setItems(cartData);
    
    // Calcular total
    const totalValue = cartData.reduce((acc, item) => {
        const price = parseFloat(item.price.replace('R$', '').replace(',', '.').trim());
        return acc + (price * item.quantity);
    }, 0);
    setTotal(totalValue);
  };

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [userId])
  );

  const handleRemove = async (id) => {
    await removeFromCart(id);
    loadCart();
  };

  const handleCheckout = () => {
 
    navigation.navigate('PaymentScreen', { 
        total: total,
        userId: userId
    });
  };

  const renderItem = ({ item }) => (
    <View style={s.itemCard}>
      <Image source={{ uri: item.imageUri }} style={s.itemImage} />
      <View style={s.itemInfo}>
        <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.itemPrice}>{item.price}</Text>
        <Text style={s.itemQty}>Qtd: {item.quantity}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.cartId)} style={s.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.title}>Meu Carrinho</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList 
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.cartId}
        contentContainerStyle={{padding: 20}}
        ListEmptyComponent={<Text style={s.empty}>Seu carrinho está vazio.</Text>}
      />

      {items.length > 0 && (
        <View style={s.footer}>
            <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalValue}>R$ {total.toFixed(2).replace('.', ',')}</Text>
            </View>
            <SolidButton text="FINALIZAR COMPRA" onPress={handleCheckout} />
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  itemCard: { flexDirection: 'row', backgroundColor: '#1f1f1f', borderRadius: 10, padding: 10, marginBottom: 15, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#333' },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#00A79D', fontWeight: 'bold', marginTop: 4 },
  itemQty: { color: '#888', fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 10 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1f1f1f' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { color: '#aaa', fontSize: 18 },
  totalValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  empty: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 }
});

export default CartScreen;