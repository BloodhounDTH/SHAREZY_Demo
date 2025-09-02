//
// ===== Sharezy Utilities (Final Cleaned Version) =====
//

// === DOM Helpers ===
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const byId = (id)=>document.getElementById(id);

// === Formatting Helpers ===
const money = (n)=>(n||0).toLocaleString('th-TH');
const imgPath=(p)=>(p&&!p.startsWith('assets/'))?('assets/'+p):(p||'assets/main.jpg');

function statusTH(s){
  const STATUS_TH = { 
    placed:'สั่งเช่าแล้ว', 
    deposit_received:'รับมัดจำแล้ว', 
    shipped:'สินค้าอยู่ระหว่างการจัดส่ง', 
    renter_received:'อยู่ระหว่างการเช่า', 
    return_in_transit: 'อยู่ระหว่างการคืนสินค้า', 
    returned_to_owner: 'ร้านค้าได้รับของคืนแล้ว', 
    inspected_ok:'ตรวจสภาพ: สมบูรณ์', 
    inspected_issue:'ตรวจสภาพ: มีปัญหา', 
    deposit_returned:'คืนมัดจำแล้ว', 
    cancelled: 'ยกเลิกแล้ว', 
    closed:'ปิดออเดอร์', 
    awaiting_renter_signature: 'รอลูกค้าลงนามสัญญา', 
    awaiting_owner_signature: 'รอผู้ให้เช่าลงนามสัญญา' 
  };
  return STATUS_TH[s] || s || '-';
}

// === Date & Time Helpers ===
function addDays(d, n){ return new Date(d.getTime() + n * 86400000); }
function fmtDateLabelTH(dt){ if(!dt) return ""; const d = new Date(dt); return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric' }).format(d).replace(/\//g, '-'); }
function fmtDateInput(dt){ if (!dt) return ""; const d = new Date(dt); return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }
function parseDateInput(v){ if (!v) return null; const [y, m, d] = v.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, -7, 0, 0)); }
function daysBetween(start,end){ try{ if(!start||!end) return 1; const s = new Date(start); const e = new Date(end); const diff = Math.ceil((e - s) / 86400000) + 1; return Math.max(1, diff); }catch(_){ return 1; } }
function rangesOverlap(s1,e1,s2,e2){ if(!s1||!e1||!s2||!e2) return false; const a1=new Date(s1).getTime(), a2=new Date(e1).getTime(); const b1=new Date(s2).getTime(), b2=new Date(e2).getTime(); return a1<=b2 && b1<=a2; }

