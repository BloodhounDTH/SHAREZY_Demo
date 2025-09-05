// รวมข้อมูลจากไฟล์ ../js/* ให้ใช้ในแอดมินแบบเดียวกัน
// รองรับหลายทรง (กันกรณีโปรเจกต์มี window.DB หรือฟังก์ชัน helper)
function safeParseLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

// Users
export function getUsers() {
  // โครงยอดฮิต: window.DB_USERS = [...]
  if (Array.isArray(window.DB_USERS)) return window.DB_USERS;

  // เผื่อใช้ DB.users
  if (window.DB && Array.isArray(window.DB.users)) return window.DB.users;

  return [];
}

// Products (รวมเสื้อผ้า + เครื่องมือจาก 2 ไฟล์)
export function getProductsAll() {
  const clothes = Array.isArray(window.ITEM_CLOTHES) ? window.ITEM_CLOTHES : [];
  const tools   = Array.isArray(window.ITEM_TOOLS)   ? window.ITEM_TOOLS   : [];
  return [...clothes, ...tools];
}

// Orders (ใช้ฟังก์ชันจาก order-management.js ถ้ามี)
export function getOrders() {
  if (typeof window.loadOrders === 'function') {
    try { return window.loadOrders(); } catch { /* fallthrough */ }
  }
  // fallback: ใช้ key เดิมที่โปรเจกต์คุณใช้เก็บ orders ใน LS
  return safeParseLS('s_orders', []);
}

export function saveOrderOverrides(map) {
  localStorage.setItem('s_product_overrides', JSON.stringify(map || {}));
}
export function getOrderOverrides() {
  return safeParseLS('s_product_overrides', {});
}
