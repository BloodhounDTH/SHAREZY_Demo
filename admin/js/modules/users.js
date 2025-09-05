// admin/js/modules/users.js
// แสดงรายการผู้ใช้จาก DB_USERS ถ้าไม่มี ให้ mockup 12 รายการ

function getUsers(){
  if (Array.isArray(window.DB_USERS) && window.DB_USERS.length) return DB_USERS;
  // fallback mock
  return Array.from({length:12}).map((_,i)=>({
    id: 1000+i,
    name: `ผู้ใช้เดโม ${i+1}`,
    email: `user${i+1}@demo.com`,
    phone: `09${String(80000000+i).slice(0,8)}`,
    address: `99/1 ถนนสุขุมวิท เขตคลองเตย กทม. 10${20+i}`,
    role: i%4===0?'owner': (i%3===0?'renter':'member'),
    points: (i+1)*37
  }));
}

export function renderUsers(){
  const sec   = document.querySelector('section[data-view="users"]');
  if (!sec) return;

  const tbody = sec.querySelector('#tblUsers tbody');
  const qEl   = sec.querySelector('#userSearch');
  const rEl   = sec.querySelector('#userRole');
  if (!tbody) return;

  const term = (qEl?.value || '').trim().toLowerCase();
  const rVal = (rEl?.value || '').trim();

  const list = getUsers().filter(u => {
    const matchRole = !rVal || String(u.role||'') === rVal;
    const hay = [
      u.name, u.email, u.phone, u.address, u.firstName, u.lastName
    ].map(v => (v || '').toLowerCase());
    const matchText = !term || hay.some(v => v.includes(term));
    return matchRole && matchText;
  });

  tbody.innerHTML = list.map(u=>`
    <tr>
      <td>${u.id ?? '-'}</td>
      <td>${u.name ?? '-'}</td>
      <td>${u.email ?? '-'}</td>
      <td>${u.role ?? '-'}</td>
      <td>${u.level ?? '-'}</td>
      <td>${u.phone ?? '-'}</td>
      <td><button class="btn btn-mini" data-detail="${u.id}">ตรวจสอบรายละเอียด</button></td>
    </tr>
  `).join('') || '<tr><td colspan="7" class="muted">— ไม่พบผู้ใช้ —</td></tr>';

  tbody.querySelectorAll('button[data-detail]').forEach(b=>{
    b.addEventListener('click', ()=> openUserModal(b.getAttribute('data-detail')));
  });
}


function ensureMask(){ let m=document.querySelector('.mask'); if(!m){m=document.createElement('div'); m.className='mask'; document.body.appendChild(m);} return m; }
function ensureModal(){ let m=document.getElementById('adminModal'); if(!m){m=document.createElement('div'); m.id='adminModal'; document.body.appendChild(m);} return m; }
function lockScroll(on){ document.body.classList.toggle('no-scroll', !!on); }

function openUserModal(uid){
  const u = getUsers().find(x=>String(x.id)===String(uid));
  const mask=ensureMask(), modal=ensureModal();
  modal.className='modal-md'; modal.style.display='block'; mask.style.display='block'; lockScroll(true);

  modal.innerHTML = `
    <h3>รายละเอียดผู้ใช้</h3>
    <div style="display:grid;grid-template-columns:140px 1fr;gap:10px">
      <div class="owner-avatar" style="width:80px;height:80px"><span>👤</span></div>
      <div>
        <div><strong>${u?.name||'-'}</strong></div>
        <div>อีเมล: ${u?.email||'-'}</div>
        <div>โทร: ${u?.phone||'-'}</div>
        <div>ที่อยู่: ${u?.address||'-'}</div>
        <div>สิทธิ์: ${u?.role||'-'}</div>
        <div>คะแนน: ${(u?.points||0).toLocaleString()}</div>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right">
      <button id="u_close">ปิด</button>
    </div>
  `;
  document.getElementById('u_close')?.addEventListener('click', close);
  mask.onclick = e => { if (e.target===mask) close(); };
  function close(){ modal.style.display='none'; mask.style.display='none'; lockScroll(false); }
}


/* UX tweak: users toolbar */
(function(){
  const sec = document.querySelector('section[data-view="users"]');
  if(!sec) return;
  const q = sec.querySelector('#userSearch');
  const role = sec.querySelector('#userRole');
  const reload = sec.querySelector('#btnReloadUsers');
  if(q){ q.classList.add('input-sm'); q.style.maxWidth='240px'; }
  if(role){ role.classList.add('input-xs'); role.style.maxWidth='140px'; role.style.marginLeft='6px'; }
  if(reload){ reload.style.marginLeft='6px'; }
})();

document.addEventListener('DOMContentLoaded', () => {
  const sec    = document.querySelector('section[data-view="users"]');
  if (!sec) return;

  const q      = sec.querySelector('#userSearch');
  const role   = sec.querySelector('#userRole');
  const reload = sec.querySelector('#btnReloadUsers');

  // ผูกอีเวนต์ให้กรองทันทีที่พิมพ์/เปลี่ยนบทบาท
  q?.addEventListener('input',  renderUsers);
  role?.addEventListener('change', renderUsers);

  // ปุ่ม Reload เอาไว้รีเซ็ตตัวกรองและแสดงทุกคน
  reload?.addEventListener('click', () => {
    if (q) q.value = '';
    if (role) role.value = '';
    renderUsers();
  });

  // แสดงครั้งแรก
  renderUsers();
});