// === UI Helpers ===
function showToast(msg, type="success", ms=2400){ const wrap = byId('toastWrap'); if(!wrap) return alert(msg); const div = document.createElement('div'); div.className = `toast ${type}`; div.textContent = msg; wrap.appendChild(div); setTimeout(()=>{ div.style.opacity=.9; }, 0); setTimeout(()=>{ div.style.opacity=0; div.style.transform='translateY(-6px)'; }, ms); setTimeout(()=>{ wrap.removeChild(div); }, ms+400); }
function autoReveal(root=document){ const els=root.querySelectorAll(".reveal"); if(!els.length) return; const IO=new IntersectionObserver((entries,obs)=>{ entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("is-in"); obs.unobserve(e.target);} }); }, {threshold:.12}); els.forEach(el=>IO.observe(el)); }
function stabilizeGridHeight(grid){ /* This function is no longer needed with the new product card styling */ }
function showConfirmPopup({ title = 'ยืนยันการกระทำ', message = 'คุณแน่ใจหรือไม่?', onConfirm = () => {} }) { if (byId('confirmPopup')) return; const root = document.createElement('div'); root.className = 'modal-backdrop show'; root.id = 'confirmPopup'; root.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="h3" style="margin-bottom:6px">${title}</div><div class="muted" style="margin-bottom:12px">${message}</div><div class="detail-actions" style="display:flex; gap:8px; justify-content:flex-end;"><button class="btn-primary" id="confirmOk">ยืนยัน</button><button class="btn" id="confirmCancel">ยกเลิก</button></div></div>`; const closeModal = () => { root.remove(); }; root.querySelector('#confirmCancel').addEventListener('click', closeModal); root.querySelector('#confirmOk').addEventListener('click', () => { onConfirm(); closeModal(); }); root.addEventListener('click', (e) => { if (e.target === root) { closeModal(); } }); document.body.appendChild(root); }
function showThankYouPopup({ title = 'สำเร็จ!', message = 'ขอบคุณที่ใช้บริการ', onOk = () => {} }) { if (document.getElementById('thankYouPopup')) return; const root = document.createElement('div'); root.id = 'thankYouPopup'; root.className = 'modal-backdrop show'; root.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="text-align: center;"><div style="font-size: 4rem; line-height: 1;">✨</div><div class="h2" style="margin-top: 16px;">${title}</div><p class="muted">${message}</p><div class="detail-actions" style="margin-top: 20px;"><button class="btn-primary w-full" id="thankYouOk">ตกลง</button></div></div>`; const closeModal = () => { onOk(); root.remove(); }; root.querySelector('#thankYouOk').addEventListener('click', closeModal); document.body.appendChild(root); }
function showInfoModal(title, message) {
    if (document.getElementById('infoModal')) return;
    const root = document.createElement('div');
    root.id = 'infoModal';
    root.className = 'modal-backdrop show';
    root.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" style="text-align: center;">
            <div class="h2" style="margin-top: 16px;">${title}</div>
            <p class="muted">${message}</p>
            <div class="detail-actions" style="margin-top: 20px;">
                <button class="btn-primary w-full" id="infoOk">ตกลง</button>
            </div>
        </div>
    `;
    const closeModal = () => root.remove();
    root.querySelector('#infoOk').addEventListener('click', closeModal);
    document.body.appendChild(root);
}

function getImagesOf(p){
  if (Array.isArray(p.images) && p.images.length) return p.images;
  if (p.image) return [p.image];
  return ["assets/placeholder.jpg"];
}

// เลือกรูป "ปก" แบบสุ่มครั้งเดียวต่อรอบการโหลดหน้า (แคชไว้ใน p._cover)
function getCoverImage(p){
  if (p._cover) return p._cover;
  const imgs = getImagesOf(p);
  const pick = imgs[(Math.random() * imgs.length) | 0];
  p._cover = pick;                     // cache
  return pick;
}

// === Rendering Helpers ===
function getStarClass(rating){ if(rating >= 4.5) return "gold"; if(rating > 0) return "silver"; return "gray"; }
function renderStars(rating){ let html = ""; for(let i=1;i<=5;i++){ if(rating >= i){ html += `<span class="star full">★</span>`; } else if(rating > i-1 && rating < i){ html += `<span class="star half">★</span>`; } else { html += `<span class="star empty">★</span>`; } } return `<span class="stars">${html} <span class="rating">${rating}</span></span>`; }

// === Validation & Formatting Helpers ===
function validateThaiID(id) { if (id == null || id.length !== 13 || !/^[0-9]\d+$/.test(id)) { return false; } let sum = 0; for (let i = 0; i < 12; i++) { sum += parseInt(id.charAt(i)) * (13 - i); } const checksum = (11 - (sum % 11)) % 10; return parseInt(id.charAt(12)) === checksum; }
function autoFormatThaiID(event) { const input = event.target; let value = input.value.replace(/[^0-9]/g, ''); if (value.length > 13) { value = value.substring(0, 13); } let formatted = ''; if (value.length > 0) { formatted += value.substring(0, 1); if (value.length > 1) { formatted += '-' + value.substring(1, 5); if (value.length > 5) { formatted += '-' + value.substring(5, 10); if (value.length > 10) { formatted += '-' + value.substring(10, 12); if (value.length > 12) { formatted += '-' + value.substring(12, 13); } } } } } input.value = formatted; }


function hydrateOrder(o){
  o.status ??= 'placed';
  o.shipTrackNo ??= (o.trackingNo || '');
  o.returnTrackNo ??= '';
  o.carrierOut ??= '';
  o.carrierBack ??= '';
  o.receivedAt ??= null;
  o.renterProofPhotos ??= [];
  o.ownerReturnPhotos ??= [];
  o.rentalStart ??= o.startDate || null;
  o.rentalEnd ??= o.endDate || null;
  o.returnDueAt ??= o.rentalEnd || null;
  o.countdownSent ??= { d7:false, d3:false, d1:false };
  o.dispute ??= { open:false, resolved:false, note:'' };
  o.reviewEnabled ??= false;
  o.depositReturned ??= false;

  // ▼▼▼ เพิ่มโค้ดบรรทัดนี้เข้าไป ▼▼▼
  o.total ??= { discount: 0, couponCode: '', grand: 0 };

  return o;
}

const OCCUPIED_STATUSES = new Set(['placed','deposit_received','shipped','renter_received','return_in_transit','returned_to_owner','inspected_issue','dispute_open']);
function productOccupiedByOrders(p, start, end){ const orders = (DB.orders||[]).map(hydrateOrder); for(const o of orders){ if(!o.items || !o.items.includes(p.id)) continue; if(!OCCUPIED_STATUSES.has(o.status)) continue; if(start && end && o.rentalStart && o.rentalEnd){ if(rangesOverlap(start,end,o.rentalStart,o.rentalEnd)) return true; } else if(o.rentalStart && o.rentalEnd){ const today = new Date(); today.setHours(0,0,0,0); if(rangesOverlap(today,today,o.rentalStart,o.rentalEnd)) return true; } else { return true; } } return false; }
function productStatus(p, start, end){ if(p.active === false) return {key:'inactive', text:'ไม่พร้อมให้เช่า', cls:'gray', available:false}; if(productOccupiedByOrders(p, start, end)) return {key:'busy', text:'กำลังเช่าอยู่', cls:'orange', available:false}; return {key:'free', text:'พร้อมให้เช่า', cls:'green', available:true}; }

function printElement(element) {
  // 1. ค้นหาและลบ iframe สำหรับพิมพ์ของเก่าทิ้ง (ถ้ามี)
  const oldFrame = document.getElementById('print-frame');
  if (oldFrame) {
    oldFrame.remove();
  }

  // 2. สร้าง iframe ใหม่ขึ้นมาซ่อนไว้
  const iframe = document.createElement('iframe');
  iframe.id = 'print-frame';
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  // 3. ดึงเนื้อหาและสร้างหน้า HTML ใหม่สำหรับพิมพ์โดยเฉพาะ
  const contentToPrint = element.innerHTML;
  const printDocument = iframe.contentWindow.document;

  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>พิมพ์สัญญา</title>
        <style>
          /* สไตล์พื้นฐานสำหรับหน้ากระดาษ A4 */
          body { 
            font-family: 'Jost', 'Noto Sans Thai', sans-serif; 
            line-height: 1.6; 
            color: #000;
            margin: 2cm; /* เว้นขอบกระดาษ */
          }
          h3, p, strong { margin: 0; }
          .contract-item { 
            page-break-inside: avoid; /* ป้องกันไม่ให้รายการสินค้าโดนตัดกลางหน้า */
            margin-bottom: 1rem; 
          }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        ${contentToPrint}
      </body>
    </html>
  `);
  printDocument.close();

  // 4. สั่งพิมพ์และลบ iframe ทิ้งหลังพิมพ์เสร็จ
  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  // หน่วงเวลาเล็กน้อยแล้วลบทิ้ง หรือใช้ onafterprint
  setTimeout(() => {
    iframe.remove();
  }, 500);
}

