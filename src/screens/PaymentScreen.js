import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SolidButton from '../components/SolidButton';
import { StyledInput, PhoneMaskInput } from '../components/Inputs'; // Reutilizando seus inputs
import { clearCart } from '../database/database';

const PaymentScreen = ({ navigation, route }) => {
  const { total, userId } = route.params || { total: 0 };
  
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animação do check de sucesso
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handlePayment = async () => {
    if (!name || !cardNumber || !expiry || !cvv) {
      Alert.alert('Atenção', 'Preencha todos os dados do cartão (simulação).');
      return;
    }

    setProcessing(true);

    // 1. Simula tempo de processamento (2 segundos)
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);
      
      // 2. Limpa o carrinho no banco de dados
      await clearCart(userId);

      // 3. Inicia animação de sucesso
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // 4. Volta para o início após mostrar o sucesso
      setTimeout(() => {
        setSuccess(false);
        navigation.reset({
            index: 0,
            routes: [{ name: 'CatalogList' }], // Volta para o catálogo
        });
        Alert.alert("Obrigado!", "Sua arte chegará em breve.");
      }, 2500);

    }, 2000);
  };

  // Renderiza o Modal de Sucesso
  const renderSuccessModal = () => (
    <Modal visible={success} transparent animationType="fade">
      <View style={s.modalOverlay}>
        <View style={s.successBox}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name="checkmark-circle" size={100} color="#00C851" />
          </Animated.View>
          <Text style={s.successTitle}>Pagamento Aprovado!</Text>
          <Text style={s.successSub}>Sua compra foi confirmada.</Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      {renderSuccessModal()}
      
      <View style={s.header}>
        <Text style={s.headerTitle}>Checkout Seguro</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.cardPreview}>
            <Text style={s.cardLabel}>Valor Total</Text>
            <Text style={s.totalValue}>R$ {total?.toFixed(2).replace('.', ',')}</Text>
            <View style={s.secureBadge}>
                <Ionicons name="lock-closed" size={14} color="#00A79D" />
                <Text style={s.secureText}>Ambiente Seguro (Simulado)</Text>
            </View>
        </View>

        <Text style={s.sectionTitle}>Dados do Cartão</Text>
        
        <StyledInput 
            placeholder="Número do Cartão" 
            keyboard="numeric" 
            value={cardNumber} 
            onChange={(t) => setCardNumber(t.replace(/\D/g, '').slice(0, 16))} // Só números
            icon="card-outline"
        />

        <StyledInput 
            placeholder="Nome impresso no cartão" 
            value={name} 
            onChange={setName} 
            autoCap="characters"
        />

        <View style={s.row}>
            <View style={{flex: 1, marginRight: 10}}>
                <StyledInput 
                    placeholder="MM/AA" 
                    value={expiry} 
                    onChange={setExpiry} 
                    keyboard="numeric"
                    maxLength={5}
                />
            </View>
            <View style={{flex: 1}}>
                <StyledInput 
                    placeholder="CVV" 
                    value={cvv} 
                    onChange={setCvv} 
                    keyboard="numeric"
                    maxLength={3}
                />
            </View>
        </View>

      </ScrollView>

      <View style={s.footer}>
        <SolidButton 
            text={processing ? "PROCESSANDO..." : `PAGAR R$ ${total?.toFixed(2).replace('.', ',')}`} 
            onPress={processing ? null : handlePayment} 
            style={{ opacity: processing ? 0.7 : 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  cardPreview: { backgroundColor: '#1f1f1f', padding: 20, borderRadius: 12, marginBottom: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  cardLabel: { color: '#aaa', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  secureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 167, 157, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  secureText: { color: '#00A79D', fontSize: 12, marginLeft: 5 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 15 },
  row: { flexDirection: 'row' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#1f1f1f' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  successBox: { width: '80%', backgroundColor: '#1f1f1f', padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20 },
  successSub: { color: '#aaa', fontSize: 16, marginTop: 5, textAlign: 'center' },
});

export default PaymentScreen;