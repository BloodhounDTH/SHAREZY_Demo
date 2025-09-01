//
// ===== Sharezy Order Management & Business Logic (Cleaned Version) =====
//

// Safety shim: อย่าให้ computeSettlement คืน undefined
window.computeSettlement = (function(orig){
  return function(order){
    try { return (typeof orig === 'function' ? orig(order) : {}) || {}; }
    catch(e){ return {}; }
  };
})(window.computeSettlement);


// --- Business Logic & Calculations ---
function computeSettlement(order){
    const days = order.days ? Math.max(1, order.days|0) : daysBetween(order.rentalStart||order.startDate, order.rentalEnd||order.endDate);
    let rent=0, deposit=0, shipOut=0, shipBackIncluded=0;
    for(const id of (order.items||[])){
      const p = products.find(x=>x.id===id); if(!p) continue;
      rent += (p.pricePerDay||0)*days;
      deposit += (p.deposit||0);
      shipOut += (p.shipFeeOut||0);
      if(p.returnShipping==='included') shipBackIncluded += (p.shipFeeBack||0);
    }
    const platformFee = Math.round(rent*0.30);
    const ownerNet = Math.max(0, rent-platformFee) + shipOut + shipBackIncluded;
    const renterPay = rent + deposit + shipOut;
    return {rent,deposit,shipOut,shipBackIncluded,platformFee,ownerNet,renterPay,grand:renterPay, days};
}
function generateOrderNo() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
  const randomPart = crypto.randomUUID().replace(/-/g, '').substring(0, 4).toUpperCase();
  return `SZ${dateStr}${randomPart}`;
}

function statusLabelTH(order){
  const s = order.status;
  const role = (state?.user?.id === order.ownerId) ? 'owner'
             : (state?.user?.id === order.renterId) ? 'renter' : '';
  if (s === 'completed') return role === 'owner' ? 'คำสั่งเช่าเสร็จสมบูรณ์' : 'เสร็จสิ้น';
  const map = {
    placed:'สร้างออเดอร์แล้ว',
    processing:'กำลังเตรียม',
    paid:'ชำระเงินแล้ว',
    shipped:'ส่งสินค้าแล้ว',
    delivered:'จัดส่งสำเร็จ',
    renter_received:'ลูกค้าได้รับของ',
    return_in_transit:'ลูกค้าส่งคืน',
    cancelled:'ยกเลิก',
    closed:'เสร็จสิ้น',
    deposit_returned:'เสร็จสิ้น'
  };
  return map[s] || s;
}


// --- UI Modals & Popups (Order Related) ---
function openInvoice(order, role='renter'){

    const userRole = state?.user?.role;
    if(role==='renter'){
      if(!((userRole==='renter' && state?.user?.id===order.renterId) || userRole === 'admin')){ showToast('คุณไม่มีสิทธิ์ดูบิลนี้','error'); return; }
    }else if(role==='owner'){
      if(!((userRole==='owner' && state?.user?.id===order.ownerId) || userRole === 'admin')){ showToast('คุณไม่มีสิทธิ์ดูบิลนี้','error'); return; }
    }else{ showToast('ไม่ทราบประเภทบิล','error'); return; }

    const st = computeSettlement(order);
    const win = window.open('', '_blank');
    const logo = 'assets/logo.png';
    const oNo = order.orderNo || ('#'+order.id);
    const roleTitle = role==='owner' ? 'ใบสรุปยอดผู้ให้เช่า' : 'ใบเสร็จ/บิลสำหรับผู้เช่า';
    const lines = (order.items||[]).map(id=>{
      const p=products.find(x=>x.id===id)||{};
      return `<tr><td>${p.title||'-'}</td><td style="text-align:right">฿${money(p.pricePerDay)}</td></tr>`;
    }).join('');

    const totals = role==='owner' ? `
      <tr><td>ค่าเช่ารวม</td><td style="text-align:right">฿${money(st.rent)}</td></tr>
      <tr><td>ค่าส่งออก</td><td style="text-align:right">฿${money(st.shipOut)}</td></tr>
      <tr><td>ไม่รวมค่าส่งกลับ</td><td style="text-align:right">—</td></tr>
      <tr><td>ค่าธรรมเนียมแพลตฟอร์ม (30%)</td><td style="text-align:right">฿${money(st.platformFee)}</td></tr>
      <tr><td><strong>ยอดสุทธิผู้ให้เช่า</strong></td><td style="text-align:right"><strong>฿${money(st.ownerNet)}</strong></td></tr>
    ` : `
      <tr><td>ค่าเช่ารวม</td><td style="text-align:right">฿${money(st.rent)}</td></tr>
      <tr><td>มัดจำ</td><td style="text-align:right">฿${money(st.deposit)}</td></tr>
      <tr><td>ค่าส่งออก</td><td style="text-align:right">฿${money(st.shipOut)}</td></tr>
      <tr><td>ค่าส่งกลับ (ชำระปลายทาง)</td><td style="text-align:right">ไม่รวม</td></tr>
      <tr><td><strong>ยอดที่ชำระ</strong></td><td style="text-align:right"><strong>฿${money(st.renterPay)}</strong></td></tr>
    `;

    win.document.write(`
      <html lang="th"><head><meta charset="utf-8"><title>${roleTitle} ${oNo}</title>
        <style>body{font-family:system-ui,'Noto Sans Thai',sans-serif;padding:24px;background:#f8fafc}.paper{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px}h1{margin:0 0 8px}.muted{color:#6b7280}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{padding:8px;border-bottom:1px solid #eee}.right{text-align:right}.head{display:flex;gap:16px;align-items:center;margin-bottom:10px}.head img{height:40px}.print{margin-top:14px;padding:8px 12px;border-radius:8px;border:0;background:#111827;color:#fff;cursor:pointer}</style>
      </head><body onload="window.print()">
        <div class="paper"><div class="head"><img src="${logo}"><div><h1>${roleTitle}</h1><div class="muted">เลขที่: ${oNo} • ${new Date(order.createdAt).toLocaleString()}</div></div></div>
        <div class="muted">ช่วงเช่า: ${fmtDateLabelTH(order.rentalStart||'-')} – ${fmtDateLabelTH(order.rentalEnd||'-')} • ${statusTH(order.status)}</div>
        <table><thead><tr><th>รายการ</th><th class="right">ราคา/วัน</th></tr></thead><tbody>${lines}</tbody></table>
        <table><tbody>${totals}</tbody></table><button class="print" onclick="window.print()">พิมพ์</button></div>
      </body></html>`);
    win.document.close();
}

function showSuccessPopup(msg='ดำเนินการสั่งเช่าเรียบร้อยแล้ว'){
    const m = document.createElement('div');
    m.className = 'modal-backdrop show';
    m.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="h3" style="margin-bottom:8px">${msg}</div>
        <div class="detail-actions" style="margin-top:12px">
          <button class="btn" data-ok>ตกลง</button>
        </div>
      </div>`;
    m.addEventListener('click', (e)=>{ if(e.target.dataset.ok || e.target===m){ document.body.removeChild(m); } });
    document.body.appendChild(m);
};


function maybeSendCountdownNotifs(order){
    order = typeof hydrateOrder==='function' ? hydrateOrder(order) : order;
    if(!order || !order.returnDueAt) return;
    const due = new Date(order.returnDueAt).getTime();
    const left = due - Date.now();
    const DAY = 24*60*60*1000;
    const marks = [
      {key:'d7', ms:7*DAY, text:'อีก 7 วันครบกำหนดคืนสินค้า'},
      {key:'d3', ms:3*DAY, text:'อีก 3 วันครบกำหนดคืนสินค้า'},
      {key:'d1', ms:1*DAY, text:'อีก 1 วันครบกำหนดคืนสินค้า'},
    ];
    order.countdownSent ||= {};
    marks.forEach(m=>{
      if(!order.countdownSent[m.key] && left <= m.ms){
        pushNotif?.({ text:`${m.text} สำหรับคำสั่งซื้อ ${order.orderNo}`, link:`#/order/${order.id}`, forRole:'renter', toId: order.renterId });
        order.countdownSent[m.key] = true;
        saveOrders?.();
      }
    });
};


