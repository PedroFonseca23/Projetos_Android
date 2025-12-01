import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const DB_NAME = 'projetoquadros-v13.db';

const db = SQLite.openDatabaseSync(DB_NAME);

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, name TEXT, email TEXT NOT NULL UNIQUE, phone TEXT, password_hash TEXT, role TEXT DEFAULT 'user');
      CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, title TEXT, price TEXT, imageUri TEXT, userId TEXT, width TEXT, height TEXT, status TEXT DEFAULT 'available');
      CREATE TABLE IF NOT EXISTS product_analytics (id TEXT PRIMARY KEY NOT NULL, productId TEXT, viewedByUserId TEXT, timestamp INTEGER);
      CREATE TABLE IF NOT EXISTS cart_items (id TEXT PRIMARY KEY NOT NULL, userId TEXT, productId TEXT, quantity INTEGER DEFAULT 1);
      CREATE TABLE IF NOT EXISTS sales (id TEXT PRIMARY KEY NOT NULL, userId TEXT, totalAmount REAL, date INTEGER, itemsJson TEXT);
      CREATE TABLE IF NOT EXISTS custom_orders (id TEXT PRIMARY KEY NOT NULL, userId TEXT, imageUri TEXT, width TEXT, height TEXT, description TEXT, address TEXT, status TEXT DEFAULT 'pending', adminPrice TEXT, deliveryFee TEXT, date INTEGER);
    `);
    return true;
  } catch (error) {
    return false;
  }
};

export const exportFullDatabase = async () => { return JSON.stringify({}); };
export const importFullDatabase = async (json) => { return true; };

export const addUser = async (name, email, phone, pw) => {
    const id = Crypto.randomUUID();
    const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pw);
    const role = (email.includes('admin')) ? 'admin' : 'user';
    await db.runAsync('INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [id, name, email, phone, hashedPassword, role]);
};

export const loginUser = async (email, pw) => {
    const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pw);
    return await db.getFirstAsync('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hashedPassword]);
};

export const checkEmail = async (email) => {
    const user = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
    return !!user;
};

export const addProduct = async (title, price, width, height, imageUri, userId) => {
  const id = Crypto.randomUUID();
  await db.runAsync('INSERT INTO products (id, title, price, width, height, imageUri, userId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, title, price, String(width), String(height), imageUri, userId, 'available']);
};

export const updateProduct = async (id, title, price, width, height, imageUri) => { 
    await db.runAsync('UPDATE products SET title = ?, price = ?, width = ?, height = ?, imageUri = ? WHERE id = ?', [title, price, String(width), String(height), imageUri, id]); 
};

export const deleteProduct = async (productId) => { 
    await db.runAsync('DELETE FROM products WHERE id = ?', [productId]); 
};

export const getProducts = async () => { 
    return await db.getAllAsync("SELECT * FROM products WHERE status = 'available' ORDER BY id DESC"); 
};

export const logProductView = async (pid, uid) => { 
    const id = Crypto.randomUUID(); 
    await db.runAsync('INSERT INTO product_analytics (id, productId, viewedByUserId, timestamp) VALUES (?, ?, ?, ?)', [id, pid, uid, Date.now()]); 
};

export const addToCart = async (userId, productId) => {
  const prod = await db.getFirstAsync("SELECT status FROM products WHERE id = ?", [productId]);
  if (prod && prod.status === 'sold') return false;
  const existingItem = await db.getFirstAsync('SELECT * FROM cart_items WHERE userId = ? AND productId = ?', [userId, productId]);
  if (existingItem) return false;
  const id = Crypto.randomUUID();
  await db.runAsync('INSERT INTO cart_items (id, userId, productId, quantity) VALUES (?, ?, ?, ?)', [id, userId, productId, 1]);
  return true;
};

export const removeFromCart = async (cartItemId) => { 
    await db.runAsync('DELETE FROM cart_items WHERE id = ?', [cartItemId]); 
};

export const getCartItems = async (userId) => { 
    return await db.getAllAsync(`SELECT c.id as cart_item_id, c.quantity, p.id as product_id, p.title, p.price, p.imageUri FROM cart_items c JOIN products p ON c.productId = p.id WHERE c.userId = ?`, [userId]); 
};

export const clearCart = async (userId) => { 
    await db.runAsync('DELETE FROM cart_items WHERE userId = ?', [userId]); 
};

export const processOrder = async (userId, total, cartItems) => {
    const saleId = Crypto.randomUUID();
    const date = Date.now();
    const itemsJson = JSON.stringify(cartItems);
    try {
        await db.runAsync('INSERT INTO sales (id, userId, totalAmount, date, itemsJson) VALUES (?, ?, ?, ?, ?)', [saleId, userId, total, date, itemsJson]);
        for (let item of cartItems) { if (item.product_id) await db.runAsync("UPDATE products SET status = 'sold' WHERE id = ?", [item.product_id]); }
        await db.runAsync('DELETE FROM cart_items WHERE userId = ?', [userId]);
        return true;
    } catch (e) { return false; }
};

export const getDashboardStats = async () => {
    try {
        const totalViewsObj = await db.getFirstAsync('SELECT COUNT(*) as count FROM product_analytics');
        const totalProductsObj = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE status = 'available'");
        const totalSoldObj = await db.getFirstAsync("SELECT COUNT(*) as count FROM products WHERE status = 'sold'");
        const totalUsersObj = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');
        const revenueObj = await db.getFirstAsync('SELECT SUM(totalAmount) as total FROM sales');
        const popularProducts = await db.getAllAsync(`SELECT p.title, COUNT(a.id) as viewCount FROM products p JOIN product_analytics a ON p.id = a.productId GROUP BY p.title ORDER BY viewCount DESC LIMIT 5`);
        const allSales = await db.getAllAsync('SELECT totalAmount, date FROM sales ORDER BY date ASC');
        return {
            totalViews: totalViewsObj?.count || 0,
            totalProducts: totalProductsObj?.count || 0,
            totalSold: totalSoldObj?.count || 0,
            totalUsers: totalUsersObj?.count || 0,
            totalRevenue: revenueObj?.total || 0,
            popularProducts: popularProducts || [],
            salesHistory: allSales || []
        };
    } catch (e) { return null; }
};

export const createCustomOrder = async (userId, imageUri, width, height, description, address) => {
    const id = Crypto.randomUUID();
    const date = Date.now();
    await db.runAsync('INSERT INTO custom_orders (id, userId, imageUri, width, height, description, address, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, userId, imageUri, width, height, description, address, date]);
    return true;
};

export const getUserOrders = async (userId) => { 
    return await db.getAllAsync('SELECT * FROM custom_orders WHERE userId = ? ORDER BY date DESC', [userId]); 
};

export const getPendingOrders = async () => { 
    return await db.getAllAsync(`SELECT co.*, u.name as userName, u.email as userEmail FROM custom_orders co JOIN users u ON co.userId = u.id WHERE co.status = 'pending' ORDER BY co.date DESC`); 
};

export const replyToOrder = async (orderId, price, deliveryFee) => { 
    await db.runAsync("UPDATE custom_orders SET status = 'quoted', adminPrice = ?, deliveryFee = ? WHERE id = ?", [price, deliveryFee, orderId]); return true; 
};

export const updateCustomOrderStatus = async (orderId, status) => { 
    await db.runAsync("UPDATE custom_orders SET status = ? WHERE id = ?", [status, orderId]); return true; 
};

export const getAppSetting = async (key) => null;
export const setAppSetting = async (key, value) => {};

export default db;