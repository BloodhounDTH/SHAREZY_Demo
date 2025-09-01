//
// ===== Sharezy Cart & Checkout System =====
//

/**
 * เพิ่มสินค้าลงในตะกร้า
 * @param {number} id - ID ของสินค้า
 * @returns {boolean} - true หากเพิ่มสำเร็จ, false หากไม่สำเร็จ
 */
function addToCart(id){
  // 1. ตรวจสอบว่าล็อกอินหรือยัง
  if (!state.user){
    showLoginPopup?.();
    return false;
  }

  // 2. ป้องกันการเพิ่มสินค้าซ้ำ
  if (state.cart.includes(id)) {
    const p = (window.products || []).find(x => x.id === id);
    showToast(`"${p?.title || "สินค้า"}" อยู่ในตะกร้าแล้ว`, "info");
    return false;
  }

  // 3. ตรวจสอบสถานะความพร้อมของสินค้า (ถ้ามี)
  const p = (window.products || []).find(x => x.id === id);
  const start = state.filterStart || null;
  const end   = state.filterEnd   || null;
  const st = productStatus(p, start, end);
  if (!st.available){
    showToast(`"${p.title}" ไม่พร้อมให้เช่าในวันที่เลือก`, "error");
    return false;
  }

  // 4. เพิ่มสินค้า, บันทึก, และอัปเดต UI
  state.cart.push(id);
  save?.();
  renderCart?.();

  showToast(`เพิ่ม "${p?.title || "สินค้า"}" ลงตะกร้าแล้ว`, "success");
  return true;
}


/**
 * แสดงผลรายการสินค้าในตะกร้าและยอดรวม
 */
/**
 * แสดงผลรายการสินค้าในตะกร้าและยอดรวม
 */
function renderCart(){
  const cartCountEl = byId('cartCount');
  const cartItemsEl = byId('cartItems');
  const cartFootEl = byId('cartPanel')?.querySelector('.cart-foot');
  const subtotalEl = byId('cartSubtotal');

  if (!cartItemsEl || !cartFootEl) return;

  const items = state.cart.map(id => (products || []).find(p => p.id === id)).filter(Boolean);

  if (cartCountEl) cartCountEl.textContent = items.length;

  if (items.length > 0) {
    cartItemsEl.innerHTML = items.map(p => `
      <div class="cart-item">
        <img src="${imgPath(p.image)}" alt="${p.title}">
        <div class="cart-info">
          <div class="title">${p.title}</div>
          <div class="muted">฿${money(p.pricePerDay)}/วัน • ไซส์ ${p.size}</div>
        </div>
        <button class="icon-btn small remove" data-remove="${p.id}" title="นำออก">×</button>
      </div>
    `).join('');

    const subtotal = items.reduce((s, p) => s + (p.pricePerDay || 0), 0);
    if (subtotalEl) subtotalEl.textContent = money(subtotal) + " บาท";
    
    // แสดงส่วนท้ายเมื่อมีของในตะกร้า
    cartFootEl.style.display = 'block';

  } else {
    cartItemsEl.innerHTML = `<div class="empty">ยังไม่มีสินค้าในตะกร้า</div>`;
    
    // ซ่อนส่วนท้ายเมื่อไม่มีของในตะกร้า
    cartFootEl.style.display = 'none';
  }
}


/**
 * เปิด/ปิดฉากหลัง (Backdrop) ของตะกร้า
 * @param {boolean} show - true เพื่อแสดง
 */
function showCartBackdrop(show){
  const cartBackdrop = byId('cartBackdrop');
  if(!cartBackdrop) return;
  cartBackdrop.classList.toggle('hidden', !show);
  cartBackdrop.classList.toggle('show', show);
}

/**
 * เปิดแผงตะกร้าสินค้า
 */
function openCart(){
  const p = byId('cartPanel');
  if(p){
    p.classList.remove('hidden');
    requestAnimationFrame(()=>{
        p.classList.add('show');
        document.body.classList.add('modal-open'); // ล็อก scroll
    });
  }
  showCartBackdrop(true);
  window.hidePromoWidget?.(); // ซ่อนวิดเจ็ตโปรโมชัน

  // ทำให้เลื่อนได้เฉพาะรายการสินค้าในตะกร้า
  const scroller = p.querySelector('.cart-items');
  if (scroller){
    scroller.addEventListener('wheel', (e)=> e.stopPropagation(), { passive:true });
    scroller.addEventListener('touchmove', (e)=> e.stopPropagation(), { passive:true });
  }
}

/**
 * ปิดแผงตะกร้าสินค้า
 */