// ===== Event Bus (lightweight) =====
window.emit = window.emit || function(name, detail){ 
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch(_){}
};
window.on = window.on || function(name, fn){
  try { window.addEventListener(name, e => fn && fn(e.detail)); } catch(_){}
};

// ===== Privacy Helpers =====
window.maskNationalId = window.maskNationalId || function(id){
  if (!id) return 'N/A';
  return String(id).replace(/\d/g, '•');
};
window.canSeeNatId = window.canSeeNatId || function(viewer, ownerUser){
  if (!viewer || !ownerUser) return false;
  if (viewer.role === 'admin') return true;
  const sameId = viewer.id && ownerUser.id && viewer.id === ownerUser.id;
  const sameEmail = viewer.email && ownerUser.email && viewer.email === ownerUser.email;
  return !!(sameId || sameEmail);
};

// ใช้อีโมจิจาก user.js ถ้ามี (RANK_ICONS / USER_RANK_ICONS / RANK_ICON)
// เกณฑ์จัดระดับ: ตามโค้ดเดิม (จำนวนธุรกรรม)
window.RANK_ICONS = window.RANK_ICONS || {
  Bronze:'🐣', Silver:'💰', Gold:'🏅', Platinum:'♛', Diamond:'💎', Admin:'🤴🏻'
};

