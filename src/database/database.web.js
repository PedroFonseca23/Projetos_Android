const isWeb = true;
const STORAGE_KEY = '@app_quadros_db_v5';

const loadDb = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { users: [], products: [], cart: [], analytics: [], sales: [], custom_orders: [] };
};

let dbData = loadDb();
const saveDb = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData)); } catch (e) {} };

export const initDatabase = async () => { console.log("💾 [WEB] Banco v5 Iniciado."); return true; };

export const addUser = async (name, email, phone, password) => {
  if (dbData.users.find(u => u.email === email)) throw new Error('Email em uso');
  dbData.users.push({ id: String(Date.now()), name, email, phone, password, role: email.includes('admin') ? 'admin' : 'user' });
  saveDb();
};

export const loginUser = async (email, password) => { return dbData.users.find(u => u.email === email && u.password === password) || (email === 'admin@teste.com' && password === '123456' ? { id: 'web-admin', name: 'Admin', role: 'admin' } : null); };

export const checkEmail = async (email) => {
    return !!dbData.users.find(u => u.email === email);
};

export const addProduct = async (title, price, width, height, imageUri, userId) => { dbData.products.unshift({ id: String(Date.now()), title, price, width, height, imageUri, userId, status: 'available' }); saveDb(); return true; };
export const updateProduct = async (id, title, price, width, height, imageUri) => { const idx = dbData.products.findIndex(p => p.id === id); if (idx !== -1) { dbData.products[idx] = { ...dbData.products[idx], title, price, width, height, imageUri }; saveDb(); } };
export const deleteProduct = async (id) => { dbData.products = dbData.products.filter(p => p.id !== id); saveDb(); };
export const getProducts = async () => dbData.products.filter(p => p.status === 'available');
export const addToCart = async (userId, productId) => { const product = dbData.products.find(p => p.id === productId); if (!product || product.status === 'sold') return false; const exists = dbData.cart.find(item => item.userId === userId && item.productId === productId); if (exists) return false; dbData.cart.push({ cartId: String(Date.now()) + Math.random(), userId, productId, quantity: 1, ...product }); saveDb(); return true; };
export const removeFromCart = async (cartItemId) => { dbData.cart = dbData.cart.filter(item => item.cartId !== cartItemId); saveDb(); };
export const getCartItems = async (userId) => { return dbData.cart.filter(item => item.userId === userId).map(item => ({ cart_item_id: item.cartId, product_id: item.productId, quantity: 1, title: item.title, price: item.price, imageUri: item.imageUri })); };
export const clearCart = async (userId) => { dbData.cart = dbData.cart.filter(item => item.userId !== userId); saveDb(); };
export const processOrder = async (userId, total, cartItems) => { dbData.sales.push({ id: String(Date.now()), userId, totalAmount: total, date: Date.now(), itemsJson: JSON.stringify(cartItems) }); cartItems.forEach(c => { const p = dbData.products.find(prod => prod.id === c.product_id); if (p) p.status = 'sold'; }); dbData.cart = dbData.cart.filter(item => item.userId !== userId); saveDb(); return true; };
export const getDashboardStats = async () => { 
    const totalViews = dbData.analytics.length;
    const totalProducts = dbData.products.filter(p => p.status === 'available').length;
    const totalSold = dbData.products.filter(p => p.status === 'sold').length;
    const totalUsers = dbData.users.length;
    const totalRevenue = dbData.sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const viewsMap = {}; dbData.analytics.forEach(a => { viewsMap[a.productId] = (viewsMap[a.productId] || 0) + 1; });
    const popularProducts = dbData.products.map(p => ({ title: p.title, viewCount: viewsMap[p.id] || 0 })).sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    const salesHistory = dbData.sales.map(s => ({ totalAmount: s.totalAmount, date: s.date }));
    return { totalViews, totalProducts, totalSold, totalUsers, totalRevenue, popularProducts, salesHistory };
};
export const logProductView = async (pid, uid) => { dbData.analytics.push({ id: String(Date.now()), productId: pid, viewedByUserId: uid, timestamp: Date.now() }); saveDb(); };
export const exportFullDatabase = async () => JSON.stringify(dbData);
export const importFullDatabase = async (json) => { try { dbData = JSON.parse(json); saveDb(); return true; } catch (e) { return false; } };
export const getAppSetting = async () => null;
export const setAppSetting = async () => {};
export const createCustomOrder = async (userId, imageUri, width, height, description, address) => { dbData.custom_orders.unshift({ id: String(Date.now()), userId, imageUri, width, height, description, address, status: 'pending', date: Date.now() }); saveDb(); return true; };
export const getUserOrders = async (userId) => { return dbData.custom_orders.filter(o => o.userId === userId); };
export const getPendingOrders = async () => { return dbData.custom_orders.filter(o => o.status === 'pending').map(o => { const u = dbData.users.find(user => user.id === o.userId); return { ...o, userName: u?.name || 'Cliente', userEmail: u?.email || '---' }; }); };
export const replyToOrder = async (orderId, price, deliveryFee) => { const idx = dbData.custom_orders.findIndex(o => o.id === orderId); if (idx !== -1) { dbData.custom_orders[idx].status = 'quoted'; dbData.custom_orders[idx].adminPrice = price; dbData.custom_orders[idx].deliveryFee = deliveryFee; saveDb(); } return true; };
export const updateCustomOrderStatus = async (orderId, status) => { const idx = dbData.custom_orders.findIndex(o => o.id === orderId); if (idx !== -1) { dbData.custom_orders[idx].status = status; saveDb(); } return true; };

export default {
  initDatabase, addUser, loginUser, checkEmail, addProduct, updateProduct, deleteProduct, getProducts,
  addToCart, removeFromCart, getCartItems, clearCart, processOrder,
  getDashboardStats, logProductView, exportFullDatabase, importFullDatabase,
  getAppSetting, setAppSetting, createCustomOrder, getUserOrders, getPendingOrders, replyToOrder, updateCustomOrderStatus
};