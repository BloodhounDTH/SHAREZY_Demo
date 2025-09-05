import { initRouter } from './router.js';
import { setupErrorOverlay } from './utils.js';

function boot() {
  setupErrorOverlay();

  // ตรวจสิทธิ์ว่าเป็น admin หรือไม่
  const sUser = JSON.parse(localStorage.getItem('s_user') || 'null');
  if (!sUser || sUser.role !== 'admin') {
    alert('สำหรับผู้ดูแลระบบเท่านั้น');
    location.href = '../index.html';
    return;
  }

  console.log('[ADMIN] app.js loaded');

  // ปุ่มกลับหน้าแรก
  document.getElementById('btnBackHome')?.addEventListener('click', () => {
    location.href = '../index.html';
  });

  // เริ่ม Router
  initRouter();
}

// รันเมื่อ DOM โหลดเสร็จ
window.addEventListener('DOMContentLoaded', () => { boot(); });
