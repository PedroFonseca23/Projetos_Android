import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, FlatList, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import SolidButton from '../components/SolidButton';
import { createCustomOrder, getUserOrders, updateCustomOrderStatus } from '../database/database';

const CustomOrderScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  const { theme } = useTheme();
  
  const [tab, setTab] = useState('new');
  const [orders, setOrders] = useState([]);
  
  // Form States
  const [imageUri, setImageUri] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (tab === 'list') loadOrders();
  }, [tab]);

  const loadOrders = async () => {
    const data = await getUserOrders(userId);
    setOrders(data);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!imageUri || !width || !height || !desc || !address) return Alert.alert("Erro", "Preencha todos os campos.");
    await createCustomOrder(userId, imageUri, width, height, desc, address);
    Alert.alert("Sucesso", "Pedido enviado! Aguarde o orçamento.");
    setTab('list');
    setImageUri(null); setWidth(''); setHeight(''); setDesc(''); setAddress('');
  };

  const handleRefuse = async (order) => {
    await updateCustomOrderStatus(order.id, 'refused');
    loadOrders();
    Alert.alert("Recusado", "Orçamento recusado.");
  };

  const handleAccept = (order) => {
    Alert.alert(
        "Aceitar Orçamento",
        "Como deseja prosseguir?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Chamar no WhatsApp", 
                onPress: () => {
                    const message = `Olá, gostaria de fechar o pedido personalizado ID: ${order.id}. Valor: ${order.adminPrice}.`;
                    Linking.openURL(`https://wa.me/5521999999999?text=${encodeURIComponent(message)}`);
                }
            },
            { 
                text: "Pagar pelo App", 
                onPress: () => {
                    // Calcula total (Preço + Frete)
                    const p = parseFloat(order.adminPrice.replace('R$', '').replace('.', '').replace(',', '.').trim());
                    const f = parseFloat(order.deliveryFee.replace('R$', '').replace('.', '').replace(',', '.').trim());
                    const total = p + f;
                    
                    navigation.navigate('PaymentScreen', { 
                        total, 
                        userId, 
                        isCustom: true, 
                        orderId: order.id 
                    });
                }
            }
        ]
    );
  };

  const renderOrderItem = ({ item }) => {
    let statusText = 'Aguardando';
    let statusColor = '#FF9500';

    if (item.status === 'quoted') { statusText = 'Orçamento Recebido'; statusColor = theme.primary; }
    if (item.status === 'refused') { statusText = 'Recusado'; statusColor = '#ff4444'; }
    if (item.status === 'paid') { statusText = 'Pago / Em Produção'; statusColor = '#34C759'; }

    return (
        <View style={[s.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.row}>
                <Image source={{ uri: item.imageUri }} style={s.miniThumb} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[s.orderStatus, { color: statusColor }]}>{statusText}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{new Date(item.date).toLocaleDateString()}</Text>
                    <Text style={{ color: theme.text, marginTop: 4 }}>{item.width}cm x {item.height}cm</Text>
                </View>
            </View>
            
            {item.status === 'quoted' && (
                <View style={[s.quoteBox, { backgroundColor: theme.background }]}>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>Valor: <Text style={{ color: theme.primary }}>{item.adminPrice}</Text></Text>
                    <Text style={{ color: theme.text, fontWeight: 'bold' }}>Frete: <Text style={{ color: theme.primary }}>{item.deliveryFee}</Text></Text>
                    
                    <View style={s.actions}>
                        <TouchableOpacity style={[s.actionBtn, { borderColor: '#ff4444' }]} onPress={() => handleRefuse(item)}>
                            <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Recusar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => handleAccept(item)}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Aceitar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
            <Text style={[s.headerTitle, { color: theme.text }]}>Pedido Personalizado</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={s.tabs}>
            <TouchableOpacity onPress={() => setTab('new')} style={[s.tabItem, tab === 'new' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}>
                <Text style={{ color: tab === 'new' ? theme.primary : theme.textSecondary, fontWeight: 'bold' }}>Novo Pedido</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('list')} style={[s.tabItem, tab === 'list' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}>
                <Text style={{ color: tab === 'list' ? theme.primary : theme.textSecondary, fontWeight: 'bold' }}>Meus Pedidos</Text>
            </TouchableOpacity>
        </View>

        {tab === 'new' ? (
            <ScrollView contentContainerStyle={s.content}>
                <TouchableOpacity style={[s.imagePicker, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={pickImage}>
                    {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} /> : (
                        <View style={{ alignItems: 'center' }}>
                            <Ionicons name="cloud-upload-outline" size={40} color={theme.textSecondary} />
                            <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Enviar Foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={s.rowInputs}>
                    <TextInput style={[s.input, { flex: 1, marginRight: 10, backgroundColor: theme.card, color: theme.text }]} placeholder="Largura (cm)" placeholderTextColor={theme.textSecondary} keyboardType="numeric" value={width} onChangeText={setWidth} />
                    <TextInput style={[s.input, { flex: 1, backgroundColor: theme.card, color: theme.text }]} placeholder="Altura (cm)" placeholderTextColor={theme.textSecondary} keyboardType="numeric" value={height} onChangeText={setHeight} />
                </View>

                <TextInput style={[s.input, { backgroundColor: theme.card, color: theme.text, height: 80 }]} placeholder="Descreva moldura, acabamento, etc..." placeholderTextColor={theme.textSecondary} multiline value={desc} onChangeText={setDesc} />
                
                <TextInput style={[s.input, { backgroundColor: theme.card, color: theme.text }]} placeholder="Endereço Completo para Entrega" placeholderTextColor={theme.textSecondary} value={address} onChangeText={setAddress} />

                <SolidButton text="SOLICITAR ORÇAMENTO" onPress={handleSubmit} />
            </ScrollView>
        ) : (
            <FlatList
                data={orders}
                keyExtractor={item => item.id}
                renderItem={renderOrderItem}
                contentContainerStyle={s.listContent}
                ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 50 }}>Nenhum pedido realizado.</Text>}
            />
        )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  content: { padding: 20 },
  listContent: { padding: 20 },
  imagePicker: { height: 200, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  rowInputs: { flexDirection: 'row', marginBottom: 15 },
  input: { padding: 15, borderRadius: 8, marginBottom: 15 },
  orderCard: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  miniThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  orderStatus: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  quoteBox: { marginTop: 15, padding: 10, borderRadius: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center', marginHorizontal: 5 },
});

export default CustomOrderScreen;