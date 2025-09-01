// js/payment.js

/**
 * เปิดหน้าต่างสำหรับเลือกช่องทางการชำระเงิน
 * @param {object} orderData - ข้อมูลออเดอร์จากหน้า Checkout
 */
function openPaymentSelection(orderData) {
  if (document.getElementById('paymentModal')) return;

  const root = document.createElement('div');
  root.id = 'paymentModal';
  root.className = 'modal-backdrop show';

  const isCodAvailable = orderData.items.every(item => item.allowCOD === true);

  root.innerHTML = `
    <div class="modal payment-modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="h2" style="text-align: center;">เลือกช่องทางชำระเงิน</div>
      <div class="payment-summary">
        <span>ยอดชำระทั้งหมด</span>
        <strong>${money(orderData.total.grand)} บาท</strong>
      </div>
      <div class="payment-options">
        <button class="payment-option" data-method="qr"><span class="icon">📱</span><span class="text">QR Code PromptPay</span></button>
        <button class="payment-option" data-method="cod" ${isCodAvailable ? '' : 'disabled'}><span class="icon">📦</span><span class="text">เก็บเงินปลายทาง</span></button>
        <button class="payment-option" data-method="cc" disabled><span class="icon">💳</span><span class="text">บัตรเครดิต (เร็วๆ นี้)</span></button>
      </div>
      <div class="my-info-footer">
        <button class="btn-primary w-full" id="btnNextPayment" disabled>ถัดไป</button>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const nextButton = root.querySelector('#btnNextPayment');
  let selectedMethod = null;

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();

    const optionButton = e.target.closest('.payment-option');
    if (optionButton && !optionButton.disabled) {
      root.querySelectorAll('.payment-option').forEach(btn => btn.classList.remove('selected'));
      optionButton.classList.add('selected');
      selectedMethod = optionButton.dataset.method;
      nextButton.disabled = false;
    }

    if (e.target.closest('#btnNextPayment')) {
      closeModal(); // ปิดหน้าต่างเลือกช่องทาง
      if (selectedMethod === 'qr') {
        showQrPaymentPage(orderData); // ไปหน้า QR
      } else if (selectedMethod === 'cod') {
        showCodRulesPage(orderData); // ไปหน้ากฎ COD
      }
    }
  });
}

// ▼▼▼ START: ฟังก์ชันที่เพิ่มเข้ามาใหม่ ▼▼▼

/**
 * แสดงหน้าชำระเงินด้วย QR Code
 * @param {object} orderData 
 */
function showQrPaymentPage(orderData) {
  if (document.getElementById('qrModal')) return;
  const root = document.createElement('div');
  root.id = 'qrModal';
  root.className = 'modal-backdrop show';

  root.innerHTML = `
    <div class="modal payment-modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="h2" style="text-align: center;">ชำระเงินผ่าน QR Code</div>
      <div class="qr-code-display">
        <img src="assets/QR.JPG" alt="สแกนเพื่อชำระเงิน">
        <p>ยอดชำระทั้งหมด: <strong>${money(orderData.total.grand)} บาท</strong></p>
      </div>
      <div class="my-info-footer" style="flex-direction: column; gap: 10px;">
        <button class="btn w-full" id="btnSaveQR">บันทึก QR Code</button>
        <button class="btn-primary w-full" id="btnConfirmPayment">ยืนยันการชำระเงิน</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnConfirmPayment')) {
      closeModal();
      showSlipUploadPage(orderData); // ไปหน้าอัปโหลดสลิป
    }
    if (e.target.closest('#btnSaveQR')) {
        showToast('บันทึก QR Code แล้ว (ตัวอย่าง)', 'info');
    }
  });
}

/**
 * แสดงหน้าอัปโหลดสลิป (สำหรับ QR Code)
 * @param {object} orderData 
 */
