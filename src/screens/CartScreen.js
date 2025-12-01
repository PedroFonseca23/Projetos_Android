import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCartItems, removeFromCart } from '../database/database';
import SolidButton from '../components/SolidButton';
import { useTheme } from '../context/ThemeContext';

const CartScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const { theme } = useTheme();

  const loadCart = async () => {
    if (!userId) return;
    const cartData = await getCartItems(userId);
    setItems(cartData);
    
    // --- CORREÇÃO DO PREÇO ---
    const totalValue = cartData.reduce((acc, item) => {
        let cleanString = String(item.price).replace('R$', '').trim();
        cleanString = cleanString.replace(/\./g, ''); // Remove milhar
        cleanString = cleanString.replace(',', '.');  // Decimal
        const price = parseFloat(cleanString);
        return acc + (isNaN(price) ? 0 : price);
    }, 0);
    
    setTotal(totalValue);
  };

  useFocusEffect(useCallback(() => { loadCart(); }, [userId]));

  const handleRemove = async (id) => {
    await removeFromCart(id);
    loadCart();
  };

  const handleCheckout = () => {
    navigation.navigate('PaymentScreen', { total: total, userId: userId });
  };

  const renderItem = ({ item }) => (
    <View style={[s.itemCard, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.imageUri }} style={[s.itemImage, { backgroundColor: theme.border }]} />
      <View style={s.itemInfo}>
        <Text style={[s.itemTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[s.itemPrice, { color: theme.primary }]}>{item.price}</Text>
        <Text style={[s.itemQty, { color: theme.textSecondary }]}>Peça Única</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.cart_item_id)} style={s.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>Meu Carrinho</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList 
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.cart_item_id || Math.random().toString()}
        contentContainerStyle={{padding: 20}}
        ListEmptyComponent={<Text style={[s.empty, { color: theme.textSecondary }]}>Seu carrinho está vazio.</Text>}
      />

      {items.length > 0 && (
        <View style={[s.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={s.totalRow}>
                <Text style={[s.totalLabel, { color: theme.textSecondary }]}>Total</Text>
                <Text style={[s.totalValue, { color: theme.text }]}>
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </Text>
            </View>
            <SolidButton text="FINALIZAR COMPRA" onPress={handleCheckout} />
        </View>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  itemCard: { flexDirection: 'row', borderRadius: 10, padding: 10, marginBottom: 15, alignItems: 'center' },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontWeight: 'bold', marginTop: 4 },
  itemQty: { fontSize: 12, marginTop: 2 },
  removeBtn: { padding: 10 },
  footer: { padding: 20, borderTopWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18 },
  totalValue: { fontSize: 22, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16 }
});

export default CartScreen;