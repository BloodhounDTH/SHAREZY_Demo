// js/item_clothes.js
// สินค้าหมวดเสื้อผ้า (Clothes) — แยกจาก products ใน main.js

window.ITEM_CLOTHES = window.ITEM_CLOTHES ?? [
    { id: 101, ownerId: 2, title: "ชุดราตรี", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 500, size:"M", color:"แดง", location:"กรุงเทพฯ",
    image:"assets/pic101.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 50,
    requiresWash:true, cleaningFee:30, active:false, rating:4.9
  },
  { id: 102, ownerId: 2, title: "ชุดแต่งงาน", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 800, size:"L", color:"ดำ", location:"เชียงใหม่",
    image:"assets/pic102.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 60,
    requiresWash:false, cleaningFee:0, active:true, rating:4.8
  },
  { id: 103, ownerId: 2, title: "ชุดเพื่อนเจ้าสาว", category:"เสื้อผ้า",
    pricePerDay: 300, deposit: 1200, size:"S", color:"หลากสี", location:"ขอนแก่น",
    image:"assets/pic103.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 70, shipFeeBack: 0,
    requiresWash:true, cleaningFee:40, active:true, rating:5.0
  },
  { id: 104, ownerId: 2, title: "ชุดไทยประยุกต์", category:"เสื้อผ้า",
    pricePerDay: 150, deposit: 400, size:"S", color:"ชมพูอ่อน", location:"ชลบุรี",
    image:"assets/pic104.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 45,
    requiresWash:true, cleaningFee:20, active:true, rating:4.7
  },
  { id: 105, ownerId: 2, title: "บิกินี่ทูพีซ", category:"เสื้อผ้า",
    pricePerDay: 190, deposit: 600, size:"M", color:"ครีม", location:"นครราชสีมา",
    image:"assets/pic105.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 55,
    requiresWash:false, cleaningFee:0, active:true, rating:4.6
  },
  { id: 106, ownerId: 2, title: "ชุดว่ายน้ำวันพีซ", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 300, size:"L", color:"ฟ้า", location:"นนทบุรี",
    image:"assets/pic106.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 0,
    requiresWash:true, cleaningFee:15, active:true, rating:4.5
  },
  { id: 107, ownerId: 2, title: "ผ้าคลุมบิกินี่/คาร์ดิแกนซีทรู", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 500, size:"F", color:"เงิน", location:"ปทุมธานี",
    image:"assets/pic107.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 50,
    requiresWash:true, cleaningFee:20, active:true, rating:4.8
  },
  { id: 108, ownerId: 2, title: "เชิ้ตลินินโอเวอร์ไซส์", category:"เสื้อผ้า",
    pricePerDay: 130, deposit: 300, size:"F", color:"ขาว", location:"ภูเก็ต",
    image:"assets/pic108.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 35, shipFeeBack: 35,
    requiresWash:false, cleaningFee:0, active:true, rating:4.6
  },
  { id: 109, ownerId: 2, title: "เดรสสายเดี่ยวซาติน", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 900, size:"S", color:"ม่วงลาเวนเดอร์", location:"สงขลา",
    image:"assets/pic109.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 65, shipFeeBack: 0,
    requiresWash:true, cleaningFee:35, active:true, rating:4.7
  },
  { id: 110, ownerId: 2, title: "เดรสแม็กซี่ลายดอก", category:"เสื้อผ้า",
    pricePerDay: 110, deposit: 250, size:"M", color:"เขียว", location:"เชียงราย",
    image:"assets/pic110.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 30, shipFeeBack: 30,
    requiresWash:false, cleaningFee:0, active:true, rating:4.4
  },
  { id: 111, ownerId: 2, title: "จัมป์สูท", category:"เสื้อผ้า",
    pricePerDay: 170, deposit: 500, size:"L", color:"หลากสี", location:"พิษณุโลก",
    image:"assets/pic111.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 55,
    requiresWash:true, cleaningFee:25, active:true, rating:4.7
  },
  { id: 112, ownerId: 2, title: "กางเกงขายาวขากว้าง", category:"เสื้อผ้า",
    pricePerDay: 210, deposit: 700, size:"M", color:"ดำ", location:"อุดรธานี",
    image:"assets/pic112.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 0,
    requiresWash:true, cleaningFee:30, active:true, rating:4.8
  },
  {
    id: 113, ownerId: 5, title: "กระโปรงพลีท", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 500, size:"M", color:"ขาว", location:"อุบลราชธานี",
    image:"assets/pic113.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.3
  },
  {
    id: 114, ownerId: 6, title: "คาร์ดิแกนไหมพรม", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 600, size:"L", color:"แดง", location:"นครศรีธรรมราช",
    image:"assets/pic114.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.4
  },
  {
    id: 115, ownerId: 5, title: "สูทเบลเซอร์", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 700, size:"F", color:"ชมพู", location:"ระยอง",
    image:"assets/pic115.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.5
  },
  {
    id: 116, ownerId: 6, title: "เดรสคัตเอาท์", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 800, size:"S", color:"ฟ้า", location:"สุราษฎร์ธานี",
    image:"assets/pic116.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.6
  },
  {
    id: 117, ownerId: 5, title: "ชุดไปทะเล", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 900, size:"M", color:"เขียว", location:"ลพบุรี",
    image:"assets/pic117.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.7
  },
  {
    id: 118, ownerId: 6, title: "เลกกิ้งออกกำลังกาย", category:"เสื้อผ้า",
    pricePerDay: 140, deposit: 1000, size:"L", color:"ครีม", location:"พระนครศรีอยุธยา",
    image:"assets/pic118.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.8
  },
  {
    id: 119, ownerId: 5, title: "สปอร์ตบรา", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 400, size:"F", color:"ม่วง", location:"นครปฐม",
    image:"assets/pic119.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.9
  },
  {
    id: 120, ownerId: 6, title: "ชุดนอนซาติน", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 500, size:"S", color:"ดำ", location:"สมุทรปราการ",
    image:"assets/pic120.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.0
  },
  {
    id: 121, ownerId: 5, title: "เสื้อครอป", category:"เสื้อผ้า",
    pricePerDay: 200, deposit: 600, size:"M", color:"ขาว", location:"ตรัง",
    image:"assets/pic121.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.1
  },
  {
    id: 122, ownerId: 6, title: "กระโปรงยีนส์เอวสูง", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 700, size:"L", color:"แดง", location:"กำแพงเพชร",
    image:"assets/pic122.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.2
  },
  {
    id: 123, ownerId: 5, title: "กางเกงยีนส์เอวสูง", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 800, size:"F", color:"ชมพู", location:"เพชรบุรี",
    image:"assets/pic123.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.3
  },
  {
    id: 124, ownerId: 6, title: "เสื้อกันหนาวไหมพรม", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 900, size:"S", color:"ฟ้า", location:"ประจวบคีรีขันธ์",
    image:"assets/pic124.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.4
  },
  {
    id: 125, ownerId: 5, title: "ชุดรับปริญญา", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 1000, size:"M", color:"เขียว", location:"บุรีรัมย์",
    image:"assets/pic125.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.5
  },
  {
    id: 126, ownerId: 6, title: "ชุดราตรี", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 400, size:"L", color:"ครีม", location:"ศรีสะเกษ",
    image:"assets/pic126.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.6
  },
  {
    id: 127, ownerId: 5, title: "ชุดแต่งงาน", category:"เสื้อผ้า",
    pricePerDay: 140, deposit: 500, size:"F", color:"ม่วง", location:"สุโขทัย",
    image:"assets/pic127.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.7
  },
  {
    id: 128, ownerId: 6, title: "ชุดเพื่อนเจ้าสาว", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 600, size:"S", color:"ดำ", location:"แม่ฮ่องสอน",
    image:"assets/pic128.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.8
  },
  {
    id: 129, ownerId: 5, title: "ชุดไทยประยุกต์", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 700, size:"M", color:"ขาว", location:"ตราด",
    image:"assets/pic129.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.9
  },
  {
    id: 130, ownerId: 6, title: "บิกินี่ทูพีซ", category:"เสื้อผ้า",
    pricePerDay: 200, deposit: 800, size:"L", color:"แดง", location:"สกลนคร",
    image:"assets/pic130.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.0
  },
  {
    id: 131, ownerId: 5, title: "ชุดว่ายน้ำวันพีซ", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 900, size:"F", color:"ชมพู", location:"กรุงเทพฯ",
    image:"assets/pic131.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.1
  },
  {
    id: 132, ownerId: 6, title: "ผ้าคลุมบิกินี่/คาร์ดิแกนซีทรู", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 1000, size:"S", color:"ฟ้า", location:"เชียงใหม่",
    image:"assets/pic132.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.2
  },
  {
    id: 133, ownerId: 5, title: "เชิ้ตลินินโอเวอร์ไซส์", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 400, size:"M", color:"เขียว", location:"ขอนแก่น",
    image:"assets/pic133.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.3
  },
  {
    id: 134, ownerId: 6, title: "เดรสสายเดี่ยวซาติน", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 500, size:"L", color:"ครีม", location:"ชลบุรี",
    image:"assets/pic134.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.4
  },
  {
    id: 135, ownerId: 5, title: "เดรสแม็กซี่ลายดอก", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 600, size:"F", color:"ม่วง", location:"นครราชสีมา",
    image:"assets/pic135.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.5
  },
  {
    id: 136, ownerId: 6, title: "จัมป์สูท", category:"เสื้อผ้า",
    pricePerDay: 140, deposit: 700, size:"S", color:"ดำ", location:"นนทบุรี",
    image:"assets/pic136.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.6
  },
  {
    id: 137, ownerId: 5, title: "กางเกงขายาวขากว้าง", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 800, size:"M", color:"ขาว", location:"ปทุมธานี",
    image:"assets/pic137.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.7
  },
  {
    id: 138, ownerId: 6, title: "กระโปรงพลีท", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 900, size:"L", color:"แดง", location:"ภูเก็ต",
    image:"assets/pic138.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.8
  },
  {
    id: 139, ownerId: 5, title: "คาร์ดิแกนไหมพรม", category:"เสื้อผ้า",
    pricePerDay: 200, deposit: 1000, size:"F", color:"ชมพู", location:"สงขลา",
    image:"assets/pic139.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.9
  },
  {
    id: 140, ownerId: 6, title: "สูทเบลเซอร์", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 400, size:"S", color:"ฟ้า", location:"เชียงราย",
    image:"assets/pic140.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.0
  },
  {
    id: 141, ownerId: 5, title: "เดรสคัตเอาท์", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 500, size:"M", color:"เขียว", location:"พิษณุโลก",
    image:"assets/pic141.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.1
  },
  {
    id: 142, ownerId: 6, title: "ชุดไปทะเล", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 600, size:"L", color:"ครีม", location:"อุดรธานี",
    image:"assets/pic142.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.2
  },
  {
    id: 143, ownerId: 5, title: "เลกกิ้งออกกำลังกาย", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 700, size:"F", color:"ม่วง", location:"อุบลราชธานี",
    image:"assets/pic143.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.3
  },
  {
    id: 144, ownerId: 6, title: "สปอร์ตบรา", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 800, size:"S", color:"ดำ", location:"นครศรีธรรมราช",
    image:"assets/pic144.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.4
  },
  {
    id: 145, ownerId: 5, title: "ชุดนอนซาติน", category:"เสื้อผ้า",
    pricePerDay: 140, deposit: 900, size:"M", color:"ขาว", location:"ระยอง",
    image:"assets/pic145.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.5
  },
  {
    id: 146, ownerId: 6, title: "เสื้อครอป", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 1000, size:"L", color:"แดง", location:"สุราษฎร์ธานี",
    image:"assets/pic146.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.6
  },
  {
    id: 147, ownerId: 5, title: "กระโปรงยีนส์เอวสูง", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 400, size:"F", color:"ชมพู", location:"ลพบุรี",
    image:"assets/pic147.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.7
  },
  {
    id: 148, ownerId: 6, title: "กางเกงยีนส์เอวสูง", category:"เสื้อผ้า",
    pricePerDay: 200, deposit: 500, size:"S", color:"ฟ้า", location:"พระนครศรีอยุธยา",
    image:"assets/pic148.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.8
  },
  {
    id: 149, ownerId: 5, title: "เสื้อกันหนาวไหมพรม", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 600, size:"M", color:"เขียว", location:"นครปฐม",
    image:"assets/pic149.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:false, rating:4.9
  },
  {
    id: 150, ownerId: 6, title: "ชุดรับปริญญา", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 700, size:"L", color:"ครีม", location:"สมุทรปราการ",
    image:"assets/pic150.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.0
  },
  {
    id: 151, ownerId: 5, title: "ชุดราตรี", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 800, size:"F", color:"ม่วง", location:"ตรัง",
    image:"assets/pic151.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.1
  },
  {
    id: 152, ownerId: 6, title: "ชุดแต่งงาน", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 900, size:"S", color:"ดำ", location:"กำแพงเพชร",
    image:"assets/pic152.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.2
  },
  {
    id: 153, ownerId: 5, title: "ชุดเพื่อนเจ้าสาว", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 1000, size:"M", color:"ขาว", location:"เพชรบุรี",
    image:"assets/pic153.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:true, rating:4.3
  },
  {
    id: 154, ownerId: 6, title: "ชุดไทยประยุกต์", category:"เสื้อผ้า",
    pricePerDay: 140, deposit: 400, size:"L", color:"แดง", location:"ประจวบคีรีขันธ์",
    image:"assets/pic154.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.4
  },
  {
    id: 155, ownerId: 5, title: "บิกินี่ทูพีซ", category:"เสื้อผ้า",
    pricePerDay: 160, deposit: 500, size:"F", color:"ชมพู", location:"บุรีรัมย์",
    image:"assets/pic155.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.5
  },
  {
    id: 156, ownerId: 6, title: "ชุดว่ายน้ำวันพีซ", category:"เสื้อผ้า",
    pricePerDay: 180, deposit: 600, size:"S", color:"ฟ้า", location:"ศรีสะเกษ",
    image:"assets/pic156.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.6
  },
  {
    id: 157, ownerId: 5, title: "ผ้าคลุมบิกินี่/คาร์ดิแกนซีทรู", category:"เสื้อผ้า",
    pricePerDay: 200, deposit: 700, size:"M", color:"เขียว", location:"สุโขทัย",
    image:"assets/pic157.jpg", shippingMode:"fixed", returnShipping:"included",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:true, rating:4.7
  },
  {
    id: 158, ownerId: 6, title: "เชิ้ตลินินโอเวอร์ไซส์", category:"เสื้อผ้า",
    pricePerDay: 220, deposit: 800, size:"L", color:"ครีม", location:"แม่ฮ่องสอน",
    image:"assets/pic158.jpg", shippingMode:"combined", returnShipping:"separate",
    shipFeeOut: 55, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.8
  },
  {
    id: 159, ownerId: 5, title: "เดรสสายเดี่ยวซาติน", category:"เสื้อผ้า",
    pricePerDay: 240, deposit: 900, size:"F", color:"ม่วง", location:"ตราด",
    image:"assets/pic159.jpg", shippingMode:"both", returnShipping:"included",
    shipFeeOut: 60, shipFeeBack: 40,
    requiresWash: true, cleaningFee:30, active:true, rating:4.9
  },
  {
    id: 160, ownerId: 6, title: "เดรสแม็กซี่ลายดอก", category:"เสื้อผ้า",
    pricePerDay: 260, deposit: 1000, size:"S", color:"ดำ", location:"สกลนคร",
    image:"assets/pic160.jpg", shippingMode:"fixed", returnShipping:"separate",
    shipFeeOut: 40, shipFeeBack: 40,
    requiresWash: false, cleaningFee:0, active:true, rating:4.0
  },
  {
    id: 161, ownerId: 5, title: "จัมป์สูท", category:"เสื้อผ้า",
    pricePerDay: 280, deposit: 400, size:"M", color:"ขาว", location:"กรุงเทพฯ",
    image:"assets/pic161.jpg", shippingMode:"combined", returnShipping:"included",
    shipFeeOut: 45, shipFeeBack: 40,
    requiresWash: true, cleaningFee:10, active:true, rating:4.1
  },
  {
    id: 162, ownerId: 6, title: "กางเกงขายาวขากว้าง", category:"เสื้อผ้า",
    pricePerDay: 120, deposit: 500, size:"L", color:"แดง", location:"เชียงใหม่",
    image:"assets/pic162.jpg", shippingMode:"both", returnShipping:"separate",
    shipFeeOut: 50, shipFeeBack: 40,
    requiresWash: true, cleaningFee:20, active:true, rating:4.2
  }
];


// ลงทะเบียนแหล่งข้อมูลของไฟล์นี้ เพื่อให้ main.js รวมสินค้าอัตโนมัติ
(window.ITEM_SOURCES = window.ITEM_SOURCES || []).push(window.ITEM_CLOTHES);