// modules/docs.js
// Document: รายการสัญญา + ค้นหา + เปิด "ฟอร์มสัญญาจริง" ผ่าน signature.js (โหมดแอดมินเหลือเฉพาะปุ่มพิมพ์)

const __rand = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const __money = n => (+n||0).toLocaleString();

// -------- Polyfills / Utils --------
function ensureSignatureLoaded() {
  return new Promise((resolve, reject) => {
    if (typeof window.showSignaturePage === 'function') return resolve();
    let s = document.querySelector('script[data-sz-signature]');
    if (!s) {
      s = document.createElement('script');
      s.src = '../js/signature.js';
      s.async = true;
      s.dataset.szSignature = '1';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('โหลด signature.js ไม่สำเร็จ'));
      document.body.appendChild(s);
    } else {
      s.addEventListener('load', ()=>resolve());
      s.addEventListener('error', ()=>reject(new Error('โหลด signature.js ไม่สำเร็จ')));
    }
  });
}

if (typeof window.money !== 'function') window.money = __money;

if (typeof window.fmtDateLabelTH !== 'function') {
  window.fmtDateLabelTH = function fmtDateLabelTH(val){
    const d = (val instanceof Date) ? val : new Date(val);
    if (isNaN(d)) return 'N/A';
    const th = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${String(d.getDate()).padStart(2,'0')} ${th[d.getMonth()]} ${d.getFullYear()+543}`;
  };
}

if (typeof window.computeSettlement !== 'function') {
  window.computeSettlement = function computeSettlement(order){
    let rent = 0;
    const days = +order.days || 1;
    if (Array.isArray(order.items)) {
      for (const it of order.items) {
        const price = +(it.pricePerDay ?? it.price ?? 0);
        const qty   = +(it.qty ?? 1);
        rent += price * qty * days;
      }
    } else if (+order.total) {
      rent = +order.total;
    }
    const deposit = +(order.deposit ?? 0);
    const shipOut = +(order.shipOut ?? 0);
    return { rent, deposit, shipOut, grand: rent+deposit+shipOut };
  };
}

// -------- Data accessors --------
function getUsers(){ return Array.isArray(window.DB_USERS) ? DB_USERS : []; }
function getAllProducts(){
  const c = Array.isArray(window.ITEM_CLOTHES) ? ITEM_CLOTHES : [];
  const t = Array.isArray(window.ITEM_TOOLS)   ? ITEM_TOOLS   : [];
  return [...c, ...t];
}
function getOrders(){ return (window.DB && Array.isArray(DB.orders)) ? DB.orders : []; }

// -------- Seed demo orders (ถ้าไม่มีของจริง) --------
function makeOrderNo(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da= String(d.getDate()).padStart(2,'0');
  const hh= String(d.getHours()).padStart(2,'0');
  const mm= String(d.getMinutes()).padStart(2,'0');
  const s = Math.random().toString(36).slice(2,4).toUpperCase();
  return `SZ${y}${m}${da}${hh}${mm}${s}`;
}

function seedIfNeeded(){
  if (!window.DB) window.DB = {};
  if (!Array.isArray(DB.orders) || !DB.orders.length){
    const users = getUsers();
    const owners = users.filter(u=>u.role==='owner');
    const renters= users.filter(u=>u.role!=='owner');
    const prods  = getAllProducts();

    DB.orders = Array.from({length:20}).map((_,i)=>{
      const owner  = owners[i % Math.max(1, owners.length)] || users[0] || {id: 501, name:'Owner Mock'};
      const renter = renters[i % Math.max(1, renters.length)]|| users[1] || {id: 601, name:'User Mock'};
      const prod   = prods.length ? prods[__rand(0, prods.length-1)] : null;
      const days   = __rand(1,7);
      const base   = prod?.pricePerDay || __rand(90, 600);
      return {
        id: 9000+i,
        orderNo: makeOrderNo(),
        status: (i%2===0) ? 'awaiting_renter_signature' : 'awaiting_owner_signature',
        createdAt: new Date(Date.now()-i*86400000).toISOString(),
        rentalStart: new Date(Date.now()-i*86400000).toISOString(),
        rentalEnd:   new Date(Date.now()-(i-__rand(1,3))*86400000).toISOString(),
        ownerId: owner?.id ?? 501,
        renterId: renter?.id ?? 601,
        days,
        items: prod ? [{ productId: prod.id, title: prod.title, category: prod.category, pricePerDay: base, qty: 1 }]
                    : [{ productId: 0, title: `สินค้าทดลอง ${i+1}`, category:'demo', pricePerDay: base, qty: 1 }],
        total: base * days
      };
    });
  }
}

// -------- Table rendering --------
function mapOrderToRow(o){
  const users = getUsers();
  const owner  = users.find(u=>String(u.id)===String(o.ownerId));
  const renter = users.find(u=>String(u.id)===String(o.renterId));
  const created = (o.createdAt || o.created_at || new Date()).toString().slice(0,10);
  return {
    orderNo: o.orderNo || o.id || '',
    ownerName: owner?.name || `Owner ${o.ownerId||'-'}`,
    renterName: renter?.name || `User ${o.renterId||'-'}`,
    createdAt: created
  };
}

export function renderDocs(){
  seedIfNeeded();

  const tbody = document.querySelector('#tblDocs tbody');
  if (!tbody) return;

  const q = (document.getElementById('docSearch')?.value || '').toLowerCase();
  const rows = getOrders().map(mapOrderToRow)
    .filter(r => !q || r.orderNo.toLowerCase().includes(q));

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.orderNo}</td>
      <td>${r.ownerName}</td>
      <td>${r.renterName}</td>
      <td>${r.createdAt}</td>
      <td><button class="btn" data-open="${r.orderNo}">ดูสัญญา</button></td>
    </tr>
  `).join('') || `<tr><td colspan="5">ไม่พบเอกสาร</td></tr>`;

  document.getElementById('docSearch')?.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') renderDocs();
  });

  tbody.querySelectorAll('button[data-open]')?.forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const orderNo = btn.getAttribute('data-open');
      await openContract(orderNo);
    });
  });
}

