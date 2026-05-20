/* ═══════════════════════════════════════════════
   SHOPWAVE — Complete Application v4
   ═══════════════════════════════════════════════ */
'use strict';

/* ─── STATE ──────────────────────────────────── */
const State = {
  cart:         JSON.parse(localStorage.getItem('sw_cart')     || '[]'),
  wishlist:     JSON.parse(localStorage.getItem('sw_wishlist') || '[]'),
  currentCat:   'all',
  currentSort:  'featured',
  currentView:  'grid',
  searchQuery:  '',
  page:         1,
  perPage:      12,
  heroIndex:    0,
  heroTimer:    null,
  countdownEnd: Date.now() + (5 * 3600 + 42 * 60 + 18) * 1000,
  // Advanced filters
  priceMin:     0,
  priceMax:     200000,
  minRating:    0,
  filterBrands: [],
  inStockOnly:  false,
};
let currentUser = null;

/* ─── PERSIST ────────────────────────────────── */
const saveCart     = () => localStorage.setItem('sw_cart',     JSON.stringify(State.cart));
const saveWishlist = () => localStorage.setItem('sw_wishlist', JSON.stringify(State.wishlist));

/* ─── API HELPER ─────────────────────────────── */
async function api(method, url, body) {
  try {
    const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
  } catch (e) { return {}; }
}

/* ─── HELPERS ────────────────────────────────── */
const fmt = n => '₹' + n.toLocaleString('en-IN');
const pct = (was, now) => Math.round((was - now) / was * 100);
const stars = r => {
  const full = Math.floor(r), half = r % 1 >= 0.5 ? 1 : 0, empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
};

function showToast(msg, type = 'default') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 2800);
}

function scrollToProducts() {
  document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAllModals() {
  ['quickViewModal','accountModal','ordersModal','wishlistModal'].forEach(id => {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('open'); }
  });
  closeCart();
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════
   HERO SLIDER
   ═══════════════════════════════════════════════ */
function goSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;
  slides[State.heroIndex].classList.remove('active');
  dots[State.heroIndex].classList.remove('active');
  State.heroIndex = (idx + slides.length) % slides.length;
  slides[State.heroIndex].classList.add('active');
  dots[State.heroIndex].classList.add('active');
}
function slideHero(dir) { goSlide(State.heroIndex + dir); resetHeroTimer(); }
function resetHeroTimer() {
  clearInterval(State.heroTimer);
  State.heroTimer = setInterval(() => goSlide(State.heroIndex + 1), 5000);
}

/* ═══════════════════════════════════════════════
   COUNTDOWN
   ═══════════════════════════════════════════════ */
function tickCountdown() {
  const diff = Math.max(0, State.countdownEnd - Date.now());
  const pad  = n => String(n).padStart(2, '0');
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const el = id => document.getElementById(id);
  if (el('hours')) el('hours').textContent = pad(h);
  if (el('mins'))  el('mins').textContent  = pad(m);
  if (el('secs'))  el('secs').textContent  = pad(s);
  if (diff === 0)  State.countdownEnd = Date.now() + 6 * 3600 * 1000;
}

