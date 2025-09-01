//
// ===== Sharezy Notification System =====
//

// --- Core Logic ---

// กันเว็บล้มถ้าไม่ได้ประกาศ showBrowserNotif ที่อื่น
if (typeof window.showBrowserNotif !== 'function') {
  window.showBrowserNotif = function(payload){
    // no-op หรือ log เบา ๆ
    try { console.log('[notif]', payload?.title || payload?.text || payload); } catch(_){}
  };
}


/**
 * เพิ่มการแจ้งเตือนใหม่เข้าไปใน state
 * @param {object} notif - อ็อบเจกต์การแจ้งเตือน { text, link, toId, forRole }
 */
function pushNotif({text, link=null, at=new Date().toLocaleString(), forRole=null, toId=null}){
  state.notifs.push({
      text,
      link,
      at,
      forRole,
      toId,
      read: false,
      ts: Date.now() // Timestamp for sorting
  });
  save();
  renderNotifs();
  updateNotifBadge();
  broadcastNotifsChanged(); // แจ้งเตือน tab อื่นๆ
}

/**
 * ดึงรายการแจ้งเตือนที่ยังไม่ได้อ่านสำหรับ user ID ที่กำหนด
 * @param {number} uid - User ID
 * @returns {Array}
 */
function getUnreadFor(uid){
    return (state.notifs||[]).filter(n => (n.toId === uid) && !n.read);
}

/**
 * ตั้งค่าการแจ้งเตือนทั้งหมดของ user ID ที่กำหนดให้เป็น "อ่านแล้ว"
 * @param {number} uid - User ID
 */
function markAllReadFor(uid){
  state.notifs = (state.notifs||[]).map(n => n.toId===uid ? {...n, read:true} : n);
  save();
  updateNotifBadge();
  renderNotifs();
}

/**
 * ล้างการแจ้งเตือนทั้งหมดสำหรับผู้ใช้ปัจจุบัน
 */
function clearNotifsForCurrent() {
    if (!state.user) return;
    state.notifs = state.notifs.filter(n => n.toId !== state.user.id);
    save();
    renderNotifs();
    updateNotifBadge();
}


// --- UI Rendering & Updates ---

/**
 * แสดงผลรายการแจ้งเตือนใน Panel
 */
function renderNotifs(){
  const list=byId('notifList'); if(!list) return;
  const uid = state.user?.id || null;

  const data = (state.notifs||[])
    .filter(n => !uid || n.toId===uid)
    .sort((a,b) => (b.ts || 0) - (a.ts || 0));

  if (data.length > 0) {
      list.innerHTML = data.map(n => {
        // ▼▼▼ เพิ่มเงื่อนไขเพื่อกำหนดคลาส 'unread' หรือ 'read' ▼▼▼
        const statusClass = n.read ? 'read' : 'unread';
        
        return `
        <div class="notif ${statusClass}" ${n.link ? `data-link="${n.link}"` : ""}>
          <div>${n.text}</div>
          <small>${n.at || ""}</small>
        </div>`;
      }).join("");
  } else {
      list.innerHTML = `<div class="notif empty">ยังไม่มีการแจ้งเตือน</div>`;
  }

  updateNotifBadge();
}

/**
 * อัปเดตตัวเลข (Badge) บนไอคอนกระดิ่ง
 */
function updateNotifBadge(){
  const uid = state.user?.id;
  const count = uid ? getUnreadFor(uid).length : 0;
  const badge = byId('notifBadge');
  const bellBtn = byId('btnBell');
  if(!badge || !bellBtn) return;

  if(count > 0){
    // แสดงตัวเลขและ animation เมื่อมี unread
    badge.textContent = count;
    badge.classList.remove('hidden');
    bellBtn.classList.add('has-unread');
  } else {
    // ซ่อนตัวเลขและหยุด animation เมื่อไม่มี unread
    badge.classList.add('hidden');
    bellBtn.classList.remove('has-unread');
  }
}

/**
 * จัดตำแหน่ง Panel การแจ้งเตือนให้อยู่ใต้ปุ่มกระดิ่ง
 */
