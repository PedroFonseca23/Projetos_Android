import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import SolidButton from '../components/SolidButton';
import { getPendingOrders, replyToOrder } from '../database/database';
import { CurrencyInput } from '../components/CurrencyInput';

const AdminOrdersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [price, setPrice] = useState('');
  const [frete, setFrete] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await getPendingOrders();
    setOrders(data);
  };

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setPrice('');
    setFrete('');
  };

  const sendQuote = async () => {
    if (!price || !frete) return Alert.alert("Erro", "Preencha os valores.");
    await replyToOrder(selectedOrder.id, price, frete);
    Alert.alert("Enviado", "Orçamento enviado para o cliente.");
    setSelectedOrder(null);
    load();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => handleOpenOrder(item)}>
        <Image source={{ uri: item.imageUri }} style={s.thumb} />
        <View style={s.info}>
            <Text style={[s.clientName, { color: theme.text }]}>{item.userName}</Text>
            <Text style={{ color: theme.textSecondary }}>{item.width}x{item.height}cm • {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={{ color: theme.primary, fontWeight: 'bold', marginTop: 5 }}>Responder agora</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[s.title, { color: theme.text }]}>Pedidos Pendentes</Text>
        <View style={{width: 24}}/>
      </View>

      <FlatList 
        data={orders}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 50 }}>Nenhum pedido pendente.</Text>}
      />

      <Modal visible={!!selectedOrder} animationType="slide" onRequestClose={() => setSelectedOrder(null)}>
        <View style={[s.modalContainer, { backgroundColor: theme.background }]}>
            <View style={s.modalHeader}>
                <Text style={[s.modalTitle, { color: theme.text }]}>Enviar Orçamento</Text>
                <TouchableOpacity onPress={() => setSelectedOrder(null)}><Ionicons name="close" size={28} color={theme.text} /></TouchableOpacity>
            </View>
            
            {selectedOrder && (
                <View style={{ padding: 20 }}>
                    <Image source={{ uri: selectedOrder.imageUri }} style={s.bigImage} resizeMode="contain" />
                    
                    <Text style={[s.label, { color: theme.textSecondary }]}>Cliente: <Text style={{ color: theme.text }}>{selectedOrder.userName}</Text></Text>
                    <Text style={[s.label, { color: theme.textSecondary }]}>Medidas: <Text style={{ color: theme.text }}>{selectedOrder.width} x {selectedOrder.height} cm</Text></Text>
                    <Text style={[s.label, { color: theme.textSecondary }]}>Descrição: <Text style={{ color: theme.text }}>{selectedOrder.description}</Text></Text>
                    <Text style={[s.label, { color: theme.textSecondary }]}>Endereço: <Text style={{ color: theme.text }}>{selectedOrder.address}</Text></Text>

                    <View style={s.divider} />

                    <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 10 }}>Definir Valores</Text>
                    <CurrencyInput placeholder="Preço do Quadro" value={price} onChange={setPrice} />
                    <CurrencyInput placeholder="Valor do Frete" value={frete} onChange={setFrete} />

                    <SolidButton text="ENVIAR RESPOSTA" onPress={sendQuote} />
                </View>
            )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#ccc' },
  info: { flex: 1, marginLeft: 15 },
  clientName: { fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  bigImage: { width: '100%', height: 200, backgroundColor: '#333', borderRadius: 12, marginBottom: 20 },
  label: { marginBottom: 8, fontSize: 14 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 20 },
});

export default AdminOrdersScreen;