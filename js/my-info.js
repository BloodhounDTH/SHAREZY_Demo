// ===== my-info.js — Sharezy (drop-in, fills + saves + validates) =====
/* globals DB, state, showToast, byId, updateCurrentUser, setCurrentUser, getCurrentUser */

(function(){
  // --- Safe helpers ---
  const $ = (id) => (typeof byId === 'function' ? byId(id) : document.getElementById(id));
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj||{}, key);

  function composeAddress(x){
    const parts = [
      x.addrLine1,
      [x.addrSoi, x.addrRoad].filter(Boolean).join(' '),
      [x.addrSubDistrict, x.addrDistrict].filter(Boolean).join(' '),
      [x.addrProvince, x.addrZip].filter(Boolean).join(' ')
    ].filter(Boolean);
    return parts.join(', ');
  }

  function validateThaiID(id){
    // Expect 13 digits (optionally with dashes/space). Return {ok, msg}
    const digits = (id||'').replace(/\D/g, '');
    if (!digits) return { ok:true, msg:'' }; // allow empty (optional field)
    if (digits.length !== 13) return { ok:false, msg:'ต้องมี 13 หลัก' };
    // checksum
    let sum = 0;
    for (let i=0;i<12;i++) sum += parseInt(digits[i],10) * (13 - i);
    const check = (11 - (sum % 11)) % 10;
    const ok = check === parseInt(digits[12],10);
    return { ok, msg: ok ? 'เลขบัตรถูกต้อง' : 'เลขบัตรไม่ถูกต้อง' };
  }

  function safeToast(msg, type){
    try { (typeof showToast === 'function' ? showToast(msg, type) : alert(msg)); } catch(_){}
  }

  function currentUser(){
    // prefer state.user, fallback from localStorage
    if (state && state.user) return state.user;
    try{
      const raw = localStorage.getItem('s_user');
      return raw ? JSON.parse(raw) : null;
    }catch(_){ return null; }
  }

  function saveUser(fields){
    // Use updateCurrentUser if provided; else manual update to state/DB/localStorage
    if (typeof updateCurrentUser === 'function') {
      return updateCurrentUser(fields);
    }
    const u = currentUser();
    if (!u) return null;
    // Respect hasIdentity lock
    const patch = { ...fields };
    if (u.hasIdentity) {
      delete patch.firstName;
      delete patch.lastName;
      delete patch.nationalId;
    }
    const next = { ...u, ...patch };
    next.address = composeAddress(next);
    next.updatedAt = new Date().toISOString();

    // state
    if (state) state.user = next;
    // DB
    if (typeof DB !== 'undefined') {
      DB.users = DB.users || (window.DB_USERS || []);
      const idx = (DB.users||[]).findIndex(x => x.id === next.id);
      if (idx > -1) DB.users[idx] = { ...DB.users[idx], ...next };
      else DB.users.push(next);
    }
    // localStorage
    try {
      localStorage.setItem('s_user', JSON.stringify(next));
      if (DB && DB.users) localStorage.setItem('s_users', JSON.stringify(DB.users));
    } catch(_){}

    // call setCurrentUser if exists (to keep app invariants)
    if (typeof setCurrentUser === 'function') setCurrentUser(next);
    return next;
  }

  function fillInputs(u){
    const map = {
      infoName: u.name,
      infoEmail: u.email,
      infoPhone: u.phone,
      infoFirstName: u.firstName,
      infoLastName: u.lastName,
      infoNationalId: u.nationalId,
      addrLine1: u.addrLine1,
      addrSoi: u.addrSoi,
      addrRoad: u.addrRoad,
      addrSubDistrict: u.addrSubDistrict,
      addrDistrict: u.addrDistrict,
      addrProvince: u.addrProvince,
      addrZip: u.addrZip
    };
    Object.entries(map).forEach(([id,val]) => { const el = $(id); if (el) el.value = val || ''; });
    const avatar = document.querySelector('.avatar-placeholder');
    if (avatar) avatar.textContent = u.avatar || '👤';
  }

  function openMyInfo(){
    // Remove existing
    const exist = document.getElementById('myInfoModal');
    if (exist) exist.remove();

    const user = currentUser() || {};
    const hasIdentity = !!user.hasIdentity;

    const root = document.createElement('div');
    root.id = 'myInfoModal';
    root.className = 'modal-backdrop show';

    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:720px">
        <button class="modal-close" data-close="1">×</button>

        <div class="my-info-header">
          <div class="avatar-placeholder">${user.avatar || '👤'}</div>
          <strong>${user.name || 'ข้อมูลส่วนตัว'}</strong>
        </div>

        <div class="my-info-body">
          <div class="form-field">
            <label for="infoName">ชื่อที่แสดง (ชื่อเล่น)</label>
            <input type="text" id="infoName" value="${user.name || ''}" placeholder="กรอกชื่อเล่นของคุณ">
          </div>

          <div class="form-field">
            <label for="infoEmail">อีเมล</label>
            <div class="input-with-button">
              <input type="email" id="infoEmail" value="${user.email || ''}" readonly disabled>
              <button class="btn btn-secondary btn-verify" disabled>ยืนยันอีเมล</button>
            </div>
          </div>
          
          <div class="form-field">
            <label for="infoPhone">เบอร์โทรศัพท์</label>
            <div class="input-with-button">
              <input type="tel" id="infoPhone" value="${user.phone || ''}" placeholder="08x-xxx-xxxx">
              <button class="btn btn-secondary btn-verify" disabled>รับ OTP</button>
            </div>
          </div>

          <div class="hr"></div>

          <label class="form-label-group">ข้อมูลยืนยันตัวตน (แก้ไขไม่ได้)</label>
          <div class="identity-grid">
            <div class="form-field">
              <label for="infoFirstName">ชื่อจริง (ภาษาไทย)</label>
              <input type="text" id="infoFirstName" value="${user.firstName || ''}" placeholder="กรอกชื่อจริง" ${hasIdentity ? 'disabled' : ''}>
            </div>
            <div class="form-field">
              <label for="infoLastName">นามสกุล (ภาษาไทย)</label>
              <input type="text" id="infoLastName" value="${user.lastName || ''}" placeholder="กรอกนามสกุล" ${hasIdentity ? 'disabled' : ''}>
            </div>
            <div class="form-field grid-col-span-2">
              <label for="infoNationalId">หมายเลขบัตรประจำตัวประชาชน</label>
              <input type="text" id="infoNationalId" value="${user.nationalId || ''}" placeholder="กรอกเลข 13 หลัก" ${hasIdentity ? 'disabled' : ''} maxlength="17">
              <div id="id-validation-msg" class="validation-message"></div>
            </div>
          </div>

          <label class="form-label-group">ที่อยู่สำหรับจัดส่ง</label>
          <div class="address-grid">
            <div class="form-field grid-col-span-2"><label for="addrLine1">บ้านเลขที่ / หมู่ / อาคาร</label><input type="text" id="addrLine1"></div>
            <div class="form-field"><label for="addrSoi">ซอย</label><input type="text" id="addrSoi"></div>
            <div class="form-field"><label for="addrRoad">ถนน</label><input type="text" id="addrRoad"></div>
            <div class="form-field"><label for="addrSubDistrict">แขวง / ตำบล</label><input type="text" id="addrSubDistrict"></div>
            <div class="form-field"><label for="addrDistrict">เขต / อำเภอ</label><input type="text" id="addrDistrict"></div>
            <div class="form-field"><label for="addrProvince">จังหวัด</label><input type="text" id="addrProvince"></div>
            <div class="form-field"><label for="addrZip">รหัสไปรษณีย์</label><input type="text" id="addrZip"></div>
          </div>
        </div>

        <div class="my-info-footer">
          <button class="btn" id="btnChangePassword">เปลี่ยนรหัสผ่าน</button>
          <button class="btn-primary" id="btnSaveInfo">บันทึกข้อมูล</button>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // Fill address inputs after render
    fillInputs(user);

    // Thai ID live validation (if editable)
    const idInput = $('infoNationalId');
    const idMsg   = $('id-validation-msg');
    if (idInput && !hasIdentity) {
      const onID = () => {
        const v = idInput.value.trim();
        const { ok, msg } = validateThaiID(v);
        if (idMsg) {
          idMsg.textContent = msg || '';
          idMsg.style.color = ok ? '#16a34a' : '#dc2626';
        }
      };
      idInput.addEventListener('input', onID);
      onID();
    }

    // Events
    root.addEventListener('click', (e)=>{
      if (e.target.closest('[data-close]') || e.target === root) {
        root.remove();
        return;
      }
      if (e.target.id === 'btnSaveInfo') {
        // collect fields
        const fields = {
          name: $('infoName')?.value?.trim() || '',
          phone: $('infoPhone')?.value?.trim() || '',
          firstName: $('infoFirstName')?.value?.trim() || '',
          lastName: $('infoLastName')?.value?.trim() || '',
          nationalId: $('infoNationalId')?.value?.trim() || '',
          addrLine1: $('addrLine1')?.value?.trim() || '',
          addrSoi: $('addrSoi')?.value?.trim() || '',
          addrRoad: $('addrRoad')?.value?.trim() || '',
          addrSubDistrict: $('addrSubDistrict')?.value?.trim() || '',
          addrDistrict: $('addrDistrict')?.value?.trim() || '',
          addrProvince: $('addrProvince')?.value?.trim() || '',
          addrZip: $('addrZip')?.value?.trim() || '',
        };

        // basic validation
        if (!fields.name) { safeToast('กรุณากรอกชื่อที่แสดง','error'); return; }
        if (fields.addrZip && !/^\d{5}$/.test(fields.addrZip)) { safeToast('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก','error'); return; }
        if (fields.phone && !/^0\d[-\d ]{7,}$/.test(fields.phone)) { safeToast('กรุณากรอกเบอร์โทรให้ถูกต้อง','error'); return; }
        if (!hasIdentity && fields.nationalId){
          const v = validateThaiID(fields.nationalId);
          if (!v.ok) { safeToast(v.msg || 'เลขบัตรไม่ถูกต้อง','error'); return; }
        }

        const updated = saveUser(fields);
        if (updated){
          // refresh header/menu if present
          try { if (typeof renderAccountMenu === 'function') renderAccountMenu(); } catch(_){}
          safeToast('บันทึกข้อมูลแล้ว','success');
        }else{
          safeToast('บันทึกไม่สำเร็จ','error');
        }
      }

      if (e.target.id === 'btnChangePassword') {
        const npw = prompt('กรุณากรอกรหัสผ่านใหม่');
        if (npw && npw.length >= 4){
          const u = currentUser();
          if (u){
            saveUser({ password: npw });
            safeToast('เปลี่ยนรหัสผ่านแล้ว','success');
          }
        } else if (npw) {
          safeToast('รหัสผ่านอย่างน้อย 4 ตัวอักษร','error');
        }
      }
    });
  }

  // Export
  window.openMyInfo = openMyInfo;
})();

// Back-compat aliases
window.openMyInfo       = window.openMyInfo       || openMyInfo;
window.openMyInfoModal  = window.openMyInfoModal  || openMyInfo;  // ← รองรับโค้ดเก่า
