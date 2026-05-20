/* ═══════════════════════════════════════════════
   SHOPWAVE — Express Server v2
   ═══════════════════════════════════════════════ */
'use strict';

const express     = require('express');
const session     = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt      = require('bcryptjs');
const path        = require('path');
const cors        = require('cors');
const { stmts, db } = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── MIDDLEWARE ─────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  secret: 'shopwave-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}));

/* ─── AUTH MIDDLEWARE ────────────────────────── */
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = stmts.getUserByEmail.get('admin@shopwave.com');
  if (!user || user.id !== req.session.userId) return res.status(403).json({ error: 'Admin only' });
  next();
}

/* ═══════════════════════════════════════════════
   AUTH ROUTES
   ═══════════════════════════════════════════════ */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });
    if (stmts.getUserByEmail.get(email.toLowerCase())) return res.status(409).json({ error: 'An account with this email already exists' });
    const hash   = await bcrypt.hash(password, 12);
    const result = stmts.createUser.run(name.trim(), email.toLowerCase(), hash, phone || null);
    req.session.userId   = result.lastInsertRowid;
    req.session.userName = name.trim();
    res.json({ success: true, user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const user = stmts.getUserByEmail.get(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid email or password' });
    req.session.userId   = user.id;
    req.session.userName = user.name;
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ success: true })); });

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = stmts.getUserById.get(req.session.userId);
  if (user) user.isAdmin = (user.email === 'admin@shopwave.com');
  res.json({ user: user || null });
});

/* ═══════════════════════════════════════════════
   USER ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/user/profile', requireAuth, (req, res) => {
  const user = stmts.getUserById.get(req.session.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});
app.put('/api/user/profile', requireAuth, (req, res) => {
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  stmts.updateUser.run(name.trim(), phone || null, req.session.userId);
  req.session.userName = name.trim();
  res.json({ success: true });
});

/* ═══════════════════════════════════════════════
   WISHLIST ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/wishlist', requireAuth, (req, res) => {
  res.json({ wishlist: stmts.getWishlist.all(req.session.userId).map(r => r.product_id) });
});
app.post('/api/wishlist/:productId', requireAuth, (req, res) => {
  stmts.addWishlist.run(req.session.userId, parseInt(req.params.productId));
  res.json({ success: true });
});
app.delete('/api/wishlist/:productId', requireAuth, (req, res) => {
  stmts.removeWishlist.run(req.session.userId, parseInt(req.params.productId));
  res.json({ success: true });
});

/* ═══════════════════════════════════════════════
   CART ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/cart', requireAuth, (req, res) => {
  res.json({ cart: stmts.getCart.all(req.session.userId) });
});
app.put('/api/cart', requireAuth, (req, res) => {
  const { items } = req.body;
  stmts.clearCart.run(req.session.userId);
  if (Array.isArray(items)) items.forEach(i => stmts.upsertCart.run(req.session.userId, i.id, i.qty));
  res.json({ success: true });
});

/* ═══════════════════════════════════════════════
   ORDER ROUTES
   ═══════════════════════════════════════════════ */
app.post('/api/orders', requireAuth, (req, res) => {
  try {
    const { items, total, address, payment, coupon } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items in order' });

    // Apply coupon discount if provided
    let finalTotal = total;
    if (coupon) {
      const c = stmts.getCoupon.get(coupon.toUpperCase());
      if (c && c.active && c.used_count < c.max_uses) {
        if (c.type === 'percent') finalTotal = total * (1 - c.value / 100);
        else finalTotal = Math.max(0, total - c.value);
        stmts.useCoupon.run(coupon.toUpperCase());
      }
    }

    const order = stmts.createOrder.run(req.session.userId, finalTotal, 'confirmed',
      address ? JSON.stringify(address) : null, payment || 'COD');
    for (const item of items) {
      stmts.addOrderItem.run(order.lastInsertRowid, item.id, item.name, item.price, item.qty);
    }
    stmts.clearCart.run(req.session.userId);

    // Create notification
    stmts.addNotification.run(req.session.userId,
      `🎉 Order #${order.lastInsertRowid} confirmed! Total: ₹${Math.round(finalTotal).toLocaleString('en-IN')}`, 'order');

    res.json({ success: true, orderId: order.lastInsertRowid, total: finalTotal });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Could not place order' }); }
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = stmts.getOrders.all(req.session.userId);
  res.json({ orders: orders.map(o => ({ ...o, items: stmts.getOrderItems.all(o.id) })) });
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(req.params.id, req.session.userId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ order: { ...order, items: stmts.getOrderItems.all(order.id) } });
});

/* ═══════════════════════════════════════════════
   REVIEWS ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/reviews/:productId', (req, res) => {
  const reviews = stmts.getReviews.all(parseInt(req.params.productId));
  res.json({ reviews });
});

app.post('/api/reviews/:productId', requireAuth, (req, res) => {
  const { rating, title, body } = req.body;
  const pid = parseInt(req.params.productId);
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
  if (!body?.trim()) return res.status(400).json({ error: 'Review text is required' });
  const user = stmts.getUserById.get(req.session.userId);
  stmts.addReview.run(pid, req.session.userId, user.name, rating, title || '', body.trim());
  res.json({ success: true });
});

/* ═══════════════════════════════════════════════
   COUPON ROUTES
   ═══════════════════════════════════════════════ */
app.post('/api/coupons/validate', (req, res) => {
  const { code, cartTotal } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Enter a coupon code' });
  const c = stmts.getCoupon.get(code.toUpperCase());
  if (!c || !c.active) return res.json({ valid: false, message: 'Invalid or expired coupon' });
  if (c.used_count >= c.max_uses) return res.json({ valid: false, message: 'Coupon usage limit reached' });
  if (cartTotal < c.min_order) return res.json({ valid: false, message: `Minimum order ₹${c.min_order} required` });
  if (c.expires_at && new Date(c.expires_at) < new Date()) return res.json({ valid: false, message: 'Coupon has expired' });
  const discount = c.type === 'percent' ? (cartTotal * c.value / 100) : c.value;
  res.json({ valid: true, discount: Math.round(discount), type: c.type, value: c.value, message: `${c.type === 'percent' ? c.value + '% off' : '₹' + c.value + ' off'} applied!` });
});

/* ═══════════════════════════════════════════════
   NOTIFICATIONS ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/notifications', requireAuth, (req, res) => {
  const notifications = stmts.getNotifications.all(req.session.userId);
  const unread = stmts.getUnreadCount.get(req.session.userId).cnt;
  res.json({ notifications, unread });
});
app.put('/api/notifications/read', requireAuth, (req, res) => {
  stmts.markAllRead.run(req.session.userId);
  res.json({ success: true });
});

/* ═══════════════════════════════════════════════
   ADMIN ROUTES
   ═══════════════════════════════════════════════ */
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    users:   stmts.countUsers.get().cnt,
    orders:  stmts.countOrders.get().cnt,
    revenue: stmts.sumRevenue.get().total,
    chart:   stmts.ordersLast7.all()
  });
});
app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = stmts.getAllOrders.all();
  res.json({ orders: orders.map(o => ({ ...o, items: stmts.getOrderItems.all(o.id) })) });
});
app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json({ users: stmts.getAllUsers.all() });
});
app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  const valid = ['pending','confirmed','packed','shipped','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  stmts.updateOrderStatus.run(status, req.params.id);
  res.json({ success: true });
});

/* ─── CATCH-ALL ──────────────────────────────── */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'ecomm.html')));

app.listen(PORT, () => {
  console.log(`\n🚀 ShopWave server running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT} in your browser\n`);
});
