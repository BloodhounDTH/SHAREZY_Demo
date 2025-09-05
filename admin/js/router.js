// admin/js/router.js
import { renderRenters }       from './modules/renters.js';
import { renderSearchProduct } from './modules/search.js';
import { approve as renderApprove, rejected as renderRejected } from './modules/products.js';
import { renderSaller }        from './modules/saller.js';
import { renderUsers }         from './modules/users.js';
import { renderMerchants }     from './modules/merchants.js';
import { renderCases }         from './modules/cases.js';
import { renderDocs }          from './modules/docs.js';
import { renderDashboard }     from './modules/dashboard.js';

const sections = [...document.querySelectorAll('main > section[data-view]')];

const routes = {
  'dashboard':         renderDashboard,
  'users':             renderUsers,
  'renter':            renderRenters,
  'product-search':    renderSearchProduct,
  'product-approve':   renderApprove,
  'product-rejected':  renderRejected,
  'merchant-register': renderMerchants,
  'cases':             renderCases,
  'saller':            renderSaller,
  'documents':         renderDocs,
};

function setActive(view){
  document.querySelectorAll('[data-page]').forEach(a=>{
    const p = a.getAttribute('data-page')?.replace(/^#/,'');
    a.classList.toggle('is-active', p===view);
    a.classList.toggle('active', p===view);
  });
}

function show(view){
  sections.forEach(s => s.hidden = true);
  const target = sections.find(s => s.dataset.view === view) || sections[0];
  if (!target) return;
  target.hidden = false;
  setActive(view);
  const fn = routes[view];
  if (typeof fn === 'function') { try{ fn(); }catch(e){ console.error('[router]', e); } }
}

function onRoute(){
  const view = (location.hash || '#dashboard').replace(/^#/, '');
  show(view);
}

export function initRouter(){
  document.querySelectorAll('[data-page]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const page = a.getAttribute('data-page');
      if (page){ e.preventDefault(); location.hash = page.startsWith('#')?page:('#'+page); }
    });
  });
  window.addEventListener('hashchange', onRoute);
  onRoute();
}

export default { initRouter };
