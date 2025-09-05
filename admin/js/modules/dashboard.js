// modules/dashboard.js
// Dashboard: KPI, realtime visitors, time-range compare, category chart, TH tile-map, insights, recent tickets → cases

let visitChart, catChart;
let visitorsTimer = null;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ====== STATE ช่วงเวลา ======
const DashState = {
  range: '7d',      // 7d | 30d | 90d | 180d | 1y | 2y | 3y
  compare: false
};


// ==== Mapping ชื่อไทย -> ID จังหวัดใน thailandLow (ตัวอย่างชุดหลัก ใช้เท่าที่เรามีผู้ใช้จริงก่อน) ====
const NAME_TO_ID = {
  "กรุงเทพมหานคร": "TH-10", "สมุทรปราการ": "TH-11", "นนทบุรี": "TH-12", "ปทุมธานี": "TH-13", "อยุธยา": "TH-14",
  "อ่างทอง":"TH-15","ลพบุรี":"TH-16","สิงห์บุรี":"TH-17","ชัยนาท":"TH-18","สระบุรี":"TH-19",
  "ชลบุรี":"TH-20","ระยอง":"TH-21","จันทบุรี":"TH-22","ตราด":"TH-23","ฉะเชิงเทรา":"TH-24","ปราจีนบุรี":"TH-25","นครนายก":"TH-26","สระแก้ว":"TH-27",
  "นครราชสีมา":"TH-30","บุรีรัมย์":"TH-31","สุรินทร์":"TH-32","ศรีสะเกษ":"TH-33","อุบลราชธานี":"TH-34","ยโสธร":"TH-35","ชัยภูมิ":"TH-36","อำนาจเจริญ":"TH-37","บึงกาฬ":"TH-38","หนองบัวลำภู":"TH-39","ขอนแก่น":"TH-40","อุดรธานี":"TH-41","เลย":"TH-42","หนองคาย":"TH-43","มหาสารคาม":"TH-44","ร้อยเอ็ด":"TH-45","กาฬสินธุ์":"TH-46","สกลนคร":"TH-47","นครพนม":"TH-48","มุกดาหาร":"TH-49",
  "เชียงใหม่":"TH-50","ลำพูน":"TH-51","ลำปาง":"TH-52","อุตรดิตถ์":"TH-53","แพร่":"TH-54","น่าน":"TH-55","พะเยา":"TH-56","เชียงราย":"TH-57","แม่ฮ่องสอน":"TH-58",
  "นครสวรรค์":"TH-60","อุทัยธานี":"TH-61","กำแพงเพชร":"TH-62","ตาก":"TH-63","สุโขทัย":"TH-64","พิษณุโลก":"TH-65","พิจิตร":"TH-66","เพชรบูรณ์":"TH-67",
  "ราชบุรี":"TH-70","กาญจนบุรี":"TH-71","สุพรรณบุรี":"TH-72","นครปฐม":"TH-73","สมุทรสาคร":"TH-74","สมุทรสงคราม":"TH-75","เพชรบุรี":"TH-76","ประจวบคีรีขันธ์":"TH-77",
  "นครศรีธรรมราช":"TH-80","กระบี่":"TH-81","พังงา":"TH-82","ภูเก็ต":"TH-83","สุราษฎร์ธานี":"TH-84","ระนอง":"TH-85","ชุมพร":"TH-86",
  "สงขลา":"TH-90","สตูล":"TH-91","ตรัง":"TH-92","พัทลุง":"TH-93","ปัตตานี":"TH-94","ยะลา":"TH-95","นราธิวาส":"TH-96"
};

// เก็บ instance ไว้อัปเดตซ้ำ
let thMapChart = null;

function renderThailandMapAmcharts(dataByProvince) {
  // แปลงเป็น areas ของ amCharts
  const areas = Object.entries(dataByProvince)
    .map(([name, val]) => {
      const id = NAME_TO_ID[name];
      return id ? { id, value: val || 0 } : null;
    })
    .filter(Boolean);

  // ครั้งแรก: สร้างแผนที่ใหม่
  if (!thMapChart) {
    thMapChart = AmCharts.makeChart("thMapHost", {
      type: "map",
      theme: "light",
      colorSteps: 10,
      dataProvider: { map: "thailandLow", areas },
      areasSettings: {
        autoZoom: true,
        balloonText: "[[title]]: [[value]] คน",
        outlineColor: "rgba(108,92,231,0.6)",
        outlineThickness: 0.6
      },
      valueLegend: { right: 10, minValue: "น้อย", maxValue: "มาก" }
    });
  } else {
    // รอบถัดไป: อัปเดตข้อมูลอย่างเดียว
    thMapChart.dataProvider.areas = areas;
    thMapChart.validateData();
  }
}

