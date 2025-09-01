// ===== Sharezy Signature (contract) =====
// - เปลี่ยนไปใช้ window.DB_USERS แทน DB.users
// - แสดงข้อมูลบุคคลในสัญญา: ชื่อจริง(คำนำหน้า+ชื่อ+สกุล), ชื่อเล่น, เลขบัตรประชาชน, ชื่อผู้ใช้ในระบบ (อีเมล)
// - ส่วนอื่น ๆ ยังคงอิงโครงสร้างระบบเดิมของคุณ (DB.orders, products, computeSettlement, money, fmtDateLabelTH, ฯลฯ)

/**
 * แสดงหน้าสัญญาเช่าอิเล็กทรอนิกส์ในรูปแบบของ Modal
 * @param {object} order - อ็อบเจกต์ข้อมูลออเดอร์จาก DB.orders
 * @param {object} currentUser - อ็อบเจกต์ผู้ใช้ปัจจุบันจาก state.user
 */

function maskNationalId(id) {
  if (!id) return 'N/A';
  // คงรูปแบบเดิมไว้บางส่วน เช่น X-XXXX-XXXXX-XX-X
  const digits = id.replace(/\D/g,'');
  if (digits.length < 13) return 'ข้อมูลถูกซ่อน';
  return id.replace(/\d/g, '•'); // เบลอทุกหลัก
}

