// admin/js/modules/products.js
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

function ensureMask(){ let m=document.querySelector('.mask'); if(!m){m=document.createElement('div');m.className='mask';document.body.appendChild(m);} return m; }
function ensureModal(){ let m=document.getElementById('adminModal'); if(!m){m=document.createElement('div');m.id='adminModal';document.body.appendChild(m);} return m; }
function lockScroll(on){ document.body.classList.toggle('no-scroll', !!on); }
function normalizeAssetUrl(url,fb){ if(!url) return fb; let out=url.replace(/(^|\/)admin\/assets\//,'$1../assets/'); if(!/^(\.\.\/|https?:)/.test(out)) out='../assets/'+out.replace(/^assets\//,''); return out; }
function getUsers(){ return Array.isArray(window.DB_USERS) ? DB_USERS : []; }
function ownerNameById(id){ const u=getUsers().find(x=>String(x.id)===String(id)); return u?.shop || u?.name || `Owner ${id}`; }

export function renderProducts(page){ if(page==='product-approve') return renderApprove(); if(page==='product-rejected') return renderRejected(); }
export function approve(){ return renderApprove(); }
export function rejected(){ return renderRejected(); }

function seedApprove(){
  if (Array.isArray(window.__APPROVE_DEMO)) return;
  window.__APPROVE_DEMO = Array.from({length:15}).map((_,i)=>({
    pid: 8000+i, title:`สินค้าลงทะเบียนใหม่ ${i+1}`,
    category:['clothes','tools','gadget','bag'][i%4],
    pricePerDay:rand(80,900), ownerId:(i%5)+1, status:'pending',
    image:`../assets/pic${rand(101,162)}.jpg`,
    submittedAt:new Date(Date.now()-i*5400_000).toISOString().slice(0,16).replace('T',' ')
  }));
}
function seedRejectedIfEmpty(force=false){
  if (!force && Array.isArray(window.__REJECTED_DEMO) && window.__REJECTED_DEMO.length) return;
  const reasons=['ภาพสินค้าไม่ชัด','สินค้าผิดกฏหมาย','หมวดหมู่ไม่ถูกต้อง','ละเมิดลิขสิทธิ์','ภาพไม่เหมาะสม','ข้อมูลไม่ครบถ้วน','อื่น ๆ'];
  window.__REJECTED_DEMO = reasons.map((r,i)=>({
    date:new Date(Date.now()-i*86400000).toISOString().slice(0,10), ownerId:(i%5)+1, title:`สินค้าที่ถูกปฏิเสธ ${i+1}`, reason:r
  }));
}

/* ---------- APPROVE ---------- */
function renderApprove(){
  seedApprove();
  const tbody = document.querySelector('#tblProducts tbody') || createApproveTable();
  if (!tbody) return;

  const q   = (document.getElementById('productSearch')?.value||'').toLowerCase();
  const cat = ''; const catEl=document.getElementById('productCat'); if(catEl) catEl.style.display='none'; const qEl=document.getElementById('productSearch'); if(qEl){ qEl.classList.add('input-sm'); qEl.style.maxWidth='240px'; }

  const list=(window.__APPROVE_DEMO||[])
    .filter(p=>!q||p.title.toLowerCase().includes(q))
    .filter(p=>!cat||p.category===cat);

  tbody.innerHTML = list.length ? list.map(p=>`
    <tr>
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${(+p.pricePerDay).toLocaleString()}</td>
      <td><span class="status st-pending">pending</span></td>
      <td>${ownerNameById(p.ownerId)}</td>
      <td><button class="btn btn-mini" data-check="${p.pid}">ตรวจสอบ</button></td>
    </tr>
  `).join('') : `<tr><td colspan="6">ยังไม่มีสินค้าลงทะเบียนใหม่</td></tr>`;

  document.getElementById('btnProductRefresh')?.addEventListener('click', renderApprove);
  document.getElementById('productSearch')?.addEventListener('keydown', e=>{ if(e.key==='Enter') renderApprove(); });
  document.getElementById('productCat')?.addEventListener('change', renderApprove);

  tbody.querySelectorAll('button[data-check]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const pid=+b.getAttribute('data-check');
      const item=(window.__APPROVE_DEMO||[]).find(x=>x.pid===pid);
      if(item) openApproveModal(item);
    });
  });
}

