import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Animated, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SolidButton from '../components/SolidButton';
import { StyledInput } from '../components/Inputs'; 
import { processOrder, getCartItems, updateCustomOrderStatus } from '../database/database';
import { useTheme } from '../context/ThemeContext';

const PaymentScreen = ({ navigation, route }) => {
  const { total, userId, isCustom, orderId } = route.params || { total: 0 };
  const { theme, isDark } = useTheme();
  
  const [method, setMethod] = useState('credit'); // credit, debit, pix
  
  // Card States
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  
  // Address States
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // --- FORMATAÇÕES ---

  const handleExpiryChange = (text) => {
    // Remove tudo que não é número
    const clean = text.replace(/\D/g, '');
    
    // Formata MM/AA
    if (clean.length >= 2) {
      setExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setExpiry(clean);
    }
  };

  const handleCvvChange = (text) => {
    // Apenas números e no máximo 4 dígitos
    const clean = text.replace(/\D/g, '').slice(0, 4);
    setCvv(clean);
  };

  const handleCardNumberChange = (text) => {
    // Apenas números e no máximo 16 dígitos
    const clean = text.replace(/\D/g, '').slice(0, 16);
    setCardNumber(clean);
  };

  const handlePayment = async () => {
    if (method !== 'pix') {
        if (!name || !cardNumber || !expiry || !cvv || !cep || !address || !number) {
            Alert.alert('Atenção', 'Preencha todos os dados.');
            return;
        }
        // Validação simples de data
        if (expiry.length < 5) {
            Alert.alert('Erro', 'Data de validade inválida.');
            return;
        }
    }

    setProcessing(true);

    setTimeout(async () => {
        try {
            let successOrder = false;

            if (isCustom) {
                successOrder = await updateCustomOrderStatus(orderId, 'paid');
            } else {
                const cartItems = await getCartItems(userId);
                successOrder = await processOrder(userId, total, cartItems);
            }

            setProcessing(false);

            if (successOrder) {
                setSuccess(true);
                Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();

                setTimeout(() => {
                    setSuccess(false);
                    if (isCustom) {
                        navigation.goBack();
                        Alert.alert("Sucesso!", "Pagamento confirmado! Seu pedido entrou em produção.");
                    } else {
                        navigation.reset({ index: 0, routes: [{ name: 'CatalogList' }] });
                        Alert.alert("Sucesso!", "Compra realizada!");
                    }
                }, 2500);
            } else {
                Alert.alert("Erro", "Falha ao registrar venda.");
            }
        } catch (e) {
            setProcessing(false);
            Alert.alert("Erro", "Ocorreu um erro inesperado.");
        }
    }, 2000);
  };

  const PaymentTabs = () => (
      <View style={[s.tabs, { borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => setMethod('credit')} style={[s.tab, method === 'credit' && { backgroundColor: theme.primary }]}>
              <Text style={{ color: method === 'credit' ? '#fff' : theme.textSecondary, fontWeight: 'bold' }}>Crédito</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMethod('debit')} style={[s.tab, method === 'debit' && { backgroundColor: theme.primary }]}>
              <Text style={{ color: method === 'debit' ? '#fff' : theme.textSecondary, fontWeight: 'bold' }}>Débito</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMethod('pix')} style={[s.tab, method === 'pix' && { backgroundColor: theme.primary }]}>
              <Text style={{ color: method === 'pix' ? '#fff' : theme.textSecondary, fontWeight: 'bold' }}>Pix</Text>
          </TouchableOpacity>
      </View>
  );

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      
      <Modal visible={success} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.successBox, { backgroundColor: theme.card }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons name="checkmark-circle" size={100} color={theme.primary} />
            </Animated.View>
            <Text style={[s.successTitle, { color: theme.text }]}>Pagamento Aprovado!</Text>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={[s.headerTitle, { color: theme.text }]}>Checkout</Text>
        
        <PaymentTabs />

        {method === 'pix' ? (
            <View style={[s.pixContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="qr-code-outline" size={100} color={theme.text} />
                <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 10 }}>
                    Copie o código abaixo ou escaneie o QR Code para pagar.
                </Text>
                <View style={[s.pixCode, { backgroundColor: theme.background }]}>
                    <Text numberOfLines={1} style={{ color: theme.text, flex: 1 }}>00020126330014BR.GOV.BCB.PIX...</Text>
                    <Ionicons name="copy-outline" size={20} color={theme.primary} />
                </View>
            </View>
        ) : (
            <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>DADOS DO CARTÃO ({method === 'credit' ? 'Crédito' : 'Débito'})</Text>
                
                <StyledInput 
                    placeholder="Número do Cartão" 
                    keyboardType="numeric" 
                    value={cardNumber} 
                    onChange={handleCardNumberChange} 
                    maxLength={16}
                />
                
                <StyledInput 
                    placeholder="Nome Impresso" 
                    value={name} 
                    onChange={setName} 
                    autoCap="characters" 
                />
                
                <View style={s.row}>
                    <View style={{flex: 1, marginRight: 10}}>
                        <StyledInput 
                            placeholder="MM/AA" 
                            value={expiry} 
                            onChange={handleExpiryChange} 
                            maxLength={5} 
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{flex: 1}}>
                        <StyledInput 
                            placeholder="CVV" 
                            value={cvv} 
                            onChange={handleCvvChange} 
                            keyboardType="numeric" 
                            maxLength={4} 
                        />
                    </View>
                </View>
            </View>
        )}

        {method !== 'pix' && (
            <View style={s.section}>
                <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>ENDEREÇO</Text>
                <View style={s.row}>
                    <View style={{flex: 1.5, marginRight: 10}}>
                        <StyledInput placeholder="CEP" keyboardType="numeric" value={cep} onChange={setCep} maxLength={8} />
                    </View>
                    <View style={{flex: 1}}>
                        <StyledInput placeholder="Número" keyboardType="numeric" value={number} onChange={setNumber} />
                    </View>
                </View>
                <StyledInput placeholder="Rua / Bairro" value={address} onChange={setAddress} />
            </View>
        )}

        <View style={[s.totalContainer, { borderTopColor: theme.border }]}>
            <Text style={[s.totalLabel, { color: theme.text }]}>Total a pagar</Text>
            <Text style={[s.totalValue, { color: theme.primary }]}>R$ {total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        </View>

      </ScrollView>

      <View style={[s.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <SolidButton 
            text={processing ? "PROCESSANDO..." : method === 'pix' ? "JÁ PAGUEI NO PIX" : "FINALIZAR PEDIDO"} 
            onPress={processing ? null : handlePayment} 
            style={{ opacity: processing ? 0.7 : 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  tabs: { flexDirection: 'row', borderWidth: 1, borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  row: { flexDirection: 'row' },
  pixContainer: { padding: 30, alignItems: 'center', borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  pixCode: { flexDirection: 'row', padding: 10, borderRadius: 8, alignItems: 'center', width: '100%' },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 20, borderTopWidth: 1 },
  totalLabel: { fontSize: 18 },
  totalValue: { fontSize: 24, fontWeight: 'bold' },
  footer: { padding: 20, borderTopWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  successBox: { width: '80%', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 },
  successTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 20 },
});

export default PaymentScreen;