// widgets/th-map.js
// Thailand tile-map (province heat by usage)

const PROVINCES = [
  "กรุงเทพมหานคร","เชียงใหม่","ชลบุรี","ขอนแก่น","นครราชสีมา","ภูเก็ต","ปทุมธานี",
  "เชียงราย","สงขลา","นครศรีธรรมราช","สุราษฎร์ธานี","บุรีรัมย์","อุดรธานี","พิษณุโลก",
  "ระยอง","นครปฐม","สมุทรปราการ","นนทบุรี","ลำปาง","อุบลราชธานี"
]; // รายการย่อเพื่อความสวยงามและอ่านง่าย

export function renderThailandTileMap(hostSelector, dataByProvince) {
  const host = typeof hostSelector === 'string' ? document.querySelector(hostSelector) : hostSelector;
  if (!host) return;

  // เตรียมค่าสีตามสเกล
  const vals = PROVINCES.map(p => dataByProvince[p] || 0);
  const max = Math.max(...vals, 1);
  const scale = v => Math.round((v / max) * 100); // 0..100

  // ล้างของเดิม
  host.innerHTML = '';

  // สร้างกริด (5 คอลัมน์)
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
  grid.style.gap = '8px';

  PROVINCES.forEach(p => {
    const v = dataByProvince[p] || 0;
    const level = scale(v); // 0..100
    const tile = document.createElement('div');
    tile.title = `${p}: ${v}`;
    tile.style.padding = '10px';
    tile.style.borderRadius = '10px';
    tile.style.textAlign = 'center';
    tile.style.background = `linear-gradient(180deg, rgba(108,92,231,${0.15 + level/150}), rgba(108,92,231,${0.05 + level/300}))`;
    tile.style.border = '1px solid rgba(108,92,231,0.2)';
    tile.style.fontSize = '13px';
    tile.innerHTML = `<div style="font-weight:600">${p}</div><div style="opacity:.8">${v.toLocaleString()}</div>`;
    grid.appendChild(tile);
  });

  host.appendChild(grid);
}
