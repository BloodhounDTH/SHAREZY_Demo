//
// ===== Sharezy Product Catalog & Rendering System =====
//

let catIndex = 0; // State for category slider position

/**
 * แสดงผลแถบหมวดหมู่ (Category Slider)
 */
function renderCats(){
  const track=byId('catTrack'); if(!track) return;
  track.innerHTML = (window.CAT_SLIDES || []).map(c=>`
    <article class="cat-card reveal" data-cat="${c.key}">
      <div class="cat-emoji">${c.emoji}</div>
      <div class="h3" style="margin-top:6px">${c.title}</div>
      <div class="cat-sub">${c.sub}</div>
    </article>`).join('');
  autoReveal(track);
}

/**
 * อัปเดตตำแหน่งการเลื่อนของ Category Slider
 */
function updateCatTransform(){
  const track=byId('catTrack');
  const card=track?.querySelector('.cat-card');
  if(!card) return;

  const visiblePerFrame = () => {
    const vw = byId('catTrack').parentElement.clientWidth;
    if(vw < 560) return 1; if(vw < 900) return 2; if(vw < 1200) return 3; return 4;
  };

  const gap = 14;
  const vpf = visiblePerFrame();
  const step = card.getBoundingClientRect().width + gap;
  const maxIndex = Math.max(0, Math.ceil((window.CAT_SLIDES || []).length / vpf) - 1);
  catIndex = Math.min(Math.max(0, catIndex), maxIndex);
  track.style.transform = `translateX(${-catIndex * vpf * step}px)`;
}

/**
 * แสดงผลสินค้าใน Grid หลัก พร้อมระบบแบ่งหน้า (Pagination)
 * @param {Array} list - รายการสินค้าที่จะแสดง (ถ้าไม่ระบุ จะกรองจาก state.currentCat)
 * @param {string} title - ชื่อหัวข้อที่จะแสดง (เช่น "สินค้าทั้งหมด" หรือ "ผลการค้นหา")
 */
// js/product-catalog.js

// ▼▼▼ วางทับฟังก์ชันนี้ทั้งหมด ▼▼▼
function renderProducts(list, title = "สินค้า"){
  const PER_PAGE = 12;
  const grid = byId('productGrid');
  const head = byId('productTitle');
  const emptyEl = byId('emptyState');
  if(!grid || !head || !emptyEl) return;

  head.textContent = title;
  state.currentCat = title;

  if (!list) {
    list = (products || []).filter(p => p.category === state.currentCat || title === "สินค้าทั้งหมด" || title.startsWith("ผลลัพธ์"));
  }

  const start = state.filterStart || null;
  const end   = state.filterEnd   || null;
  const decorated = list.map(p => ({ ...p, __status: productStatus(p, start, end) }));

  if (decorated.length === 0) {
      grid.innerHTML = '';
      grid.style.minHeight = 'auto'; // Reset ความสูงเมื่อไม่มีสินค้า
      emptyEl.innerHTML = `<div class="empty-dev"><div class="icon">ℹ️</div><div class="msg">ไม่พบสินค้าในหมวด "${title}"</div></div>`;
      emptyEl.classList.remove('hidden');
      byId('pagerSlot')?.remove();
      return;
  }
  emptyEl.classList.add('hidden');

  state.productPageByCat ??= {};
  const totalPages = Math.max(1, Math.ceil(decorated.length / PER_PAGE));
  let page = state.productPageByCat[title] || 1;
  page = Math.max(1, Math.min(page, totalPages));
  state.productPageByCat[title] = page;

  const startIdx = (page - 1) * PER_PAGE;
  const pageItems = decorated.slice(startIdx, startIdx + PER_PAGE);

  const htmlItems = pageItems.map(p => {
    const isAvail = p.__status?.available !== false;
    return `
    <article class="product-card reveal">
      <div class="thumb">
        <span class="status-badge ${p.__status.cls}">${p.__status.text}</span>
        <img src="${imgPath(p.image)}" alt="${p.title}" onerror="this.src='assets/main.jpg'">
        <div class="overlay"><button class="btn" onclick="openDetail(${p.id})">รายละเอียด</button></div>
      </div>
      <div class="product-info">
        <div class="h3">${p.title}</div>
        <div class="muted">${renderStars(p.rating)} • <span class="price">฿${money(p.pricePerDay)}/วัน</span></div>
        <div class="detail-actions" style="margin-top:6px">
          <button class="btn ${isAvail ? '' : 'btn--disabled'}" ${isAvail ? `onclick="addToCart(${p.id})"` : 'disabled title="ไม่พร้อมให้เช่า"'}>
            เพิ่มลงตะกร้า
          </button>
        </div>
      </div>
    </article>`;
  }).join('');
  
  const ghostCount = Math.max(0, PER_PAGE - pageItems.length);
  const ghosts = '<article class="product-card ghost"></article>'.repeat(ghostCount);
  grid.innerHTML = htmlItems + ghosts;
  autoReveal(grid);

  let pager = byId('pagerSlot');
  if (pager) pager.remove();
  if (totalPages <= 1) return;

  const buildPageList = (total, current) => {
    if (total <= 6) return Array.from({length: total}, (_,i)=> i+1);
    const keep = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
    const pages = [...keep].filter(n => n >= 1 && n <= total).sort((a,b) => a - b);
    const out = [];
    for(let i=0; i < pages.length; i++){
      out.push(pages[i]);
      if(i < pages.length - 1 && pages[i+1] - pages[i] > 1) out.push('…');
    }
    return out;
  };
  const nums = buildPageList(totalPages, page).map(n => {
      if (n === '…') return `<li class="pg__dots"><span>…</span></li>`;
      return `<li class="pg__numb${n === page ? ' is-active' : ''}"><button class="pg__btn" data-page="${n}">${n}</button></li>`;
  }).join('');

  grid.insertAdjacentHTML('afterend', `
      <nav class="pg" id="pagerSlot"><ul class="pg__list">
          <li class="pg__ctrl"><button class="pg__arrow" id="pgPrev" ${page === 1 ? 'disabled' : ''}>‹</button></li>
          ${nums}
          <li class="pg__ctrl"><button class="pg__arrow" id="pgNext" ${page === totalPages ? 'disabled' : ''}>›</button></li>
      </ul></nav>`);
      
  const goToPage = (newPage) => {
    const currentScrollY = window.scrollY;
    state.productPageByCat[title] = newPage;
    renderProducts(list, title);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' });
    });
  };

  byId('pgPrev')?.addEventListener('click', () => goToPage(page - 1));
  byId('pgNext')?.addEventListener('click', () => goToPage(page + 1));
  $$('#pagerSlot .pg__btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => goToPage(Number(btn.dataset.page)));
  });
}

