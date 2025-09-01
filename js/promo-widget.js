//
// ===== Sharezy Promotion Widget =====
//

(function(){
  const IMG = 'assets/promo.png';
  const PROMO_WIDTH = 200;
  const STORAGE_KEY = 'sz_promo_disabled';

  // ตัวช่วยกันไม่มี money()
  const fmt = (n)=> (typeof money==='function' ? money(n) : (Number(n)||0).toLocaleString('th-TH'));

  // เลือกคูปองตัวโปรโมต: ลำดับความสำคัญ => code='WELCOME50' -> featured:true -> ตัวแรกในลิสต์
  const LIST   = window.COUPONS || [];
  const PROMO  = LIST.find(c=>c.code==='WELCOME50') || LIST.find(c=>c.featured) || LIST[0] || null;
  const PROMO_CODE = PROMO?.code || 'WELCOME50';

  // สร้างข้อความจากนิยามคูปองใน coupons.js
  const OFFER_TXT = PROMO
    ? (PROMO.type==='percent'
        ? `ลูกค้าใหม่ลด ${PROMO.value}%${PROMO.maxDiscount ? ` (สูงสุด ฿${fmt(PROMO.maxDiscount)})` : ''}!!`
        : `ลูกค้าใหม่ลด ฿${fmt(PROMO.value)}!!`)
    : 'ลูกค้าใหม่ลด 50 บาท!!';
  const MIN_TXT   = PROMO?.minRent ? `ขั้นต่ำ ฿${fmt(PROMO.minRent)}!` : '';

  // ⬇️ ทำให้เรียกปิดถาวรได้จากทุกที่ (แม้ widget ยังไม่ถูก mount)
  window.disablePromoWidget = function(){
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch(_){}
    document.getElementById('promoBubble')?.remove();
    document.getElementById('promoChip')?.remove();
  };

  // ถ้าเคยปิดถาวรแล้ว ไม่ต้องสร้าง widget อีก
  if (localStorage.getItem(STORAGE_KEY) === '1') return;

  function mountPromo(){
    if (document.getElementById('promoChip') || document.getElementById('promoBubble')) return;

    // chip (แสดงตลอด)
    const chip = document.createElement('button');
    chip.id = 'promoChip';
    chip.innerHTML = `<span class="emoji">🎁</span><span class="txt">โปรโมชั่น!</span>`;
    document.body.appendChild(chip);

    // bubble
    const bubble = document.createElement('div');
    bubble.id = 'promoBubble';
    bubble.style.setProperty('--promo-width', PROMO_WIDTH + 'px');
    bubble.innerHTML = `
      <div class="close" aria-label="ปิด" title="ปิด">×</div>
      <div class="title">${OFFER_TXT}</div>
      <div class="sub">เพียงใช้โค้ด <span class="code">${PROMO_CODE}</span></div>
      ${MIN_TXT ? `<div class="sub">${MIN_TXT}</div>` : ``}
      <img src="${IMG}" alt="โปรโมชั่น">
    `;
    document.body.appendChild(bubble);

    function openBubble(){ bubble.classList.remove('promo-hidden'); }
    function closeBubble(){ bubble.classList.add('promo-hidden'); }

    chip.addEventListener('click', openBubble);
    bubble.querySelector('.close').addEventListener('click', closeBubble);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPromo);
  } else {
    mountPromo();
  }
})();

// คุม widget โปรโมชัน ไม่ให้มันบังตะกร้า
window.hidePromoWidget = function(){
  document.getElementById('promoBubble')?.classList.add('promo-hidden'); // ซ่อนบับเบิล
  document.getElementById('promoChip')?.classList.add('promo-hidden');   // ซ่อนชิปด้วยตอนเปิดตะกร้า
};
window.showPromoWidget = function(){
  document.getElementById('promoBubble')?.classList.add('promo-hidden'); // บับเบิลยังซ่อนไว้
  document.getElementById('promoChip')?.classList.remove('promo-hidden'); // โชว์ชิป 🎁 โปรโมชั่น!
};