function showOrderConfirmationPage(order) { /* ...โค้ดเดิมที่ถูกต้อง... */ }

function openOwnerCompletedModal(order){
  if (document.getElementById('orderCompletedModal')) return;

  const root = document.createElement('div');
  root.id = 'orderCompletedModal';
  root.className = 'modal-backdrop show';

  const owner  = (DB.users||[]).find(u => u.id === order.ownerId)  || {};
  const renter = (DB.users||[]).find(u => u.id === order.renterId) || {};
  const fmtDate = (d) => {
    if (typeof fmtDateLabelTH === 'function') return fmtDateLabelTH(d);
    try { return new Date(d).toLocaleString('th-TH'); } catch(_){ return d || '-'; }
  };
  const fmtAddr = (u)=>{
    if (!u) return 'N/A';
    if (u.address && u.address.trim()) return u.address;
    const parts = [
      u.addrLine1,
      [u.addrSoi, u.addrRoad].filter(Boolean).join(' '),
      [u.addrSubDistrict, u.addrDistrict].filter(Boolean).join(' '),
      [u.addrProvince, u.addrZip].filter(Boolean).join(' ')
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };
  const productListHTML = (order.items||[]).map(id=>{
    const p = (Array.isArray(products) ? products.find(pp=>pp.id===id) : null);
    return `<li>${p?.title || 'รายการ'} ×1</li>`;
  }).join('');

  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:720px">
      <button class="modal-close" data-close="1">×</button>

      <div class="h2">${statusLabelTH(order)}</div>
      <div class="hr"></div>

      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>เลขคำสั่งเช่า</strong><div>${order.orderNo || order.id}</div></div>
        <div><strong>อัปเดตล่าสุด</strong><div>${fmtDate(order.updatedAt || order.completedAt || order.createdAt)}</div></div>
      </div>

      <div class="hr"></div>
      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>ผู้เช่า</strong><div>${renter.name||'N/A'}<br>โทร. ${renter.phone||'N/A'}<br>${fmtAddr(renter)}</div></div>
        <div><strong>ผู้ให้เช่า</strong><div>${owner.name||'N/A'}<br>โทร. ${owner.phone||'N/A'}<br>${fmtAddr(owner)}</div></div>
      </div>

      <div class="hr"></div>
      <div>
        <strong>รายการสินค้า</strong>
        <ul style="margin:8px 0 0 18px">${productListHTML}</ul>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  root.addEventListener('click', (e)=>{
    if (e.target.closest('[data-close]') || e.target === root) root.remove();
  });
}


function openPurchaseHistoryBuyer() {
    DB.orders = loadOrders();
    if (document.getElementById('purchaseHistoryModal')) return;
    if (!state.user) { openAuthModal(false); return; }
    const myId = state.user.id;
    const orders = (DB.orders || []).filter(o => o.renterId === myId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const root = document.createElement('div');
    root.id = 'purchaseHistoryModal';
    root.className = 'modal-backdrop show';
    const rows = orders.map(o => { const st = computeSettlement(o); const dt = new Date(o.createdAt || Date.now()); const orderNo = o.orderNo || ('#' + (o.id ?? '')); return `<tr><td><strong>${orderNo}</strong><br><small class="muted">${dt.toLocaleString()}</small></td><td>${statusTH(o.status)}</td><td class="right">฿${(st.grand || 0).toLocaleString()}</td><td class="right"><button class="btn" data-od="${o.id}">ดูรายละเอียด</button></td></tr>`; }).join('') || '<tr><td colspan="4" class="muted" style="text-align:center;">ยังไม่มีข้อมูล</td></tr>';
    root.innerHTML = `<div class="modal"><button class="modal-close" data-close="1">×</button><div class="h2">ประวัติการเช่า</div><div class="hr"></div><table class="table"><thead><tr><th>เลขที่</th><th>สถานะ</th><th class="right">ยอดรวม</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;

    // --- START: แก้ไข Event Listener ---

    // Listener 1: จัดการการคลิกที่ปุ่ม "ดูรายละเอียด" ภายในตารางโดยตรง
    const tableBody = root.querySelector('tbody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-od]');
            if (btn) {
                document.body.removeChild(root); // ปิด Modal ปัจจุบันก่อน
                openOrderDetail(+btn.getAttribute('data-od')); // แล้วค่อยเปิด Modal ใหม่
            }
        });
    }

    // Listener 2: จัดการการปิด Modal (คลิกปุ่ม x หรือคลิกพื้นหลัง)
    root.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]') || e.target === root) {
            document.body.removeChild(root);
        }
    });

    // --- END: แก้ไข Event Listener ---

    document.body.appendChild(root);
}


function openPurchaseHistoryOwner(){
  DB.orders = loadOrders();
  if (document.getElementById('purchaseHistoryModal')) return;
  if(!state.user){ openAuthModal(false); return; }
  const myId = state.user.id;
  const orders = (DB.orders||[]).filter(o=>o.ownerId===myId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
  const root = document.createElement('div');
  root.id = 'purchaseHistoryModal';
  root.className='modal-backdrop show';
  const rows = orders.map(o=>{ const st = computeSettlement(o); const dt = new Date(o.createdAt||Date.now()); const orderNo = o.orderNo || ('#'+(o.id??'')); return `<tr><td><strong>${orderNo}</strong><br><small class="muted">${dt.toLocaleString()}</small></td><td>${statusTH(o.status)}</td><td class="right">฿${(st.ownerNet||0).toLocaleString()}</td><td class="right"><button class="btn" data-od="${o.id}">ดูรายละเอียด</button></td></tr>`; }).join('') || `<tr><td colspan="4" class="muted" style="text-align:center;">ยังไม่มีข้อมูล</td></tr>`;
  root.innerHTML = `<div class="modal"><button class="modal-close" data-close="1">×</button><div class="h2">ประวัติการให้เช่า</div><div class="hr"></div><table class="table"><thead><tr><th>เลขที่</th><th>สถานะ</th><th class="right">ยอดรับสุทธิ</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  
  // --- START: แก้ไข Event Listener ---
  root.addEventListener('click', (e) => { 
    if(e.target.closest('[data-close]')||e.target===root) {
        document.body.removeChild(root);
        return;
    }
    const btn = e.target.closest('button[data-od]'); 
    if(btn) {
        document.body.removeChild(root); // <-- ปิด Modal ปัจจุบันก่อน
        openOrderDetail(+btn.getAttribute('data-od')); // <-- แล้วค่อยเปิด Modal ใหม่
    }
  });
  // --- END: แก้ไข Event Listener ---

  document.body.appendChild(root);
}

function openOrderDetail(orderId){
  if (document.getElementById('orderDetailModal')) return;
  const order = DB.orders.find(o => o.id === +orderId);
  if(!order) return showToast('ไม่พบคำสั่งซื้อ','error');

  const isOwner  = state.user?.role === 'owner'  && state.user.id === order.ownerId;
  const isRenter = state.user?.role === 'renter' && state.user.id === order.renterId;
  if (!isOwner && !isRenter) return;

  // ✅ ถ้าเสร็จสิ้นแล้ว แยก modal เฉพาะ: เจ้าของ/ลูกค้า
  if (order.status === 'completed') {
    if (isOwner)  return openOwnerCompletedModal(order);   // มีสรุปละเอียด
    if (isRenter) return openRenterCompletedModal(order);  // โชว์แค่ยอดรวม + มัดจำ
  }

  if (isOwner) openOwnerOrderDetail(order);
  else         openRenterOrderDetail(order);
}


function openOwnerCompletedModal(order){
  if (document.getElementById('orderDetailModal')) return;

  const root = document.createElement('div');
  root.id = 'orderDetailModal';      // ใช้ id เดิมเพื่อสไตล์เดียวกัน
  root.className = 'modal-backdrop show';

  const owner  = (DB.users||[]).find(u => u.id === order.ownerId)  || {};
  const renter = (DB.users||[]).find(u => u.id === order.renterId) || {};

  const fmtDate = (d) => {
    if (typeof fmtDateLabelTH === 'function') return fmtDateLabelTH(d);
    try { return d ? new Date(d).toLocaleString('th-TH') : '-'; } catch(_){ return d||'-'; }
  };
  const fmtAddr = (u)=>{
    if (!u) return 'N/A';
    if (u.address && u.address.trim()) return u.address;
    const parts = [u.addrLine1, [u.addrSoi,u.addrRoad].filter(Boolean).join(' '), [u.addrSubDistrict,u.addrDistrict].filter(Boolean).join(' '), [u.addrProvince,u.addrZip].filter(Boolean).join(' ')].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };
  const productListHTML = (order.items||[]).map(id=>{
    const p = (Array.isArray(products) ? products.find(pp=>pp.id===id) : null);
    return `<li>${p?.title || 'รายการ'} ×1</li>`;
  }).join('');

  const S = getSettlement(order); // ← เอายอดแบบกันพัง

  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:760px">
      <button class="modal-close" data-close="1">×</button>

      <div class="h2">คำสั่งเช่าเสร็จสมบูรณ์</div>
      <div class="hr"></div>

      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>เลขคำสั่งเช่า</strong><div>${order.orderNo || order.id}</div></div>
        <div><strong>อัปเดตล่าสุด</strong><div>${fmtDate(order.updatedAt || order.completedAt || order.createdAt)}</div></div>
      </div>

      <div class="hr"></div>
      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div><strong>ผู้เช่า</strong><div>${renter.name||'N/A'}<br>โทร. ${renter.phone||'N/A'}<br>${fmtAddr(renter)}</div></div>
        <div><strong>ผู้ให้เช่า</strong><div>${owner.name||'N/A'}<br>โทร. ${owner.phone||'N/A'}<br>${fmtAddr(owner)}</div></div>
      </div>

      <div class="hr"></div>
      <div>
        <strong>รายการสินค้า</strong>
        <ul style="margin:8px 0 0 18px">${productListHTML}</ul>
      </div>

      <div class="hr"></div>
      <div>
        <strong>สรุปยอด</strong>
        <div class="money-grid" style="margin-top:6px;display:grid;grid-template-columns:1fr auto;row-gap:6px;">
          <div>ค่าเช่า</div>          <div><b>${moneySafe(S.rent)}</b></div>
          <div>ค่าจัดส่ง</div>        <div>${moneySafe(S.shipping)}</div>
          <div>ค่าบริการ</div>        <div>${moneySafe(S.service)}</div>
          <div>ค่าปรับ</div>          <div>${moneySafe(S.fine)}</div>
          <div>ส่วนลด</div>          <div>- ${moneySafe(S.discount)}</div>
          <div>มัดจำ</div>            <div>${moneySafe(S.deposit)}</div>
          <div class="hr" style="grid-column:1/-1;margin:6px 0;"></div>
          <div><b>ยอดรวมสุทธิ</b></div><div><b>${moneySafe(S.grand)}</b></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  // ปิดเฉพาะกากบาท (พื้นหลังไม่ปิด)
  root.addEventListener('click', (e)=>{
    if (e.target.closest('[data-close]')) root.remove();
  });
}
window.openOwnerCompletedModal = window.openOwnerCompletedModal || openOwnerCompletedModal;


function openRenterCompletedModal(order){
  if (document.getElementById('orderDetailModal')) return;

  const root = document.createElement('div');
  root.id = 'orderDetailModal';
  root.className = 'modal-backdrop show';

  const S = getSettlement(order);

  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" style="max-width:560px">
      <button class="modal-close" data-close="1">×</button>

      <div class="h2">การเช่าเสร็จสิ้น</div>
      <div class="hr"></div>

      <div class="money-grid" style="display:grid;grid-template-columns:1fr auto;row-gap:6px;">
        <div>ยอดชำระรวม</div><div><b>${moneySafe(S.grand)}</b></div>
        <div>มัดจำ</div>      <div>${moneySafe(S.deposit)}</div>
      </div>

      <!-- ถ้าอยากแสดงข้อความชวนรีวิวแบบไม่บังคับ: -->
      <!-- <div class="hint" style="margin-top:10px;color:#64748b;">ขอบคุณที่เช่า หากสะดวกช่วยรีวิวสินค้าให้ร้านค้าได้นะครับ</div> -->
    </div>
  `;
  document.body.appendChild(root);

  root.addEventListener('click', (e)=>{
    if (e.target.closest('[data-close]')) root.remove();
  });
}
window.openRenterCompletedModal = window.openRenterCompletedModal || openRenterCompletedModal;



// ===== Money helpers (ปลอดภัยถ้าไม่มี money()) =====
function moneySafe(v){
  if (typeof money === 'function') return money(v);
  try { return Number(v||0).toLocaleString('th-TH', { style:'currency', currency:'THB' }).replace('THB','฿').trim(); }
  catch { return (v||0) + ' บาท'; }
}




// ===== ดึงสรุปยอดแบบกันพัง (ถ้า computeSettlement คืนไม่ครบ) =====
function getSettlement(order){
  let s = {};
  try { s = computeSettlement(order) || {}; } catch(_) { s = {}; }

  const rent     = s.rentTotal ?? s.rent ?? order.rentTotal ?? 0;
  const deposit  = s.deposit ?? order.deposit ?? 0;
  const discount = s.discount ?? 0;
  const shipping = s.shipping ?? s.shippingFee ?? order.shippingFee ?? 0;
  const fine     = s.fine ?? 0;
  const service  = s.serviceFee ?? 0;
  const grand    = s.grand ?? s.total ?? Math.max(0, rent + shipping + service + fine + deposit - discount);

  return { rent, deposit, discount, shipping, fine, service, grand };
}


function openRenterOrderDetail(order) {
  if (document.getElementById('orderDetailModal')) return;
  const root = document.createElement('div');
  root.id = 'orderDetailModal';
  root.className = "modal-backdrop show";
  const st = computeSettlement(order);
  const rentalEndDate = parseDateInput(order.rentalEnd);
  const returnDate = rentalEndDate ? addDays(rentalEndDate, 1) : null;
  const returnDateFormatted = returnDate ? fmtDateLabelTH(returnDate) : 'N/A';
  const itemsHTML = (order.items||[]).map(id => { const p = products.find(x => x.id === id) || {}; return `<div class="item-row"><img src="${imgPath(p.image)}" alt="${p.title}"><div class="item-info"><strong>${p.title}</strong><small>${money(p.pricePerDay)} บาท/วัน</small></div><div class="item-price">${money(p.pricePerDay * st.days)} บาท</div></div>`; }).join('');
  const totalsHTML = `<tr><td>ค่าเช่ารวม</td><td class="right">${money(st.rent)} บาท</td></tr><tr><td>ค่ามัดจำ</td><td class="right">${money(st.deposit)} บาท</td></tr><tr><td>ค่าจัดส่ง</td><td class="right">${money(st.shipOut)} บาท</td></tr>${order.total.discount > 0 ? `<tr><td>ส่วนลด (${order.total.couponCode})</td><td class="right">-${money(order.total.discount)} บาท</td></tr>` : ''}<tr class="grand-total"><td><strong>ยอดชำระทั้งหมด</strong></td><td class="right"><strong>${money(st.grand)} บาท</strong></td></tr>`;
  
  // --- START: แก้ไขและปรับปรุง Logic ทั้งหมด ---
  const statusText = statusTH(order.status);
  let shippingDetailsHTML = '';
  let footerHTML = '';

  switch (order.status) {
    case 'awaiting_renter_signature':
      footerHTML = `<button class="btn-primary w-full" id="btnSignContract">ลงนามในสัญญา</button>`;
      break;

    case 'awaiting_owner_signature':
    case 'placed':
    case 'confirmed':
      footerHTML = `<div class="muted" style="width:100%; text-align:center;">${statusText}</div>`;
      break;

    case 'shipped':
      shippingDetailsHTML = `<div class="shipping-details-box"><strong>ข้อมูลการจัดส่ง</strong><p>บริษัทขนส่ง: ${order.carrierOut || 'N/A'}</p><p>เลขพัสดุ: ${order.trackingNo || 'N/A'}</p></div>`;
      footerHTML = `<button class="btn-primary w-full" id="btnConfirmReceipt">ยืนยันรับสินค้า</button>`;
      break;

    case 'renter_received':
      footerHTML = `<button class="btn-primary w-full" id="btnReturnItem">ส่งสินค้าคืนร้านค้า</button>`;
      break;

    case 'completed':
    case 'deposit_returned':
    case 'closed':
      if (order.review) {
        footerHTML = `<div class="muted" style="width:100%; text-align:center;">ขอบคุณสำหรับรีวิวของคุณ</div>`;
      } else {
        footerHTML = `<button class="btn-primary w-full" id="btnLeaveReview">ให้คะแนนสินค้า</button>`;
      }
      break;
    
    default:
      // กรณีสำรองสำหรับสถานะอื่นๆ ที่ไม่ได้ระบุไว้ เช่น 'cancelled'
      footerHTML = `<div class="muted" style="width:100%; text-align:center;">สถานะ: ${statusText}</div>`;
      break;
  }
  // --- END: แก้ไขและปรับปรุง Logic ทั้งหมด ---

  root.innerHTML = `<div class="modal order-detail-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="my-info-header"><strong>รายละเอียดคำสั่งซื้อ</strong><small class="muted">หมายเลข: ${order.orderNo}</small></div><div class="my-info-body"><div class="status-display status-${order.status}"><span>สถานะปัจจุบัน:</span><strong>${statusText}</strong></div>${shippingDetailsHTML}<div class="date-summary"><div><strong>วันที่เริ่มเช่า:</strong> ${fmtDateLabelTH(order.rentalStart)} &nbsp;&nbsp;-&nbsp;&nbsp; <strong>วันที่สิ้นสุด:</strong> ${fmtDateLabelTH(order.rentalEnd)} &nbsp;&nbsp;-&nbsp;&nbsp; <strong>วันที่ต้องคืนสินค้า:</strong> ${returnDateFormatted}</div></div><div class="item-summary"><label class="form-label-group">รายการสินค้า (${order.items.length} ชิ้น)</label>${itemsHTML}</div><div class="total-summary"><label class="form-label-group">สรุปยอดชำระ</label><table><tbody>${totalsHTML}</tbody></table></div></div><div class="my-info-footer">${footerHTML}</div></div>`;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const modalBody = root.querySelector('.my-info-body');
  if (modalBody) modalBody.addEventListener('wheel', e => e.stopPropagation());
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnSignContract')) { 
      closeModal();
      showSignaturePage(order, state.user);
    }
    if (e.target.closest('#btnConfirmReceipt')) { closeModal(); openReceiptConfirmationPage(order); }
    if (e.target.closest('#btnReturnItem')) { closeModal(); openReturnShipmentPage(order); }
    if (e.target.closest('#btnLeaveReview')) { openReview(order.id); }
  });
}