/* ═══════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════ */
function buildCard(p) {
  const inWish    = State.wishlist.includes(p.id);
  const discount  = p.was ? pct(p.was, p.price) : 0;
  const badgeHTML = p.badge ? `<span class="badge-tag ${p.badge}">${p.badge.toUpperCase()}</span>` : '';
  const newBadge  = p.isNew ? `<span class="badge-tag new">NEW</span>` : '';
  return `<div class="product-card" data-id="${p.id}" data-cat="${p.cat}">
    <div class="card-img">
      <a href="product.html?id=${p.id}" class="card-emoji-link" aria-label="View ${p.name}"><span class="card-emoji">${p.emoji}</span></a>
      <div class="card-badges">${badgeHTML}${newBadge}</div>
      <button class="card-wishlist ${inWish ? 'wishlisted' : ''}"
        onclick="toggleWishlist(${p.id},event)"
        aria-label="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}">
        ${inWish ? '❤️' : '🤍'}
      </button>
      <div class="card-quick-view" onclick="quickView(${p.id})" role="button" tabindex="0">Quick View</div>
    </div>
    <div class="card-body">
      <div class="card-brand">${p.brand}</div>
      <a href="product.html?id=${p.id}" class="card-name-link"><div class="card-name">${p.name}</div></a>
      <div class="card-rating">
        <span class="stars" aria-label="${p.rating} out of 5 stars">${stars(p.rating)}</span>
        <span class="rating-val">${p.rating}</span>
        <span class="rating-count">(${p.reviews.toLocaleString('en-IN')})</span>
      </div>
      <div class="card-price">
        <span class="price-now">${fmt(p.price)}</span>
        ${p.was ? `<span class="price-was">${fmt(p.was)}</span><span class="price-off">${discount}% off</span>` : ''}
      </div>
      <div class="card-delivery">🚚 ${p.delivery}</div>
      <div class="card-actions">
        <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="buy-now"     onclick="buyNow(${p.id})">Buy Now</button>
      </div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════ */
function getFilteredProducts() {
  let list = [...PRODUCTS];
  if (State.currentCat !== 'all') list = list.filter(p => p.cat === State.currentCat);
  if (State.searchQuery) {
    const q = State.searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.cat.toLowerCase().includes(q)
    );
  }
  // Advanced filters
  list = list.filter(p => p.price >= State.priceMin && p.price <= State.priceMax);
  if (State.minRating > 0) list = list.filter(p => p.rating >= State.minRating);
  if (State.filterBrands.length > 0) list = list.filter(p => State.filterBrands.includes(p.brand));
  // inStockOnly: treat all products as in stock (no stock field), so skip if false
  switch (State.currentSort) {
    case 'low':    list.sort((a,b) => a.price - b.price); break;
    case 'high':   list.sort((a,b) => b.price - a.price); break;
    case 'rating': list.sort((a,b) => b.rating - a.rating); break;
    case 'new':    list.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0)); break;
    default:       list.sort((a,b) => (b.featured?1:0) - (a.featured?1:0));
  }
  return list;
}

function renderMainGrid() {
  const grid  = document.getElementById('mainGrid');
  const title = document.getElementById('sectionTitle');
  const count = document.getElementById('productCount');
  const btn   = document.getElementById('loadMoreBtn');
  if (!grid) return;
  const all   = getFilteredProducts();
  const paged = all.slice(0, State.page * State.perPage);
  const label = State.currentCat === 'all' ? 'All Products'
    : State.currentCat.charAt(0).toUpperCase() + State.currentCat.slice(1);
  if (title) title.textContent = State.searchQuery ? `Results for "${State.searchQuery}"` : label;
  if (count) count.textContent = `${all.length} products`;
  grid.className = 'products-grid' + (State.currentView === 'list' ? ' list-mode' : '');
  grid.innerHTML = paged.length ? paged.map(buildCard).join('')
    : `<div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search or category</p>
        <button class="btn-primary" onclick="clearSearch()">Clear Search</button>
       </div>`;
  if (btn) btn.style.display = paged.length < all.length ? 'inline-block' : 'none';
}

function renderFlashGrid() {
  const grid = document.getElementById('flashGrid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p => p.flashSale).slice(0, 6).map(buildCard).join('');
}

/* ═══════════════════════════════════════════════
   FILTER / SORT / VIEW / SEARCH
   ═══════════════════════════════════════════════ */
function filterCat(cat) {
  State.currentCat = cat; State.page = 1; State.searchQuery = '';
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  document.querySelectorAll('.cat-link').forEach(a => a.classList.toggle('active', a.dataset.cat === cat));
  renderMainGrid();
  scrollToProducts();
}

function sortProducts(sort) {
  State.currentSort = sort; State.page = 1;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.sort === sort));
  renderMainGrid();
}

function setView(view) {
  State.currentView = view;
  document.getElementById('gridView')?.classList.toggle('active', view === 'grid');
  document.getElementById('listView')?.classList.toggle('active', view === 'list');
  renderMainGrid();
}

function doSearch() {
  const q   = document.getElementById('searchInput')?.value.trim() || '';
  const cat = document.getElementById('searchCat')?.value.toLowerCase() || 'all';
  State.searchQuery = q;
  State.currentCat  = cat === 'all' ? 'all' : cat;
  State.page = 1;
  renderMainGrid();
  if (q) scrollToProducts();
}

function clearSearch() {
  State.searchQuery = ''; State.currentCat = 'all';
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = '';
  document.querySelectorAll('.cat-link').forEach(a => a.classList.toggle('active', a.dataset.cat === 'all'));
  renderMainGrid();
}

function loadMore() { State.page++; renderMainGrid(); }

function filterBrand(brand) {
  State.searchQuery = brand; State.currentCat = 'all'; State.page = 1;
  const inp = document.getElementById('searchInput');
  if (inp) inp.value = brand;
  renderMainGrid();
  scrollToProducts();
}

/* ═══════════════════════════════════════════════
   CART
   ═══════════════════════════════════════════════ */
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = State.cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else State.cart.push({ id, qty });
  saveCart(); updateCartBadge(); renderCartItems();
  showToast(`✅ ${p.name.split(' ').slice(0,4).join(' ')}… added to cart`, 'success');
  addNotification('🛒', `Added to cart: ${p.name.split(' ').slice(0,4).join(' ')}…`);
  syncCartToServer();
}

function buyNow(id) { addToCart(id); openCart(); }

function removeFromCart(id) {
  State.cart = State.cart.filter(i => i.id !== id);
  saveCart(); updateCartBadge(); renderCartItems(); syncCartToServer();
}

function changeQty(id, delta) {
  const item = State.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(); renderCartItems(); syncCartToServer();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = State.cart.reduce((s,i) => s + i.qty, 0);
}

function renderCartItems() {
  const container  = document.getElementById('cartItems');
  const empty      = document.getElementById('cartEmpty');
  const footer     = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl    = document.getElementById('cartTotal');
  if (!container) return;

  if (!State.cart.length) {
    container.innerHTML = '';
    if (empty)  empty.style.display  = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }
  if (empty)  empty.style.display  = 'none';
  if (footer) footer.style.display = 'block';

  let subtotal = 0;
  container.innerHTML = State.cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    if (!p) return '';
    const lineTotal = p.price * item.qty;
    subtotal += lineTotal;
    return `<div class="cart-item" data-id="${p.id}">
      <div class="cart-item-img">${p.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-brand">${p.brand}</div>
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${fmt(lineTotal)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${p.id},-1)" aria-label="Decrease quantity">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id},+1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${p.id})" aria-label="Remove from cart">✕</button>
    </div>`;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = fmt(subtotal);
  if (totalEl)    totalEl.textContent    = fmt(subtotal);
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

async function syncCartToServer() {
  if (!currentUser) return;
  await api('PUT', '/api/cart', { items: State.cart });
}
async function syncCartFromServer() {
  const data = await api('GET', '/api/cart');
  if (data.cart?.length) {
    data.cart.forEach(item => {
      if (!State.cart.find(i => i.id === item.product_id))
        State.cart.push({ id: item.product_id, qty: item.qty });
    });
    saveCart(); updateCartBadge(); renderCartItems();
  }
}

/* ═══════════════════════════════════════════════
   WISHLIST
   ═══════════════════════════════════════════════ */
function toggleWishlist(id, e) {
  if (e) e.stopPropagation();
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const idx    = State.wishlist.indexOf(id);
  const adding = idx === -1;
  if (adding) { State.wishlist.push(id); showToast('❤️ Added to wishlist', 'wish'); addNotification('❤️', `Added to wishlist: ${p.name.split(' ').slice(0,4).join(' ')}…`); }
  else        { State.wishlist.splice(idx, 1); showToast('🤍 Removed from wishlist'); }
  saveWishlist(); updateWishBadge();
  // Update all matching card buttons on page
  document.querySelectorAll('.card-wishlist').forEach(btn => {
    const card = btn.closest('.product-card');
    if (card && parseInt(card.dataset.id) === id) {
      const inW = State.wishlist.includes(id);
      btn.textContent = inW ? '❤️' : '🤍';
      btn.classList.toggle('wishlisted', inW);
      btn.setAttribute('aria-label', inW ? 'Remove from wishlist' : 'Add to wishlist');
    }
  });
  if (currentUser) {
    adding ? api('POST', `/api/wishlist/${id}`) : api('DELETE', `/api/wishlist/${id}`);
  }
}

function updateWishBadge() {
  const badge = document.getElementById('wishBadge');
  if (badge) badge.textContent = State.wishlist.length;
}

async function syncWishlistFromServer() {
  const data = await api('GET', '/api/wishlist');
  if (data.wishlist) { State.wishlist = data.wishlist; saveWishlist(); updateWishBadge(); }
}

function openWishlistPanel() {
  let modal = document.getElementById('wishlistModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'wishlistModal';
    modal.className = 'qv-overlay';
    modal.addEventListener('click', e => {
      if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
    document.body.appendChild(modal);
  }
  const items = State.wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  const listHTML = items.length
    ? items.map(p => `
      <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--border);align-items:center">
        <div style="font-size:38px;width:58px;height:58px;background:var(--bg);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.emoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;color:var(--orange);text-transform:uppercase;letter-spacing:.5px">${p.brand}</div>
          <div style="font-size:13px;font-weight:600;color:var(--text);margin:3px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
          <div style="font-size:17px;font-weight:800;color:var(--navy)">${fmt(p.price)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button onclick="addToCart(${p.id});showToast('✅ Added to cart','success')" style="background:var(--navy);color:white;font-size:12px;font-weight:700;padding:8px 14px;border-radius:8px;border:none;cursor:pointer;white-space:nowrap">Add to Cart</button>
          <button onclick="toggleWishlist(${p.id});setTimeout(openWishlistPanel,50)" style="background:var(--bg);color:var(--red);font-size:12px;font-weight:700;padding:8px 14px;border-radius:8px;border:1.5px solid #fecaca;cursor:pointer">Remove</button>
        </div>
      </div>`).join('')
    : '<div style="text-align:center;padding:56px 20px;color:var(--text-muted);font-size:15px">❤️ Your wishlist is empty<br><br><small>Click the heart on any product to save it here</small></div>';

  modal.innerHTML = `
  <div class="qv-modal" style="max-width:520px" role="dialog" aria-modal="true" aria-label="My Wishlist">
    <button class="qv-close" onclick="document.getElementById('wishlistModal').classList.remove('open');document.body.style.overflow=''" aria-label="Close wishlist">✕</button>
    <div style="padding:28px">
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--navy);margin-bottom:20px">❤️ My Wishlist <span style="font-size:16px;color:var(--text-muted);font-weight:500">(${items.length} items)</span></h2>
      <div style="max-height:65vh;overflow-y:auto">${listHTML}</div>
    </div>
  </div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ═══════════════════════════════════════════════
   QUICK VIEW
   ═══════════════════════════════════════════════ */
function quickView(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const discount = p.was ? pct(p.was, p.price) : 0;
  const inWish   = State.wishlist.includes(p.id);
  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.className = 'qv-overlay';
    modal.addEventListener('click', e => { if (e.target === modal) closeQuickView(); });
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
  <div class="qv-modal" role="dialog" aria-modal="true" aria-label="Quick view: ${p.name}">
    <button class="qv-close" onclick="closeQuickView()" aria-label="Close quick view">✕</button>
    <div class="qv-body">
      <div class="qv-img">${p.emoji}</div>
      <div class="qv-info">
        <div class="qv-brand">${p.brand}</div>
        <h2 class="qv-name">${p.name}</h2>
        <div class="qv-rating">
          <span class="stars" aria-label="${p.rating} out of 5">${stars(p.rating)}</span>
          <span class="rating-val">${p.rating}</span>
          <span class="rating-count">(${p.reviews.toLocaleString('en-IN')} reviews)</span>
        </div>
        <div class="qv-price">
          <span class="price-now">${fmt(p.price)}</span>
          ${p.was ? `<span class="price-was">${fmt(p.was)}</span><span class="price-off">${discount}% off</span>` : ''}
        </div>
        <div class="qv-delivery">🚚 ${p.delivery}</div>
        <div class="qv-actions">
          <button class="add-to-cart" onclick="addToCart(${p.id});closeQuickView()">Add to Cart</button>
          <button class="buy-now"     onclick="buyNow(${p.id});closeQuickView()">Buy Now</button>
          <button class="qv-wish ${inWish ? 'wishlisted' : ''}" onclick="toggleWishlist(${p.id})" aria-label="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}">
            ${inWish ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  </div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeQuickView() {
  const m = document.getElementById('quickViewModal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ═══════════════════════════════════════════════
   NEWSLETTER
   ═══════════════════════════════════════════════ */
function subscribeNL() {
  const input = document.getElementById('nlEmail');
  if (!input) return;
  const email = input.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('⚠️ Please enter a valid email address', 'warn');
    input.focus();
    return;
  }
  input.value = '';
  showToast("🎉 You're subscribed! Welcome to ShopWave.", 'success');
}

/* ═══════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════ */
async function loadSession() {
  try {
    const data = await api('GET', '/api/auth/me');
    currentUser = data.user || null;
  } catch (e) { currentUser = null; }
  updateAccountUI();
  if (currentUser) {
    await syncWishlistFromServer();
    await syncCartFromServer();
  }
}

function updateAccountUI() {
  const btn = document.querySelector('.action-btn[title="Account"], .action-btn[title="My Account"]');
  if (!btn) return;
  if (currentUser) {
    btn.querySelector('.action-label').textContent = currentUser.name.split(' ')[0];
    btn.title   = 'My Account';
    btn.onclick = openAccountModal;
  } else {
    btn.querySelector('.action-label').textContent = 'Account';
    btn.title   = 'Account';
    btn.onclick = () => { window.location.href = 'login.html'; };
  }
}

async function logout() {
  await api('POST', '/api/auth/logout');
  currentUser = null;
  State.cart = []; State.wishlist = [];
  saveCart(); saveWishlist();
  updateCartBadge(); updateWishBadge();
  updateAccountUI(); closeAccountModal();
  showToast('👋 Signed out successfully');
}

/* ─── ACCOUNT MODAL ──────────────────────────── */
function openAccountModal() {
  let modal = document.getElementById('accountModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'accountModal';
    modal.className = 'qv-overlay';
    modal.addEventListener('click', e => { if (e.target === modal) closeAccountModal(); });
    document.body.appendChild(modal);
  }
  const u = currentUser;
  modal.innerHTML = `
  <div class="qv-modal" style="max-width:460px" role="dialog" aria-modal="true" aria-label="My Account">
    <button class="qv-close" onclick="closeAccountModal()" aria-label="Close account panel">✕</button>
    <div style="padding:32px">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--border)">
        <div style="width:64px;height:64px;background:linear-gradient(135deg,var(--orange),var(--orange-dk));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:white;font-family:var(--font-display);box-shadow:0 4px 16px rgba(255,107,53,.4);flex-shrink:0">
          ${u.name.charAt(0).toUpperCase()}
        </div>
        <div style="min-width:0">
          <div style="font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.name}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px">${u.email}</div>
          ${u.phone ? `<div style="font-size:12px;color:var(--text-muted);margin-top:1px">📞 ${u.phone}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="viewOrders()" class="acct-menu-btn">📦 My Orders</button>
        <button onclick="openWishlistPanel();closeAccountModal()" class="acct-menu-btn">❤️ My Wishlist <span style="background:var(--orange);color:white;font-size:11px;padding:1px 7px;border-radius:10px;margin-left:4px">${State.wishlist.length}</span></button>
        <button onclick="logout()" class="acct-menu-btn danger">🚪 Sign Out</button>
      </div>
    </div>
  </div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAccountModal() {
  const m = document.getElementById('accountModal');
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ─── ORDERS MODAL ───────────────────────────── */
async function viewOrders() {
  closeAccountModal();
  let modal = document.getElementById('ordersModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ordersModal';
    modal.className = 'qv-overlay';
    modal.addEventListener('click', e => {
      if (e.target === modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
    });
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div class="qv-modal" style="max-width:540px" role="dialog" aria-modal="true" aria-label="My Orders">
    <button class="qv-close" onclick="document.getElementById('ordersModal').classList.remove('open');document.body.style.overflow=''" aria-label="Close orders">✕</button>
    <div style="padding:28px"><h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--navy);margin-bottom:20px">📦 My Orders</h2>
    <div style="text-align:center;padding:32px;color:var(--text-muted)">Loading…</div></div></div>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const data   = await api('GET', '/api/orders');
  const orders = data.orders || [];
  const ordersHTML = orders.length
    ? orders.map(o => `
      <div style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:800;color:var(--navy);font-family:var(--font-display)">Order #${o.id}</span>
          <span style="background:#d1fae5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase">${o.status}</span>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">${new Date(o.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
        ${o.items.map(i => `<div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:8px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.product_name} × ${i.qty}</span><span style="font-weight:700;flex-shrink:0">${fmt(i.price * i.qty)}</span></div>`).join('')}
        <div style="font-weight:800;color:var(--navy);margin-top:10px;font-size:15px;text-align:right">Total: ${fmt(o.total)}</div>
      </div>`).join('')
    : '<div style="text-align:center;padding:48px 20px;color:var(--text-muted)">📦 No orders yet.<br><br><button onclick="document.getElementById(\'ordersModal\').classList.remove(\'open\');document.body.style.overflow=\'\'" style="background:var(--orange);color:white;font-weight:700;padding:10px 24px;border-radius:10px;border:none;cursor:pointer;margin-top:8px">Start Shopping</button></div>';

  modal.querySelector('div > div > div:last-child').innerHTML = ordersHTML;
}

/* ═══════════════════════════════════════════════
   CHECKOUT
   ═══════════════════════════════════════════════ */
function goToCheckout() {
  if (!currentUser) {
    showToast('⚠️ Please sign in to checkout', 'warn');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }
  if (!State.cart.length) { showToast('⚠️ Your cart is empty'); return; }
  closeCart();
  window.location.href = 'checkout.html';
}

async function proceedToCheckout() {
  if (!currentUser) {
    showToast('⚠️ Please sign in to checkout', 'warn');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }
  if (!State.cart.length) { showToast('⚠️ Your cart is empty'); return; }

  const items = State.cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return { id: item.id, name: p?.name || 'Product', price: p?.price || 0, qty: item.qty };
  });
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const btn = document.querySelector('.checkout-btn');
  if (btn) { btn.textContent = 'Placing order…'; btn.disabled = true; }

  try {
    const data = await api('POST', '/api/orders', { items, total });
    if (data.success) {
      State.cart = []; saveCart(); updateCartBadge(); renderCartItems(); closeCart();
      addNotification('🎉', `Order #${data.orderId} placed successfully!`);
      showToast(`🎉 Order #${data.orderId} placed! Thank you.`, 'success');
    } else {
      showToast('❌ ' + (data.error || 'Could not place order'), 'warn');
    }
  } catch (e) {
    showToast('❌ Server error. Please try again.', 'warn');
  } finally {
    if (btn) { btn.textContent = 'Proceed to Checkout →'; btn.disabled = false; }
  }
}

/* ═══════════════════════════════════════════════
   INIT FUNCTIONS
   ═══════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
}

function initStickyHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 10), { passive: true });
}

function initBrandChips() {
  document.querySelectorAll('.brand-chip').forEach(chip => {
    chip.addEventListener('click', () => filterBrand(chip.textContent.trim()));
    chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); filterBrand(chip.textContent.trim()); } });
  });
}

function initCatCards() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
  });
}

function initPromoCodes() {
  document.querySelectorAll('.promo-card .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.promo-card');
      const p    = card?.querySelector('p');
      if (p?.textContent.includes('WELCOME15')) {
        navigator.clipboard.writeText('WELCOME15').catch(() => {});
        showToast('📋 Code WELCOME15 copied to clipboard!', 'success');
      } else {
        showToast('✅ Offer applied!', 'success');
      }
    });
  });
}

function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.cat-card, .promo-card, .brand-chip, .section-header').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
}

/* ═══════════════════════════════════════════════
   BOOT — DOMContentLoaded
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Apply dark mode from localStorage ── */
  applyThemeOnLoad();

  /* ── Render products ── */
  renderFlashGrid();
  renderMainGrid();
  updateCartBadge();
  updateWishBadge();
  renderCartItems();

  /* ── Hero slider ── */
  resetHeroTimer();

  /* ── Countdown ── */
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ── Search: Enter key + live suggestions ── */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { hideSuggestions(); doSearch(); } });
    searchInput.addEventListener('input', () => showSearchSuggestions(searchInput.value));
    searchInput.addEventListener('blur', () => setTimeout(hideSuggestions, 200));
  }

  /* ── Cart toggle ── */
  document.getElementById('cartToggle')?.addEventListener('click', openCart);

  /* ── Wishlist toggle ── */
  document.getElementById('wishlistBtn')?.addEventListener('click', openWishlistPanel);

  /* ── Notifications ── */
  document.getElementById('notifBtn')?.addEventListener('click', toggleNotifPanel);

  /* ── Checkout button ── */
  document.querySelector('.checkout-btn')?.addEventListener('click', goToCheckout);

  /* ── Keyboard: Escape closes everything ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeAllModals(); closeFilterSidebar(); closeNotifPanel(); hideSuggestions(); }
  });

  /* ── UI inits ── */
  initBackToTop();
  initStickyHeader();
  initBrandChips();
  initCatCards();
  initPromoCodes();
  initScrollAnimations();
  initFilterBrands();
  updateNotifBadge();

  /* ── Load auth session (works when served via node server.js) ── */
  loadSession();
});


