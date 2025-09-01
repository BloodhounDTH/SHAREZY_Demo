// === user.js (keep old shape, just add missing fields) ===
window.DB_USERS = window.DB_USERS ?? [
  {
    id: 1, name: "ดวงพร", email: "off@sharezy.com", role: "renter", level: "Gold", points: 1200, password: "sharezy",
    firstName: "ดวงพร", lastName: "สีกากอล์ฟ", nationalId: "1101701234567", hasIdentity: false,
    phone: "080-123-4567",
    addrLine1: "99/12 หมู่บ้านกัลปพฤกษ์", addrSoi: "ซอย 3", addrRoad: "ถนนวิภาวดี",
    addrSubDistrict: "ลาดยาว", addrDistrict: "จตุจักร", addrProvince: "กรุงเทพมหานคร", addrZip: "10900",
    address: "99/12 หมู่บ้านกัลปพฤกษ์, ซอย 3 ถนนวิภาวดี, ลาดยาว จตุจักร, กรุงเทพมหานคร 10900",
    avatar: "👤", createdAt: "2024-01-10T09:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 2, name: "น้องอีฟ", email: "eve@sharezy.com", role: "owner", level: "Diamond", points: 4200, password: "sharezy",
    firstName: "อีฟ", lastName: "นะจ๊ะ", nationalId: "1719902345671", hasIdentity: true,
    phone: "081-222-3344",
    addrLine1: "188/8 อาคารเพชร", addrSoi: "", addrRoad: "ถนนห้วยแก้ว",
    addrSubDistrict: "สุเทพ", addrDistrict: "เมืองเชียงใหม่", addrProvince: "เชียงใหม่", addrZip: "50200",
    address: "188/8 อาคารเพชร, ถนนห้วยแก้ว, สุเทพ เมืองเชียงใหม่, เชียงใหม่ 50200",
    avatar: "👜", createdAt: "2024-01-11T10:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 3, name: "Pimza007", email: "pim@sharezy.com", role: "admin", level: "Admin", points: 9999, password: "sharezy",
    firstName: "พิมพ์", lastName: "ซ่า", nationalId: "1840203456712", hasIdentity: true,
    phone: "082-345-6789",
    addrLine1: "55/5 คอนโดสกายวิว", addrSoi: "ซอย 5", addrRoad: "ถนนพระราม 9",
    addrSubDistrict: "ห้วยขวาง", addrDistrict: "ห้วยขวาง", addrProvince: "กรุงเทพมหานคร", addrZip: "10310",
    address: "55/5 คอนโดสกายวิว, ซอย 5 ถนนพระราม 9, ห้วยขวาง ห้วยขวาง, กรุงเทพมหานคร 10310",
    avatar: "🛡️", createdAt: "2024-01-12T11:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 4, name: "ไก่จ๋า", email: "max@sharezy.com", role: "renter", level: "Bronze", points: 20, password: "sharezy",
    firstName: "แม็กซ์", lastName: "ใจดี", nationalId: "1100604567123", hasIdentity: false,
    phone: "083-777-8899",
    addrLine1: "12/4 ห้อง 2B", addrSoi: "ซอย หนองมน 1", addrRoad: "ถนนสุขุมวิท",
    addrSubDistrict: "แสนสุข", addrDistrict: "เมืองชลบุรี", addrProvince: "ชลบุรี", addrZip: "20130",
    address: "12/4 ห้อง 2B, ซอย หนองมน 1 ถนนสุขุมวิท, แสนสุข เมืองชลบุรี, ชลบุรี 20130",
    avatar: "🐣", createdAt: "2024-01-13T12:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 5, name: "ป้าบิ๋ม เสื้อหมา", email: "bim@sharezy.com", role: "owner", level: "Silver", points: 100, password: "sharezy",
    firstName: "บิ๋ม", lastName: "บุ๋ม", nationalId: "1730405671234", hasIdentity: false,
    phone: "084-111-2233",
    addrLine1: "8/88 ร้านป้าบิ๋ม", addrSoi: "", addrRoad: "ถนนลาดพร้าว",
    addrSubDistrict: "คลองจั่น", addrDistrict: "บางกะปิ", addrProvince: "กรุงเทพมหานคร", addrZip: "10240",
    address: "8/88 ร้านป้าบิ๋ม, ถนนลาดพร้าว, คลองจั่น บางกะปิ, กรุงเทพมหานคร 10240",
    avatar: "👗", createdAt: "2024-01-14T13:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 6, name: "ซ้อแพท บิกินี่ให้เช่า", email: "pat@sharezy.com", role: "owner", level: "Platinum", points: 120, password: "sharezy",
    firstName: "แพท", lastName: "ณ จ๊ะ", nationalId: "1102006789123", hasIdentity: true,
    phone: "085-999-0001",
    addrLine1: "222/2 บูทีคสโตร์", addrSoi: "ซอย 2", addrRoad: "ถนนปฏัก",
    addrSubDistrict: "กะรน", addrDistrict: "เมืองภูเก็ต", addrProvince: "ภูเก็ต", addrZip: "83100",
    address: "222/2 บูทีคสโตร์, ซอย 2 ถนนปฏัก, กะรน เมืองภูเก็ต, ภูเก็ต 83100",
    avatar: "👙", createdAt: "2024-01-15T14:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  },
  {
    id: 99, name: "Arm", email: "arm@sharezy.com", role: "admin", level: "Admin", points: 9999, password: "sharezy",
    firstName: "ศิริชัย", lastName: "แอดมิน", nationalId: "1103707891234", hasIdentity: true,
    phone: "097-179-7168",
    addrLine1: "1 อาคารเซียร์", addrSoi: "", addrRoad: "ถนนวิภาวดี-รังสิต",
    addrSubDistrict: "คลองหนึ่ง", addrDistrict: "คลองหลวง", addrProvince: "ปทุมธานี", addrZip: "12120",
    address: "1 อาคารเซียร์, ถนนวิภาวดี-รังสิต, คลองหนึ่ง คลองหลวง, ปทุมธานี 12120",
    avatar: "🤴🏻", createdAt: "2024-01-16T15:00:00.000Z", updatedAt: "2024-06-01T10:00:00.000Z"
  }
];

// (ถ้าโปรเจกต์ส่วนอื่นใช้ DB.users อยู่ ให้สะท้อนค่าจาก DB_USERS ไปด้วย)
window.DB = window.DB || {};
DB.users = DB.users || window.DB_USERS;
