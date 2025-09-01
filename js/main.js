//
// ===== Sharezy Main Application Initializer =====
//

// --- Global State Management ---
const DB = {}; // To hold data from other files
const state = {
  user: JSON.parse(localStorage.getItem("s_user") || "null"),
  cart: JSON.parse(localStorage.getItem("s_cart") || "[]"),
  notifs: JSON.parse(localStorage.getItem("s_notif") || "[]"),
  currentCat: "สินค้าทั้งหมด",
  filterStart: null,
  filterEnd: null,
  couponCode: "",
  productPageByCat: {}
};

// Persistence helpers
const save = () => {
  localStorage.setItem("s_user", JSON.stringify(state.user));
  localStorage.setItem("s_cart", JSON.stringify(state.cart));
  localStorage.setItem("s_notif", JSON.stringify(state.notifs));
};
function loadOrders(){ try { return JSON.parse(localStorage.getItem("s_orders")||"[]"); } catch(_){ return []; } }
function saveOrders(){
  // ย่อข้อมูลออเดอร์ (ตัดฟิลด์หนัก ๆ ออกก่อน)
  const shrink = (o)=>({
    id:o.id, orderNo:o.orderNo, ownerId:o.ownerId, renterId:o.renterId,
    items:Array.isArray(o.items)?o.items.slice(0,50):[],
    status:o.status,
    rentalStart:o.rentalStart||o.startDate||null,
    rentalEnd:o.rentalEnd||o.endDate||null,
    paymentMethod:o.paymentMethod||null,
    shipTrackNo:o.shipTrackNo||'',
    returnTrackNo:o.returnTrackNo||'',
    review:o.review||null,
    createdAt:o.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString()
  });

  const isQuota = (e)=> e && (
    e.name==='QuotaExceededError' || e.name==='NS_ERROR_DOM_QUOTA_REACHED' || e.code===22 || e.code===1014
  );

  let data = (DB.orders||[]).map(shrink);

  // ลองเซฟก่อน
  try {
    localStorage.setItem('s_orders', JSON.stringify(data));
    return;
  } catch(e){
    if (!isQuota(e)) throw e;
  }

  // ถ้าเต็ม ให้ตัดออเดอร์ที่ "จบแล้ว/เก่า" ออกทีละชุดจนกว่าจะเซฟได้
  const doneSet = new Set(['completed','closed','cancelled','deposit_returned']);
  const ranked = data.map(o=>({o, done:doneSet.has(o.status),
    t: new Date(o.updatedAt||o.createdAt||Date.now()).getTime()}))
    .sort((a,b)=> (a.done!==b.done)? (a.done?-1:1) : (a.t-b.t));

  for (let cut= Math.ceil(ranked.length*0.1); ranked.length>0; ){
    // ตัดอย่างน้อย 10% ต่อรอบ
    const victims = ranked.splice(0, Math.max(10, cut)).map(r=>r.o.id);
    data = data.filter(o=>!victims.includes(o.id));
    try{
      localStorage.setItem('s_orders', JSON.stringify(data));
      console.warn('[saveOrders] quota: pruned', victims.length, 'orders, saved left =', data.length);
      return;
    }catch(e){
      if (!isQuota(e)) throw e;
      // ถ้ายังเต็มก็วนตัดต่อ
    }
  }

  // สุดท้าย เก็บเฉพาะงานค้างไว้ก่อนเพื่อให้ flow ไปต่อ
  const active = (DB.orders||[]).filter(o=>!doneSet.has(o.status)).map(shrink);
  try{
    localStorage.setItem('s_orders', JSON.stringify(active));
    console.warn('[saveOrders] saved only active orders =', active.length);
  }catch(e){
    console.error('[saveOrders] failed completely:', e);
  }
}