function openOwnerOrderDetail(order) {
  if (document.getElementById('orderDetailModal')) return;
  const root = document.createElement('div');
  root.id = 'orderDetailModal';
  root.className = "modal-backdrop show";
  let currentOrder = JSON.parse(JSON.stringify(order));
  
  // สร้างโครง Modal ครั้งแรกที่นี่
  root.innerHTML = `<div class="modal order-detail-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="my-info-header"></div><div class="my-info-body"></div><div class="my-info-footer"></div></div>`;

  const renderModalContent = () => {
    const st = computeSettlement(currentOrder);
    const rentalEndDate = parseDateInput(currentOrder.rentalEnd);
    const returnDate = rentalEndDate ? addDays(rentalEndDate, 1) : null;
    const returnDateFormatted = returnDate ? fmtDateLabelTH(returnDate) : 'N/A';
    const itemsHTML = (currentOrder.items || []).map(id => { const p = products.find(x => x.id === id) || {}; return `<div class="item-row" data-item-id-row="${id}"><div class="edit-mode-action"><button class="btn-remove-item icon-btn" data-item-id="${id}">🗑️</button></div><img src="${imgPath(p.image)}" alt="${p.title}"><div class="item-info"><strong>${p.title}</strong><small>${money(p.pricePerDay)} บาท/วัน</small></div><div class="item-price">${money(p.pricePerDay * st.days)} บาท</div></div>`; }).join('');
    const totalsHTML = `<tr><td>ค่าเช่ารวม</td><td class="right">${money(st.rent)} บาท</td></tr><tr><td>ค่ามัดจำ</td><td class="right">${money(st.deposit)} บาท</td></tr><tr><td>ค่าจัดส่ง</td><td class="right">${money(st.shipOut)} บาท</td></tr>${currentOrder.total.discount > 0 ? `<tr><td>ส่วนลด (${currentOrder.total.couponCode})</td><td class="right">-${money(currentOrder.total.discount)} บาท</td></tr>` : ''}<tr class="grand-total"><td><strong>ยอดรับสุทธิ</strong></td><td class="right"><strong>${money(st.ownerNet)} บาท</strong></td></tr>`;
    
    let statusText = statusTH(currentOrder.status);
    let actionButtonsHTML = '';
    let detailsHTML = '';

    if (currentOrder.status === 'awaiting_owner_signature') {
        statusText = 'รอผู้ให้เช่าลงนามสัญญา';
        actionButtonsHTML = `<button class="btn-primary w-full" id="btnSignContract">ตรวจสอบและลงนามในสัญญา</button>`;
    } else if (currentOrder.status === 'placed') {
        actionButtonsHTML = `<button class="btn" id="btnEditOrder">แก้ไขออเดอร์</button><button class="btn-primary" id="btnConfirmOrder">ยืนยันออเดอร์</button>`;
    } else if (currentOrder.status === 'shipped') {
        statusText = 'รอลูกค้ายืนยันการรับสินค้า';
        actionButtonsHTML = `<div class="muted" style="width:100%; text-align:center;">${statusText}</div>`;
    } else if (currentOrder.status === 'return_in_transit') {
        statusText = 'รอตรวจสอบสินค้าที่ส่งคืน';
        actionButtonsHTML = `<button class="btn" id="btnReportIssue" style="background-color: #fee2e2; color: #b91c1c;">พบปัญหาสินค้า</button><button class="btn-primary" id="btnConfirmReturnAndRefund">ยืนยันรับคืนและคืนมัดจำ</button>`;
        const renterReceiptPhotosHTML = (currentOrder.renterProofPhotos || []).map(src => `<img src="${src}" class="preview-image">`).join('');
        const renterReturnPhotosHTML = (currentOrder.returnProofPhotos || []).map(src => `<img src="${src}" class="preview-image">`).join('');
        detailsHTML = `<div class="shipping-details-box"><strong>ข้อมูลการส่งคืน</strong><p>บริษัทขนส่ง: ${currentOrder.carrierBack || 'N/A'}</p><p>เลขพัสดุ: ${currentOrder.returnTrackNo || 'N/A'}</p></div><div class="photo-comparison"><div class="photo-set"><label class="form-label-group">รูปที่ลูกค้าถ่ายเมื่อรับของ</label><div class="receipt-preview">${renterReceiptPhotosHTML || '<small class="muted">ไม่มีรูปภาพ</small>'}</div></div><div class="photo-set"><label class="form-label-group">รูปที่ลูกค้าถ่ายก่อนส่งคืน</label><div class="receipt-preview">${renterReturnPhotosHTML || '<small class="muted">ไม่มีรูปภาพ</small>'}</div></div></div>`;
    }

    root.querySelector('.my-info-header').innerHTML = `<strong>จัดการออเดอร์</strong><small class="muted">หมายเลข: ${currentOrder.orderNo}</small>`;
    root.querySelector('.my-info-body').innerHTML = `<div class="status-display status-${currentOrder.status}"><span>สถานะปัจจุบัน:</span><strong>${statusText}</strong></div>${detailsHTML}<div class="date-summary"><div><strong>วันที่เริ่มเช่า:</strong> ${fmtDateLabelTH(currentOrder.rentalStart)} &nbsp;&nbsp;-&nbsp;&nbsp; <strong>วันที่สิ้นสุด:</strong> ${fmtDateLabelTH(currentOrder.rentalEnd)} &nbsp;&nbsp;-&nbsp;&nbsp; <strong>วันที่ต้องคืนสินค้า:</strong> ${returnDateFormatted}</div></div><div class="item-summary"><label class="form-label-group">รายการสินค้า</label>${itemsHTML}</div><div class="total-summary"><label class="form-label-group">สรุปยอดรับ</label><table><tbody>${totalsHTML}</tbody></table></div>`;
    root.querySelector('.my-info-footer').innerHTML = actionButtonsHTML;
  };

  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const modalBody = root.querySelector('.my-info-body');
  if (modalBody) modalBody.addEventListener('wheel', e => e.stopPropagation());
  
  renderModalContent(); // เรียกใช้ครั้งแรก
  
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnSignContract')) {
      closeModal();
      showSignaturePage(currentOrder, state.user);
    }
    if (e.target.closest('#btnConfirmOrder')) { closeModal(); openShippingPage(currentOrder); }
    if (e.target.closest('#btnEditOrder')) { root.classList.add('edit-mode'); root.querySelector('.my-info-footer').innerHTML = `<button class="btn" id="btnCancelEdit">ยกเลิก</button><button class="btn-primary" id="btnSaveChanges">บันทึกการแก้ไข</button>`; }
    if (e.target.closest('#btnCancelEdit')) { root.classList.remove('edit-mode'); currentOrder = JSON.parse(JSON.stringify(order)); renderModalContent(); }
    if (e.target.closest('.btn-remove-item')) {
      const itemIdToRemove = parseInt(e.target.dataset.itemId);
      showConfirmPopup({
          title: 'ยืนยันการลบสินค้า', message: `คุณต้องการลบสินค้านี้ออกจากออเดอร์และจะมีการปรับยอดเงินคืนลูกค้าใช่หรือไม่?`,
          onConfirm: () => {
              currentOrder.items = currentOrder.items.filter(id => id !== itemIdToRemove);
              if (currentOrder.items.length === 0) {
                  cancelOrder(currentOrder);
              } else {
                  const newTotals = computeSettlement(currentOrder);
                  currentOrder.total = { ...currentOrder.total, ...newTotals };
                  renderModalContent();
                  showToast(`ลบสินค้าเรียบร้อย ระบบได้คำนวณยอดเงินใหม่แล้ว`, 'success');
              }
          }
      });
    }
    if (e.target.closest('#btnSaveChanges')) {
      const orderIndex = DB.orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
          DB.orders[orderIndex] = currentOrder;
          saveOrders();
          showToast('บันทึกการแก้ไขออเดอร์เรียบร้อยแล้ว!', 'success');
          pushNotif({ text: `ออเดอร์ ${currentOrder.orderNo} ของท่านมีการเปลี่ยนแปลง`, link: `#/order/${currentOrder.id}`, forRole: 'renter', toId: currentOrder.renterId });
          closeModal();
      } else {
          showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    }
    if (e.target.closest('#btnReportIssue')) {
      const reason = prompt('กรุณาระบุรายละเอียดความเสียหาย:');
      if (reason) { showToast('ส่งเรื่องให้ Admin ตรวจสอบแล้ว', 'success'); closeModal(); }
    }
    if (e.target.closest('#btnConfirmReturnAndRefund')) {
        showConfirmPopup({
            title: 'ยืนยันการจบรายการ', message: 'คุณยืนยันว่าได้รับสินค้าคืนในสภาพสมบูรณ์และพร้อมจะคืนเงินมัดจำใช่หรือไม่?',
            onConfirm: () => {
                const orderIndex = DB.orders.findIndex(o => o.id === currentOrder.id);
                if (orderIndex !== -1) {
                    DB.orders[orderIndex].status = 'completed';
                    saveOrders();
                    pushNotif({ text: `ร้านค้าได้คืนเงินมัดจำสำหรับออเดอร์ #${currentOrder.orderNo} แล้ว`, link: `#/order/${currentOrder.id}`, forRole: 'renter', toId: currentOrder.renterId });
                    pushNotif({ text: `กรุณาให้คะแนนสินค้าจากออเดอร์ #${currentOrder.orderNo}`, link: `#/order/${currentOrder.id}`, forRole: 'renter', toId: currentOrder.renterId });
                    showToast('ดำเนินการเสร็จสิ้น!', 'success');
                    closeModal();
                }
            }
        });
    }
  });
}

