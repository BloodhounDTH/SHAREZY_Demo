// admin/js/modules/saller.js
// ---------- SHAREZY Admin · Saller (Sales) ----------
// ตาราง: วันที่ | เลขออเดอร์ | ร้านค้า | สินค้า | จำนวน | ยอดรวม | สถานะ
// คุณสมบัติ:
// - สร้างหมายเลขออเดอร์รูปแบบ SZ+YYYYMMDD+xxx (ไม่ซ้ำในชุดเรนเดอร์)
// - ดึงข้อมูลจริงจาก window.* ถ้ามี (orders ที่มี status + total/amount/sum)
// - ถ้าไม่มีข้อมูลจริง สร้างเดโม่ให้ทันที
// - คำนวน KPI: ยอดขายรวม / จำนวนออเดอร์ / เฉลี่ยต่อออเดอร์ / ยอดคืนเงิน(เล็กน้อย)
// - ปลอดภัยต่อ DOM: ตรวจสอบ table/tbody มีอยู่ก่อนเสมอ และ inject แถบ KPI ถ้าไม่พบ

/* ===== Utilities ===== */
function baht(n){ return (+n||0).toLocaleString(undefined,{maximumFractionDigits:0}); }
function pad3(n){ return String(n%1000).padStart(3,'0'); }
function orderNo(date, tail){
  const d = date ? new Date(date) : new Date();
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `SZ${y}${m}${day}${pad3(tail)}`;
}
function getUsers(){ return Array.isArray(window.DB_USERS) ? window.DB_USERS : []; }
function getOwners(){ return getUsers().filter(u => u.role === 'owner'); }
function ownerNameById(id){
  const o=getOwners().find(x=>String(x.id)===String(id));
  return o?.shop || o?.name || (id?`Owner ${id}`:'-');
}
function productPools(){
  // รวมสินค้าจาก ITEM_CLOTHES / ITEM_TOOLS หรือจาก window.* ที่มี ownerId + price/pricePerDay
  const out=[];
  const c = Array.isArray(window.ITEM_CLOTHES) ? window.ITEM_CLOTHES : [];
  const t = Array.isArray(window.ITEM_TOOLS)   ? window.ITEM_TOOLS   : [];
  out.push(...c, ...t);
  for(const k of Object.keys(window)){
    const v=window[k];
    if(Array.isArray(v) && v.length && typeof v[0]==='object'){
      const looksLikeProduct = v.some(p => ('ownerId' in p) && ('pricePerDay' in p || 'price' in p || 'dailyPrice' in p));
      if(looksLikeProduct) out.push(...v);
    }
  }
  return out;
}
function detectOrders(){
  // มองหา arrays ที่เป็นออเดอร์จาก window.* (มี status + (total/amount/sum))
  const orders=[];
  for(const k of Object.keys(window)){
    const v=window[k];
    if(Array.isArray(v) && v.length && typeof v[0]==='object'){
      const ok = v.some(o => ('status' in o) && ('total' in o || 'amount' in o || 'sum' in o));
      if(ok) orders.push(...v);
    }
  }
  return orders;
}
function isCompletedStatus(st){
  const s=String(st||'').toLowerCase();
  return ['placed','completed','complete','closed','done','finished','success','delivered','settled','paid'].includes(s);
}
function firstItemInfo(o){
  // คืน {title, qty, price} จาก o.items[0] ถ้ามี มิฉะนั้นประมาณค่า
  const it = Array.isArray(o.items) && o.items[0] ? o.items[0] : null;
  if(it){
    return {
      title: it.title || it.name || 'สินค้า',
      qty: +it.qty || +it.quantity || 1,
      price: +it.price || +it.pricePerDay || +it.amount || 0
    };
  }
  // try map from productPools by pid/owner
  return { title: o.title || o.product || 'สินค้า', qty: +o.qty || 1, price: +o.price || +o.pricePerDay || 0 };
}

