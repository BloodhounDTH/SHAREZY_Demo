// admin/js/modules/search.js
// Search Product: ตารางค้นหา + sort + edit modal (รองรับ id ทั้ง #tblSearch และ #tblProductsAll)

const SP = { filters:{ ownerId:'', cat:'', status:'', q:'' }, sortBy:'id', sortDir:'asc' };

function ensureMask(){ let m=document.querySelector('.mask'); if(!m){m=document.createElement('div'); m.className='mask'; document.body.appendChild(m);} return m; }
function ensureModal(){ let m=document.getElementById('adminModal'); if(!m){m=document.createElement('div'); m.id='adminModal'; document.body.appendChild(m);} return m; }
function lockScroll(on){ document.body.classList.toggle('no-scroll', !!on); }

function getUsers(){ return Array.isArray(window.DB_USERS) ? DB_USERS : []; }
function getOwners(){ return getUsers().filter(u => u.role === 'owner'); }
function ownerMap(){ const m={}; getOwners().forEach(o=>m[String(o.id)]=o.shop||o.name||`Owner ${o.id}`); return m; }

function findProductArrays(){
  const arrs=[]; for (const k of Object.keys(window)){ const v=window[k];
    if(Array.isArray(v)&&v.length&&typeof v[0]==='object'){
      const ok=v.some(o=>'ownerId'in o&&('pricePerDay'in o||'price'in o||'dailyPrice'in o));
      if(ok) arrs.push(v);
    }
  } return arrs.flat();
}
function getAllProducts(){
  const c=Array.isArray(window.ITEM_CLOTHES)?ITEM_CLOTHES:[]; const t=Array.isArray(window.ITEM_TOOLS)?ITEM_TOOLS:[];
  const merged=[...c,...t]; return merged.length?merged:findProductArrays();
}
function normalizeAssetUrl(url, fb){ if(!url) return fb; let out=String(url).replace(/(^|\/ )admin\/assets\//,'$1../assets/'); if(!/^(\.\.\/|https?:)/.test(out)) out='../assets/'+out.replace(/^assets\//,''); return out; }
function productThumb(p){ const fb=`../assets/pic${100+(Number(p.id)||0)%62}.jpg`; if(Array.isArray(p.images)&&p.images[0]) return normalizeAssetUrl(p.images[0],fb); return normalizeAssetUrl(p.image,fb); }
const money = n => (+n||0).toLocaleString();

export function renderSearchProduct(){
  initFilters(); bindEvents(); renderTable();
}

function initFilters(){
  const selOwner=document.getElementById('sp_owner');
  if (selOwner){
    const owners=getOwners();
    selOwner.innerHTML=`<option value="">ทั้งหมด</option>` + owners.map(o=>`<option value="${o.id}">${o.shop||o.name||('Owner '+o.id)}</option>`).join('');
  }
  const selCat=document.getElementById('sp_cat');
  if (selCat){
    const cats=Array.from(new Set(getAllProducts().map(p=>p.category).filter(Boolean)));
    selCat.innerHTML=`<option value="">ทั้งหมด</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }
  const selStatus=document.getElementById('sp_status');
  if (selStatus){
    selStatus.innerHTML=`<option value="">ทั้งหมด</option><option value="active">Active</option><option value="inactive">Inactive</option>`;
  }
  // ย่อช่องค้นหา
  document.getElementById('sp_q')?.classList.add('input-lg');
}

function bindEvents(){
  document.getElementById('sp_apply')?.addEventListener('click', apply);
  document.getElementById('sp_reset')?.addEventListener('click', reset);
  document.getElementById('sp_q')?.addEventListener('keydown', e=>{ if(e.key==='Enter') apply(); });
  (document.querySelectorAll('#tblSearch thead th[data-sort], #tblProductsAll thead th[data-sort]')||[]).forEach(th=>{
    th.addEventListener('click', ()=>{
      const k=th.getAttribute('data-sort');
      if(SP.sortBy===k) SP.sortDir=(SP.sortDir==='asc'?'desc':'asc'); else {SP.sortBy=k;SP.sortDir='asc';}
      renderTable();
    });
  });
}
function apply(){
  SP.filters.ownerId=document.getElementById('sp_owner')?.value||'';
  SP.filters.cat=document.getElementById('sp_cat')?.value||'';
  SP.filters.status=document.getElementById('sp_status')?.value||'';
  SP.filters.q=(document.getElementById('sp_q')?.value||'').trim().toLowerCase();
  renderTable();
}
function reset(){
  ['sp_owner','sp_cat','sp_status','sp_q'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  SP.filters={ ownerId:'', cat:'', status:'', q:'' }; SP.sortBy='id'; SP.sortDir='asc'; renderTable();
}

function filterProducts(list){
  const f=SP.filters; let out=list.slice();
  if(f.ownerId) out=out.filter(p=>String(p.ownerId)===String(f.ownerId));
  if(f.cat) out=out.filter(p=>String(p.category||'').toLowerCase()===f.cat.toLowerCase());
  if(f.status) out=out.filter(p=>(!!p.active)===(f.status==='active'));
  if(f.q){
    const q=f.q; out=out.filter(p=>{
      const s=[p.title,p.category,p.description,p.id,p.sku,p.code].filter(Boolean).join(' ').toLowerCase();
      return s.includes(q);
    });
  }
  return out;
}
function sortProducts(list){
  const k=SP.sortBy, dir=SP.sortDir==='asc'?1:-1, owners=ownerMap();
  return list.slice().sort((a,b)=>{
    if(k==='id') return String(a.id).localeCompare(String(b.id))*dir;
    if(k==='title') return String(a.title||'').localeCompare(String(b.title||''))*dir;
    if(k==='owner') return String(owners[String(a.ownerId)]||'').localeCompare(String(owners[String(b.ownerId)]||''))*dir;
    if(k==='category') return String(a.category||'').localeCompare(String(b.category||''))*dir;
    if(k==='price') return (((+a.pricePerDay)||0)-((+b.pricePerDay)||0))*dir;
    if(k==='active') return ((a.active===b.active)?0:(a.active?1:-1))*dir;
    return 0;
  });
}

function renderTable(){
  const tbl = document.querySelector('#tblSearch tbody') || document.querySelector('#tblProductsAll tbody');
  if (!tbl) return;

  let rows=getAllProducts();
  rows=sortProducts(filterProducts(rows));
  const owners=ownerMap();

  tbl.innerHTML = rows.length ? rows.map(p=>`
    <tr data-pid="${p.id}">
      <td>${p.id}</td>
      <td><div class="tbl-thumb" style="background-image:url('${productThumb(p)}')"></div></td>
      <td class="linklike" data-open-merchant="${p.ownerId}">${p.title||'(ไม่มีชื่อ)'}</td>
      <td>${p.category||'-'}</td>
      <td style="text-align:right">${money(+p.pricePerDay||0)}</td>
      <td>${owners[String(p.ownerId)]||('Owner '+p.ownerId)}</td>
      <td>${p.active?'<span class="badge st-open">Active</span>':'<span class="badge st-rejected">Inactive</span>'}</td>
      <td><button class="btn btn-mini" data-edit="${p.id}">แก้ไข</button></td>
    </tr>
  `).join('') : `<tr><td colspan="8">ไม่พบสินค้า</td></tr>`;

  tbl.querySelectorAll('[data-open-merchant]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); openOwnerMini(el.getAttribute('data-open-merchant')); });
  });
  tbl.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); openProductEdit(btn.getAttribute('data-edit'), renderTable); });
  });
}

// modal ร้านแบบย่อ
function openOwnerMini(ownerId){
  const mask=ensureMask(), modal=ensureModal();
  const o=getOwners().find(x=>String(x.id)===String(ownerId));
  modal.className='modal-md'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);
  modal.innerHTML=`
    <h3>ข้อมูลร้าน</h3>
    <div style="display:flex;gap:12px;align-items:center">
      <div class="owner-avatar"><img src="../assets/shop${((+ownerId-1)%4)+1}.jpg" alt=""></div>
      <div>
        <div><strong>${o?(o.shop||o.name):('Owner '+ownerId)}</strong></div>
        <div>ผู้ติดต่อ: ${o?.name||'-'}</div>
        <div>โทร: ${o?.phone||'-'}</div>
        <div>อีเมล: ${o?.email||'-'}</div>
        <div style="max-width:520px">${o?.address||''}</div>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right"><button id="om_close">ปิด</button></div>
  `;
  document.getElementById('om_close')?.addEventListener('click', close);
  mask.onclick = (e)=>{ if (e.target===mask) close(); };
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}

// edit modal — ใช้รูปแบบเดียวกับ renters.js
function openProductEdit(productId, onSave){
  const mask=ensureMask(), modal=ensureModal();
  const all=getAllProducts(); const prod=all.find(p=>String(p.id)===String(productId));
  if(!prod){ alert('ไม่พบสินค้า'); return; }
  const img=productThumb(prod);

  modal.className='modal-lg'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);
  modal.innerHTML=`
    <h3>แก้ไขสินค้า #${prod.id}</h3>
    <div style="display:grid;grid-template-columns:220px 1fr;gap:12px;align-items:start">
      <div>
        <img id="sp_preview" src="${img}" style="width:100%;height:200px;object-fit:cover;border-radius:8px" alt="">
        <input type="text" id="sp_img" value="${img}" placeholder="รูปภาพ URL" class="input-lg" style="width:100%;margin-top:6px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="form-row"><label>ชื่อสินค้า</label><input type="text" id="sp_title" value="${prod.title||''}" class="input-lg"></div>
        <div class="form-row"><label>หมวดหมู่</label><input type="text" id="sp_cat_edit" value="${prod.category||''}" class="input-md"></div>
        <div class="form-row"><label>ราคา/วัน</label><input type="number" id="sp_price" value="${+prod.pricePerDay||0}" min="0" class="input-sm"></div>
        <div class="form-row" style="display:flex;align-items:center;gap:6px;margin-top:22px">
          <input type="checkbox" id="sp_active" ${prod.active?'checked':''}> <label for="sp_active">Active</label>
        </div>
        <div class="form-row" style="grid-column:1/-1"><label>รายละเอียด</label><textarea id="sp_desc" rows="3">${prod.description||''}</textarea></div>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px">
      <button id="sp_cancel">ยกเลิก</button>
      <button id="sp_save" class="btn">บันทึก</button>
    </div>
  `;
  const imgInput=document.getElementById('sp_img'), preview=document.getElementById('sp_preview');
  imgInput?.addEventListener('input', ()=>{ preview.src = normalizeAssetUrl(imgInput.value, img); });
  document.getElementById('sp_cancel')?.addEventListener('click', close);
  mask.onclick=(e)=>{ if(e.target===mask) close(); };
  document.getElementById('sp_save')?.addEventListener('click', ()=>{
    prod.title=(document.getElementById('sp_title').value||'').trim();
    prod.category=(document.getElementById('sp_cat_edit').value||'').trim();
    prod.pricePerDay=Math.max(0, parseFloat(document.getElementById('sp_price').value||'0'));
    prod.active=!!document.getElementById('sp_active').checked;
    prod.description=(document.getElementById('sp_desc').value||'').trim();
    const newImg=(imgInput.value||'').trim();
    if(newImg){ if(!Array.isArray(prod.images)) prod.images=[]; prod.images[0]=normalizeAssetUrl(newImg,img); }
    try{ window.showToast?.('บันทึกสินค้าเรียบร้อย','success'); }catch{}
    close(); if(typeof onSave==='function') onSave();
  });
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}

// quick search input (admin.html)
document.getElementById('productSearchAll')?.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){ SP.filters.q = (e.target.value||'').trim().toLowerCase(); renderTable(); }
});