function openShippingPage(order) {
  if (document.getElementById('shippingModal')) return;
  const root = document.createElement('div');
  root.id = 'shippingModal';
  root.className = "modal-backdrop show";
  const owner = DB.users.find(u => u.id === order.ownerId) || {};
  const renter = DB.users.find(u => u.id === order.renterId) || {};
  const carriersOptions = (window.CARRIERS || []).map(c => `<option value="${c}">${c}</option>`).join('');
  root.innerHTML = `<div class="modal order-detail-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="my-info-header"><strong>เตรียมการจัดส่ง</strong><small class="muted">ออเดอร์: ${order.orderNo}</small></div><div class="my-info-body"><div class="shipping-info-grid"><div class="sender-info"><label class="form-label-group">ผู้ส่ง</label><p>${owner.name || 'N/A'}<br>${owner.address || 'N/A'}<br>โทร. ${owner.phone || 'N/A'}</p></div><div class="receiver-info"><label class="form-label-group">ผู้รับ</label><p>${renter.name || 'N/A'}<br>${renter.address || 'N/A'}<br>โทร. ${renter.phone || 'N/A'}</p></div></div><div class="form-field"><label for="shippingCarrier">บริษัทขนส่ง</label><select id="shippingCarrier">${carriersOptions}</select></div><div class="form-field"><label for="trackingNumber">เลขพัสดุ</label><input type="text" id="trackingNumber" placeholder="กรอกเลขพัสดุที่นี่"></div><div class="form-field checkbox-group"><label for="fragileCheckbox">สินค้าแตกหักง่าย</label><input type="checkbox" id="fragileCheckbox" ${order.fragile ? 'checked' : ''}></div></div><div class="my-info-footer" style="flex-direction:column; gap:10px;"><button class="btn w-full" id="btnPrintLabel">พิมพ์ใบปะหน้า</button><button class="btn-primary w-full" id="btnSubmitTracking">แจ้งเลขพัสดุให้ลูกค้า</button></div></div>`;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const modalBody = root.querySelector('.my-info-body');
  if (modalBody) { modalBody.addEventListener('wheel', e => e.stopPropagation()); }
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnPrintLabel')) { const isFragile = root.querySelector('#fragileCheckbox').checked; openPrintLabel(order, isFragile); }
    if (e.target.closest('#btnSubmitTracking')) {
        const tracking = root.querySelector('#trackingNumber').value.trim();
        const carrier = root.querySelector('#shippingCarrier').value;
        const isFragile = root.querySelector('#fragileCheckbox').checked;
        if (!tracking) { showToast('กรุณากรอกเลขพัสดุ', 'error'); return; }
        const orderIndex = DB.orders.findIndex(o => o.id === order.id);
        if (orderIndex !== -1) {
            DB.orders[orderIndex].status = 'shipped';
            DB.orders[orderIndex].trackingNo = tracking;
            DB.orders[orderIndex].carrierOut = carrier;
            DB.orders[orderIndex].fragile = isFragile;
            saveOrders();
            pushNotif({ text: `สินค้าของคุณจัดส่งแล้ว! (${carrier}: ${tracking})`, link: `#/order/${order.id}`, forRole: 'renter', toId: order.renterId });
            showToast('แจ้งเลขพัสดุให้ลูกค้าเรียบร้อยแล้ว!', 'success');
            closeModal();
            openOrderDetail(order.id);
        } else {
            showToast('เกิดข้อผิดพลาดในการอัปเดตออเดอร์', 'error');
        }
    }
  });
}

