// IndexedDB 数据库层 - 本地数据持久化
const DB_NAME = 'AutoBillingDB';
const DB_VERSION = 1;

let dbInstance = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 交易记录表
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('category', 'category', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
      }

      // 分类表
      if (!db.objectStoreNames.contains('categories')) {
        const catStore = db.createObjectStore('categories', { keyPath: 'id' });
        catStore.createIndex('type', 'type', { unique: false });
      }

      // 预算表
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'id' });
      }

      // 设置表
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

// 通用 CRUD 操作
export async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function add(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function put(storeName, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSetting(key) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result ? request.result.value : null);
    request.onerror = () => resolve(null);
  });
}

export async function setSetting(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// 初始化默认分类
const DEFAULT_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'UtensilsCrossed', type: 'expense', color: '#f97316' },
  { id: 'transport', name: '交通', icon: 'Car', type: 'expense', color: '#3b82f6' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', type: 'expense', color: '#ec4899' },
  { id: 'entertainment', name: '娱乐', icon: 'Gamepad2', type: 'expense', color: '#8b5cf6' },
  { id: 'housing', name: '住房', icon: 'Home', type: 'expense', color: '#14b8a6' },
  { id: 'utilities', name: '水电', icon: 'Zap', type: 'expense', color: '#eab308' },
  { id: 'health', name: '医疗', icon: 'HeartPulse', type: 'expense', color: '#ef4444' },
  { id: 'education', name: '教育', icon: 'BookOpen', type: 'expense', color: '#6366f1' },
  { id: 'communication', name: '通讯', icon: 'Phone', type: 'expense', color: '#06b6d4' },
  { id: 'other_expense', name: '其他支出', icon: 'MoreHorizontal', type: 'expense', color: '#64748b' },
  { id: 'salary', name: '工资', icon: 'Briefcase', type: 'income', color: '#22c55e' },
  { id: 'investment', name: '投资', icon: 'TrendingUp', type: 'income', color: '#10b981' },
  { id: 'other_income', name: '其他收入', icon: 'PlusCircle', type: 'income', color: '#84cc16' },
];

export async function initDefaultData() {
  const db = await openDB();
  const existing = await getAll('categories');
  if (existing.length === 0) {
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    for (const cat of DEFAULT_CATEGORIES) {
      store.add(cat);
    }
    await new Promise((resolve) => { tx.oncomplete = resolve; });
  }
}
