// modules/cases.js
// แสดงข้อพิพาท / เคส จาก demo (ถ้ามี) หรือจาก DB.orders

function seed5() {
  if (Array.isArray(window.__CASES_DEMO) && window.__CASES_DEMO.length) return;
  window.__CASES_DEMO = [
    { caseId:'T-2001', orderId:'SZ20250901A1', title:'แม่ค้าส่งสินค้าผิด', status:'open',    createdAt:'2025-09-01 10:21' },
    { caseId:'T-2002', orderId:'SZ20250829B2', title:'สินค้าเสียหาย',       status:'pending', createdAt:'2025-08-29 14:02' },
    { caseId:'T-2003', orderId:'SZ20250828C3', title:'สินค้าไม่ตรงปก',      status:'open',    createdAt:'2025-08-28 18:33' },
    { caseId:'T-2004', orderId:'SZ20250827D4', title:'ขอเลื่อนวันส่งคืน',   status:'done',    createdAt:'2025-08-27 09:40' },
    { caseId:'T-2005', orderId:'SZ20250825E5', title:'ขอคืนเงินบางส่วน',    status:'pending', createdAt:'2025-08-25 20:12' },
  ];
}

// ใน renderCases() ก่อนใช้งาน window.__CASES_DEMO ให้เรียก seed5();
seed5();

export function renderCases() {
  const tbody = document.querySelector("#tblCases tbody");
  if (!tbody) return;

  // 1) กินข้อมูล demo ที่ส่งมาจาก Dashboard ก่อน
  let cases = Array.isArray(window.__CASES_DEMO) ? window.__CASES_DEMO : [];

  // 2) ถ้าไม่มี demo ให้ลองดึงจาก DB.orders (กรณีคุณมีเคสจริงใน DB)
  if (!cases.length && window.DB && Array.isArray(window.DB.orders)) {
    cases = window.DB.orders
      .filter(o => o.case || o.dispute)
      .map((o, idx) => ({
        caseId: `AUTO-${idx + 1}`,
        orderId: o.id ?? "-",
        title:  o.case?.title || o.dispute?.title || "Case",
        status: o.case?.status || o.dispute?.status || "pending",
        createdAt: o.case?.createdAt || "-"
      }));
  }

  tbody.innerHTML =
    cases.map(
      (c, idx) => `
      <tr data-idx="${idx}">
        <td>${idx + 1}</td>
        <td>${c.orderId}</td>
        <td>${c.title}</td>
        <td><span class="status ${statusBadge(c.status)}">${c.status}</span></td>
        <td>${c.createdAt || "-"}</td>
      </tr>`
    ).join("") || `<tr><td colspan="5">ยังไม่มีข้อมูลเคส</td></tr>`;

  // คลิกแถวเพื่อเปิด modal วินิจฉัย/ปิดเคส (demo action)
  tbody.querySelectorAll("tr[data-idx]").forEach(tr => {
    tr.addEventListener("click", () => {
      const i = Number(tr.getAttribute("data-idx"));
      openCaseModal(cases[i], (newStatus) => {
        cases[i].status = newStatus;
        window.__CASES_DEMO = cases;   // เขียนทับ demo ให้เห็นผล
        renderCases();
      });
    });
  });

  console.log(`[CASES] แสดง ${cases.length} รายการ`);
}

function statusBadge(st) {
  if (st === "open") return "st-open";
  if (st === "pending") return "st-pending";
  if (st === "done") return "st-done";
  if (st === "rejected") return "st-rejected";
  return "st-open";
}

function openCaseModal(item, onSave) {
  const mask = document.querySelector(".mask");
  const modal = document.getElementById("caseModal");
  if (!mask || !modal) return;

  modal.innerHTML = `
    <h3>วินิจฉัยเคส</h3>
    <div style="margin-bottom:8px"><strong>Order:</strong> ${item.orderId}</div>
    <div style="margin-bottom:8px"><strong>เรื่อง:</strong> ${item.title}</div>
    <div style="margin-bottom:12px"><strong>รายละเอียด:</strong> ${item.detail || "-"}</div>
    <label>เปลี่ยนสถานะ</label>
    <select id="cm_status" style="width:100%;margin:8px 0">
      <option value="open"    ${item.status==='open'?'selected':''}>open</option>
      <option value="pending" ${item.status==='pending'?'selected':''}>pending</option>
      <option value="done"    ${item.status==='done'?'selected':''}>done</option>
      <option value="rejected"${item.status==='rejected'?'selected':''}>rejected</option>
    </select>
    <button id="cm_save">💾 บันทึก</button>
    <button id="cm_cancel">❌ ยกเลิก</button>
  `;

  const close = () => { mask.style.display = "none"; modal.style.display = "none"; };
  document.getElementById("cm_cancel").onclick = close;
  document.getElementById("cm_save").onclick = () => {
    const ns = document.getElementById("cm_status").value;
    if (onSave) onSave(ns);
    close();
  };

  mask.style.display = "block";
  modal.style.display = "block";
}