// ====== Utils เวลา/บัคเก็ต ======
function buildBuckets(rangeKey) {
  const now = new Date();

  let buckets = [];
  let mode = 'day';          // 'hour' | 'day' | 'month'
  let countDays = 7;
  let countHours = 0;

  if (rangeKey === '1h') {mode = 'hour';countHours = 1;}
  else if (rangeKey === '3h') {mode = 'hour';countHours = 3;} 
  else if (rangeKey === '6h') {mode = 'hour';countHours = 6;}  
  else if (rangeKey === '12h') {mode = 'hour';countHours = 12;} 
  else if (rangeKey === '1d') countDays = 1;
  else if (rangeKey === '3d') countDays = 3;
  else if (rangeKey === '7d') countDays = 7;
  else if (rangeKey === '30d') countDays = 30;
  else if (rangeKey === '90d') countDays = 90;
  else if (rangeKey === '180d') countDays = 180;
  else if (rangeKey === '1y')  { mode = 'month'; countDays = 365; }
  else if (rangeKey === '2y')  { mode = 'month'; countDays = 365*2; }
  else if (rangeKey === '3y')  { mode = 'month'; countDays = 365*3; }

  if (mode === 'hour') {
    // ปักที่ต้นชั่วโมงปัจจุบัน แล้วถอยหลังทีละชั่วโมง
    const top = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    for (let i = countHours - 1; i >= 0; i--) {
      const d = new Date(top.getTime() - i * 3600000);
      // ใส่วันที่ด้วยเพื่อกันชนกันข้ามวัน
      const label =
        `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ` +
        `${String(d.getHours()).padStart(2,'0')}:00`;
      buckets.push({ key: label, date: d });
    }
  } else if (mode === 'day') {
    for (let i = countDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      buckets.push({ key: label, date: d });
    }
  } else {
    // month mode
    const months = Math.ceil(countDays / 30);
    const tmp = new Date(now);
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(tmp.getFullYear(), tmp.getMonth() - i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      buckets.push({ key: label, date: d });
    }
  }

  return { mode, buckets };
}


// จำลอง Visitors/Users ตาม bucket
function simulateTraffic(buckets, mode) {
  const visitors = [], users = [];
  buckets.forEach(() => {
    // base ขึ้นกับ mode เพื่อให้สเกลสวย
    const baseV = (mode === 'day') ? rand(800, 2600) : rand(12000, 75000);
    const v = baseV + rand(-Math.floor(baseV*0.25), Math.floor(baseV*0.25));
    const u = Math.max(0, Math.floor(v * (0.08 + Math.random()*0.12)));
    visitors.push(v);
    users.push(u);
  });
  return { visitors, users };
}

function previousPeriod(rangeKey) {
  // ใช้ bucket เท่ากัน แล้วสุ่มให้ต่ำกว่านิดหน่อยเพื่อเปรียบเทียบ
  const { mode, buckets } = buildBuckets(rangeKey);
  const { visitors, users } = simulateTraffic(buckets, mode);
  const prevV = visitors.map(v => Math.max(0, Math.floor(v * (0.75 + Math.random()*0.2))));
  const prevU = users.map(u => Math.max(0, Math.floor(u * (0.75 + Math.random()*0.2))));
  return { mode, buckets, prevV, prevU };
}

// ====== KPI / Top Sellers / Recent Tickets (เดิม) ======
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

function startRealtimeVisitors() {
  const el = document.getElementById("visitorsOnline");
  if (!el) return;
  if (visitorsTimer) clearInterval(visitorsTimer);

  const tick = () => {
    el.textContent = rand(120, 18000).toLocaleString();
    el.classList.remove('v-blink');
    // trigger reflow เพื่อรีสตาร์ท animation
    // eslint-disable-next-line no-unused-expressions
    void el.offsetWidth;
    el.classList.add('v-blink');
  };
  tick();
  visitorsTimer = setInterval(tick, 2500);
}