// --- Header UI Rendering ---
function mountHeader(){
  const right=byId('hdrRight');
  if (!right) return;
  
  // คืนค่าโค้ด HTML ให้เหมือนกับไฟล์ main_backup.js ต้นฉบับ 100%
  right.innerHTML = state.user ? `
    <button class="btn-pill" id="btnUser">👤</button>
    <button class="btn-pill" id="btnSearch">🔎</button>
    <button class="btn-pill" id="btnCart">🛒<span id="cartCount" class="cart-badge">${state.cart.length}</span></button>
    <button class="btn-pill" id="btnBell">🔔<span id="notifBadge" class="dot"></span></button>
    ${state.user?.role==='admin' ? '<button class="btn-pill gear" id="btnAdmin" title="แดชบอร์ดแอดมิน">⚙️</button>' : ''}
  ` : `
    <button class="btn-pill" id="btnLogin">👤</button>
    <button class="btn-pill" id="btnSearch">🔎</button>
  `;
  updateNotifBadge();
}

// js/main.js

function renderAccountMenu(){
  const box=byId('accountMenu'); if(!box) return;
  if(!state.user){
    box.classList.add('hidden');
    return;
  }
  
  const user = state.user;
  const rank = getUserRank(user);
  
  box.innerHTML=`
    <div class="menu-item account-header">
      <div class="account-rank-icon-large rank-${rank.name.toLowerCase()}">${rank.icon}</div>
      <div class="account-info-center">
        <strong>สวัสดี ${user.name || "Guest"}</strong>
        <small class="rank-name rank-${rank.name.toLowerCase()}">ระดับ ${rank.name}</small>
        <small>คะแนน ${user.points || 0}</small>
      </div>
    </div>
    <div class="hr"></div>
    <a class="menu-item" href="#" data-act="my-info">ข้อมูลของฉัน</a>
    <a class="menu-item" href="#" data-act="ph-buyer">ประวัติการเช่า</a>
    ${user.role === 'owner' ? '<a class="menu-item" href="#" data-act="manage-shop"><b>จัดการร้านค้า</b></a>' : ''}
    <div class="hr"></div>
    <a class="menu-item" href="#" data-act="logout">ออกจากระบบ</a>`;
}

// --- Main Page Date Filter ---
function wireDateFilter(){
  const s = byId('startDate'); const e = byId('endDate');
  if(!s || !e) return;

  if(state.filterStart) s.value = fmtDateInput(state.filterStart);
  if(state.filterEnd)   e.value = fmtDateInput(state.filterEnd);

  const onChange = ()=>{
    const sv = parseDateInput(s.value);
    if (sv) e.min = fmtDateInput(addDays(sv, 1)); else e.removeAttribute('min');

    state.filterStart = sv;
    state.filterEnd   = parseDateInput(e.value);
    save();
    renderProducts(undefined, state.currentCat || 'สินค้าทั้งหมด');
    if (byId('checkoutModal')) validateCartDates?.();
  };
  s.addEventListener('change', onChange);
  e.addEventListener('change', onChange);
}

function validateCartDates(){
  const s = state.filterStart;
  const e = state.filterEnd;
  const bad = state.cart.filter(id => {
      const prod = (products||[]).find(p => p.id === id);
      return prod && !productStatus(prod, s, e).available;
  });

  const btn = byId('btnConfirmOrder');
  const alert = byId('checkoutAlert');
  const blocked = bad.length > 0;

  if(btn) {
      btn.disabled = blocked;
      btn.classList.toggle('btn--disabled', blocked);
  }
  if(alert) {
      alert.classList.toggle('hidden', !blocked);
      if(blocked) alert.innerHTML = `สินค้าบางรายการไม่พร้อมให้บริการในวันที่ท่านเลือก`;
  }
  return { blocked };
}

function scrollToSearch(){
  const input = byId('searchInput');
  if(!input) return;

  // อ่านค่าความสูงของ Header จาก CSS Variable '--header-h' โดยตรง
  const rootStyles = getComputedStyle(document.documentElement);
  let headerH = parseInt(rootStyles.getPropertyValue('--header-h')) || 96;
  
  const extraOffset = 40; // ใช้ระยะห่าง 40px เหมือนในโค้ดเดิมของคุณ
  
  const y = input.getBoundingClientRect().top + window.scrollY - (headerH + extraOffset);

  window.scrollTo({ top: y, behavior: 'smooth' });
  
  setTimeout(() => {
    input.focus({ preventScroll: true });
    input.select?.();
  }, 350);
}

