// ===== Sharezy Authentication System (Linked with window.DB_USERS & localStorage) =====
//
// - ใช้ window.DB_USERS จาก user.js
// - รองรับเปิด modal ด้วยหน้า Register ได้ (isRegister=true)
// - บันทึกผู้ใช้ใหม่ลง localStorage ('DB_USERS') เพื่อไม่หายหลังรีเฟรช
// - Flow: ไม่มีแท็บ, เริ่มหน้า Login, มีปุ่มสลับไป/กลับ Register
//

/** helper: โหลด DB_USERS จาก localStorage ถ้ามี */
(function hydrateUsersFromLocalStorage() {
  try {
    const saved = localStorage.getItem('DB_USERS');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        window.DB_USERS = parsed;
      }
    }
  } catch (e) {
    console.warn('Cannot hydrate DB_USERS from localStorage:', e);
  }
})();

/** helper: เซฟ DB_USERS ลง localStorage */
function persistUsers() {
  try {
    localStorage.setItem('DB_USERS', JSON.stringify(window.DB_USERS || []));
  } catch (e) {
    console.warn('Cannot persist DB_USERS to localStorage:', e);
  }
}

/**
 * เปิด Modal สำหรับการเข้าสู่ระบบ หรือ สมัครสมาชิก
 * @param {boolean} isRegister - true เพื่อให้แสดงหน้าสมัครสมาชิกก่อน
 */