function openApproveModal(item){
  const mask=ensureMask(), modal=ensureModal();
  modal.className='modal-lg'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);

  modal.innerHTML=`
    <h3>ตรวจสอบสินค้า</h3>
    <div class="owner-box">
      <div class="owner-avatar">🛍️</div>
      <div class="owner-meta">
        <div><strong>ผู้ขาย:</strong> ${ownerNameById(item.ownerId)}</div>
        <div><strong>หมวดหมู่:</strong> ${item.category}</div>
        <div><strong>ราคา/วัน:</strong> ${(+item.pricePerDay).toLocaleString()} บาท</div>
        <div><strong>ยื่นเมื่อ:</strong> ${item.submittedAt}</div>
      </div>
    </div>
    <img src="${normalizeAssetUrl(item.image,`../assets/pic${rand(101,162)}.jpg`)}" style="width:100%;max-height:340px;object-fit:cover;border-radius:8px" alt="">
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
      <button id="ap_reject">ไม่อนุมัติ</button>
      <button id="ap_ok" class="btn">อนุมัติ</button>
    </div>
  `;
  document.getElementById('ap_reject')?.addEventListener('click', ()=>{
    const reason=prompt('เหตุผลที่ไม่อนุมัติ:','ภาพสินค้าไม่ชัด')||'ไม่ระบุ';
    rejectItem(item, reason); close(); renderApprove();
  });
  document.getElementById('ap_ok')?.addEventListener('click', ()=>{ approveItem(item); close(); renderApprove(); });
  mask.onclick = e => { if (e.target===mask) close(); };
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}

function approveItem(item){
  window.__APPROVE_DEMO = (window.__APPROVE_DEMO||[]).filter(x=>x.pid!==item.pid);
}
function rejectItem(item, reason){
  window.__APPROVE_DEMO = (window.__APPROVE_DEMO||[]).filter(x=>x.pid!==item.pid);
  if(!Array.isArray(window.__REJECTED_DEMO)) window.__REJECTED_DEMO=[];
  window.__REJECTED_DEMO.push({ date:new Date().toISOString().slice(0,10), ownerId:item.ownerId, title:item.title, reason });
}

/* ---------- REJECTED ---------- */
function renderRejected(){
  seedRejectedIfEmpty();
  let tbody = document.querySelector('#tblProductsRejected tbody') || document.querySelector('#tblRejected tbody');
  if (!tbody) tbody = createRejectedTable();
  if (!tbody) return;

  const list=(window.__REJECTED_DEMO||[]);
  tbody.innerHTML = list.length ? list.map(p=>`
    <tr>
      <td>${p.date}</td>
      <td>${ownerNameById(p.ownerId)}</td>
      <td>${p.title}</td>
      <td>${p.reason}</td>
    </tr>
  `).join('') : `<tr><td colspan="4">ยังไม่มีรายการถูกปฏิเสธ</td></tr>`;
}

/* ---------- helpers: create table on the fly if HTML ไม่มี ---------- */
function createApproveTable(){
  const host = document.querySelector('section[data-view="product-approve"]');
  if (!host) return null;
  host.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
      <input id="productSearch" placeholder="ค้นหา..." class="input-sm" style="max-width:240px">
      <select id="productCat" class="input-sm" style="display:none">
        <option value="">ทุกหมวด</option>
        <option value="clothes">clothes</option>
        <option value="tools">tools</option>
        <option value="gadget">gadget</option>
        <option value="bag">bag</option>
      </select>
      <button id="btnProductRefresh" class="btn btn-mini">รีเฟรช</button>
    </div>
    <table id="tblProducts">
      <thead><tr>
        <th>สินค้า</th><th>หมวด</th><th>ราคา/วัน</th><th>สถานะ</th><th>ร้าน</th><th>ตรวจสอบ</th>
      </tr></thead>
      <tbody></tbody>
    </table>
  `;
  return host.querySelector('tbody');
}

function createRejectedTable(){
  const host = document.querySelector('section[data-view="product-rejected"]');
  if (!host) return null;
  host.innerHTML = `
    <table id="tblRejected">
      <thead><tr>
        <th>วันที่</th><th>ร้านค้า</th><th>สินค้า</th><th>เหตุผล</th>
      </tr></thead>
      <tbody></tbody>
    </table>
  `;
  return host.querySelector('tbody');
}