// --- Global Event Bus ---
function mountEvents(){
  document.addEventListener('click',(e)=>{
    const t=e.target.closest('[data-act]') || e.target;
    const act = t.dataset.act;

    // --- Menu Actions ---
    if (act === "my-info") openMyInfoModal();
    if (act === "ph-buyer") openPurchaseHistoryBuyer();
    if (act === "manage-shop") openPurchaseHistoryOwner();
    if (act === "logout") {
        state.user=null; save(); mountHeader(); renderAccountMenu();
        showToast('ออกจากระบบแล้ว','info');
    }

    // --- Header & Global Buttons ---
    if(t.closest('#btnLogin')) openAuthModal(false);
    if(t.closest('#btnUser')) byId('accountMenu')?.classList.toggle('hidden');
    if(t.closest('#btnCart')) openCart();
    if(t.closest('#closeCart')) closeCart();
    if(t.closest('#btnBell')){
        const panel=byId('notifPanel');
        if(panel?.classList.contains('hidden')){
            positionNotifPanel();
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
            if(state.user) markAllReadFor(state.user.id);
        }
    }
    if (t.closest('#btnSearch')) { scrollToSearch(); }
    if (t.closest('#btnAdmin')) { openAdmin(); }
    if (t.closest('#btnClearCart')) {
        if (state.cart.length > 0) {
            showConfirmPopup({
                title: 'ยืนยันการล้างตะกร้า',
                message: 'คุณต้องการนำสินค้าทั้งหมดออกจากตะกร้าใช่หรือไม่?',
                onConfirm: () => {
                    state.cart = []; save(); renderCart();
                    showToast('ล้างตะกร้าเรียบร้อยแล้ว', 'info');
                }
            });
        }
    }
    if (t.closest('#btnCheckout')) { closeCart(); openCheckout(); }
    if (t.dataset.remove) {
        const id = +t.dataset.remove;
        state.cart = state.cart.filter(x => x !== id); save(); renderCart();
    }

    // --- Outside Click Handlers ---
    if(!e.target.closest('#accountMenu') && !e.target.closest('#btnUser')) {
        byId('accountMenu')?.classList.add('hidden');
    }
  });

  // --- Other Event Listeners ---
  byId('searchBtn')?.addEventListener('click',()=> applySearch(byId('searchInput')?.value));
  byId('searchInput')?.addEventListener('keydown',(e)=>{ if(e.key==='Enter') applySearch(e.target.value); });
  function applySearch(q){
    q=(q||"").trim().toLowerCase();
    if(!q){ renderProducts(products,"สินค้าทั้งหมด"); return; } 
    const list=products.filter(p=>[p.title,p.color,p.size,p.category].join(" ").toLowerCase().includes(q));
    renderProducts(list,`ผลลัพธ์: “${q}”`);
  }

  byId('catTrack')?.addEventListener('click',(e)=>{
    const card=e.target.closest('.cat-card'); if(!card) return;
    renderProducts(undefined, card.dataset.cat);
    byId('browse')?.scrollIntoView({ behavior: 'smooth' });
  });
  byId('catPrev')?.addEventListener('click',()=>{catIndex--;updateCatTransform();});
  byId('catNext')?.addEventListener('click',()=>{catIndex++;updateCatTransform();});
  window.addEventListener('resize',updateCatTransform);

  const notifList = byId('notifList');
  if (notifList) {
      notifList.addEventListener('wheel', e => e.stopPropagation());
  }
}


// --- App Initialization ---
function init(){
  DB.users = window.DB_USERS || [];
  DB.products = window.products = [...(window.ITEM_CLOTHES || []), ...(window.ITEM_TOOLS || [])];
  DB.categories = window.CAT_SLIDES || [];
  DB.carriers = window.CARRIERS || [];
  DB.coupons = window.COUPONS || [];
  DB.orders = loadOrders();

  mountHeader();
  renderAccountMenu();
  renderCart();
  renderNotifs();
  renderCats();
  updateCatTransform();

  const allProducts = [...DB.products];
  for (let i = allProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
  }
  renderProducts(allProducts, "สินค้าทั้งหมด");
  
  renderRecommended();
  wireDateFilter();
  autoReveal(document);
  mountEvents();

  if(state.user){
    onLoginShowNotifs();
    startRealtimeNotifs();
    checkOverdueOrders();
  }
}

// Start the app!
document.addEventListener('DOMContentLoaded', init);