function openAuthModal(isRegister = false) {
  if (document.getElementById('authModal')) return;

  const root = document.createElement('div');
  root.id = 'authModal';
  root.className = "modal-backdrop show";
  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <button class="modal-close" data-close="1" aria-label="ปิดหน้าต่าง">×</button>

      <!-- ฟอร์มเข้าสู่ระบบ -->
      <form id="loginForm" class="auth-box" aria-hidden="false">
        <h3 id="authTitle">เข้าสู่ระบบ</h3>
        <div class="form-field">
          <label for="loginEmail">อีเมล</label>
          <input type="email" id="loginEmail" placeholder="you@email.com" autocomplete="email" required />
        </div>
        <div class="form-field">
          <label for="loginPass">รหัสผ่าน</label>
          <input type="password" id="loginPass" placeholder="••••••" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn-primary w-full" id="doLogin">เข้าสู่ระบบ</button>

        <!-- ลิงก์ไปสมัครสมาชิก -->
        <div class="auth-bottom">
          <p>ยังไม่ได้เป็นสมาชิก?</p>
          <button type="button" class="btn-secondary w-full" id="goRegister">สมัครสมาชิก</button>
        </div>
      </form>

      <!-- ฟอร์มสมัครสมาชิก (เริ่มต้นซ่อน) -->
      <form id="regForm" class="auth-box hidden" aria-hidden="true">
        <h3>สมัครสมาชิก</h3>

        <div class="form-grid-layout">
          <div class="form-field">
            <label for="regName">ชื่อเล่น (แสดงผล)</label>
            <input type="text" id="regName" placeholder="ชื่อในเว็บ" autocomplete="nickname" required />
          </div>
          <div class="form-field">
            <label for="regTitle">คำนำหน้า</label>
            <select id="regTitle" required>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>
          <div class="form-field full-width">
            <label for="regFirstName">ชื่อจริง</label>
            <input type="text" id="regFirstName" placeholder="กรอกชื่อจริงโดยไม่ต้องใส่คำนำหน้า" autocomplete="given-name" required />
          </div>
          <div class="form-field full-width">
            <label for="regLastName">นามสกุล</label>
            <input type="text" id="regLastName" placeholder="นามสกุล" autocomplete="family-name" required />
          </div>
          <div class="form-field full-width">
            <label for="regEmail">อีเมล</label>
            <input type="email" id="regEmail" placeholder="you@email.com" autocomplete="email" required />
          </div>
          <div class="form-field full-width">
            <label for="regPass">รหัสผ่าน</label>
            <input type="password" id="regPass" placeholder="••••••" autocomplete="new-password" required />
          </div>
        </div>

        <div class="form-field">
          <label><input type="checkbox" id="regTos" required> ยอมรับ <a href="#" id="openTOS">กฎข้อบังคับของแอพ</a></label>
        </div>
        <button type="submit" class="btn-primary w-full" id="doRegister" disabled>สมัครสมาชิก</button>

        <!-- ลิงก์กลับไปเข้าสู่ระบบ -->
        <div class="auth-bottom">
          <p style="text-align:center;">มีบัญชีอยู่แล้ว?</p>
          <button type="button" class="btn-ghost w-full" id="goLogin">เข้าสู่ระบบ</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  // ---------- Helpers ----------
  const qs = s => root.querySelector(s);
  const loginForm   = qs('#loginForm');
  const regForm     = qs('#regForm');
  const goRegister  = qs('#goRegister');
  const goLogin     = qs('#goLogin');
  const doRegisterBtn = qs('#doRegister');
  const regTos        = qs('#regTos');

  function showLogin() {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginForm.setAttribute('aria-hidden', 'false');
    regForm.setAttribute('aria-hidden', 'true');
    setTimeout(() => qs('#loginEmail')?.focus(), 0);
  }
  function showRegister() {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regForm.setAttribute('aria-hidden', 'false');
    loginForm.setAttribute('aria-hidden', 'true');
    setTimeout(() => qs('#regName')?.focus(), 0);
  }

  // ---------- เปิดด้วยหน้าไหน ----------
  if (isRegister) showRegister(); else showLogin();

  // ---------- การสลับฟอร์ม ----------
  goRegister.addEventListener('click', showRegister);
  goLogin.addEventListener('click', showLogin);

  // ---------- เปิดปุ่มสมัครเมื่อยอมรับเงื่อนไข ----------
  regTos.addEventListener('change', () => {
    doRegisterBtn.disabled = !regTos.checked;
  });

  // ---------- เปิด TOS ----------
  qs('#openTOS').addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof openTOS === 'function') openTOS();
  });

  // ---------- ปิด modal ----------
  function closeModal() {
    if (root.parentNode) document.body.removeChild(root);
  }
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]') || e.target === root) closeModal();
  });
  document.addEventListener('keydown', escClose);
  function escClose(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escClose);
    }
  }

  // ---------- กันรีเฟรชหน้าเวลา submit ----------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    doLogin();
  });
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    doRegister();
  });

  // ---------- ล็อกอิน ----------
  function doLogin() {
    const email = qs('#loginEmail').value.trim().toLowerCase();
    const pass  = qs('#loginPass').value.trim();

    const u = (window.DB_USERS || []).find(x => x.email === email && x.password === pass);
    if (!u) { showToast?.('อีเมลหรือรหัสผ่านไม่ถูกต้อง','error');  return; }

    // เก็บ user เข้า state พร้อมฟิลด์สำคัญที่สัญญาจะใช้
    state.user = {
      id: u.id,
      title: u.title,
      name: u.name,             // ชื่อเล่น
      firstName: u.firstName,   // ชื่อจริง
      lastName: u.lastName,     // นามสกุล
      email: u.email,           // ใช้เป็น "ชื่อผู้ใช้ในระบบ"
      role: u.role,
      level: u.level,
      points: u.points,
      nationalId: u.nationalId,
      phone: u.phone,
      address: u.address,
      profilePic: u.profilePic
    };

    save?.(); emit('auth:login',{user: state.user}); closeModal();
    mountHeader?.(); renderAccountMenu?.(); renderNotifs?.();
    onLoginShowNotifs?.(); startRealtimeNotifs?.();
    showToast?.(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ ${u.name||''}`,'success');
  }

  // ---------- สมัครสมาชิก ----------
  function doRegister() {
    const nickname   = qs('#regName').value.trim();
    const title      = qs('#regTitle').value;
    const firstName  = qs('#regFirstName').value.trim();
    const lastName   = qs('#regLastName').value.trim();
    const email      = qs('#regEmail').value.trim().toLowerCase();
    const pass       = qs('#regPass').value.trim();
    const role       = "renter"; // ค่า default: ผู้เช่า

    if (!nickname || !firstName || !lastName || !email || !pass) {
      showToast?.('กรอกข้อมูลให้ครบถ้วน','error'); return;
    }
    if ((window.DB_USERS || []).find(u => u.email === email)) {
      alert('อีเมลนี้ถูกใช้งานแล้ว'); return;
    }

    const newId = Math.max(0, ...(window.DB_USERS || []).map(u => u.id || 0)) + 1;

    const u = {
      id: newId,
      title,
      name: nickname,       // ชื่อเล่น
      firstName,
      lastName,
      email,
      password: pass,
      role,
      level: "Bronze",
      points: 0,
      phone: "",
      nationalId: "",       // ให้ผู้ใช้ไปกรอกเติมภายหลังในโปรไฟล์
      address: "",
      profilePic: "assets/users/default.jpg"
    };

    window.DB_USERS = (window.DB_USERS || []);
    window.DB_USERS.push(u);
    persistUsers();

    showToast?.('สมัครสำเร็จและเข้าสู่ระบบแล้ว','success');

    // ล็อกอินอัตโนมัติ
    state.user = {
      id: u.id,
      title: u.title,
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      level: u.level,
      points: u.points,
      nationalId: u.nationalId,
      phone: u.phone,
      address: u.address,
      profilePic: u.profilePic
    };

    save?.(); emit('auth:login',{user: state.user}); closeModal();
    mountHeader?.(); renderAccountMenu?.(); renderNotifs?.();
    onLoginShowNotifs?.(); startRealtimeNotifs?.();
  }
}

/**
 * แสดงป๊อปอัปแจ้งให้ผู้ใช้เข้าสู่ระบบก่อน
 */
function showLoginPopup(){
  const m = document.createElement('div');
  m.className = 'modal-backdrop show';
  m.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="h3" style="margin-bottom:6px">กรุณาเข้าสู่ระบบก่อน!</div>
      <div class="muted" style="margin-bottom:10px">เพื่อหยิบสินค้าใส่ตะกร้า โปรดเข้าสู่ระบบ</div>
      <div class="detail-actions" style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn-primary" id="goLogin">เข้าสู่ระบบ</button>
      </div>
    </div>`;
  m.addEventListener('click', (e)=>{
    if(e.target.dataset.close || e.target===m) document.body.removeChild(m);
  });
  m.querySelector('#goLogin').addEventListener('click', ()=>{
    document.body.removeChild(m);
    openAuthModal?.(false);
  });
  document.body.appendChild(m);
}

/**
 * เปิด Modal แสดงข้อตกลงและเงื่อนไข (Terms of Service)
 */
function openTOS(){
  if (document.getElementById('tosModal')) return;
  const root = document.createElement('div');
  root.id = 'tosModal';
  root.className = "modal-backdrop show";

  root.innerHTML = `
    <div class="modal order-detail-modal tos-modal-size" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="my-info-header">
        <strong>กฎข้อบังคับและเงื่อนไขการใช้บริการ</strong>
        <small class="muted">ปรับปรุงล่าสุด: 28 สิงหาคม 2568</small>
      </div>
      <div class="my-info-body tos-content">
        <p><strong>ยินดีต้อนรับสู่ SHAREZY</strong></p>
        <p>การเข้าใช้งานแพลตฟอร์มของเราหมายความว่าท่านได้ยอมรับและตกลงที่จะปฏิบัติตามกฎข้อบังคับและเงื่อนไขที่ระบุไว้ด้านล่างนี้ทุกประการ</p>

        <h4>1. บทบาทและคำจำกัดความ</h4>
        <ul>
          <li><strong>"Sharezy" หรือ "แพลตฟอร์ม":</strong> หมายถึง บริการตัวกลางที่เชื่อมต่อระหว่างผู้เช่าและผู้ให้เช่า</li>
          <li><strong>"ผู้เช่า":</strong> หมายถึง ผู้ใช้งานที่ทำการเช่าสินค้าผ่านแพลตฟอร์ม</li>
          <li><strong>"ผู้ให้เช่า":</strong> หมายถึง ผู้ใช้งานที่นำสินค้าของตนมาลงประกาศเพื่อให้เช่าผ่านแพลตฟอร์ม</li>
        </ul>

        <h4>2. หน้าที่และความรับผิดชอบของผู้เช่า</h4>
        <ul>
          <li><strong>การชำระเงิน:</strong> ผู้เช่าต้องชำระค่าเช่า ค่ามัดจำ และค่าจัดส่งเต็มจำนวนตามที่ระบุก่อนเริ่มการเช่า</li>
          <li><strong>การดูแลรักษาสินค้า:</strong> ต้องดูแลสินค้าให้อยู่ในสภาพใกล้เคียงกับตอนที่ได้รับ โดยคำนึงถึงการใช้งานตามปกติ</li>
          <li><strong>การส่งสินค้าคืน:</strong> ผู้เช่ารับผิดชอบค่าจัดส่งคืน (ยกเว้นระบุว่า “รวมค่าส่งกลับแล้ว”) ต้องจัดส่งภายใน <u>1 วัน</u> หลังวันสิ้นสุดการเช่า พร้อมแจ้งเลขพัสดุในระบบ และบรรจุหีบห่อให้แข็งแรงปลอดภัย</li>
          <li><strong>การปฏิเสธรับสินค้า (กรณีเก็บเงินปลายทาง):</strong> การปฏิเสธโดยไม่มีเหตุอันควร ถือเป็นการละเมิดข้อตกลงและสร้างความเสียหายต่อผู้ให้เช่าและแพลตฟอร์ม</li>
          <li><strong>ช่องทางการชำระเงินที่อนุญาต:</strong> ผู้เช่าต้องทำธุรกรรมผ่านช่องทางที่แพลตฟอร์มกำหนดเท่านั้น ห้ามชำระ/โอนเงินนอกระบบ มิฉะนั้นแพลตฟอร์มไม่รับผิดชอบต่อความเสียหาย</li>
        </ul>

        <h4>3. หน้าที่และความรับผิดชอบของผู้ให้เช่า</h4>
        <ul>
          <li><strong>ความถูกต้องของข้อมูล:</strong> ต้องลงข้อมูลสินค้า (รูป รายละเอียด สภาพ ตำหนิ) ตามความเป็นจริง</li>
          <li><strong>สภาพสินค้า:</strong> สินค้าต้องสะอาดและพร้อมใช้งานตามที่ประกาศ</li>
          <li><strong>การจัดส่ง:</strong> ต้องจัดส่งโดยเร็วหลังยืนยันออเดอร์ และแจ้งเลขพัสดุในระบบ</li>
          <li><strong>การคืนมัดจำ:</strong> เมื่อได้รับคืนและตรวจสอบเรียบร้อย ต้องคืนเงินมัดจำ หรือเปิดเคสข้อพิพาทภายใน <u>3 วันทำการ</u></li>
          <li><strong>ความรับผิดระหว่างขนส่งไปยังผู้เช่า:</strong> ผู้ให้เช่าต้องใช้บริการขนส่งที่เชื่อถือได้และเก็บหลักฐาน (ใบเสร็จ/เลขพัสดุ) หากเกิดสูญหายหรือเสียหายระหว่างไปยังผู้เช่า ให้ดำเนินการเคลมกับบริษัทขนส่งตามหลักฐาน</li>
        </ul>

        <h4>4. นโยบายเกี่ยวกับความเสียหาย การคืนล่าช้า และการยกเลิก</h4>
        <ul>
          <li><strong>ความเสียหายของสินค้า:</strong> 
            <ul>
              <li>ความสึกหรอตามการใช้งานปกติ: ได้รับการยกเว้น</li>
              <li>อุบัติเหตุ/ความประมาท/ใช้งานผิดวัตถุประสงค์: ประเมินตามมูลค่าซ่อมจริง โดยผู้ให้เช่าต้องมีหลักฐานประกอบ (ใบประเมิน/ใบเสร็จ) และแพลตฟอร์มจะใช้เงินมัดจำชดเชยก่อน หากมูลค่าเกิน ผู้เช่ารับผิดชอบส่วนต่าง</li>
            </ul>
          </li>
          <li><strong>การคืนล่าช้า:</strong> คิดค่าปรับ <u>รายวัน</u> ตามที่ระบุในหน้าสินค้าหรือข้อตกลงออเดอร์ หากล่าช้าเกิน <u>7 วัน</u> แพลตฟอร์มขอสงวนสิทธิ์หักเงินมัดจำเต็มจำนวน และอาจระงับบัญชี</li>
          <li><strong>การยกเลิกโดยผู้ให้เช่า:</strong> ผู้เช่าจะได้รับเงินคืนเต็มจำนวนทันที</li>
          <li><strong>ความสูญหาย/เสียหายระหว่างส่งคืน:</strong> ผู้เช่าต้องใช้บริการขนส่งที่รองรับเลขติดตาม (tracking) และแพ็กหีบห่อให้เหมาะสม หากสูญหาย/เสียหายในระหว่างส่งคืน ให้เคลมกับบริษัทขนส่งโดยอาศัยหลักฐานจากระบบและใบรับส่งพัสดุ</li>
        </ul>

        <h4>5. บทบาทและข้อจำกัดความรับผิดของ Sharezy</h4>
        <ul>
          <li><strong>การเป็นตัวกลาง:</strong> Sharezy เป็นแพลตฟอร์มตัวกลางเพื่อเชื่อมต่อและอำนวยความสะดวก ไม่ใช่เจ้าของสินค้า</li>
          <li><strong>การระงับข้อพิพาท:</strong> ทีมงานทำหน้าที่ไกล่เกลี่ยโดยพิจารณาจากหลักฐานทั้งสองฝ่าย (ข้อมูลในระบบ รูป/วิดีโอ ใบเสร็จ ข้อมูลขนส่ง ฯลฯ)</li>
          <li><strong>การคุ้มครองข้อมูลส่วนบุคคล:</strong> เราเคารพและปกป้องข้อมูลส่วนบุคคล ใช้ข้อมูลเท่าที่จำเป็นต่อการติดต่อ/จัดส่ง/ยืนยันตัวตน ตามนโยบายความเป็นส่วนตัว</li>
          <li><strong>ข้อจำกัดความรับผิด:</strong> แพลตฟอร์มไม่รับผิดชอบต่อ (ก) ความเสียหายจากการใช้งานสินค้าระหว่างคู่สัญญา (ข) การกระทำที่ผิดกฎหมายของผู้ใช้ (ค) ความล่าช้าหรือความเสียหายจากผู้ให้บริการขนส่งภายนอก</li>
        </ul>

        <h4>6. การยืนยันตัวตนและความถูกต้องของข้อมูล</h4>
        <ul>
          <li><strong>ความถูกต้องของข้อมูลสมาชิก:</strong> ผู้ใช้ต้องลงทะเบียนด้วยข้อมูลจริงและปรับปรุงให้เป็นปัจจุบัน</li>
          <li><strong>การตรวจสอบ (KYC):</strong> แพลตฟอร์มอาจร้องขอเอกสารยืนยันตัวตน (เช่น บัตรประชาชน) หรือข้อมูลเพิ่มเติมเพื่อป้องกันการทุจริต โดยเก็บรักษาตามนโยบายความเป็นส่วนตัว</li>
        </ul>

        <h4>7. การใช้งานที่ต้องห้าม</h4>
        <ul>
          <li>ห้ามลงประกาศ/เช่าสินค้าที่ผิดกฎหมาย ละเมิดทรัพย์สินทางปัญญา หรือขัดต่อศีลธรรมอันดี</li>
          <li>ห้ามกระทำการหลอกลวง สร้างออเดอร์เทียม หรือชำระเงินนอกระบบ</li>
        </ul>

        <h4>8. การละเมิดกฎและการระงับบัญชี</h4>
        <p>การละเมิดข้อใดข้อหนึ่ง อาจนำไปสู่การตักเตือน ระงับชั่วคราว หรือระงับถาวร รวมถึงการยกเลิกสิทธิประโยชน์และการเข้าถึงระบบตามที่แพลตฟอร์มเห็นสมควร</p>

        <h4>9. การแก้ไขเปลี่ยนแปลงเงื่อนไข</h4>
        <p>Sharezy ขอสงวนสิทธิ์ในการแก้ไข ปรับปรุง หรือเพิ่มเติมกฎข้อบังคับ โดยจะแจ้งให้ผู้ใช้ทราบล่วงหน้าอย่างน้อย 7 วันทำการผ่านช่องทางที่เหมาะสม การใช้งานแพลตฟอร์มต่อไปภายหลังการแก้ไขถือเป็นการยอมรับเงื่อนไขฉบับปรับปรุง</p>

      </div>
      <div class="my-info-footer">
        <button class="btn-primary w-full" data-close="1">รับทราบและเข้าใจ</button>
      </div>
    </div>`;

  document.body.appendChild(root);

  const tosBody = root.querySelector('.tos-content');
  if (tosBody) tosBody.addEventListener('wheel', e => e.stopPropagation());
  
  root.addEventListener('click',(e)=>{ 
    if(e.target.closest('[data-close]')||e.target===root) {
      document.body.removeChild(root);
    }
  });
}