/**
 * แสดงผลส่วน "สินค้าแนะนำ"
 */
function renderRecommended(){
    const grid = byId('recGrid'); if(!grid) return;
    
    // ดึงสินค้า Top 10 ที่เรตติ้งสูงสุดมาใช้ (ปรับเปลี่ยนเงื่อนไขได้ในอนาคต)
    const rec = (products || [])
      .slice()
      .sort((a,b)=>(b.rating||0)-(a.rating||0))
      .slice(0, 10);

    // สร้าง HTML ของการ์ดสินค้า 1 ชุด
    const cardHTML = rec.map(p=>`
      <article class="product-card" onclick="openDetail(${p.id})">
        <div class="thumb">
          <img src="${imgPath(p.image)}" alt="${p.title}" onerror="this.src='assets/main.jpg'">
          <div class="overlay"><button class="btn">รายละเอียด</button></div>
        </div>
        <div class="product-info">
          <div class="h3">${p.title}</div>
          <div class="muted">
            <span class="price">฿${money(p.pricePerDay)}/วัน</span>
          </div>
        </div>
      </article>`).join('');

    // สร้างแถบเลื่อนโดยนำรายการสินค้ามาต่อกัน 2 ชุด
    grid.innerHTML = `
      <div class="rec-track">
        ${cardHTML}${cardHTML}
      </div>
    `;
    autoReveal(grid);
}


/**
 * เปิดหน้าต่าง Modal แสดงรายละเอียดสินค้า
 * @param {number} id - Product ID
 */
function openDetail(id){
  const p = products.find(x => x.id === id);
  if (!p) return;
  const owner = DB.users.find(u => u.id === p.ownerId);
  const st = productStatus(p, state.filterStart, state.filterEnd);

  const root = document.createElement("div");
  root.className = "modal-backdrop show";
  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="detail-wrap">
        <img src="${imgPath(p.image)}" alt="${p.title}" class="detail-img">
        <div class="detail-info">
          <h2 class="detail-title">${p.title}</h2>
          <div class="detail-meta">
            ${renderStars(p.rating)} | เจ้าของ: ${owner ? owner.name : "N/A"}
          </div>
          <div class="detail-price">฿${money(p.pricePerDay)}/วัน</div>
          <div class="detail-tags">
            <span class="tag">ไซส์ ${p.size}</span>
            <span class="tag">สี ${p.color}</span>
            <span class="tag">มัดจำ ฿${money(p.deposit)}</span>
          </div>
          <p class="muted">${p.description || ''}</p>
          <div class="detail-actions">
            <button id="detailAddBtn" class="btn-primary ${st.available ? '' : 'btn--disabled'}" ${st.available ? '' : 'disabled'}>
              ${st.available ? 'เพิ่มลงตะกร้า' : st.text}
            </button>
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target === root) closeModal();
  });

  root.querySelector('#detailAddBtn')?.addEventListener('click', () => {
    if (addToCart(p.id)) closeModal();
  });
}