// โหลดสคริปต์ "ข้อมูล" จากโฟลเดอร์หลัก ../js/
// ปรับรายชื่อให้ตรงกับโปรเจกต์จริงของคุณในโฟลเดอร์ www/js (ดูจากภาพ)
const CORE_DATA_JS = [
  '../js/user.js',
  '../js/item_clothes.js',
  '../js/item_tools.js',
  '../js/order-management.js',
  // เพิ่มไฟล์อื่น ๆ ที่ประกาศข้อมูล/ฟังก์ชันที่ต้องใช้ในแอดมินได้ที่นี่
];

export async function loadDataScripts() {
  for (const src of CORE_DATA_JS) {
    await inject(src);
  }
}

function inject(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false; // ต้องการลำดับ
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('load failed: ' + src));
    document.head.appendChild(s);
  });
}
