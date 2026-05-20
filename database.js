/* ═══════════════════════════════════════════════
   SHOPWAVE — SQLite Database Setup
   ═══════════════════════════════════════════════ */

const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const db = new Database(path.join(__dirname, 'shopwave.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ─── CREATE TABLES ──────────────────────────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    phone       TEXT,
    avatar      TEXT    DEFAULT 'U',
    created_at  TEXT    DEFAULT (datetime('now')),
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       TEXT    DEFAULT 'Home',
    line1       TEXT    NOT NULL,
    line2       TEXT,
    city        TEXT    NOT NULL,
    state       TEXT    NOT NULL,
    pincode     TEXT    NOT NULL,
    is_default  INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total       REAL    NOT NULL,
    status      TEXT    DEFAULT 'pending',
    created_at  TEXT    DEFAULT (datetime('now')),
    address     TEXT,
    payment     TEXT
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL,
    product_name TEXT   NOT NULL,
    price       REAL    NOT NULL,
    qty         INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL,
    added_at    TEXT    DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL,
    qty         INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    user_name   TEXT    NOT NULL,
    rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    title       TEXT,
    body        TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now')),
    UNIQUE(product_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    NOT NULL UNIQUE,
    type        TEXT    NOT NULL CHECK(type IN ('percent','flat')),
    value       REAL    NOT NULL,
    min_order   REAL    DEFAULT 0,
    max_uses    INTEGER DEFAULT 100,
    used_count  INTEGER DEFAULT 0,
    expires_at  TEXT,
    active      INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    message     TEXT    NOT NULL,
    type        TEXT    DEFAULT 'info',
    read        INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

/* ─── PREPARED STATEMENTS ────────────────────── */

const stmts = {
  // Users
  createUser:    db.prepare('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)'),
  getUserByEmail:db.prepare('SELECT * FROM users WHERE email = ?'),
  getUserById:   db.prepare('SELECT id, name, email, phone, avatar, created_at FROM users WHERE id = ?'),
  updateUser:    db.prepare("UPDATE users SET name=?, phone=?, updated_at=datetime('now') WHERE id=?"),
  updateAvatar:  db.prepare("UPDATE users SET avatar=?, updated_at=datetime('now') WHERE id=?"),
  getAllUsers:   db.prepare('SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC'),

  // Wishlist
  addWishlist:   db.prepare('INSERT OR IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)'),
  removeWishlist:db.prepare('DELETE FROM wishlist WHERE user_id=? AND product_id=?'),
  getWishlist:   db.prepare('SELECT product_id FROM wishlist WHERE user_id=?'),

  // Cart
  upsertCart:    db.prepare('INSERT INTO cart (user_id, product_id, qty) VALUES (?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET qty=excluded.qty'),
  removeCart:    db.prepare('DELETE FROM cart WHERE user_id=? AND product_id=?'),
  clearCart:     db.prepare('DELETE FROM cart WHERE user_id=?'),
  getCart:       db.prepare('SELECT product_id, qty FROM cart WHERE user_id=?'),

  // Orders
  createOrder:   db.prepare('INSERT INTO orders (user_id, total, status, address, payment) VALUES (?,?,?,?,?)'),
  addOrderItem:  db.prepare('INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (?,?,?,?,?)'),
  getOrders:     db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC'),
  getOrderItems: db.prepare('SELECT * FROM order_items WHERE order_id=?'),
  getAllOrders:   db.prepare(`SELECT o.*, u.name as user_name, u.email as user_email
                              FROM orders o JOIN users u ON o.user_id=u.id
                              ORDER BY o.created_at DESC LIMIT 100`),
  updateOrderStatus: db.prepare("UPDATE orders SET status=? WHERE id=?"),

  // Reviews
  addReview:     db.prepare('INSERT OR REPLACE INTO reviews (product_id, user_id, user_name, rating, title, body) VALUES (?,?,?,?,?,?)'),
  getReviews:    db.prepare('SELECT * FROM reviews WHERE product_id=? ORDER BY created_at DESC'),
  getUserReview: db.prepare('SELECT * FROM reviews WHERE product_id=? AND user_id=?'),

  // Coupons
  getCoupon:     db.prepare('SELECT * FROM coupons WHERE code=? AND active=1'),
  useCoupon:     db.prepare('UPDATE coupons SET used_count=used_count+1 WHERE code=?'),

  // Notifications
  addNotification:    db.prepare('INSERT INTO notifications (user_id, message, type) VALUES (?,?,?)'),
  getNotifications:   db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50'),
  markAllRead:        db.prepare('UPDATE notifications SET read=1 WHERE user_id=?'),
  getUnreadCount:     db.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE user_id=? AND read=0'),

  // Admin stats
  countUsers:    db.prepare('SELECT COUNT(*) as cnt FROM users'),
  countOrders:   db.prepare('SELECT COUNT(*) as cnt FROM orders'),
  sumRevenue:    db.prepare("SELECT COALESCE(SUM(total),0) as total FROM orders WHERE status != 'cancelled'"),
  ordersLast7:   db.prepare(`SELECT date(created_at) as day, COUNT(*) as cnt, COALESCE(SUM(total),0) as revenue
                              FROM orders WHERE created_at >= datetime('now','-7 days')
                              GROUP BY date(created_at) ORDER BY day ASC`),
};

/* ─── SEED COUPONS ───────────────────────────── */
const seedCoupons = db.transaction(() => {
  const existing = db.prepare('SELECT COUNT(*) as cnt FROM coupons').get();
  if (existing.cnt === 0) {
    db.prepare('INSERT INTO coupons (code,type,value,min_order,max_uses) VALUES (?,?,?,?,?)').run('WELCOME15','percent',15,0,1000);
    db.prepare('INSERT INTO coupons (code,type,value,min_order,max_uses) VALUES (?,?,?,?,?)').run('FLAT200','flat',200,999,500);
    db.prepare('INSERT INTO coupons (code,type,value,min_order,max_uses) VALUES (?,?,?,?,?)').run('SAVE10','percent',10,0,1000);
  }
});
seedCoupons();

/* ─── SEED ADMIN USER ────────────────────────── */
const seedAdmin = db.transaction(() => {
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get('admin@shopwave.com');
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.prepare('INSERT INTO users (name, email, password, phone) VALUES (?,?,?,?)').run('Admin', 'admin@shopwave.com', hash, null);
  }
});
seedAdmin();

module.exports = { db, stmts };
