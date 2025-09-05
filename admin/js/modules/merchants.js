// admin/js/modules/merchants.js
function mockMerchants(){
  return Array.from({length:16}).map((_,i)=>({
    id:6000+i,
    shop:`ร้านเดโม ${i+1}`,
    owner:`คุณเจ้าของ ${i+1}`,
    email:`shop${i+1}@demo.com`,
    phone:`09${String(70000000+i).slice(0,8)}`,
    address:`123/4 ถนนสุขุมวิท เขตบางนา กทม. ${10110+i}`,
    submittedAt:new Date(Date.now()-i*7200000).toISOString().slice(0,16).replace('T',' ')
  }));
}

export function renderMerchants(){
  const section = document.querySelector('section[data-view="merchant-register"]');
  if (!section) return;

  // ถ้าไม่มี table ให้สร้าง
  if (!section.querySelector('#tblMerchants')){
    section.innerHTML = `
      <h3>Merchant Register</h3>
      <table id="tblMerchants">
        <thead><tr>
          <th>ร้านค้า</th><th>ผู้ติดต่อ</th><th>อีเมล</th><th>โทร</th><th>ยื่นเมื่อ</th><th>จัดการ</th>
        </tr></thead>
        <tbody></tbody>
      </table>
    `;
  }

  const tbody = section.querySelector('#tblMerchants tbody');
  const list = mockMerchants();

  tbody.innerHTML = list.map(m=>`
    <tr>
      <td>${m.shop}</td>
      <td>${m.owner}</td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.submittedAt}</td>
      <td><button class="btn btn-mini">ตรวจสอบ</button></td>
    </tr>
  `).join('');
}


function ensureMask(){ let m=document.querySelector('.mask'); if(!m){m=document.createElement('div');m.className='mask';document.body.appendChild(m);} return m; }
function ensureModal(){ let m=document.getElementById('adminModal'); if(!m){m=document.createElement('div');m.id='adminModal';document.body.appendChild(m);} return m; }
function lockScroll(on){ document.body.classList.toggle('no-scroll', !!on); }

function pickShopImg(id){ const n = ((+id||1)%5)+1; return `../assets/shop${n}.jpg`; }

function openMerchantModal(m){
  const mask=ensureMask(), modal=ensureModal();
  modal.className='modal-lg'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);
  modal.innerHTML = `
    <h3>รายละเอียดร้านค้า</h3>
    <div class="owner-box">
      <div class="owner-avatar"><img src="${pickShopImg(m.id)}" alt=""></div>
      <div class="owner-meta">
        <div><strong>${m.shop}</strong></div>
        <div>ผู้ติดต่อ: ${m.owner||'-'}</div>
        <div>อีเมล: ${m.email||'-'}</div>
        <div>โทร: ${m.phone||'-'}</div>
        <div style="max-width:520px">${m.address||''}</div>
        <div>ยื่นเมื่อ: ${m.submittedAt||''}</div>
      </div>
      <div style="margin-left:auto"><button id="mc_close" class="btn">ปิด</button></div>
    </div>
    <div style="height:8px"></div>
    <div class="muted">* ข้อมูลนี้เป็นเดโม่เพื่อการตรวจสอบ</div>
  `;
  document.getElementById('mc_close')?.addEventListener('click', close);
  mask.onclick = e => { if (e.target===mask) close(); };
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}

(function bindMerchantButtons(){
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('section[data-view="merchant-register"] button.btn');
    if(!btn) return;
    const row = btn.closest('tr'); if(!row) return;
    const cells = row.querySelectorAll('td');
    const m = {
      id: row.rowIndex+6000,
      shop: cells[0]?.textContent?.trim(),
      owner: cells[1]?.textContent?.trim(),
      email: cells[2]?.textContent?.trim(),
      phone: cells[3]?.textContent?.trim(),
      submittedAt: cells[4]?.textContent?.trim(),
      address: '123/4 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110'
    };
    openMerchantModal(m);
  });
})();