function renderTopSellers() {
  const owners = (Array.isArray(window.DB_USERS) ? DB_USERS : []).filter(u => u.role === "owner");
  const names = owners.length ? owners.map(o => o.name || `Owner ${o.id}`) : ["Naree Closet","KookKai Shop","Pim Chic","UrbanWear","ToolRent"];

  // สุ่มยอดขึ้นกับช่วง (ช่วงยาว = ยอดรวมมากกว่า)
  const rangeFactor = ({'7d':1,'30d':4,'90d':10,'180d':18,'1y':36,'2y':72,'3y':110}[DashState.range] || 1);
  const top = names.map(n=>({ name:n, sales: rand(5000, 20000) * rangeFactor }))
                   .sort((a,b)=>b.sales-a.sales)
                   .slice(0,3);

  const ol = document.getElementById("topSellers");
  if (!ol) return;
  ol.innerHTML = top.map((t,i)=>{
    const cls = i===0?'gold':i===1?'silver':'bronze';
    return `<li class="${cls}">${t.name} — <strong>${t.sales.toLocaleString()} บาท</strong></li>`;
  }).join("");
}

function seedCasesFromTickets(tks) {
  window.__CASES_DEMO = tks.map((t, i) => ({
    caseId: t.id, orderId: `ORD-${1000+i}`, title: t.title, status: t.status, createdAt: t.updated,
    detail: `รายละเอียดเคส: ${t.title} — ผู้ยื่น: ${t.email}`
  }));
}

function badge(st){ if(st==='open')return' st-open'; if(st==='pending')return' st-pending'; if(st==='done')return' st-done'; return 'st-open'; }

// ====== Category Chart ======
function aggregateCategories() {
  const clothes = Array.isArray(window.ITEM_CLOTHES)?ITEM_CLOTHES:[];
  const tools   = Array.isArray(window.ITEM_TOOLS)?ITEM_TOOLS:[];
  // รวม category ทั้งหมด จาก title/category ใน items แล้วสุ่ม weight ให้เหมือนเป็นยอดเช่า
  const all = [...clothes, ...tools];
  const map = {};
  all.forEach(p=>{
    const cat = (p.category || 'misc').toLowerCase();
    map[cat] = (map[cat]||0) + (p.popularity || rand(5,40));
  });
  const arr = Object.entries(map).map(([k,v])=>({cat:k, val:v})).sort((a,b)=>b.val-a.val).slice(0,6);
  return arr;
}

function renderCategoryChart() {
  const host = document.getElementById('catChart');
  if (!host) return;
  const data = aggregateCategories();
  const labels = data.map(d => d.cat);
  const values = data.map(d => d.val);

  if (catChart) catChart.destroy();
  catChart = new Chart(host, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Popular Rentals', data: values, borderWidth:1, backgroundColor:'rgba(108,92,231,0.35)', borderColor:'rgba(108,92,231,0.9)'}]},
    options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, scales:{ x:{ beginAtZero:true } } }
  });
}


function deriveProvinceUsage() {
  // พยายามดึงจังหวัดจาก address ของ DB_USERS แบบง่าย ๆ (ถ้าไม่เจอให้สุ่ม)
  const users = Array.isArray(window.DB_USERS)?DB_USERS:[];
  const known = ['กรุงเทพมหานคร','เชียงใหม่','ชลบุรี','ขอนแก่น','นครราชสีมา','ภูเก็ต','ปทุมธานี','สงขลา','เชียงราย','พิษณุโลก'];
  const counts = {};
  users.forEach(u=>{
    const addr = (u.address || '') + ' ' + (u.province || '');
    const hit = known.find(p => addr.includes(p));
    const key = hit || known[rand(0, known.length-1)];
    counts[key] = (counts[key]||0)+1;
  });
  // ถ้าไม่มี user → mock
  if (!users.length) known.forEach(p => counts[p] = rand(10, 200));
  return counts; // {จังหวัด:จำนวน}
}

// ====== Executive Insights ======
function renderExecInsights({ visitors, users }) {
  const ul = document.getElementById('execInsights');
  if (!ul) return;
  const sumV = visitors.reduce((a,b)=>a+b,0);
  const sumU = users.reduce((a,b)=>a+b,0);
  const conv = sumV ? (sumU/sumV)*100 : 0;

  const cats = aggregateCategories();
  const topCat = cats[0]?.cat || '-';

  const provs = deriveProvinceUsage();
  const topProv = Object.entries(provs).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';

  ul.innerHTML = `
    <li>Conversion โดยรวมช่วงนี้ ~ <strong>${conv.toFixed(2)}%</strong></li>
    <li>หมวดที่นิยมที่สุด: <strong>${topCat}</strong></li>
    <li>จังหวัดที่ใช้งานมากที่สุด: <strong>${topProv}</strong></li>
    <li>ค่าเฉลี่ยยอดสั่งซื้อ (จำลอง): <strong>${rand(350, 650).toLocaleString()} บาท</strong></li>
  `;
}

