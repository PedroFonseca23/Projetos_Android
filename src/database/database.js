import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

const DB_NAME = 'projetoquadros-v7.db';

const db = SQLite.openDatabaseSync(DB_NAME);

const ADMIN_EMAIL = 'admin@projetoquadros.com';

export const initDatabase = async () => {
  console.log(`📂 DB Mobile: ${FileSystem.documentDirectory}SQLite/${DB_NAME}`);
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, name TEXT, email TEXT NOT NULL UNIQUE, phone TEXT, password_hash TEXT, role TEXT DEFAULT 'user');
      CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY NOT NULL, title TEXT, price TEXT, imageUri TEXT, userId TEXT, width TEXT, height TEXT);
      CREATE TABLE IF NOT EXISTS product_analytics (id TEXT PRIMARY KEY NOT NULL, productId TEXT, viewedByUserId TEXT, timestamp INTEGER);
      CREATE TABLE IF NOT EXISTS cart_items (id TEXT PRIMARY KEY NOT NULL, userId TEXT, productId TEXT, quantity INTEGER DEFAULT 1);
      CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT);
    `);
    return true;
  } catch (error) {
    console.error("❌ Erro DB:", error);
    return false;
  }
};

const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
};

// --- FUNÇÕES DE EXPORTAR E IMPORTAR (O SEGREDO!) ---

export const exportFullDatabase = async () => {
  // 1. Pega todos os dados das tabelas
  const users = await db.getAllAsync('SELECT * FROM users');
  const products = await db.getAllAsync('SELECT * FROM products');
  const cart = await db.getAllAsync('SELECT * FROM cart_items');
  const analytics = await db.getAllAsync('SELECT * FROM product_analytics');

  // 2. Cria um objeto único (Igual ao da Web)
  const fullData = {
    users,
    products,
    cart,
    analytics
  };

  // 3. Retorna como texto JSON
  return JSON.stringify(fullData);
};

export const importFullDatabase = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    if (!data.users || !data.products) {
      return false; // Arquivo inválido
    }

    // 4. Limpa o banco atual e insere os novos dados
    // Atenção: Isso apaga o que está no celular para colocar o backup!
    await db.runAsync('DELETE FROM users');
    await db.runAsync('DELETE FROM products');
    await db.runAsync('DELETE FROM cart_items');
    await db.runAsync('DELETE FROM product_analytics');

    // Inserir Usuários
    for (const u of data.users) {
      await db.runAsync('INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', 
        [u.id, u.name, u.email, u.phone, u.password_hash, u.role]);
    }
    // Inserir Produtos
    for (const p of data.products) {
      await db.runAsync('INSERT INTO products (id, title, price, width, height, imageUri, userId) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [p.id, p.title, p.price, p.width, p.height, p.imageUri, p.userId]);
    }
    // Inserir Carrinho
    if (data.cart) {
        for (const c of data.cart) {
            await db.runAsync('INSERT INTO cart_items (id, userId, productId, quantity) VALUES (?, ?, ?, ?)', 
                [c.id || Crypto.randomUUID(), c.userId, c.productId, c.quantity]);
        }
    }

    return true;
  } catch (e) {
    console.error("Erro import:", e);
    return false;
  }
};

// --- FUNÇÕES NORMAIS DO APP ---

export const addUser = async (name, email, phone, password) => {
  const id = Crypto.randomUUID();
  const hashedPassword = await hashPassword(password);
  const role = (email.trim().toLowerCase() === ADMIN_EMAIL) ? 'admin' : 'user';
  await db.runAsync('INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)', [id, name, email, phone, hashedPassword, role]);
};

export const loginUser = async (email, password) => {
  const hashedPassword = await hashPassword(password);
  return await db.getFirstAsync('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hashedPassword]);
};

export const addProduct = async (title, price, width, height, imageUri, userId) => {
  const id = Crypto.randomUUID();
  await db.runAsync('INSERT INTO products (id, title, price, width, height, imageUri, userId) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [id, title, price, String(width), String(height), imageUri, userId]);
  return true;
};

export const updateProduct = async (id, title, price, width, height, imageUri) => {
  await db.runAsync('UPDATE products SET title = ?, price = ?, width = ?, height = ?, imageUri = ? WHERE id = ?', 
    [title, price, String(width), String(height), imageUri, id]);
};

export const deleteProduct = async (productId) => {
  await db.runAsync('DELETE FROM product_analytics WHERE productId = ?', [productId]);
  await db.runAsync('DELETE FROM cart_items WHERE productId = ?', [productId]);
  await db.runAsync('DELETE FROM products WHERE id = ?', [productId]);
};

export const getProducts = async () => {
  return await db.getAllAsync('SELECT * FROM products ORDER BY id DESC');
};

export const logProductView = async (productId, userId) => {
  const id = Crypto.randomUUID();
  await db.runAsync('INSERT INTO product_analytics (id, productId, viewedByUserId, timestamp) VALUES (?, ?, ?, ?)', [id, productId, userId, Date.now()]);
};

export const getDashboardStats = async () => {
  try {
    const totalViewsObj = await db.getFirstAsync('SELECT COUNT(*) as count FROM product_analytics');
    const totalProductsObj = await db.getFirstAsync('SELECT COUNT(*) as count FROM products');
    const totalUsersObj = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');
    const popularProducts = await db.getAllAsync(`SELECT p.title, COUNT(a.id) as viewCount FROM products p JOIN product_analytics a ON p.id = a.productId GROUP BY p.title ORDER BY viewCount DESC LIMIT 5`);
    return {
      totalViews: totalViewsObj?.count || 0,
      totalProducts: totalProductsObj?.count || 0,
      totalUsers: totalUsersObj?.count || 0,
      popularProducts: popularProducts || [],
    };
  } catch (e) { return { totalViews: 0, totalProducts: 0, totalUsers: 0, popularProducts: [] }; }
};

export const addToCart = async (userId, productId) => {
  const existingItem = await db.getFirstAsync('SELECT * FROM cart_items WHERE userId = ? AND productId = ?', [userId, productId]);
  if (existingItem) {
    await db.runAsync('UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?', [existingItem.id]);
  } else {
    const id = Crypto.randomUUID();
    await db.runAsync('INSERT INTO cart_items (id, userId, productId, quantity) VALUES (?, ?, ?, ?)', [id, userId, productId, 1]);
  }
};

export const removeFromCart = async (cartItemId) => {
  await db.runAsync('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
};

export const getCartItems = async (userId) => {
  return await db.getAllAsync(`SELECT c.id as cartId, c.quantity, p.* FROM cart_items c JOIN products p ON c.productId = p.id WHERE c.userId = ?`, [userId]);
};

export const clearCart = async (userId) => {
  await db.runAsync('DELETE FROM cart_items WHERE userId = ?', [userId]);
};

export const getAppSetting = async (key) => {
  const setting = await db.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', [key]);
  return setting ? setting.value : null;
};

export const setAppSetting = async (key, value) => {
  await db.runAsync('UPDATE app_settings SET value = ? WHERE key = ?', [value, key]);
};

export default db;