// /js/cookie-consent.js  (SHAREZY v1.2 - robust, PDPA-ready)
(() => {
  const KEY = "sz_consent_v1"; // เปลี่ยนชื่อคีย์เมื่ออัปเดต schema เพื่อให้ถามใหม่
  const DEFAULT = { necessary: true, analytics: false, marketing: false, ts: Date.now(), expDays: 180 };

  // ---------- helpers ----------
  const $ = (s) => document.querySelector(s);
  const banner = document.getElementById("cookieBanner");
  const modal  = document.getElementById("cookieModal");

  // แสดง/ซ่อน: จัดการทั้ง hidden และคลาส .show เพื่อกัน CSS ทับ
  function show(el){ if(!el) return; el.hidden = false; el.classList.add("show"); }
  function hide(el){ if(!el) return; el.classList.remove("show"); el.hidden = true; }

  function getStored(){
    try{
      const ls = localStorage.getItem(KEY);
      const ck = document.cookie.split("; ").find(x=>x.startsWith(KEY+"="))?.split("=")[1];
      const raw = ls || ck;
      if(!raw) return null;
      const data = JSON.parse(decodeURIComponent(raw));
      const expMs = (data.expDays ?? DEFAULT.expDays) * 24*60*60*1000;
      if (Date.now() - (data.ts||0) > expMs) return null; // หมดอายุ ให้ถามใหม่
      return data;
    }catch{ return null; }
  }

  function saveConsent(consent){
    const data = { ...DEFAULT, ...consent, ts: Date.now() };
    const json = encodeURIComponent(JSON.stringify(data));
    // เก็บทั้ง localStorage และ cookie (กันกรณีปิด storage)
    try{ localStorage.setItem(KEY, json); }catch{}
    document.cookie = `${KEY}=${json}; Max-Age=${data.expDays*24*60*60}; Path=/; SameSite=Lax`;
    return data;
  }

  // โหลดสคริปต์ที่ถูกเลื่อนไว้จนกว่าจะยินยอม: ใช้ <script type="text/plain" data-consent="analytics|marketing">
  function loadDeferredScripts(){
    const c = getStored();
    if(!c) return;
    document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(node => {
      const need = node.getAttribute('data-consent'); // 'analytics' | 'marketing'
      if (!need || c[need] !== true) return;

      const s = document.createElement('script');
      const src = node.getAttribute('data-src');
      if (src) s.src = src;

      // คัดลอกแอตทริบิวต์ยอดนิยม
      ['async','defer','crossorigin','integrity','referrerpolicy'].forEach(a=>{
        if(node.hasAttribute(a)) s.setAttribute(a, node.getAttribute(a) || "");
      });

      const code = node.textContent?.trim();
      if (code) s.text = code;

      node.replaceWith(s);
    });
  }

  // API ภายใน
  const API = {
    showBanner(){ show(banner); },
    hideBanner(){ hide(banner); },
    openModal(){
      const c = getStored() || DEFAULT;
      const a = document.getElementById('toggleAnalytics');
      const m = document.getElementById('toggleMarketing');
      if (a) a.checked = !!c.analytics;
      if (m) m.checked = !!c.marketing;
      show(modal);
    },
    closeModal(){ hide(modal); }
  };

  // ผูกอีเวนต์แบบทนทาน: ใช้ capture + ผูกตรงปุ่มด้วย
  function bindClicksOnce(){
    if (bindClicksOnce._bound) return;
    bindClicksOnce._bound = true;

    const handler = (ev) => {
      const el = ev.target?.closest?.('#cookieAcceptAllBtn,#cookieRejectAllBtn,#cookieSettingsBtn,#cookieSavePrefsBtn,#cookieCloseModalBtn');
      if (!el) return;
      ev.preventDefault();

      switch (el.id) {
        case 'cookieAcceptAllBtn':
          saveConsent({ analytics: true, marketing: true });
          API.hideBanner(); API.closeModal(); loadDeferredScripts();
          break;
        case 'cookieRejectAllBtn':
          saveConsent({ analytics: false, marketing: false });
          API.hideBanner(); API.closeModal();
          break;
        case 'cookieSettingsBtn':
          API.openModal();
          break;
        case 'cookieSavePrefsBtn': {
          const a = document.getElementById('toggleAnalytics')?.checked ?? false;
          const m = document.getElementById('toggleMarketing')?.checked ?? false;
          saveConsent({ analytics: !!a, marketing: !!m });
          API.closeModal(); API.hideBanner(); loadDeferredScripts();
          break;
        }
        case 'cookieCloseModalBtn':
          API.closeModal();
          break;
      }
    };

    // 1) ฟังแบบ capture (กันโค้ดอื่น stopPropagation ใน phase bubbling)
    document.addEventListener('click', handler, true);

    // 2) ผูกตรงปุ่มด้วย (กันกรณีพิเศษ/Shadow DOM)
    ['cookieAcceptAllBtn','cookieRejectAllBtn','cookieSettingsBtn','cookieSavePrefsBtn','cookieCloseModalBtn']
      .forEach(id => document.getElementById(id)?.addEventListener('click', handler));
  }

  function init(){
    bindClicksOnce();

    const c = getStored();
    if (!c) API.showBanner(); // ยังไม่เคยให้ความยินยอม -> แสดงแบนเนอร์
    else loadDeferredScripts(); // เคยเลือกแล้ว -> โหลดสคริปต์ที่ยอมไว้

    // เปิดใช้จาก footer: window.SharezyConsent.open()
    window.SharezyConsent = {
      open: API.openModal,
      get : getStored,
      has : (type) => !!(getStored() && getStored()[type] === true),
      reset: () => { // ล้างการยินยอมและโชว์แบนเนอร์ใหม่
        try{ localStorage.removeItem(KEY); }catch{}
        document.cookie = `${KEY}=; Max-Age=0; Path=/`;
        API.showBanner();
      }
    };
  }

  // รอ DOM พร้อม (เผื่อสคริปต์ถูกโหลดที่ <head> ด้วย defer)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