function showSlipUploadPage(orderData) {
  if (document.getElementById('slipModal')) return;
  const root = document.createElement('div');
  root.id = 'slipModal';
  root.className = 'modal-backdrop show';
  
  root.innerHTML = `
    <div class="modal payment-modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="h2" style="text-align: center;">อัปโหลดหลักฐานการชำระเงิน</div>
      
      <p class="muted" style="text-align: center; margin-top: 4px;">กรุณาอัพโหลดสลิปการชำระเงิน</p>
      
      <div class="slip-upload-form">
        <label for="slipUpload" class="slip-upload-box">
          <span class="icon">📤</span>
          <span>คลิกเพื่อเลือกรูปภาพสลิป</span>
        </label>
        <input type="file" id="slipUpload" accept="image/*" class="hidden">
        <div id="slipPreview" class="slip-preview hidden"></div>
      </div>
      <div class="my-info-footer">
        <button class="btn-primary w-full" id="btnSubmitSlip" disabled>แจ้งชำระเงิน</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const slipUploadInput = root.querySelector('#slipUpload');
  const slipPreview = root.querySelector('#slipPreview');
  const submitButton = root.querySelector('#btnSubmitSlip');

  submitButton.disabled = true;

  slipUploadInput.addEventListener('change', () => {
    const file = slipUploadInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        slipPreview.innerHTML = `<img src="${e.target.result}" alt="ภาพสลิป">`;
        slipPreview.classList.remove('hidden');
        submitButton.disabled = false;
      };
      reader.readAsDataURL(file);
    } else {
        submitButton.disabled = true;
    }
  });

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    
    if (e.target.closest('#btnSubmitSlip')) {
      if (slipUploadInput.files.length === 0) {
        showToast('กรุณาอัพโหลดภาพสลิปการชำระก่อนดำเนินการ!', 'error');
        return;
      }
      closeModal();
      finalizeOrder(orderData, 'qr_pending');
    }
  });
}

/**
 * แสดงหน้ากฎและข้อบังคับสำหรับ COD
 * @param {object} orderData 
 */
function showCodRulesPage(orderData) {
  if (document.getElementById('codRulesModal')) return;
  const root = document.createElement('div');
  root.id = 'codRulesModal';
  root.className = 'modal-backdrop show';

  root.innerHTML = `
    <div class="modal payment-modal" role="dialog" aria-modal="true">
      <button class="modal-close" data-close="1">×</button>
      <div class="h2" style="text-align: center;">เงื่อนไขการชำระเงินปลายทาง</div>
      <div class="cod-rules">
        <ul>
          <li>กรุณาเตรียมเงินสดให้พอดีกับยอดชำระ <strong>${money(orderData.total.grand)} บาท</strong></li>
          <li>การปฏิเสธการรับพัสดุโดยไม่มีเหตุอันควร อาจส่งผลให้บัญชีของท่านถูกระงับการใช้งานในอนาคต</li>
          <li>การกระทำดังกล่าวสร้างความเสียหายและเสียโอกาสทางธุรกิจแก่ผู้ให้เช่าและแพลตฟอร์ม</li>
        </ul>
        <label class="accept-terms">
          <input type="checkbox" id="acceptCodTerms">
          <span>ข้าพเจ้ารับทราบและยอมรับเงื่อนไขข้างต้น</span>
        </label>
      </div>
      <div class="my-info-footer">
        <button class="btn-primary w-full" id="btnConfirmCod" disabled>ยืนยันการสั่งซื้อ</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  const closeModal = () => document.body.removeChild(root);
  const acceptCheckbox = root.querySelector('#acceptCodTerms');
  const confirmButton = root.querySelector('#btnConfirmCod');

  acceptCheckbox.addEventListener('change', () => {
    confirmButton.disabled = !acceptCheckbox.checked;
  });

  root.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('#btnConfirmCod')) {
      closeModal();
      finalizeOrder(orderData, 'cod'); // ปิดจ๊อบ
    }
  });
}


/**
 * ฟังก์ชันสุดท้ายสำหรับสร้างออเดอร์และบันทึกลงระบบ
 * @param {object} orderData 
 * @param {string} paymentMethod 
 * * --- อัปเดตใหม่ ---
 * 1. เปลี่ยนสถานะเริ่มต้นเป็น 'awaiting_renter_signature'
 * 2. เรียกหน้าสัญญา (Signature Page) แทนหน้ายืนยันออเดอร์
 * 3. ย้ายการส่ง Notification ไปจัดการหลังจากลงนามสำเร็จ
 */
function finalizeOrder(orderData, paymentMethod) {
    // สร้างอ็อบเจกต์ order โดยใช้โครงสร้างเดิมของคุณ
    const order = {
        id: Date.now(),
        orderNo: generateOrderNo(),
        items: state.cart.slice(),
        days: orderData.days,
        rentalStart: orderData.rentalStart,
        rentalEnd: orderData.rentalEnd,
        renterId: orderData.renterId,
        ownerId: orderData.ownerId,
        // --- START: การเปลี่ยนแปลงสำคัญ ---
        status: 'awaiting_renter_signature', // 1. เปลี่ยนสถานะเริ่มต้น
        // --- END: การเปลี่ยนแปลงสำคัญ ---
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
        total: orderData.total
    };

    // บันทึกออเดอร์ลง DB (เหมือนเดิม)
    DB.orders.push(hydrateOrder(order));
    saveOrders?.();

    // ล้างตะกร้า (เหมือนเดิม)
    state.cart = [];
    state.couponCode = '';
    save?.();
    renderCart?.();

    // ปิดการใช้งาน Promo Widget (เหมือนเดิม)
    window.disablePromoWidget?.();

    // --- START: การเปลี่ยนแปลง Flow การทำงาน ---
    // 2. เปลี่ยนจากการแสดงหน้ายืนยัน เป็นการแสดงหน้าสัญญา
    showToast('ชำระเงินสำเร็จ! กำลังเตรียมสัญญา...', 'success');
    
    // หน่วงเวลาเล็กน้อยเพื่อให้ผู้ใช้เห็น Toast ก่อน Modal จะปรากฏ
    setTimeout(() => {
        // currentUser จะถูกดึงมาจาก state object ที่มีอยู่แล้ว
        showSignaturePage(order, state.user); 
    }, 1000);
    
    // 3. นำ Notification ออกไปก่อน เพราะออเดอร์ยังไม่สมบูรณ์
    // pushNotif?.({ text:`ออเดอร์ ${order.orderNo} สั่งเช่าสำเร็จ`, ... }); // ย้ายไปทำหลังลงนาม
    // pushNotif?.({ text:`มีออเดอร์ใหม่ ${order.orderNo}`, ... }); // ย้ายไปทำหลังลงนาม
    // --- END: การเปลี่ยนแปลง Flow การทำงาน ---
}