/* ===== View helpers ===== */
function ensureKpiBar(section){
  let bar = section.querySelector('.saller-kpis');
  if(bar) return bar;
  bar = document.createElement('div');
  bar.className = 'saller-kpis';
  bar.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:8px 10px 12px';
  bar.innerHTML = `
    <div class="kpi"><div class="kpi-title">ยอดขายรวม</div><div class="kpi-value" id="sl_total">-</div></div>
    <div class="kpi"><div class="kpi-title">จำนวนออเดอร์</div><div class="kpi-value" id="sl_orders">-</div></div>
    <div class="kpi"><div class="kpi-title">เฉลี่ย/ออเดอร์</div><div class="kpi-value" id="sl_avg">-</div></div>
    <div class="kpi"><div class="kpi-title">ยอดคืนเงิน</div><div class="kpi-value" id="sl_refund">-</div></div>
  `;
  const tbl = section.querySelector('#tblSaller');
  if(tbl && tbl.parentNode){ tbl.parentNode.insertBefore(bar, tbl); }
  return bar;
}
function updateKpis(sum, count){
  const avg = count ? (sum / count) : 0;
  const refund = Math.round(sum * 0.02); // เดโม่: 2% เป็นยอดคืนเงินเล็กน้อย
  const byId = id => document.getElementById(id);
  const set = (id, val) => { const el = byId(id); if(el) el.textContent = val; };
  set('sl_total',  baht(sum) + ' บาท');
  set('sl_orders', (+count||0).toLocaleString() + ' รายการ');
  set('sl_avg',    baht(avg) + ' บาท');
  set('sl_refund', baht(refund) + ' บาท');
}

/* ===== Main render ===== */
export function renderSaller(){
  // ป้องกันการเรียกก่อน DOM พร้อม
  const section = document.querySelector('section[data-view="saller"]');
  const table   = document.getElementById('tblSaller');
  if(!section || !table) return;
  const tbody   = table.querySelector('tbody');
  if(!tbody) return;

  // เตรียม KPI bar (ถ้ายังไม่มี)
  ensureKpiBar(section);

  // 1) เก็บออเดอร์จริงที่เป็นสถานะสำเร็จ
  const realOrders = detectOrders().filter(o => isCompletedStatus(o.status));

  // 2) ถ้าไม่มีออเดอร์จริง → สร้างเดโม่ โดยพยายามผูกกับ owners/products
  let rows = [];
  if(realOrders.length){
    let tail=0;
    rows = realOrders.slice(0, 200).map(o => {
      const info = firstItemInfo(o);
      return {
        date: o.date || o.createdAt || new Date().toISOString(),
        no:   orderNo(o.date || o.createdAt, ++tail),
        owner: o.owner?.name || o.shop || ownerNameById(o.ownerId),
        title: info.title,
        qty:   +info.qty || 1,
        total: +o.total || +o.amount || +o.sum || (+info.price * (+info.qty||1)) || 0,
        status: o.status || 'completed'
      };
    });
  }else{
    // สร้างเดโม่ 28 รายการ
    const owners = getOwners();
    const prods  = productPools();
    let tail=0;
    rows = Array.from({length:28}).map((_,i)=>{
      const o = owners[i % Math.max(1, owners.length)];
      const p = prods[i % Math.max(1, prods.length)] || { title:'สินค้าเดโม่', pricePerDay:120, ownerId:o?.id||1 };
      const qty = (i%3)+1;
      const price = +p.pricePerDay || +p.price || 100;
      return {
        date: new Date(Date.now() - i*86400000).toISOString(),
        no:   orderNo(Date.now() - i*86400000, ++tail),
        owner: ownerNameById(p.ownerId || o?.id || 1),
        title: p.title || 'สินค้าเดโม่',
        qty,
        total: price * qty,
        status: 'completed'
      };
    });
  }

  // 3) เรนเดอร์ตาราง
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${new Date(r.date).toLocaleDateString('th-TH')}</td>
      <td>${r.no}</td>
      <td>${r.owner || '-'}</td>
      <td>${r.title || '-'}</td>
      <td style="text-align:right">${(+r.qty||1).toLocaleString()}</td>
      <td style="text-align:right">${baht(+r.total||0)} บาท</td>
      <td><span class="status st-done">${(r.status||'completed')}</span></td>
    </tr>
  `).join('');

  // 4) KPI
  const sum = rows.reduce((s,r)=> s+(+r.total||0), 0);
  updateKpis(sum, rows.length);
}

// (จบไฟล์)
