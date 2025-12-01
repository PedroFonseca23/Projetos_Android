import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import PaymentScreen from './src/screens/PaymentScreen';
import { initDatabase } from './src/database/database';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import SelectEditScreen from './src/screens/SelectEditScreen';
import MoreScreen from './src/screens/MoreScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import Toast from './src/components/Toast';
import CustomOrderScreen from './src/screens/CustomOrderScreen';
import AdminOrdersScreen from './src/screens/AdminOrdersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070',
  'https://images.unsplash.com/photo-1569172102373-d56b0264177b?q=80&w=2027',
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1919',
];

const AuthBackground = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; 
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 1500, useNativeDriver: true }).start(() => {
        setImgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
        fadeAnim.setValue(1);
      });
    }, 6000); 
    return () => clearInterval(interval);
  }, []);
  const currentImg = { uri: BACKGROUND_IMAGES[imgIndex] };
  const nextIndex = (imgIndex + 1) % BACKGROUND_IMAGES.length;
  const nextImg = { uri: BACKGROUND_IMAGES[nextIndex] };
  return (
    <View style={StyleSheet.absoluteFill}>
      <ImageBackground source={nextImg} resizeMode="cover" style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <ImageBackground source={currentImg} resizeMode="cover" style={StyleSheet.absoluteFill} />
      </Animated.View>
      <View style={{...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)'}} />
    </View>
  );
};

function AuthNavigator({ onLoginSuccess, showToast }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
      <AuthBackground />
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="Login">
          {props => <View style={s.authContainer}><LoginScreen {...props} onLoginSuccess={onLoginSuccess} showAlert={(msg) => showToast(msg, 'alert')} /></View>}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {props => <View style={s.authContainer}><RegisterScreen {...props} showAlert={(msg) => showToast(msg, 'alert')} showSuccess={(msg) => showToast(msg, 'success')} /></View>}
        </Stack.Screen>
      </Stack.Navigator>
    </KeyboardAvoidingView>
  );
}

const CatalogStackContent = ({ userId, userRole }) => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: theme.card, shadowColor: 'transparent', elevation: 0 }, 
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
        cardStyle: { backgroundColor: theme.background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
      }}
    >
      <Stack.Screen name="CatalogList" component={CatalogScreen} options={{ headerShown: false }} initialParams={{ userId, userRole }} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ title: 'Detalhes' }} initialParams={{ userId }} />
      <Stack.Screen name="CartScreen" component={CartScreen} options={{ title: 'Carrinho', headerShown: false }} initialParams={{ userId }} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ title: 'Pagamento', cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS }} />
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Adicionar Quadro' }} initialParams={{ userId }} />
      <Stack.Screen name="SelectEditScreen" component={SelectEditScreen} options={{ title: 'Gerenciar Quadros' }} initialParams={{ userId, userRole }} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Editar' }} />
    </Stack.Navigator>
  );
};

function CatalogStackNavigator({ userId, userRole }) { return <CatalogStackContent userId={userId} userRole={userRole} />; }

function MoreStackNavigator({ userId, userRole, onLogout }) {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.card }, headerTintColor: theme.text, cardStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="MoreList" component={MoreScreen} options={{ headerShown: false }} initialParams={{ userId, userRole, onLogout }} />
      {/* ADICIONADO AQUI PARA CORRIGIR O ERRO DE NAVEGAÇÃO */}
      <Stack.Screen name="CustomOrderScreen" component={CustomOrderScreen} options={{ title: 'Pedido Personalizado', headerShown: false }} />
      <Stack.Screen name="AdminOrdersScreen" component={AdminOrdersScreen} options={{ title: 'Pedidos Recebidos', headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainTabNavigator({ userId, userRole, onLogout }) {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Catálogo') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Mais') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60, paddingBottom: 10, elevation: 0, shadowOpacity: 0 },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Catálogo">
        {() => <CatalogStackNavigator userId={userId} userRole={userRole} />}
      </Tab.Screen>
      <Tab.Screen name="Mais">
        {() => <MoreStackNavigator userId={userId} userRole={userRole} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isDbReady, setIsDbReady] = useState(false); 
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => { setToastMsg(msg); setToastType(type); };

  useEffect(() => {
    const startApp = async () => {
      const success = await initDatabase();
      if (success) setIsDbReady(true); 
    };
    startApp();
  }, []);

  if (!isDbReady) {
    return (
      <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#00A79D" />
        <Text style={{color: '#fff', marginTop: 20}}>Preparando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          {!userToken ? (
              <AuthNavigator onLoginSuccess={(user) => { setUserToken(user.id); setUserRole(user.role); }} showToast={showToast} />
          ) : (
              <MainTabNavigator userId={userToken} userRole={userRole} onLogout={() => setUserToken(null)} />
          )}
          <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  authContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
});