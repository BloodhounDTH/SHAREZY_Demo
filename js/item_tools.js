// js/item_tools.js
// สินค้าหมวดเครื่องมือช่าง

window.ITEM_TOOLS = window.ITEM_TOOLS ?? [
  {
    id: 201, ownerId: 5, title: "สว่านกระแทก 13mm",
    category: "เครื่องมือช่าง",
    pricePerDay: 150, deposit: 800,
    size: "-", color: "-",
    location: "กรุงเทพฯ",
    image: "assets/tools/impact_drill.jpg",
    shippingMode: "both", returnShipping: "separate",
    shipFeeOut: 60, shipFeeBack: 60,
    requiresWash: false, cleaningFee: 0,
    active: true
  },
  {
    id: 202, ownerId: 2, title: "เครื่องฉีดน้ำแรงดัน",
    category: "เครื่องมือช่าง",
    pricePerDay: 220, deposit: 1000,
    size: "-", color: "-",
    location: "นนทบุรี",
    image: "assets/tools/pressure_washer.jpg",
    shippingMode: "both", returnShipping: "separate",
    shipFeeOut: 80, shipFeeBack: 80,
    requiresWash: true, cleaningFee: 40,
    active: true
  },
  {
    id: 203, ownerId: 6, title: "เครื่องตัดหญ้าไฟฟ้า",
    category: "เครื่องมือช่าง",
    pricePerDay: 180, deposit: 700,
    size: "-", color: "-",
    location: "ปทุมธานี",
    image: "assets/tools/grass_trimmer.jpg",
    shippingMode: "both", returnShipping: "separate",
    shipFeeOut: 70, shipFeeBack: 70,
    requiresWash: true, cleaningFee: 30,
    active: true
  },
  {
    id: 204, ownerId: 99, title: "เลเซอร์วัดระยะ",
    category: "เครื่องมือช่าง",
    pricePerDay: 120, deposit: 500,
    size: "-", color: "-",
    location: "กรุงเทพฯ",
    image: "assets/tools/laser_measure.jpg",
    shippingMode: "both", returnShipping: "separate",
    shipFeeOut: 50, shipFeeBack: 50,
    requiresWash: false, cleaningFee: 0,
    active: true
  },
  {
    id: 205, ownerId: 5, title: "ชุดบล็อกพร้อมด้ามขัน 46 ชิ้น",
    category: "เครื่องมือช่าง",
    pricePerDay: 100, deposit: 400,
    size: "-", color: "-",
    location: "สมุทรปราการ",
    image: "assets/tools/socket_set.jpg",
    shippingMode: "both", returnShipping: "separate",
    shipFeeOut: 50, shipFeeBack: 50,
    requiresWash: false, cleaningFee: 0,
    active: true
  }
];

// ลงทะเบียนแหล่งข้อมูลของไฟล์นี้ เพื่อให้ main.js รวมสินค้าอัตโนมัติ
(window.ITEM_SOURCES = window.ITEM_SOURCES || []).push(window.ITEM_TOOLS);
