// admin/js/modules/renters.js
const R = { filters: { ownerId:'', q:'' } };
function nz(v,d){ return (v===undefined||v===null)?d:v; }

function ensureMask(){ let m=document.querySelector('.mask'); if(!m){m=document.createElement('div');m.className='mask';document.body.appendChild(m);} return m; }
function ensureModal(){ let m=document.getElementById('adminModal'); if(!m){m=document.createElement('div');m.id='adminModal';document.body.appendChild(m);} return m; }
function lockScroll(on){ document.body.classList.toggle('no-scroll', !!on); }

function getUsers(){ return Array.isArray(window.DB_USERS) ? DB_USERS : []; }
function getOwners(){ return getUsers().filter(u => u.role === 'owner'); }
function ownerName(o){ return o?.shop || o?.name || `Owner ${nz(o?.id,'')}`; }

function findProductArrays(){
  const arrs=[]; for(const k of Object.keys(window)){ const v=window[k];
    if(Array.isArray(v)&&v.length&&typeof v[0]==='object'){
      const ok=v.some(o=>'ownerId'in o&&('pricePerDay'in o||'price'in o)); if(ok) arrs.push(v);
    } }
  return arrs.flat();
}
function getAllProducts(){
  const c=Array.isArray(window.ITEM_CLOTHES)?ITEM_CLOTHES:[]; const t=Array.isArray(window.ITEM_TOOLS)?ITEM_TOOLS:[];
  const merged=[...c,...t]; return merged.length?merged:findProductArrays();
}
function normalizeAssetUrl(url, fb){ if(!url) return fb; let out=url.replace(/(^|\/)admin\/assets\//,'$1../assets/'); if(!/^(\.\.\/|https?:)/.test(out)) out='../assets/'+out.replace(/^assets\//,''); return out; }
function shopImg(ownerId){ const idx=((+ownerId-1)%4)+1; return `../assets/shop${idx}.jpg`; }
function productThumb(p){ const fb=`../assets/pic${100+(Number(p.id)||0)%62}.jpg`; if(Array.isArray(p.images)&&p.images[0]) return normalizeAssetUrl(p.images[0],fb); return normalizeAssetUrl(p.image,fb); }
const money = n => (+n||0).toLocaleString();

export function renderRenters(){
  const sel = document.getElementById('r_owner');
  if (sel){
    const owners=getOwners();
    sel.innerHTML = `<option value="">ทั้งหมด</option>` + owners.map(o=>`<option value="${o.id}">${ownerName(o)}</option>`).join('');
  }
  document.getElementById('r_apply')?.addEventListener('click', applyFilters);
  document.getElementById('r_reset')?.addEventListener('click', resetFilters);
  document.getElementById('r_search')?.addEventListener('keydown', e=>{ if(e.key==='Enter') applyFilters(); });
  renderOwnerList();
}

function applyFilters(){
  R.filters.ownerId=document.getElementById('r_owner')?.value||'';
  R.filters.q=(document.getElementById('r_search')?.value||'').trim().toLowerCase();
  renderOwnerList();
}
function resetFilters(){
  const o=document.getElementById('r_owner'), q=document.getElementById('r_search');
  if(o) o.value=''; if(q) q.value='';
  R.filters={ ownerId:'', q:'' };
  renderOwnerList();
}

function renderOwnerList(){
  const host=document.getElementById('ownerList'); if(!host) return;
  const owners=getOwners().filter(o=>{
    if(R.filters.ownerId&&String(o.id)!==String(R.filters.ownerId)) return false;
    if(R.filters.q){
      const s=(ownerName(o)+' '+(o.address||'')+' '+(o.email||'')+' '+(o.phone||'')).toLowerCase();
      if(!s.includes(R.filters.q)) return false;
    }
    return true;
  });

  if(!owners.length){ host.innerHTML=`<div class="muted">ไม่พบร้านค้า</div>`; return; }

  host.innerHTML = owners.map(o=>`
    <div class="p-card">
      <div class="thumb" style="background-image:url('${shopImg(o.id)}')"></div>
      <div class="p-body">
        <div class="p-title linklike"><button class="btn" data-open="${o.id}" style="text-align:center"><br><strong>ร้าน: ${ownerName(o)}</strong></button></div>
        <div class="p-meta">ผู้ติดต่อ: ${o.name||'-'} · ${o.phone||'-'}</div>
        <div class="p-meta">${o.address||''}</div>
      </div>
    </div>
  `).join('');

  host.querySelectorAll('[data-open]').forEach(el=>{
    el.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); openOwnerModal(el.getAttribute('data-open')); });
  });
}