// ====== กราฟหลักตามช่วงเวลา + Compare ======
function renderMainChart() {
  // 1) เตรียม bucket ตามช่วงเวลา
  const { mode, buckets } = buildBuckets(DashState.range);
  const { visitors, users } = simulateTraffic(buckets, mode);
  const labels = buckets.map(b => b.key);

  // 2) datasets (rename กันซ้ำ)
  const chartDatasets = [
    {
      type: 'bar',
      label: 'Visitors',
      data: visitors,
      borderWidth: 1,
      backgroundColor: 'rgba(108,92,231,0.35)',
      borderColor:   'rgba(108,92,231,0.9)'
    },
    {
      type: 'bar',
      label: 'Users',
      data: users,
      borderWidth: 1,
      backgroundColor: 'rgba(46,204,113,0.35)',
      borderColor:   'rgba(46,204,113,0.9)'
    }
  ];

  let prevU_sum = null;

  if (DashState.compare) {
    const prev = previousPeriod(DashState.range);
    chartDatasets.push({
      type: 'line',
      label: 'Prev Visitors',
      data: prev.prevV,
      borderWidth: 2,
      borderColor: 'rgba(108,92,231,0.5)',
      borderDash: [6,4],
      fill: false,
      pointRadius: 0,
      tension: 0.3
    });
    chartDatasets.push({
      type: 'line',
      label: 'Prev Users',
      data: prev.prevU,
      borderWidth: 2,
      borderColor: 'rgba(46,204,113,0.5)',
      borderDash: [6,4],
      fill: false,
      pointRadius: 0,
      tension: 0.3
    });
    prevU_sum = prev.prevU.reduce((a,b)=>a+b,0);
  }

  // 3) วาดกราฟ
  const ctx = document.getElementById('visitChart');
  if (!ctx) return;

  if (visitChart) visitChart.destroy();
  visitChart = new Chart(ctx, {
    data: { labels, datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });

  // 4) KPI + Delta (rename กันซ้ำ)
  const sumU = users.reduce((a,b)=>a+b,0);
  const avgTicketVal = rand(150, 600);
  const salesNow = sumU * avgTicketVal;

  let deltaSalesText = '—';
  let deltaOrdersText = '—';

  if (prevU_sum !== null) {
    const salesPrev = prevU_sum * avgTicketVal;
    const diffSales = salesNow - salesPrev;
    const diffOrders = sumU - prevU_sum;
    deltaSalesText  = (diffSales >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(diffSales).toLocaleString() + ' บาท';
    deltaOrdersText = (diffOrders >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ') + Math.abs(diffOrders).toLocaleString() + ' รายการ';
  } else {
    const estPrevSales = Math.floor(salesNow * 0.9);
    const estPrevU = Math.floor(sumU * 0.9);
    deltaSalesText  = (salesNow - estPrevSales >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ')
                      + Math.abs(salesNow - estPrevSales).toLocaleString() + ' บาท';
    deltaOrdersText = (sumU - estPrevU >= 0 ? 'เพิ่มขึ้น ' : 'ลดลง ')
                      + Math.abs(sumU - estPrevU).toLocaleString() + ' รายการ';
  }

  setText('weeklySales', salesNow.toLocaleString() + ' บาท');
  setText('weeklyOrders', sumU.toLocaleString() + ' รายการ');
  setText('weeklySalesDeltaText',  deltaSalesText);
  setText('weeklyOrdersDeltaText', deltaOrdersText);

  // 5) ส่วนเสริม
  renderCategoryChart();
  renderExecInsights({ visitors, users });

  // 6) แผนที่
  const provData = deriveProvinceUsage();
  if (typeof renderThailandMapAmcharts === 'function') {
    renderThailandMapAmcharts(provData);
  } else if (typeof renderThailandMapSVG === 'function') {
    renderThailandMapSVG('#thMapHost', provData, '../assets/thailand-provinces.svg');
  }

  // 7) Top Sellers
  renderTopSellers();
}



// ====== Controls ======
function bindControls() {
  const bar = document.getElementById('dashControls');
  if (!bar) return;

  bar.querySelectorAll('button[data-range]')?.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      DashState.range = btn.getAttribute('data-range');
      renderMainChart();
    });
  });

  document.getElementById('dashCompare')?.addEventListener('change', (e)=>{
    DashState.compare = !!e.target.checked;
    renderMainChart();
  });
}

// ====== Entry point ======
export function renderDashboard() {
  bindControls();
  renderMainChart();
  startRealtimeVisitors();
  renderTopSellers();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && visitorsTimer) { clearInterval(visitorsTimer); visitorsTimer = null; }
    else if (!document.hidden && !visitorsTimer) { startRealtimeVisitors(); }
  });
}
