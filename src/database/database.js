import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

const db = SQLite.openDatabaseSync('projetoquadros-v3.db');

const ADMIN_EMAIL = 'admin@projetoquadros.com';

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      price TEXT,
      imageUri TEXT,
      userId TEXT NOT NULL,
      width REAL,
      height REAL,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
    CREATE TABLE IF NOT EXISTS product_analytics (
      id TEXT PRIMARY KEY NOT NULL,
      productId TEXT NOT NULL,
      viewedByUserId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (productId) REFERENCES products (id),
      FOREIGN KEY (viewedByUserId) REFERENCES users (id)
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    );
  `);
  
  await db.runAsync("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('heroTitle', 'Bem vindo')");
  await db.runAsync("INSERT OR IGNORE INTO app_settings (key, value) VALUES ('heroSubtitle', 'Obras de arte que transformam ambientes.')");
};

const hashPassword = async (password) => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
};

export const addUser = async (name, email, phone, password) => {
  const id = Crypto.randomUUID();
  const hashedPassword = await hashPassword(password);
  
  const role = (email.toLowerCase() === ADMIN_EMAIL) ? 'admin' : 'user';
  
  await db.runAsync(
    'INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
    id, name, email, phone, hashedPassword, role
  );
};

export const loginUser = async (email, password) => {
  const hashedPassword = await hashPassword(password);
  
  const user = await db.getFirstAsync(
    'SELECT * FROM users WHERE email = ? AND password_hash = ?',
    email,
    hashedPassword
  );
  
  return user;
};

export const addProduct = async (title, price, width, height, imageUri, userId) => {
  const id = Crypto.randomUUID();
  await db.runAsync(
    'INSERT INTO products (id, title, price, width, height, imageUri, userId) VALUES (?, ?, ?, ?, ?, ?, ?)',
    id, title, price, width, height, imageUri, userId
  );
};

export const updateProduct = async (id, title, price, width, height, imageUri) => {
  await db.runAsync(
    'UPDATE products SET title = ?, price = ?, width = ?, height = ?, imageUri = ? WHERE id = ?',
    title, price, width, height, imageUri, id
  );
};

export const deleteProduct = async (productId) => {
  await db.runAsync('DELETE FROM product_analytics WHERE productId = ?', productId);
  await db.runAsync('DELETE FROM products WHERE id = ?', productId);
};

export const getProducts = async () => {
  const allRows = await db.getAllAsync('SELECT * FROM products ORDER BY id DESC');
  return allRows;
};

export const logProductView = async (productId, userId) => {
  const id = Crypto.randomUUID();
  const timestamp = Date.now();
  await db.runAsync(
    'INSERT INTO product_analytics (id, productId, viewedByUserId, timestamp) VALUES (?, ?, ?, ?)',
    id, productId, userId, timestamp
  );
};

export const getAppSetting = async (key) => {
  const setting = await db.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', key);
  return setting ? setting.value : null;
};

export const setAppSetting = async (key, value) => {
  await db.runAsync('UPDATE app_settings SET value = ? WHERE key = ?', value, key);
};

export const getDashboardStats = async () => {
  const totalViews = await db.getFirstAsync('SELECT COUNT(*) as count FROM product_analytics');
  const totalProducts = await db.getFirstAsync('SELECT COUNT(*) as count FROM products');
  const totalUsers = await db.getFirstAsync('SELECT COUNT(*) as count FROM users');
  
  const popularProducts = await db.getAllAsync(`
    SELECT p.title, COUNT(a.id) as viewCount
    FROM products p
    JOIN product_analytics a ON p.id = a.productId
    GROUP BY p.title
    ORDER BY viewCount DESC
    LIMIT 5
  `);

  return {
    totalViews: totalViews.count,
    totalProducts: totalProducts.count,
    totalUsers: totalUsers.count,
    popularProducts: popularProducts,
  };
};

export default db;