function openOwnerModal(ownerId){
  const mask=ensureMask(), modal=ensureModal();
  const owner=getOwners().find(o=>String(o.id)===String(ownerId));
  const items=getAllProducts().filter(p=>String(p.ownerId)===String(ownerId));

  modal.className='modal-lg'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);
  modal.innerHTML = `
    <div class="owner-box">
      <div class="owner-avatar"><img src="${shopImg(ownerId)}" alt=""></div>
      <div class="owner-meta">
        <div><strong>${ownerName(owner)}</strong></div>
        <div>${owner?.email||''}</div>
        <div>${owner?.address||''}</div>
        <div>โทร: ${owner?.phone||'-'}</div>
      </div>
      <div style="margin-left:auto"><button id="r_close" class="btn">ปิด</button></div>
    </div>
    <h3 style="margin:8px 0 8px;text-align:center">สินค้าในร้าน (${items.length})</h3>
    <div class="card-grid" id="r_owner_products"></div>
  `;

  const grid=document.getElementById('r_owner_products');
  grid.innerHTML = items.map(p=>`
    <div class="p-card">
      <div class="thumb" style="background-image:url('${productThumb(p)}')"></div>
      <div class="p-body">
        <div class="p-title">${p.title||'(ไม่มีชื่อ)'}</div>
        <div class="p-meta">${p.category||'-'} · ${money(+p.pricePerDay||0)} บาท/วัน</div>
        <div class="p-status" style="text-align:center">${p.active?'<span class="badge st-open">Active</span>':'<span class="badge st-rejected">Inactive</span>'}</div>
        <div class="p-actions"><button class="btn" data-edit="${p.id}">แก้ไข</button></div>
      </div>
    </div>
  `).join('') || `<div class="muted">ยังไม่มีสินค้า</div>`;

  grid.querySelectorAll('[data-edit]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation();
      openProductEdit(btn.getAttribute('data-edit'), ()=> openOwnerModal(ownerId));
    });
  });

  document.getElementById('r_close')?.addEventListener('click', close);
  mask.onclick = e => { if (e.target===mask) close(); };
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}

function openProductEdit(productId, onSave){
  const mask=ensureMask(), modal=ensureModal();
  const all=getAllProducts(); const prod=all.find(p=>String(p.id)===String(productId));
  if(!prod){ alert('ไม่พบสินค้า'); return; }
  const img=productThumb(prod);

  modal.className='modal-lg'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);
  modal.innerHTML = `
    <h3>แก้ไขสินค้า #${prod.id}</h3>
    <div style="display:grid;grid-template-columns:220px 1fr;gap:12px;align-items:start">
      <div>
        <img id="r_preview" src="${img}" style="width:100%;height:200px;object-fit:cover;border-radius:8px" alt="">
        <input type="text" id="r_img" value="${img}" placeholder="รูปภาพ URL" class="input-lg" style="width:100%;margin-top:6px">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="form-row"><label>ชื่อสินค้า</label><input type="text" id="r_title" value="${prod.title||''}" class="input-lg"></div>
        <div class="form-row"><label>หมวดหมู่</label><input type="text" id="r_cat" value="${prod.category||''}" class="input-md"></div>
        <div class="form-row"><label>ราคา/วัน</label><input type="number" id="r_price" value="${+prod.pricePerDay||0}" min="0" class="input-sm"></div>
        <div class="form-row" style="display:flex;align-items:center;gap:6px;margin-top:22px">
          <input type="checkbox" id="r_active" ${prod.active?'checked':''}> <label for="r_active">Active</label>
        </div>
        <div class="form-row" style="grid-column:1/-1"><label>รายละเอียด</label><textarea id="r_desc" rows="3">${prod.description||''}</textarea></div>
      </div>
    </div>
    <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px">
      <button id="r_cancel">ยกเลิก</button>
      <button id="r_save" class="btn">บันทึก</button>
    </div>
  `;
  const imgInput=document.getElementById('r_img'), preview=document.getElementById('r_preview');
  imgInput?.addEventListener('input', ()=>{ preview.src = normalizeAssetUrl(imgInput.value, img); });
  document.getElementById('r_cancel')?.addEventListener('click', close);
  mask.onclick = e => { if (e.target===mask) close(); };
  document.getElementById('r_save')?.addEventListener('click', ()=>{
    prod.title=(document.getElementById('r_title').value||'').trim();
    prod.category=(document.getElementById('r_cat').value||'').trim();
    prod.pricePerDay=Math.max(0, parseFloat(document.getElementById('r_price').value||'0'));
    prod.active=!!document.getElementById('r_active').checked;
    prod.description=(document.getElementById('r_desc').value||'').trim();
    const newImg=(imgInput.value||'').trim();
    if(newImg){ if(!Array.isArray(prod.images)) prod.images=[]; prod.images[0]=normalizeAssetUrl(newImg,img); }
    try{ window.showToast?.('บันทึกสินค้าเรียบร้อย','success'); }catch{}
    close(); if(typeof onSave==='function') onSave();
  });
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}