function closeCart(){
  const p = byId('cartPanel');
  if(p){
    p.classList.remove('show');
    // หน่วงเวลาเล็กน้อยเพื่อให้ animation เล่นจบก่อนซ่อนสนิท
    setTimeout(() => {
        p.classList.add('hidden');
        document.body.classList.remove('modal-open'); // ปลดล็อก scroll
    }, 300);
  }
  showCartBackdrop(false);
  window.showPromoWidget?.(); // แสดงวิดเจ็ตโปรโมชันอีกครั้ง
}

// Event listeners for closing cart
document.addEventListener('click',(e)=>{
  const cartPanel = byId('cartPanel');
  if(!cartPanel || cartPanel.classList.contains('hidden')) return;
  // ปิดเมื่อคลิกนอกตะกร้า (ที่ไม่ใช่ปุ่มเปิดตะกร้า)
  if(!e.target.closest('#cartPanel') && !e.target.closest('#btnCart')){
    closeCart();
  }
});
byId('cartBackdrop')?.addEventListener('click', ()=> closeCart());


/**
 * เปิด Modal สำหรับขั้นตอนการชำระเงิน (Checkout)
 */
// js/cart.js

function openCheckout(){
  const items = (state.cart || []).map(id => (products || []).find(p => p.id === id)).filter(Boolean);
  if(!items.length){ showToast('ยังไม่มีสินค้าในตะกร้า','info'); return; }
  if(!state.user){ openAuthModal(false); return; }

  // ดึงวันที่จากหน้าหลักเข้ามา ถ้า state ยังว่าง
  if (!state.filterStart && byId('startDate')?.value) state.filterStart = parseDateInput(byId('startDate').value);
  if (!state.filterEnd   && byId('endDate')?.value)   state.filterEnd   = parseDateInput(byId('endDate').value);

  const sVal = state.filterStart ? fmtDateInput(state.filterStart) : "";
  const eVal = state.filterEnd   ? fmtDateInput(state.filterEnd)   : "";

  const root = document.createElement('div');
  root.className = "modal-backdrop show";
  root.id = 'checkoutModal';

  const list = items.map(p=>`
    <div class="row" style="display:flex;gap:10px;align-items:center;margin-bottom:10px">
      <img src="${imgPath(p.image)}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #eee">
      <div style="flex:1">
        <div class="h3" style="margin:0">${p.title}</div>
        <div class="muted">฿${money(p.pricePerDay)}/วัน • มัดจำ ฿${money(p.deposit)} • ค่าส่ง ฿${money(p.shipFeeOut)}</div>
      </div>
    </div>`).join('');

  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="h2">ตรวจสอบและยืนยันการเช่า</div>
      <div class="hr"></div>
      <div class="date-filter" style="margin:6px 0 10px"><label class="df-field"><span>วันที่เริ่มเช่า</span><input type="date" id="coStart" value="${sVal}"></label><span class="df-sep">—</span><label class="df-field"><span>วันที่สิ้นสุด</span><input type="date" id="coEnd" value="${eVal}"></label></div>
      <div id="checkoutAlert" class="alert error hidden" style="margin:8px 0 12px"></div>
      <div class="ck-items">${list}</div>
      <div class="coupon-row"><input type="text" id="couponInput" placeholder="โค้ดส่วนลด (ถ้ามี)" value="${state.couponCode||''}"><button class="btn" id="applyCoupon">ใช้โค้ด</button></div>
      <div id="couponMsg" class="small muted" style="min-height:18px; text-align: right;"></div>
      <div id="ckTotals" class="muted" style="margin-top:8px; line-height: 1.6;"></div>
      
      <div class="detail-actions" style="margin-top:12px; display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn-primary" id="btnConfirmOrder">ยืนยันสั่งเช่า</button>
        <button class="btn" data-close="1">ยกเลิก</button>
      </div>
    </div>`;

    document.body.appendChild(root);
    document.body.classList.add('modal-open');

    // ▼▼▼ START: เพิ่มโค้ดแก้ปัญหา Scroll ทะลุ ▼▼▼
    const scrollableContent = root.querySelector('.ck-items');
    if (scrollableContent) {
      scrollableContent.addEventListener('wheel', e => e.stopPropagation());
    }
    // ▲▲▲ END: จบส่วนแก้ปัญหา Scroll ▲▲▲

    const closeModal = () => { document.body.classList.remove('modal-open'); if (root.parentNode) root.parentNode.removeChild(root); };
    root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });

    const cs = root.querySelector('#coStart');
    const ce = root.querySelector('#coEnd');
    const elTotals = root.querySelector('#ckTotals');
    const btnPlace = root.querySelector('#btnConfirmOrder');
    const couponInput = root.querySelector('#couponInput');
    const applyCouponBtn = root.querySelector('#applyCoupon');

    function applyConstraintsAndUpdate(){
        const sv = parseDateInput(cs.value);
        if (sv) ce.min = fmtDateInput(addDays(sv, 1)); else ce.removeAttribute('min');
        const ev = parseDateInput(ce.value);
        if (ev) cs.max = fmtDateInput(addDays(ev, -1)); else cs.removeAttribute('max');
        if (sv && ev && ev <= sv){
            ce.value = fmtDateInput(addDays(sv, 1));
        }
        updateTotalsAndValidate();
    }

    function updateTotalsAndValidate(){
        state.filterStart = parseDateInput(cs.value);
        state.filterEnd   = parseDateInput(ce.value);
        save?.();

        if (byId('startDate')) byId('startDate').value = cs.value;
        if (byId('endDate')) byId('endDate').value = ce.value;
        
        const days = daysBetween(state.filterStart, state.filterEnd);
        const orderLike = { items: state.cart.slice(), days };
        const base = computeSettlement(orderLike);
        const sLbl = state.filterStart ? fmtDateLabelTH(state.filterStart) : '—';
        const eLbl = state.filterEnd   ? fmtDateLabelTH(state.filterEnd)   : '—';
        const code = (state.couponCode || '').trim();
        const disc = computeCouponDiscount(code, { rent: base.rent, days, items });
        const grandAfter = Math.max(0, base.grand - (disc.amount||0));
        
        const couponMsg = root.querySelector('#couponMsg');
        if (!code) { couponMsg.textContent = ''; }
        else if (disc.ok) {
            couponMsg.textContent = `ใช้โค้ด: ${disc.def?.code} (ลด ฿${money(disc.amount)})`;
            couponMsg.style.color = 'green';
        } else {
            couponMsg.textContent = disc.label || 'โค้ดใช้ไม่ได้';
            couponMsg.style.color = 'red';
        }

        const discountCodeText = disc.def?.code || code;
        const discountRow = disc.ok ? `<br>ส่วนลด (${discountCodeText}): -${money(disc.amount)} บาท` : '';

        elTotals.innerHTML = `
          ช่วงวันที่: <b>${sLbl}</b> — <b>${eLbl}</b> (${days} วัน)<br>
          ค่าเช่ารวม: ${money(base.rent)} บาท<br>
          มัดจำ: ${money(base.deposit)} บาท<br>
          ค่าจัดส่ง: ${money(base.shipOut)} บาท
          ${discountRow}
          <div class="hr" style="margin-top: 8px;"></div>
          <strong>ยอดชำระทั้งหมด: ${money(grandAfter)} บาท</strong> (ไม่รวมค่าส่งกลับ)
        `;
        
        const validation = validateCartDates();
        btnPlace.disabled = validation.blocked;
        btnPlace.classList.toggle('btn--disabled', validation.blocked);
    }

    function applyCoupon(){
        state.couponCode = (couponInput.value || '').trim();
        save?.();
        updateTotalsAndValidate();
    }

    applyCouponBtn.addEventListener('click', applyCoupon);
    couponInput.addEventListener('keydown', e => { if(e.key==='Enter') applyCoupon(); });
    cs.addEventListener('change', applyConstraintsAndUpdate);
    ce.addEventListener('change', applyConstraintsAndUpdate);

    let placing = false;
    btnPlace.addEventListener('click', ()=>{
        if (placing || btnPlace.disabled) return;

        // 1. รวบรวมข้อมูลออเดอร์ทั้งหมด
        const days = daysBetween(state.filterStart, state.filterEnd);
        const base = computeSettlement({ items: state.cart.slice(), days });
        const disc = computeCouponDiscount((state.couponCode||'').trim(), { rent: base.rent, days, items });
        const total = { ...base, discount: disc.amount || 0, couponCode: disc.ok ? (disc.def?.code || state.couponCode) : '', grand: Math.max(0, base.grand - (disc.amount||0)) };
        
        const orderData = {
            items: items, // ส่ง object item ทั้งหมดไปด้วย
            days: days,
            rentalStart: cs.value,
            rentalEnd: ce.value,
            renterId: state.user.id,
            ownerId: items[0]?.ownerId || 2,
            total: total
        };

        // 2. ปิดหน้าต่างปัจจุบัน
        closeModal();

        // 3. เปิดหน้าต่างเลือกช่องทางชำระเงิน พร้อมส่งข้อมูลไปด้วย
        openPaymentSelection(orderData);
    });

    applyConstraintsAndUpdate();
}