// -------- Open contract (call signature.js) --------
async function openContract(orderNo){
  try { await ensureSignatureLoaded(); }
  catch(e) { alert('ไม่สามารถโหลดฟอร์มสัญญาได้: ' + e.message); return; }

  const orders = getOrders();
  const order = orders.find(o => String(o.orderNo) === String(orderNo) || String(o.id) === String(orderNo));
  if (!order) { alert('ไม่พบคำสั่งซื้อ ' + orderNo); return; }

  let currentUser = (window.state && state.user) || null;
  if (!currentUser) {
    try { currentUser = JSON.parse(localStorage.getItem('s_user')||'{}'); }
    catch { currentUser = {}; }
  }
  if (!currentUser || !currentUser.id) currentUser = { id: 99, role:'admin', name:'Admin', email:'admin@sharezy.com' };

  // เปิดสัญญา (signature.js สร้าง modal overlay เอง)
  if (typeof window.showSignaturePage === 'function') {
    window.showSignaturePage(order, currentUser);

    // --- โหมดแอดมิน: ซ่อนพิมพ์/ลงนาม และใส่ปุ่มปิด ---
    if (String(currentUser.role).toLowerCase() === 'admin') {
      const overlay = document.getElementById('signature-modal-overlay');
      if (overlay) {
        // จำกัดขนาด modal
        overlay.querySelector('.order-detail-modal')?.classList.add('signature-modal-size');

        // 1) ซ่อนปุ่มพิมพ์ (ถ้ามี)
        const printBtn = overlay.querySelector('#print-contract-btn');
        if (printBtn) printBtn.remove();

        // 2) ซ่อนการลงนามทั้งหมด
        overlay.querySelector('.accept-terms')?.remove();               // แถว checkbox เงื่อนไข
        const signBtn = overlay.querySelector('#sign-contract-btn');    // ปุ่มลงนาม
        if (signBtn) { signBtn.disabled = true; signBtn.style.display = 'none'; }

        // 3) สร้างปุ่มปิด (ถ้ายังไม่มี)
        let closeBtn = overlay.querySelector('.admin-close-btn');
        if (!closeBtn) {
          closeBtn = document.createElement('button');
          closeBtn.className = 'btn admin-close-btn';
          closeBtn.textContent = 'ปิดหน้าต่าง';
          closeBtn.style.marginTop = '10px';

          // พยายามวางปุ่มปิดท้ายโซน footer/ปุ่มต่างๆ; ถ้าไม่พบให้วางท้าย modal
          const footerHost =
            overlay.querySelector('.my-info-footer') ||
            overlay.querySelector('.order-detail-modal');

          footerHost.appendChild(closeBtn);
        }

        // กดแล้วปิด overlay
        closeBtn.addEventListener('click', () => {
          overlay.remove();
        });

        // กด ESC เพื่อปิด
        document.addEventListener('keydown', function onEsc(e){
          if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', onEsc);
          }
        });
      }
    }
    // --------------------------------------------------------
    return;
  }
}