function openPrintLabel(order, isFragile) {
  if (document.getElementById('printLabelModal')) return;

  const root = document.createElement('div');
  root.id = 'printLabelModal';
  root.className = "modal-backdrop show print-preview-mode";

  // ---- เตรียมข้อมูลผู้ใช้ ----
  const owner  = (DB.users || []).find(u => u.id === order.ownerId)  || {};
  const renter = (DB.users || []).find(u => u.id === order.renterId) || {};
  const viewer = (typeof state !== 'undefined' && state.user) ? state.user : null;

  // ใครเป็นคนพิมพ์? (owner/admin = พิมพ์เพื่อส่งไปให้ลูกค้า, คนอื่นถือว่า renter พิมพ์ส่งคืน)
  const isOwnerViewer = !!(viewer && (viewer.id === order.ownerId) && (viewer.role === 'owner' || viewer.role === 'admin'));

  // address fallback: ถ้าไม่มี address แบบสตริง ให้ประกอบจากช่องย่อย
  const fmtAddress = (u) => {
    if (!u) return 'N/A';
    if (u.address && u.address.trim()) return u.address;
    const parts = [
      u.addrLine1,
      [u.addrSoi, u.addrRoad].filter(Boolean).join(' '),
      [u.addrSubDistrict, u.addrDistrict].filter(Boolean).join(' '),
      [u.addrProvince, u.addrZip].filter(Boolean).join(' ')
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  // สลับบทบาท FROM/TO ตามผู้ที่พิมพ์
  const sender   = isOwnerViewer ? owner  : renter;  // ผู้ส่ง (FROM)
  const receiver = isOwnerViewer ? renter : owner;   // ผู้รับ (TO)

  // รายการสินค้า
  const productListHTML = (order.items || []).map(id => {
    const p = (typeof products !== 'undefined' && Array.isArray(products)) ? products.find(pp => pp.id === id) : null;
    return `<div>- ${p?.title || 'N/A'} (x1)</div>`;
  }).join('');

  // แสดงป้ายแตกหักง่าย
  const fragileTag = isFragile ? '<div class="fragile-tag">⚠️ สินค้าแตกหักง่าย</div>' : '';

  // COD: แสดงยอดเก็บเงินเฉพาะกรณี "เจ้าของ" เป็นคนพิมพ์และวิธีชำระเป็น COD
  let codAmount = 'ไม่ต้องเก็บเงิน';
  try {
    if (isOwnerViewer && order.paymentMethod === 'cod' && typeof computeSettlement === 'function') {
      codAmount = (typeof money === 'function') ? money(computeSettlement(order).grand) : (computeSettlement(order).grand || 0).toLocaleString();
    }
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="print-label-container">
      <div class="print-label-header">
        <div class="logo"><img src="assets/logo.png" alt="Shop Logo"></div>
        <div class="barcode"><svg id="barcode"></svg></div>
      </div>

      <div class="print-label-info-section">
        <div class="print-label-from"><strong>ผู้ส่ง (FROM)</strong>
          <p>${sender.name  || 'N/A'}</p>
          <p>${fmtAddress(sender)}</p>
          <p>โทร. ${sender.phone || 'N/A'}</p>
        </div>
        <div class="print-label-to"><strong>ผู้รับ (TO)</strong>
          <p>${receiver.name  || 'N/A'}</p>
          <p>${fmtAddress(receiver)}</p>
          <p>โทร. ${receiver.phone || 'N/A'}</p>
        </div>
      </div>

      <div class="print-label-details">
        <div class="order-id"><strong>ORDER NO.</strong><span>${order.orderNo}</span></div>
        <div class="item-description"><strong>รายการสินค้า:</strong>${productListHTML}</div>
        <div class="cod-section"><strong>COD (บาท)</strong><span>${codAmount}</span></div>
      </div>

      <div class="fragile-section">${fragileTag}</div>
      <div class="tracking-number-box"><p>สำหรับขนส่ง: แปะเลขพัสดุที่นี่</p></div>
    </div>

    <div class="print-actions">
      <button class="btn-primary" id="btnActualPrint">พิมพ์ใบปะหน้าจริง</button>
      <button class="btn" data-close="1">ปิด</button>
    </div>
  `;

  document.body.appendChild(root);

  const scrollableLabel = root.querySelector('.print-label-container');
  if (scrollableLabel) { scrollableLabel.addEventListener('wheel', e => e.stopPropagation()); }

  try {
    JsBarcode("#barcode", String(order.orderNo || ''), { format: "CODE128", height: 40, displayValue: true, fontSize: 14, margin: 0 });
  } catch (e) { console.error("Barcode generation failed:", e); }

  const printButton = root.querySelector('#btnActualPrint');
  printButton.addEventListener('click', () => {
    window.print();

    if (isFragile) {
      printButton.disabled = true;
      printButton.textContent = 'พิมพ์เรียบร้อยแล้ว';
    }

    // แจ้งเตือนแบบแยกตามผู้ที่พิมพ์
    if (isOwnerViewer) {
      // เจ้าของพิมพ์ → แจ้งผู้เช่า
      pushNotif?.({
        text: `ร้านค้ากำลังเตรียมพัสดุสำหรับออเดอร์ ${order.orderNo}`,
        link: `#/order/${order.id}`,
        forRole: 'renter',
        toId: order.renterId
      });
    } else {
      // ผู้เช่าพิมพ์ (ส่งคืน) → แจ้งเจ้าของ
      pushNotif?.({
        text: `ลูกค้ากำลังเตรียมส่งคืนสำหรับออเดอร์ ${order.orderNo}`,
        link: `#/order/${order.id}`,
        forRole: 'owner',
        toId: order.ownerId
      });
    }
  });

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
      document.body.removeChild(root);
    }
  });
}


