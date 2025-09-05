// แสดง overlay เมื่อเกิด error หรือ unhandled promise
export function setupErrorOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'errOverlay';
  overlay.style.cssText = `
    position:fixed;
    inset:0;
    display:none;
    background:rgba(0,0,0,0.85);
    color:#f8d7da;
    z-index:99999;
    padding:16px;
    overflow:auto;
    font-family: monospace;
    font-size: 14px;
  `;
  overlay.innerHTML = `
    <h3 style="margin-bottom:8px;">Script Error</h3>
    <pre id="errText" style="white-space:pre-wrap;"></pre>
  `;

  function show(msg) {
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay);
    }
    document.getElementById('errText').textContent = msg;
    overlay.style.display = 'block';
  }

  window.addEventListener('error', (e) => {
    show(e?.error?.stack || e?.message || 'Unknown error');
  });
  window.addEventListener('unhandledrejection', (e) => {
    show(e?.reason?.stack || e?.reason || 'Promise rejection');
  });
}
