// js/coupons.js
// คูปองและฟังก์ชันคำนวณส่วนลด (Global ใช้ได้จากทุกไฟล์)

(function(){
  // ตัวอย่างคูปองเริ่มต้น (แก้/เพิ่มได้)
  window.COUPONS = window.COUPONS ?? [
    { code:'WELCOME50', type:'amount', value:50, minRent:200, featured:true, expires:'2026-12-31' },
    { code:'SAVE10',    type:'percent', value:10,  minRent:0,   maxDiscount:200, expires:'2025-12-31' }
  ];

  // แปลงวันหมดอายุเป็นเวลาไทย (สิ้นวัน)
  function expToDateThai(dateStr){
    return dateStr ? new Date(dateStr + 'T23:59:59+07:00') : null;
  }

  // คำนวณส่วนลดจากโค้ด: ctx = { rent, days, items }
  window.computeCouponDiscount = function(code, ctx){
    if(!code) return { ok:false, amount:0, label:'' };

    const coupons = window.COUPONS || [];
    const input = String(code).trim();               // ตัดช่องว่างหน้า/ท้าย แต่คงตัวพิมพ์
    const c = coupons.find(x => (x.code || '') === input);
    if(!c) return { ok:false, amount:0, label:'โค้ดส่วนลดไม่ถูกต้อง' };

    const now = new Date();
    const exp = expToDateThai(c.expires);
    if(exp && now > exp) return { ok:false, amount:0, label:'โค้ดส่วนลดหมดอายุ' };

    const rent = Math.max(0, +ctx?.rent || 0);
    if((+c.minRent||0) > 0 && rent < c.minRent){
      return { ok:false, amount:0, label:`ยอดค่าเช่าอย่างน้อย ฿${(+c.minRent).toLocaleString('th-TH')}` };
    }

    let amount = 0;
    if(c.type === 'percent'){
      amount = Math.round(rent * (+c.value||0) / 100);
      if(+c.maxDiscount) amount = Math.min(amount, +c.maxDiscount);
    }else{
      amount = Math.round(+c.value || 0);
    }

    if(amount <= 0) return { ok:false, amount:0, label:'โค้ดนี้ไม่ได้ส่วนลด' };

    return {
      ok: true,
      amount,
      label: (c.type==='percent' ? `${+c.value||0}%` : `฿${amount.toLocaleString('th-TH')}`),
      def: c
    };
  };

  // (ออปชัน) เพิ่มคูปองเป็นชุดภายหลัง
  window.addCoupons = function(list){
    const arr = Array.isArray(list) ? list : [list];
    window.COUPONS = (window.COUPONS||[]).concat(arr.filter(Boolean));
  };

  // เลือกโปรฯ ที่ "ใช้งานได้ตอนนี้" (คำนึงถึง enabled/startsAt/expires/channel/featured)
  window.getActivePromo = function(now = new Date()){
    const list = (window.COUPONS || []).filter(c => {
      if (c.enabled === false) return false;                 // ปิดใช้
      if (c.channel && c.channel !== 'web') return false;    // จำกัดช่องทาง
      if (c.startsAt && now < new Date(c.startsAt + 'T00:00:00+07:00')) return false;
      if (c.expires  && now > new Date(c.expires  + 'T23:59:59+07:00')) return false;
      return true;
    });

    // ให้โปรฯ ที่ติด featured มาก่อน
    list.sort((a,b)=> (b.featured===true) - (a.featured===true));
    return list[0] || null; // ไม่มีโปรฯ → ได้ null
  };
})();