/**
 * UI หน้าสำหรับให้ลูกค้ายืนยันการรับสินค้าและอัปโหลดรูป
 * @param {object} order
 */
function openReceiptConfirmationPage(order) {
  if (document.getElementById('receiptModal')) return;
  const root = document.createElement('div');
  root.id = 'receiptModal';
  root.className = 'modal-backdrop show';
  let uploadedReceiptPhotos = [];
  root.innerHTML = `<div class="modal payment-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="h2" style="text-align: center;">ยืนยันและตรวจสอบสินค้า</div><p class="muted" style="text-align: center;">กรุณาถ่ายรูปสินค้าที่ได้รับเพื่อเป็นหลักฐาน<br>(ขั้นต่ำ 2 รูป, สูงสุด 8 รูป)</p><div class="slip-upload-form"><label for="receiptUpload" class="slip-upload-box"><span class="icon">📷</span><span>คลิกเพื่อเลือกรูปภาพ</span></label><input type="file" id="receiptUpload" accept="image/*" class="hidden" multiple><div id="receiptPreview" class="receipt-preview hidden"></div></div><div class="my-info-footer" style="justify-content: space-between;"><button class="btn" id="btnRejectItem" style="background-color: #fee2e2; color: #b91c1c;">พบปัญหา / ไม่รับสินค้า</button><button class="btn-primary" id="btnConfirmItem" disabled>ยืนยันรับสินค้า</button></div></div>`;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const uploadInput = root.querySelector('#receiptUpload');
  const preview = root.querySelector('#receiptPreview');
  const confirmBtn = root.querySelector('#btnConfirmItem');
  uploadInput.addEventListener('change', () => {
    const files = Array.from(uploadInput.files).slice(0, 8);
    preview.innerHTML = '';
    uploadedReceiptPhotos = []; // เคลียร์รูปเก่า
    if (files.length > 0) {
      preview.classList.remove('hidden');
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          uploadedReceiptPhotos.push(e.target.result); // <<< เก็บข้อมูลรูปภาพ
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'preview-image';
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    }
    confirmBtn.disabled = files.length < 2;
  });

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnConfirmItem') && !confirmBtn.disabled) {
        const orderIndex = DB.orders.findIndex(o => o.id === order.id);
        if (orderIndex !== -1) {
            DB.orders[orderIndex].status = 'renter_received';
            DB.orders[orderIndex].renterProofPhotos = uploadedReceiptPhotos; // <<< บันทึกรูปลงออเดอร์
            saveOrders();
            pushNotif({ text: `ลูกค้ายืนยันรับสินค้าแล้ว (ออเดอร์ #${order.orderNo})`, link: `#/order/${order.id}`, forRole: 'owner', toId: order.ownerId });
            closeModal();
            showThankYouPopup({ title: 'ยืนยันสำเร็จ!', message: 'ขอบคุณที่ใช้บริการ ✨ ขอให้คุณมีความสุขกับประสบการณ์ใหม่ๆ นะครับ 😊' });
        }
    }
    if (e.target.closest('#btnRejectItem')) {
        showConfirmPopup({
            title: 'ยืนยันการปฏิเสธสินค้า', message: 'คุณแน่ใจหรือไม่ว่าสินค้ามีปัญหาและต้องการปฏิเสธการรับ?',
            onConfirm: () => {
                const reason = prompt('กรุณาระบุเหตุผลที่ปฏิเสธการรับสินค้า:');
                if (reason) { showToast('ส่งเรื่องของท่านให้ผู้ดูแลแล้ว', 'success'); closeModal(); }
            }
        });
    }
  });
}

