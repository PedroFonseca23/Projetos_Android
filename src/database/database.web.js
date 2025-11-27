// src/database/database.web.js
// Banco de Dados Web: Limpo e Pronto para Uso

const isWeb = true;

// MUDANÇA AQUI: Alterei para 'v2' para forçar uma limpeza nos dados antigos do navegador
const STORAGE_KEY = '@app_quadros_db_v2';

// --- SISTEMA DE ARMAZENAMENTO ---

const loadDb = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Erro ao ler localStorage", e);
  }
  
  // DADOS INICIAIS (Agora vazios)
  return {
    users: [],
    products: [], // <--- Começa vazio, sem exemplos!
    cart: [],
    analytics: []
  };
};

// Variável global que segura os dados na memória
let dbData = loadDb();

// Salva o estado atual no navegador
const saveDb = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e);
  }
};

// --- FUNÇÕES DE EXPORTAR E IMPORTAR (BACKUP) ---

export const exportFullDatabase = async () => {
  return JSON.stringify(dbData);
};

export const importFullDatabase = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.users && data.products && data.cart) {
      dbData = data;
      saveDb();
      return true;
    } else {
      console.error("Arquivo inválido: Faltam chaves principais.");
      return false;
    }
  } catch (e) {
    console.error("Erro ao importar JSON", e);
    return false;
  }
};

// --- FUNÇÕES PADRÃO ---

export const initDatabase = async () => {
  console.log("💾 [WEB] Banco de Dados Limpo Iniciado (v2).");
  return true;
};

// --- USUÁRIOS ---

export const addUser = async (name, email, phone, password) => {
  if (dbData.users.find(u => u.email === email)) {
    throw new Error('UNIQUE constraint failed: users.email');
  }
  const newUser = {
    id: String(Date.now()),
    name,
    email,
    phone,
    password, 
    role: email.includes('admin') ? 'admin' : 'user'
  };
  dbData.users.push(newUser);
  saveDb();
  return true;
};

export const loginUser = async (email, password) => {
  const user = dbData.users.find(u => u.email === email && u.password === password);
  if (user) return user;
  
  // Mantive o admin de emergência para facilitar os teus testes
  if (email === 'admin@teste.com' && password === '123456') {
     return { id: 'web-admin', name: 'Admin Web', role: 'admin' };
  }
  return null;
};

// --- PRODUTOS ---

export const addProduct = async (title, price, width, height, imageUri, userId) => {
  const newProduct = {
    id: String(Date.now()), 
    title,
    price,
    width: String(width),
    height: String(height),
    imageUri,
    userId
  };
  
  dbData.products.unshift(newProduct);
  saveDb();
  return true;
};

export const updateProduct = async (id, title, price, width, height, imageUri) => {
  const index = dbData.products.findIndex(p => p.id === id);
  if (index !== -1) {
    dbData.products[index] = { ...dbData.products[index], title, price, width, height, imageUri };
    saveDb();
  }
};

export const deleteProduct = async (productId) => {
  dbData.products = dbData.products.filter(p => p.id !== productId);
  dbData.cart = dbData.cart.filter(item => item.productId !== productId);
  saveDb();
};

export const getProducts = async () => {
  return [...dbData.products];
};

export const logProductView = async (productId, userId) => {
  dbData.analytics.push({ id: String(Date.now()), productId, userId, timestamp: Date.now() });
  saveDb();
};

export const getDashboardStats = async () => {
    const productViews = {};
    dbData.analytics.forEach(a => {
        productViews[a.productId] = (productViews[a.productId] || 0) + 1;
    });

    const popularProducts = dbData.products.map(p => ({
        title: p.title,
        viewCount: productViews[p.id] || 0
    })).sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

    return { 
        totalViews: dbData.analytics.length, 
        totalProducts: dbData.products.length, 
        totalUsers: dbData.users.length, 
        popularProducts 
    };
};

// --- CARRINHO ---

export const addToCart = async (userId, productId) => {
  const product = dbData.products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = dbData.cart.find(item => item.userId === userId && item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    dbData.cart.push({
      cartId: String(Date.now()),
      userId,
      productId,
      quantity: 1,
      ...product
    });
  }
  saveDb();
};

export const removeFromCart = async (cartItemId) => {
  dbData.cart = dbData.cart.filter(item => item.cartId !== cartItemId);
  saveDb();
};

export const getCartItems = async (userId) => {
  return dbData.cart.filter(item => item.userId === userId);
};

export const clearCart = async (userId) => {
  dbData.cart = dbData.cart.filter(item => item.userId !== userId);
  saveDb();
};

// --- SETTINGS ---
export const getAppSetting = async (key) => null;
export const setAppSetting = async (key, value) => {};

export default {
  initDatabase,
  addUser,
  loginUser,
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  logProductView,
  getDashboardStats,
  addToCart,
  removeFromCart,
  getCartItems,
  clearCart,
  getAppSetting,
  setAppSetting,
  exportFullDatabase, 
  importFullDatabase
};