/* ═══════════════════════════════════════════════
   DARK MODE
   ═══════════════════════════════════════════════ */
function applyThemeOnLoad() {
  const saved = localStorage.getItem('sw_theme');
  if (saved === 'dark') {
    document.body.dataset.theme = 'dark';
    const icon = document.querySelector('.dark-mode-icon');
    if (icon) icon.textContent = '☀️';
  }
}

function toggleDarkMode() {
  const isDark = document.body.dataset.theme === 'dark';
  if (isDark) {
    delete document.body.dataset.theme;
    localStorage.setItem('sw_theme', 'light');
    const icon = document.querySelector('.dark-mode-icon');
    if (icon) icon.textContent = '🌙';
  } else {
    document.body.dataset.theme = 'dark';
    localStorage.setItem('sw_theme', 'dark');
    const icon = document.querySelector('.dark-mode-icon');
    if (icon) icon.textContent = '☀️';
  }
}

/* ═══════════════════════════════════════════════
   LIVE SEARCH SUGGESTIONS
   ═══════════════════════════════════════════════ */
function showSearchSuggestions(query) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;
  const q = query.trim().toLowerCase();
  if (q.length < 2) { hideSuggestions(); return; }
  const matches = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.cat.toLowerCase().includes(q)
  ).slice(0, 6);
  if (!matches.length) { hideSuggestions(); return; }
  box.innerHTML = matches.map(p => `
    <div class="suggestion-item" role="option" tabindex="0"
      onclick="selectSuggestion(${p.id})"
      onkeydown="if(event.key==='Enter')selectSuggestion(${p.id})">
      <span class="sugg-emoji">${p.emoji}</span>
      <div class="sugg-info">
        <div class="sugg-name">${p.name}</div>
        <div class="sugg-meta">${p.brand} · ${fmt(p.price)}</div>
      </div>
    </div>`).join('');
  box.classList.add('open');
}