/**
 * UI หน้าสำหรับให้ลูกค้าส่งสินค้าคืน
 * @param {object} order
 */
function openReturnShipmentPage(order) {
  if (document.getElementById('returnModal')) return;
  const root = document.createElement('div');
  root.id = 'returnModal';
  root.className = 'modal-backdrop show';
  const owner = DB.users.find(u => u.id === order.ownerId) || {};
  const carriersOptions = (window.CARRIERS || []).map(c => `<option value="${c}">${c}</option>`).join('');
  root.innerHTML = `<div class="modal order-detail-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="my-info-header"><strong>ดำเนินการส่งสินค้าคืน</strong><small class="muted">ออเดอร์: ${order.orderNo}</small></div><div class="my-info-body"><div class="slip-upload-form"><label for="returnUpload" class="slip-upload-box"><span class="icon">📸</span><span>อัปโหลดรูปถ่ายพัสดุก่อนส่ง (ขั้นต่ำ 1 รูป)</span></label><input type="file" id="returnUpload" accept="image/*" class="hidden"><div id="returnPreview" class="receipt-preview hidden"></div></div><div class="sender-info"><label class="form-label-group">ที่อยู่สำหรับส่งคืน</label><p>${owner.name || 'N/A'}<br>${owner.address || 'N/A'}<br>โทร. ${owner.phone || 'N/A'}</p></div><div class="form-field"><label for="returnCarrier">บริษัทขนส่ง</label><select id="returnCarrier">${carriersOptions}</select></div><div class="form-field"><label for="returnTracking">เลขพัสดุ</label><input type="text" id="returnTracking" placeholder="กรอกเลขพัสดุ"></div></div><div class="my-info-footer" style="display: flex; gap: 10px;"><button class="btn w-full" id="btnPrintReturnLabel">พิมพ์ใบปะหน้าส่งคืน</button><button class="btn-primary w-full" id="btnConfirmReturn" disabled>ยืนยันการส่งคืน</button></div></div>`;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const modalBody = root.querySelector('.my-info-body');
  if (modalBody) modalBody.addEventListener('wheel', e => e.stopPropagation());
  const uploadInput = root.querySelector('#returnUpload');
  const preview = root.querySelector('#returnPreview');
  const confirmBtn = root.querySelector('#btnConfirmReturn');
  const trackingInput = root.querySelector('#returnTracking');
  let uploadedReturnPhotos = [];
  const checkCanConfirm = () => { confirmBtn.disabled = !(uploadInput.files.length > 0 && trackingInput.value.trim() !== ''); };
  uploadInput.addEventListener('change', () => { const files = Array.from(uploadInput.files).slice(0, 8); preview.innerHTML = ''; uploadedReturnPhotos = []; if (files.length > 0) { preview.classList.remove('hidden'); files.forEach(file => { const reader = new FileReader(); reader.onload = e => { uploadedReturnPhotos.push(e.target.result); const img = document.createElement('img'); img.src = e.target.result; img.className = 'preview-image'; preview.appendChild(img); }; reader.readAsDataURL(file); }); } checkCanConfirm(); });
  trackingInput.addEventListener('input', checkCanConfirm);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnPrintReturnLabel')) { openPrintLabel(order, order.fragile || false); }
    if (e.target.closest('#btnConfirmReturn')) {
        const orderIndex = DB.orders.findIndex(o => o.id === order.id);
        if (orderIndex !== -1) {
            DB.orders[orderIndex].status = 'return_in_transit';
            DB.orders[orderIndex].returnTrackNo = trackingInput.value.trim();
            DB.orders[orderIndex].carrierBack = root.querySelector('#returnCarrier').value;
            DB.orders[orderIndex].returnProofPhotos = uploadedReturnPhotos;
            saveOrders();
            pushNotif({ text: `ลูกค้าส่งสินค้าคืนแล้ว (ออเดอร์ #${order.orderNo})`, link: `#/order/${order.id}`, forRole: 'owner', toId: order.ownerId });
            showToast('บันทึกข้อมูลการส่งคืนเรียบร้อย!', 'success');
            closeModal();
        }
    }
  });
}