function getUserRank(user){
  if (!user) return { name:'Guest', icon:'🙂' };
  // 1) ถ้าเป็น admin หรือมี level ที่กำหนดมาแล้ว → ใช้เลย
  const explicit = (user.role === 'admin') ? 'Admin' : (user.level || '');
  if (explicit){
    const icon = user.rankIcon || window.RANK_ICONS[explicit] || '⭐';
    return { name: explicit, icon };
  }
  // 2) ถ้าไม่มี level ค่อย fallback (ตามใจคุณ จะคิดจาก points/ธุรกรรมก็ได้)
  const tx = (window.DB?.orders || []).filter(o => o.renterId === user.id || o.ownerId === user.id).length;
  const pts = +user.points || 0;
  const name = (tx >= 50 || pts >= 4000) ? 'Diamond'
            : (tx >= 30 || pts >= 2000) ? 'Platinum'
            : (tx >= 15 || pts >= 1000) ? 'Gold'
            : (tx >=  5 || pts >=  200) ? 'Silver'
            : 'Bronze';
  return { name, icon: window.RANK_ICONS[name] || '⭐' };
}
window.getUserRank = getUserRank;

/* ===== Storage Helpers: ป้องกัน QuotaExceeded และย่อข้อมูลออเดอร์ ===== */

// ตรวจว่าเป็น QuotaExceeded จริงไหม
function isQuotaExceeded(err){
  return err && (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    (err.code === 22 || err.code === 1014)
  );
}