function hideSuggestions() {
  const box = document.getElementById('searchSuggestions');
  if (box) box.classList.remove('open');
}

function selectSuggestion(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  hideSuggestions();
  window.location.href = `product.html?id=${id}`;
}

/* ═══════════════════════════════════════════════
   ADVANCED FILTERS SIDEBAR
   ═══════════════════════════════════════════════ */
function initFilterBrands() {
  const container = document.getElementById('filterBrandList');
  if (!container) return;
  const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();
  container.innerHTML = brands.map(b => `
    <label class="filter-check">
      <input type="checkbox" name="filterBrand" value="${b}" onchange="applyAdvancedFilters()">
      ${b}
    </label>`).join('');
}

function openFilterSidebar() {
  document.getElementById('filterSidebar')?.classList.add('open');
  document.getElementById('filterOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFilterSidebar() {
  document.getElementById('filterSidebar')?.classList.remove('open');
  document.getElementById('filterOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function updatePriceFilter() {
  const minEl = document.getElementById('priceMin');
  const maxEl = document.getElementById('priceMax');
  if (!minEl || !maxEl) return;
  let min = parseInt(minEl.value), max = parseInt(maxEl.value);
  if (min > max) { const t = min; min = max; max = t; }
  State.priceMin = min; State.priceMax = max;
  const minLbl = document.getElementById('priceMinLabel');
  const maxLbl = document.getElementById('priceMaxLabel');
  if (minLbl) minLbl.textContent = fmt(min);
  if (maxLbl) maxLbl.textContent = fmt(max);
  applyAdvancedFilters();
}

function applyAdvancedFilters() {
  // Rating
  const ratingEl = document.querySelector('input[name="ratingFilter"]:checked');
  State.minRating = ratingEl ? parseFloat(ratingEl.value) : 0;
  // Category
  const catEl = document.querySelector('input[name="filterCat"]:checked');
  if (catEl) {
    State.currentCat = catEl.value;
    document.querySelectorAll('.cat-link').forEach(a => a.classList.toggle('active', a.dataset.cat === State.currentCat));
  }
  // Brands
  const brandEls = document.querySelectorAll('input[name="filterBrand"]:checked');
  State.filterBrands = [...brandEls].map(el => el.value);
  // In stock
  State.inStockOnly = document.getElementById('inStockFilter')?.checked || false;
  State.page = 1;
  renderMainGrid();
  scrollToProducts();
}

function resetAdvancedFilters() {
  State.priceMin = 0; State.priceMax = 200000;
  State.minRating = 0; State.filterBrands = []; State.inStockOnly = false;
  State.currentCat = 'all';
  const minEl = document.getElementById('priceMin');
  const maxEl = document.getElementById('priceMax');
  if (minEl) minEl.value = 0;
  if (maxEl) maxEl.value = 200000;
  const minLbl = document.getElementById('priceMinLabel');
  const maxLbl = document.getElementById('priceMaxLabel');
  if (minLbl) minLbl.textContent = '₹0';
  if (maxLbl) maxLbl.textContent = '₹2,00,000';
  document.querySelectorAll('input[name="ratingFilter"]').forEach((el,i) => el.checked = i===0);
  document.querySelectorAll('input[name="filterCat"]').forEach((el,i) => el.checked = i===0);
  document.querySelectorAll('input[name="filterBrand"]').forEach(el => el.checked = false);
  const inStock = document.getElementById('inStockFilter');
  if (inStock) inStock.checked = false;
  document.querySelectorAll('.cat-link').forEach(a => a.classList.toggle('active', a.dataset.cat === 'all'));
  State.page = 1;
  renderMainGrid();
}

/* ═══════════════════════════════════════════════
   NOTIFICATIONS SYSTEM
   ═══════════════════════════════════════════════ */
function getNotifications() {
  return JSON.parse(localStorage.getItem('sw_notifications') || '[]');
}
function saveNotifications(notifs) {
  localStorage.setItem('sw_notifications', JSON.stringify(notifs));
}
function addNotification(icon, message) {
  const notifs = getNotifications();
  notifs.unshift({ id: Date.now(), icon, message, time: Date.now(), read: false });
  if (notifs.length > 20) notifs.pop();
  saveNotifications(notifs);
  updateNotifBadge();
  renderNotifList();
}
function updateNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const unread = getNotifications().filter(n => !n.read).length;
  badge.textContent = unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}
function renderNotifList() {
  const list = document.getElementById('notifList');
  if (!list) return;
  const notifs = getNotifications();
  if (!notifs.length) {
    list.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }
  list.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markRead(${n.id})">
      <span class="notif-icon">${n.icon}</span>
      <div class="notif-content">
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${timeAgo(n.time)}</div>
      </div>
      ${!n.read ? '<span class="notif-dot"></span>' : ''}
    </div>`).join('');
}
function markRead(id) {
  const notifs = getNotifications();
  const n = notifs.find(x => x.id === id);
  if (n) n.read = true;
  saveNotifications(notifs);
  updateNotifBadge();
  renderNotifList();
}
function markAllRead() {
  const notifs = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(notifs);
  updateNotifBadge();
  renderNotifList();
}
function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if (!panel) return;
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  } else {
    renderNotifList();
    panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }
}
function closeNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const overlay = document.getElementById('notifOverlay');
  if (panel) { panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); }
  if (overlay) overlay.classList.remove('open');
}