// js/order-management.js

function openReview(orderId) {
  if (document.getElementById('reviewModal')) return;
  const order = DB.orders.find(o => o.id === +orderId);
  if (!order) { showToast('ไม่พบคำสั่งซื้อ', 'error'); return; }

  if (order.review) {
  showToast('คุณได้รีวิวออเดอร์นี้ไปแล้ว', 'info');
  return;
}

  const root = document.createElement('div');
  root.id = 'reviewModal';
  root.className = 'modal-backdrop show';

  root.innerHTML = `<div class="modal review-modal" role="dialog" aria-modal="true"><button class="modal-close" data-close="1">×</button><div class="h2" style="text-align: center;">ให้คะแนนสินค้า</div><p class="muted" style="text-align: center;">กรุณาให้คะแนนและเขียนรีวิวประสบการณ์การเช่าของคุณ</p><div class="review-form"><div class="form-field"><label for="ratingInput">คะแนน</label><div class="star-rating" id="starRating">
    <span class="star" data-value="1">★</span><span class="star" data-value="2">★</span><span class="star" data-value="3">★</span><span class="star" data-value="4">★</span><span class="star" data-value="5">★</span>
  </div></div><div class="form-field"><label for="commentInput">รีวิว</label><textarea id="commentInput" placeholder="เขียนรีวิวของคุณที่นี่..."></textarea></div><div class="my-info-footer"><button class="btn-primary w-full" id="btnSubmitReview" disabled>ส่งรีวิว</button></div></div></div>`;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const submitBtn = root.querySelector('#btnSubmitReview');
  const commentInput = root.querySelector('#commentInput');
  const starRatingContainer = root.querySelector('#starRating');
  let currentRating = 0; // เก็บค่าคะแนนดาวที่เลือก

  const checkCanSubmit = () => {
    submitBtn.disabled = !(currentRating > 0 && commentInput.value.trim().length > 0);
  };

  // --- Logic สำหรับคลิกดาว ---
  starRatingContainer.addEventListener('click', (e) => {
    const clickedStar = e.target.closest('.star');
    if (clickedStar) {
      currentRating = parseInt(clickedStar.dataset.value);
      // อัปเดต UI ดาว
      Array.from(starRatingContainer.children).forEach(star => {
        if (parseInt(star.dataset.value) <= currentRating) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
      checkCanSubmit();
    }
  });

  // --- เพิ่ม Hover effect ให้ดาว ---
  starRatingContainer.addEventListener('mouseover', (e) => {
    const hoveredStar = e.target.closest('.star');
    if (hoveredStar) {
      const hoverValue = parseInt(hoveredStar.dataset.value);
      Array.from(starRatingContainer.children).forEach(star => {
        if (parseInt(star.dataset.value) <= hoverValue) {
          star.classList.add('hover');
        } else {
          star.classList.remove('hover');
        }
      });
    }
  });

  starRatingContainer.addEventListener('mouseout', () => {
    Array.from(starRatingContainer.children).forEach(star => {
      star.classList.remove('hover');
    });
  });
  // --- จบ Logic สำหรับคลิกดาว ---

  commentInput.addEventListener('input', checkCanSubmit);

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnSubmitReview') && !submitBtn.disabled) {
      const orderIndex = DB.orders.findIndex(o => o.id === order.id);
      if (orderIndex !== -1) {
        DB.orders[orderIndex].review = {
          rating: currentRating,
          comment: commentInput.value.trim(),
          reviewerId: state.user.id,
          createdAt: new Date().toISOString()
        };
        // keep status as-is (do not change to 'closed');
        saveOrders();
        // ส่ง Notification ไปให้เจ้าของสินค้า
        pushNotif({ text: `มีรีวิวใหม่สำหรับออเดอร์ #${order.orderNo}`, link: `#/order/${order.id}`, forRole: 'owner', toId: order.ownerId });
        showToast('ขอบคุณสำหรับรีวิว!', 'success');
        closeModal();
      }
    }
  });
}

function cancelOrder(order) {
  const orderIndex = DB.orders.findIndex(o => o.id === order.id);
  if (orderIndex !== -1) {
    DB.orders[orderIndex].status = 'cancelled';
    saveOrders();
    pushNotif({ text: `ขออภัย, ออเดอร์ #${order.orderNo} ของท่านถูกยกเลิกแล้ว`, link: `#/order/${order.id}`, forRole: 'renter', toId: order.renterId });
    showToast(`ออเดอร์ #${order.orderNo} ถูกยกเลิกเรียบร้อยแล้ว`, 'info');
    showToast(`ระบบกำลังดำเนินการคืนเงินจำนวน ${money(order.total.grand)} บาท`, 'success');
    document.getElementById('orderDetailModal')?.remove();
  } else {
    showToast('เกิดข้อผิดพลาดในการยกเลิกออเดอร์', 'error');
  }
}

function showLateReturnRulesPopup() {
  showConfirmPopup({
    title: 'กฎการคืนสินค้าล่าช้า',
    message: 'หากไม่คืนภายใน 7 วันหลังครบกำหนด ทางบริษัทขอสงวนสิทธิ์ในการหักเงินมัดจำเต็มจำนวน และบัญชีของท่านอาจถูกระงับการใช้งาน',
    onConfirm: () => {}
  });
}

function checkOverdueOrders() {
  const now = new Date();
  (DB.orders || []).forEach(order => {
    if (order.status !== 'renter_received') return;
    const rentalEndDate = parseDateInput(order.rentalEnd);
    const returnDueDate = rentalEndDate ? addDays(rentalEndDate, 1) : null;
    if (!returnDueDate || now < returnDueDate) return;
    const overdueDays = Math.floor((now - returnDueDate) / 86400000) + 1;
    const notifKey = `overdue_d${overdueDays}`;
    order.overdueNotifSent = order.overdueNotifSent || {};
    if (!order.overdueNotifSent[notifKey]) {
        pushNotif({
            text: `ออเดอร์ #${order.orderNo} เกินกำหนดส่งคืนมาแล้ว ${overdueDays} วัน`,
            link: `#/show-late-rules`,
            forRole: 'renter',
            toId: order.renterId
        });
        order.overdueNotifSent[notifKey] = true;
        saveOrders();
    }
  });
}