// ย่อออเดอร์ให้เก็บเฉพาะฟิลด์จำเป็น (ลบฟิลด์หนัก ๆ ออก)
function shrinkOrder(o){
  if (!o) return o;
  const lite = {
    id: o.id,
    orderNo: o.orderNo,
    ownerId: o.ownerId,
    renterId: o.renterId,
    items: Array.isArray(o.items) ? o.items.slice(0, 50) : [],
    status: o.status,
    rentalStart: o.rentalStart || o.startDate || null,
    rentalEnd: o.rentalEnd || o.endDate || null,
    paymentMethod: o.paymentMethod || null,
    shipTrackNo: o.shipTrackNo || '',
    returnTrackNo: o.returnTrackNo || '',
    review: o.review || null,
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  // ล้างฟิลด์ที่มักใหญ่: ประวัติ/สแน็ปช็อต/แคช/ภาพ/ดีบัก
  delete o.history; delete o.logs; delete o.snapshots;
  delete o.productSnapshots; delete o.images; delete o.htmlCache;
  delete o._debug; delete o._cache;
  return Object.assign(o, lite); // คืนของเดิมที่ถูกย่อแล้ว (รักษาอ้างอิง)
}

// เรียงออเดอร์ที่ “ไม่ใช่งานค้าง” เพื่อเตรียมตัดทิ้ง
function rankPrunable(orders){
  const active = new Set(['placed','processing','paid','shipped','renter_received','return_in_transit']);
  return (orders||[]).map(o => {
    const done = !active.has(o.status);
    return { o, done, time: new Date(o.updatedAt || o.createdAt || Date.now()).getTime() };
  }).sort((a,b)=>{
    // ตัดอันที่ done + เก่าที่สุด ก่อน
    if (a.done !== b.done) return a.done ? -1 : 1;
    return a.time - b.time;
  });
}

// เซฟแบบปลอดภัย: ย่อ -> เซฟ -> ถ้าเต็มให้ตัดออเดอร์เก่า/จบกระบวนการออกทีละชุดจนกว่าจะสำเร็จ
function persistOrdersSafely(key, orders){
  const MAX_TRIES = 6;              // ตัดทีละรอบ
  const CUT_BATCH = 20;             // ตัดครั้งละกี่รายการ (ออเดอร์ที่จบแล้ว/เก่ามาก)
  let data = (orders||[]).map(shrinkOrder);

  for (let attempt=0; attempt<MAX_TRIES; attempt++){
    try{
      localStorage.setItem(key, JSON.stringify(data));
      return true; // สำเร็จ!
    }catch(e){
      if (!isQuotaExceeded(e)) throw e;

      // เตรียมตัด: เลือกออเดอร์ที่ควรโดนก่อน (completed/cancelled/closed/เก่า)
      const ranked = rankPrunable(data);
      if (!ranked.length) break;
      const toCut = Math.min(CUT_BATCH, Math.ceil(ranked.length * 0.1)); // อย่างน้อย 10% ต่อรอบ
      const victims = ranked.slice(0, toCut).map(r => r.o.id);
      data = data.filter(o => !victims.includes(o.id));
      console.warn(`[persistOrdersSafely] quota exceeded → prune ${victims.length} orders, left ${data.length}`);
    }
  }

  // ถ้ายังไม่รอด ให้พยายามบันทึกเฉพาะ “ออเดอร์ที่ยัง active” ไว้ก่อน เพื่อให้ flow ไปต่อ
  try{
    const active = data.filter(o => !['completed','closed','cancelled','deposit_returned'].includes(o.status));
    localStorage.setItem(key, JSON.stringify(active));
    console.warn(`[persistOrdersSafely] saved only active orders (${active.length}) due to quota`);
    return true;
  }catch(e){
    console.error('[persistOrdersSafely] failed completely:', e);
    return false;
  }
}

// โหลดออเดอร์ (มี fallback)
function loadOrders(){
  try{
    const raw = localStorage.getItem('s_orders');
    const arr = raw ? JSON.parse(raw) : (DB.orders || []);
    DB.orders = Array.isArray(arr) ? arr : [];
  }catch(e){
    console.warn('loadOrders error', e);
    DB.orders = DB.orders || [];
  }
  return DB.orders;
}

// แทนที่/ประกาศ saveOrders ให้เรียก persistOrdersSafely เสมอ
function saveOrders(){
  if (!window.DB) window.DB = {};
  DB.orders = Array.isArray(DB.orders) ? DB.orders : [];
  const ok = persistOrdersSafely('s_orders', DB.orders);
  if (!ok){
    // แจ้งเตือนเบา ๆ ให้ผู้ใช้ทราบ แต่ไม่ทำให้ flow ค้าง
    try { showToast && showToast('ที่เก็บข้อมูลเต็ม เลยเก็บเฉพาะรายการค้างอยู่', 'warning'); } catch(_){}
  }
}

// Export ทับ global (กันกรณีไฟล์อื่นเรียก)
window.loadOrders = loadOrders;
window.saveOrders = saveOrders;