function showSignaturePage(order, currentUser) {
  if (!order || !currentUser) {
    console.error("showSignaturePage: Order or currentUser is missing.");
    showToast?.('ข้อมูลไม่ถูกต้อง ไม่สามารถแสดงสัญญาได้', 'error');
    return;
  }

  // ป้องกันการเปิดซ้อน
  if (document.getElementById('signature-modal-overlay')) return;

  // --- 1. สร้างโครงสร้าง HTML ของ Modal ---
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'signature-modal-overlay';
  modalOverlay.className = 'modal-backdrop show'; 
  
  // ดึงข้อมูลที่จำเป็นจากออเดอร์
  const st = computeSettlement(order); // ใช้ฟังก์ชันคำนวณเดิมของคุณ
  const _users = (window.DB_USERS || []);
  const owner  = _users.find(u => u.id === order.ownerId)  || {};
  const renter = _users.find(u => u.id === order.renterId) || {};

  const rentalEndDate = parseDateInput(order.rentalEnd);
  const returnDate = rentalEndDate ? addDays(rentalEndDate, 1) : null;

  const itemsHtml = order.items.map(id => {
    const p = products.find(x => x.id === id) || {};
    const details = [
      p.category && `<li><strong>หมวดหมู่:</strong> ${p.category}</li>`,
      p.color && `<li><strong>สี:</strong> ${p.color}</li>`,
      p.size && `<li><strong>ขนาด:</strong> ${p.size}</li>`
    ].filter(Boolean).join('');
    return `
      <div class="contract-item">
        <p><strong>- ${p.title || 'Unknown Item'}</strong> (จำนวน: 1)</p>
        ${details ? `<ul class="item-details">${details}</ul>` : ''}
      </div>
    `;
  }).join('');

  const isRenter = currentUser.id === order.renterId;
  const isOwner  = currentUser.id === order.ownerId;
  const isAdmin = currentUser?.role === 'admin';

  // helper: ทำชื่อจริงพร้อมคำนำหน้า
  const fullName = (u) => [u.title||'', u.firstName||'', u.lastName||'']
  .join(' ').replace(/\s+/g,' ').trim();

  // บล็อกข้อมูลผู้ให้เช่า & ผู้เช่า (รวมชื่อจริง/ชื่อเล่น/บัตร/อีเมล)
    const partyBlock = (label, u) => {
    const natIdText = (canSeeNatId && canSeeNatId(currentUser, u)) ? (u.nationalId || 'N/A') : (maskNationalId ? maskNationalId(u.nationalId) : 'N/A');
    return `
        <p class="ml-4"><strong>${label}:</strong> ${fullName(u) || 'N/A'}</p>
        <ul class="ml-8">
        <li><strong>ชื่อ user (ชื่อเล่นบนแพลตฟอร์ม):</strong> ${u.name || 'N/A'}</li>
        <li data-sensitive="nationalId"><strong>รหัสบัตรประชาชน:</strong> ${natIdText}</li>
        <li><strong>ที่อยู่:</strong> ${u.address || 'N/A'}</li>
        <li><strong>ชื่อผู้ใช้ในระบบ SHAREZY:</strong> ${u.email || 'N/A'}</li>
        </ul>
    `;
    };

  modalOverlay.innerHTML = `
    <div class="modal order-detail-modal signature-modal-size contract-printable-container" style="display: flex; flex-direction: column;" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>

      <div class="my-info-header">
        <strong>สัญญาเช่าสินค้าอิเล็กทรอนิกส์</strong>
        <small class="muted">หมายเลขออเดอร์: ${order.orderNo}</small>
      </div>

      <div class="my-info-body" style="line-height: 1.7;">
        <p class="mb-4"><strong>สัญญาฉบับนี้ทำขึ้นระหว่าง:</strong></p>
        ${partyBlock('ผู้ให้เช่า', owner)}
        ${partyBlock('และ ผู้เช่า', renter)}
        <p class="mb-4">หมายเลขออเดอร์: ${order.orderNo}</p>

        <h3 class="font-bold text-lg mb-2">ข้อ 1: รายการสินค้าที่เช่า</h3>
        <p>ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงรับเช่าสินค้าดังต่อไปนี้:</p>
        <ul class="my-3">${itemsHtml}</ul>
        
        <h3 class="font-bold text-lg mb-2 mt-6">ข้อ 2: ระยะเวลาการเช่า</h3>
        <p><strong>วันที่เริ่มเช่า:</strong> ${fmtDateLabelTH(order.rentalStart)}</p>
        <p><strong>วันที่สิ้นสุด:</strong> ${fmtDateLabelTH(order.rentalEnd)}</p>
        <p><strong>วันที่ต้องส่งคืน:</strong> ${returnDate ? fmtDateLabelTH(returnDate) : 'N/A'}</p>
        <p>โปรดส่งคืนสินค้าภายในเวลา 18:00 น. ของวันที่ต้องส่งคืน</p>
        <p> ** สัญญาจะสิ้นสุดลงเมื่อผู้ให้เช่ายืนยันสินค้าแล้วเท่านั้น ** </p>

        <h3 class="font-bold text-lg mb-2 mt-6">ข้อ 3: อัตราค่าเช่าและเงินมัดจำ</h3>
        <p><strong>ค่าเช่ารวม:</strong> ${money(st.rent)} บาท</p>
        <p><strong>ค่ามัดจำ:</strong> ${money(st.deposit)} บาท</p>
        <p><strong>ค่าจัดส่ง:</strong> ${money(st.shipOut)} บาท</p>
        <p class="font-bold"><strong>ยอดชำระทั้งสิ้น:</strong> ${money(st.grand)} บาท</p>

        <h3 class="font-bold text-lg mb-2 mt-6">ข้อ 4: เงื่อนไขและข้อตกลง</h3>
        <p>ผู้เช่าและผู้ให้เช่าได้อ่านและยอมรับ <a href="/terms" target="_blank" class="text-blue-600 hover:underline">กฎข้อบังคับและเงื่อนไขการใช้บริการของ Sharezy</a> ทุกประการ ซึ่งถือเป็นส่วนหนึ่งของสัญญานี้</p>

        <h3 class="font-bold text-lg mb-2 mt-6">ข้อ 5: การลงนามอิเล็กทรอนิกส์ (e-Signature)</h3>
        <p>ทั้งสองฝ่ายยอมรับว่าการกดปุ่ม "ยืนยันและลงนามในสัญญา" ในหน้านี้ ถือเป็นการลงลายมือชื่อทางอิเล็กทรอนิกส์ที่มีผลผูกพันทางกฎหมาย</p>
      </div>

      <!-- Footer & Signature Area -->
      <div class="my-info-footer" style="flex-direction: column; gap: 1rem;">
        <label class="accept-terms" style="align-self: flex-start;">
          <input type="checkbox" id="agreement-checkbox">
          <span>ข้าพเจ้าได้อ่านและยอมรับเงื่อนไขในสัญญานี้ทุกประการ</span>
        </label>
        <div style="display: flex; width: 100%; gap: 10px;">
          <button id="print-contract-btn" class="btn w-full" style="background-color: #6c757d;">🖨️ พิมพ์สัญญา</button>
          <button id="sign-contract-btn" disabled class="btn-primary w-full">ยืนยันและลงนามในสัญญา</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // ปุ่มพิมพ์เฉพาะส่วนสัญญา
  const printButton = document.getElementById('print-contract-btn');
  if (printButton) {
    printButton.addEventListener('click', () => {
      const contractContent = modalOverlay.querySelector('.my-info-body');
      if (!isAdmin) {
  modalOverlay.classList.add('blur-sensitive');
}
      if (contractContent) printElement(contractContent);
    });
  }

  // --- 2. Event Listeners ---
  const checkbox = document.getElementById('agreement-checkbox');
  const signButton = document.getElementById('sign-contract-btn');
  const closeModal = () => document.body.removeChild(modalOverlay);

  modalOverlay.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
  });

  checkbox.addEventListener('change', () => {
    signButton.disabled = !checkbox.checked;
  });

  signButton.addEventListener('click', () => {
    if (!checkbox.checked) return;

    signButton.disabled = true;
    signButton.textContent = 'กำลังดำเนินการ...';

    let nextStatus = '';
    if (isRenter && order.status === 'awaiting_renter_signature') {
      nextStatus = 'awaiting_owner_signature';
    } else if (isOwner && order.status === 'awaiting_owner_signature') {
      nextStatus = 'placed';
    }

    if (nextStatus) {
      const success = updateOrderStatus(order.id, nextStatus);
      if (success) {
        showToast?.('ลงนามในสัญญาสำเร็จ!', 'success');
        handlePostSignature(nextStatus, order);
      } else {
        showToast?.('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
        signButton.disabled = false;
        signButton.textContent = 'ยืนยันและลงนามในสัญญา';
      }
    } else {
      showToast?.('สถานะออเดอร์ไม่ถูกต้อง', 'error');
    }
  });
}

/**
 * อัปเดตสถานะของออเดอร์ใน DB object
 * @param {number} orderId - ID ของออเดอร์
 * @param {string} newStatus - สถานะใหม่
 * @returns {boolean} - คืนค่า true ถ้าสำเร็จ
 */
function updateOrderStatus(orderId, newStatus) {
  try {
    const orderIndex = DB.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      console.error(`Order with ID ${orderId} not found.`);
      return false;
    }
    DB.orders[orderIndex].status = newStatus;
    saveOrders?.(); // ฟังก์ชันบันทึกข้อมูลเดิมของคุณ
    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return false;
  }
}

/**
 * จัดการ UI และส่ง Notification หลังจากลงนามสำเร็จ
 * @param {string} newStatus - สถานะใหม่ของออเดอร์
 * @param {object} order - อ็อบเจกต์ข้อมูลออเดอร์
 */
function handlePostSignature(newStatus, order) {
  const modal = document.getElementById('signature-modal-overlay');
  if (modal) modal.remove();

  const orderLink = `#/order/${order.id}`;

  if (newStatus === 'awaiting_owner_signature') {
    // ลูกค้าลงนามเสร็จ -> แจ้งเตือนร้านค้า
    pushNotif?.({ 
      text: `ลูกค้าลงนามในสัญญาสำหรับออเดอร์ ${order.orderNo} แล้ว`, 
      link: orderLink, 
      forRole: 'owner',  
      toId: order.ownerId  
    });

    // แจ้งเตือนผู้เช่า
    pushNotif?.({
      text: `ออเดอร์ ${order.orderNo}: ผู้ให้เช่ากำลังตรวจสอบสัญญา เตรียมจัดส่งเร็วๆ นี้`,
      link: orderLink,
      forRole: 'renter',
      toId: order.renterId
    });

    showInfoModal?.('ลงนามสำเร็จแล้ว', 'ระบบได้ส่งสัญญาให้ผู้ให้เช่าลงนามแล้ว และจะแจ้งเตือนคุณอีกครั้งเมื่อสัญญาเสร็จสมบูรณ์');
  
  } else if (newStatus === 'placed') {
    // ร้านค้าลงนามเสร็จ -> สัญญาสมบูรณ์ -> แจ้งเตือนลูกค้า
    pushNotif?.({ 
      text: `สัญญาสำหรับออเดอร์ ${order.orderNo} เสร็จสมบูรณ์! ร้านค้ากำลังเตรียมจัดส่ง`, 
      link: orderLink, 
      forRole: 'renter', 
      toId: order.renterId 
    });
    
    // เปิดหน้ารายละเอียดออเดอร์สำหรับเจ้าของ
    const updatedOrder = DB.orders.find(o => o.id === order.id);
    if (updatedOrder) {
      openOwnerOrderDetail?.(updatedOrder);
    }
  }
}
