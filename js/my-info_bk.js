// js/my-info.js

function openMyInfoModal() {
  if (document.getElementById('myInfoModal')) return;
  if (!state.user) {
    openAuthModal();
    return;
  }

  const root = document.createElement('div');
  root.id = 'myInfoModal';
  root.className = 'modal-backdrop show';

  const user = state.user;
  
  // ตรวจสอบว่าเคยกรอกข้อมูลยืนยันตัวตนแล้วหรือยัง
  const hasIdentity = user.firstName && user.lastName && user.nationalId;

  root.innerHTML = `
    <div class="modal my-info-modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      
      <div class="my-info-header">
        <div class="avatar-placeholder">👤</div>
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

  // เติมค่าที่อยู่ให้ช่องอินพุต (หลัง render แล้ว)
const u = state.user || {};
['addrLine1','addrSoi','addrRoad','addrSubDistrict','addrDistrict','addrProvince','addrZip']
  .forEach(id => { const el = byId(id); if (el) el.value = u[id] || ''; });

// (ถ้ามีจุดแสดงที่อยู่รวม เช่น <div id="addressPreview"></div>)
const addressPreview = byId('addressPreview');
if (addressPreview) {
  const composeAddress = (x) => [x.addrLine1,
    [x.addrSoi,x.addrRoad].filter(Boolean).join(' '),
    [x.addrSubDistrict,x.addrDistrict].filter(Boolean).join(' '),
    [x.addrProvince,x.addrZip].filter(Boolean).join(' ')
  ].filter(Boolean).join(', ');
  addressPreview.textContent = u.address || composeAddress(u);
}

// ตอนกดบันทึก
const fields = {
  name: byId('infoName').value.trim(),
  phone: byId('infoPhone').value.trim(),
  firstName: byId('infoFirstName').value.trim(),
  lastName: byId('infoLastName').value.trim(),
  nationalId: byId('infoNationalId').value.trim(),
  addrLine1: byId('addrLine1').value.trim(),
  addrSoi: byId('addrSoi').value.trim(),
  addrRoad: byId('addrRoad').value.trim(),
  addrSubDistrict: byId('addrSubDistrict').value.trim(),
  addrDistrict: byId('addrDistrict').value.trim(),
  addrProvince: byId('addrProvince').value.trim(),
  addrZip: byId('addrZip').value.trim(),
};
const composed = [fields.addrLine1,
  [fields.addrSoi,fields.addrRoad].filter(Boolean).join(' '),
  [fields.addrSubDistrict,fields.addrDistrict].filter(Boolean).join(' '),
  [fields.addrProvince,fields.addrZip].filter(Boolean).join(' ')
].filter(Boolean).join(', ');

// อัปเดตลง state/DB/users/localStorage แบบสั้น ๆ
Object.assign(state.user, fields, { address: composed, updatedAt: new Date().toISOString() });
const i = (DB.users||[]).findIndex(x => x.id === state.user.id);
if (i > -1) DB.users[i] = state.user;
localStorage.setItem('s_user', JSON.stringify(state.user));
localStorage.setItem('s_users', JSON.stringify(DB.users));
showToast('บันทึกข้อมูลแล้ว','success');



  document.body.appendChild(root);
  // Prefill address fields from user.addressParts or user.address
  try{
    const ap = (user.addressParts||{});
    const setVal = (sel,v)=>{ const el = root.querySelector(sel); if(el) el.value = v||''; };
    setVal('#addrLine1', ap.line1||'');
    setVal('#addrSoi', ap.soi||'');
    setVal('#addrRoad', ap.road||'');
    setVal('#addrSubDistrict', ap.subDistrict||'');
    setVal('#addrDistrict', ap.district||'');
    setVal('#addrProvince', ap.province||'');
    setVal('#addrZip', ap.zip||'');
  }catch(_){}

  const idInput = root.querySelector('#infoNationalId');
  if (idInput) {
    idInput.addEventListener('input', autoFormatThaiID);
    idInput.addEventListener('blur', (event) => {
      const input = event.target;
      const value = input.value.replace(/[^0-9]/g, ''); // เอาขีดออกก่อนตรวจ
      const messageEl = root.querySelector('#id-validation-msg');

      if (value.length === 0) {
        // ถ้าช่องว่างเปล่า ก็ไม่ต้องแสดงอะไร
        input.classList.remove('input-valid', 'input-invalid');
        messageEl.textContent = '';
        return;
      }

      if (validateThaiID(value)) {
        input.classList.add('input-valid');
        input.classList.remove('input-invalid');
        messageEl.textContent = 'เลขบัตรประชาชนถูกต้อง';
        messageEl.className = 'validation-message valid';
      } else {
        input.classList.add('input-invalid');
        input.classList.remove('input-valid');
        messageEl.textContent = 'เลขบัตรประชาชนไม่ถูกต้อง';
        messageEl.className = 'validation-message invalid';
      }
    });
  }

  const closeModal = () => document.body.removeChild(root);

  const modalBody = root.querySelector('.my-info-body');
  if (modalBody) {
    modalBody.addEventListener('wheel', e => e.stopPropagation());
  }

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    
    if (e.target.closest('#btnSaveInfo')) {
      // Save profile data
      const get = id=> (root.querySelector(id)?.value||'').trim();
      const hasIdentity = user.firstName && user.lastName && user.nationalId;
      const addressParts = {
        line1: get('#addrLine1'),
        soi: get('#addrSoi'),
        road: get('#addrRoad'),
        subDistrict: get('#addrSubDistrict'),
        district: get('#addrDistrict'),
        province: get('#addrProvince'),
        zip: get('#addrZip')
      };
      const address = [addressParts.line1,
        addressParts.soi && `ซ. ${addressParts.soi}`,
        addressParts.road && `ถ. ${addressParts.road}`,
        addressParts.subDistrict && `แขวง/ตำบล ${addressParts.subDistrict}`,
        addressParts.district && `เขต/อำเภอ ${addressParts.district}`,
        addressParts.province && `จังหวัด ${addressParts.province}`,
        addressParts.zip
      ].filter(Boolean).join(' ').replace(/\s{2,}/g,' ').trim();

      const candidate = {
        ...user,
        name: get('#infoName') || user.name,
        phone: get('#infoPhone') || user.phone,
        firstName: hasIdentity ? user.firstName : (get('#infoFirstName') || user.firstName),
        lastName:  hasIdentity ? user.lastName  : (get('#infoLastName')  || user.lastName),
        nationalId: hasIdentity ? user.nationalId : (get('#infoNationalId') || user.nationalId),
        address,
        addressParts
      };

      // Validate ID if newly provided
      const idNum = String(candidate.nationalId||'').replace(/\D/g,'');
      if (!hasIdentity && idNum && typeof validateThaiID==='function' && !validateThaiID(idNum)){
        showToast('เลขบัตรประชาชนไม่ถูกต้อง','error'); 
        return;
      }

      // Update state and persist
      state.user = candidate;
      // update DB_USERS match by id or email
      try{
        const list = (window.DB_USERS||[]);
        const idx = list.findIndex(u => (u.id && candidate.id && u.id===candidate.id) || (u.email && candidate.email && u.email===candidate.email));
        if (idx>=0) list[idx] = { ...list[idx], ...candidate };
        else list.push(candidate);
        window.DB_USERS = list;
        localStorage.setItem('DB_USERS', JSON.stringify(list));
      }catch(_){}
      // save() persists s_user etc.
      save?.();

      emit && emit('user:updated', { user: candidate });
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
      closeModal();

    }
    // ... other event listeners
  });
}