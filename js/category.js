// js/category.js
// ข้อมูลหมวดหมู่สินค้าสำหรับสไลด์โชว์ (ใช้ emoji)

window.CAT_SLIDES = window.CAT_SLIDES ?? [
  { key:"เสื้อผ้า",         title:"เสื้อผ้า",       sub:"สวยไม่ซ้ำใคร",               emoji:"👗", active:true  },
  { key:"เครื่องมือช่าง",    title:"เครื่องมือช่าง", sub:"ครบทุกงาน ซ่อมได้ดั่งใจ",     emoji:"🔧", active:true },
  { key:"เครื่องครัว",       title:"เครื่องครัว",    sub:"ทำอาหารให้อร่อยทุกมื้อ",     emoji:"🍳", active:false },
  { key:"อุปกรณ์ท่องเที่ยว", title:"อุปกรณ์ท่องเที่ยว", sub:"พร้อมลุยทุกการเดินทาง", emoji:"🎒", active:false },
  { key:"อุปกรณ์จัดงาน",    title:"อุปกรณ์จัดงาน", sub:"สร้างบรรยากาศให้น่าจดจำ",   emoji:"🎉", active:false },
  { key:"อุปกรณ์การเรียน",   title:"อุปกรณ์การเรียน", sub:"เรียนสนุก เข้าใจง่าย",     emoji:"📚", active:false },
  { key:"ของใช้แม่และเด็ก",  title:"แม่และเด็ก",     sub:"ปลอดภัย ห่วงใยทุกก้าว",    emoji:"🍼", active:false },
  { key:"เครื่องจักรอุตสาหกรรม",        title:"เครื่องจักรอุตสาหกรรม",        sub:"องค์กรจะเติบโต โดยไม่ต้องลงทุนเยอะ", emoji:"⚙️", active:false },
  { key:"การบริการ",        title:"บริการ",        sub:"ทีมงานมืออาชีพ ช่วยเหลือครบ", emoji:"🤝", active:false },
  { key:"อื่นๆ",            title:"อื่นๆ",          sub:"ทุกอย่างที่คุณมองหา",        emoji:"✨", active:false }
];