function positionNotifPanel(){
  const bell = byId('btnBell');
  const panel = byId('notifPanel');
  if(!bell || !panel) return;

  // นำค่าตำแหน่งและขนาดของปุ่มกระดิ่งมาใช้
  const bellRect = bell.getBoundingClientRect();

  // ซ่อน Panel ชั่วคราวเพื่อวัดขนาดที่แท้จริงของมัน
  panel.style.visibility = 'hidden';
  panel.classList.remove('hidden');
  const panelWidth = panel.offsetWidth;
  panel.classList.add('hidden');
  panel.style.visibility = '';
  
  // คำนวณตำแหน่ง 'left' เพื่อให้ Panel อยู่กึ่งกลางของปุ่มกระดิ่ง
  let left = bellRect.left + (bellRect.width / 2) - (panelWidth / 2);

  // ป้องกันไม่ให้ Panel ล้นออกนอกขอบจอซ้าย-ขวา
  left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));

  // กำหนดตำแหน่ง top และ left ให้กับ Panel
  panel.style.top = (bellRect.bottom + 12) + 'px'; // อยู่ใต้กระดิ่ง 12px
  panel.style.left = left + 'px';
}


// --- Browser & Real-time ---

/**
 * แสดง Notification ของ Browser (ถ้าผู้ใช้ erlaubnis)
 * @param {string} title - หัวข้อ
 * @param {string} body - เนื้อหา
 */

function onLoginShowNotifs(){
  if(!state.user) return;
  const unreadCount = getUnreadFor(state.user.id).length;
  updateNotifBadge();

  if(unreadCount > 0){
    showToast(`คุณมีการแจ้งเตือนใหม่ ${unreadCount} รายการ`, 'info');
    showBrowserNotif('Sharezy', `คุณมีการแจ้งเตือนใหม่ ${unreadCount} รายการ`);
    
    /*
    // ▼▼▼ คอมเมนต์ส่วนนี้ออกเพื่อไม่ให้ Panel เปิดอัตโนมัติ ▼▼▼
    setTimeout(()=>{
        const panel = byId('notifPanel');
        if (panel) {
            positionNotifPanel();
            panel.classList.remove('hidden');
        }
    }, 300);
    */
  }
}

let notifChannel;
/**
 * เริ่มต้นระบบ Broadcast Channel เพื่อซิงค์การแจ้งเตือนระหว่าง Tab
 */
function startRealtimeNotifs(){
  if(!state.user?.id) return;
  try{
    notifChannel = new BroadcastChannel('sharezy-notifs');
    notifChannel.onmessage = (ev)=>{
      if(ev?.data?.type==='notifs-updated'){
        // โหลด state ใหม่จาก localStorage (ถ้ามีฟังก์ชัน)
        if(typeof load === 'function'){ load(); } else {
            // หรือ re-render จาก state ปัจจุบัน
            renderNotifs();
        }
        showToast('มีการแจ้งเตือนใหม่', 'info');
      }
    };
  } catch(e) {
      console.warn("Broadcast Channel is not supported.");
  }

  // Fallback for browsers without Broadcast Channel
  window.addEventListener('storage', (e)=>{
    if(e.key==='s_notif'){
        state.notifs = JSON.parse(e.newValue || '[]');
        renderNotifs();
    }
  });
}

/**
 * ส่งสัญญาณบอก Tab อื่นๆ ว่าการแจ้งเตือนมีการอัปเดต
 */
function broadcastNotifsChanged(){
    try{
        notifChannel?.postMessage({type:'notifs-updated'});
    } catch(e){}
}

// --- Global Event Listeners for Notification Panel ---
document.addEventListener('click',(e)=>{
  const panel = byId('notifPanel');
  // ปิด panel เมื่อคลิกนอกพื้นที่ของ panel และปุ่มกระดิ่ง
  if(panel && !panel.classList.contains('hidden')){
    if(!e.target.closest('#notifPanel') && !e.target.closest('#btnBell')){
      panel.classList.add('hidden');
      if(state.user){ markAllReadFor(state.user.id); }
    }
  }
});

byId('notifList')?.addEventListener('click',(e)=>{
  const item = e.target.closest('.notif[data-link]');
  if(!item) return;
  if (state.user) {
    markAllReadFor(state.user.id);
  }

  const link = item.dataset.link;
  if(link && link.startsWith('#/order/')){
    const id = link.split('/').pop().split('?')[0];
    openOrderDetail(id);
    byId('notifPanel')?.classList.add('hidden');
  } else if (link === '#/show-late-rules') {
    showLateReturnRulesPopup();
    byId('notifPanel')?.classList.add('hidden');
  }
});

byId('btnClearNotif')?.addEventListener('click', () => {
    showConfirmPopup({
        title: 'ยืนยันการล้างประวัติ',
        message: 'คุณต้องการล้างประวัติการแจ้งเตือนทั้งหมดใช่หรือไม่?',
        onConfirm: () => {
            clearNotifsForCurrent();
        }
    });
});