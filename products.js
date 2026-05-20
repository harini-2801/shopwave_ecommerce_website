/* ═══════════════════════════════════════════════
   SHOPWAVE — Product Data Catalog
   ═══════════════════════════════════════════════ */

const PRODUCTS = [
  // ── ELECTRONICS ──────────────────────────────
  { id: 1,  cat: 'electronics', brand: 'Apple',   name: 'iPhone 15 Pro Max 256GB Natural Titanium',      emoji: '📱', price: 134900, was: 159900, rating: 4.8, reviews: 12840, badge: 'hot',     isNew: false, delivery: 'Free delivery by Tomorrow',    featured: true,  flashSale: true  },
  { id: 2,  cat: 'electronics', brand: 'Samsung', name: 'Galaxy S24 Ultra 512GB Titanium Black',          emoji: '📱', price: 124999, was: 149999, rating: 4.7, reviews: 9320,  badge: 'sale',    isNew: false, delivery: 'Free delivery by Tomorrow',    featured: true,  flashSale: true  },
  { id: 3,  cat: 'electronics', brand: 'Sony',    name: 'WH-1000XM5 Wireless Noise Cancelling Headphones',emoji: '🎧', price: 24990,  was: 34990,  rating: 4.9, reviews: 23100, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days',      featured: true,  flashSale: true  },
  { id: 4,  cat: 'electronics', brand: 'Dell',    name: 'XPS 15 Laptop Intel Core i9 32GB RAM 1TB SSD',   emoji: '💻', price: 189990, was: 219990, rating: 4.6, reviews: 4210,  badge: null,      isNew: false, delivery: 'Free delivery in 3 days',      featured: true,  flashSale: false },
  { id: 5,  cat: 'electronics', brand: 'Apple',   name: 'MacBook Air M3 15-inch 16GB 512GB Midnight',     emoji: '💻', price: 149900, was: 169900, rating: 4.9, reviews: 7650,  badge: 'new',     isNew: true,  delivery: 'Free delivery by Tomorrow',    featured: true,  flashSale: false },
  { id: 6,  cat: 'electronics', brand: 'boAt',    name: 'Airdopes 141 TWS Earbuds 42H Playtime',          emoji: '🎧', price: 1299,   was: 3990,   rating: 4.3, reviews: 89200, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days',      featured: false, flashSale: true  },
  { id: 7,  cat: 'electronics', brand: 'Samsung', name: '65" QLED 4K Smart TV Neo Quantum HDR',           emoji: '📺', price: 89990,  was: 129990, rating: 4.7, reviews: 3400,  badge: 'sale',    isNew: false, delivery: 'Free delivery in 5 days',      featured: true,  flashSale: false },
  { id: 8,  cat: 'electronics', brand: 'Canon',   name: 'EOS R50 Mirrorless Camera 24.2MP Kit',           emoji: '📷', price: 64990,  was: 79990,  rating: 4.6, reviews: 2100,  badge: null,      isNew: false, delivery: 'Free delivery in 3 days',      featured: false, flashSale: false },
  { id: 9,  cat: 'electronics', brand: 'Apple',   name: 'iPad Pro 12.9" M4 Chip 256GB Wi-Fi Space Black', emoji: '📱', price: 109900, was: 119900, rating: 4.8, reviews: 5600,  badge: 'new',     isNew: true,  delivery: 'Free delivery by Tomorrow',    featured: true,  flashSale: false },
  { id: 10, cat: 'electronics', brand: 'Philips', name: 'Air Fryer HD9252 4.1L Digital Touch Panel',      emoji: '🍳', price: 6499,   was: 9999,   rating: 4.4, reviews: 14300, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days',      featured: false, flashSale: true  },

  // ── FASHION ──────────────────────────────────
  { id: 11, cat: 'fashion', brand: 'Nike',    name: 'Air Max 270 React Running Shoes White/Black',    emoji: '👟', price: 9995,  was: 13995, rating: 4.7, reviews: 18900, badge: 'hot',     isNew: false, delivery: 'Free delivery in 2 days',   featured: true,  flashSale: true  },
  { id: 12, cat: 'fashion', brand: 'Adidas',  name: 'Ultraboost 23 Running Shoes Core Black',         emoji: '👟', price: 12999, was: 17999, rating: 4.6, reviews: 11200, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days',   featured: true,  flashSale: false },
  { id: 13, cat: 'fashion', brand: "Levi's",  name: '511 Slim Fit Stretch Jeans Dark Indigo',         emoji: '👖', price: 2999,  was: 4499,  rating: 4.5, reviews: 32100, badge: 'sale',    isNew: false, delivery: 'Free delivery in 3 days',   featured: true,  flashSale: true  },
  { id: 14, cat: 'fashion', brand: 'Puma',    name: 'Suede Classic XXI Sneakers Peacoat/White',       emoji: '👟', price: 5999,  was: 7999,  rating: 4.4, reviews: 8700,  badge: null,      isNew: false, delivery: 'Free delivery in 2 days',   featured: false, flashSale: false },
  { id: 15, cat: 'fashion', brand: 'H&M',     name: 'Oversized Linen Blend Blazer Beige',             emoji: '🧥', price: 3499,  was: 4999,  rating: 4.3, reviews: 5400,  badge: 'new',     isNew: true,  delivery: 'Free delivery in 3 days',   featured: false, flashSale: false },
  { id: 16, cat: 'fashion', brand: 'Zara',    name: 'Floral Print Midi Dress Summer Collection',      emoji: '👗', price: 4990,  was: 6990,  rating: 4.5, reviews: 7800,  badge: 'new',     isNew: true,  delivery: 'Free delivery in 2 days',   featured: true,  flashSale: false },
  { id: 17, cat: 'fashion', brand: 'Ray-Ban', name: 'Aviator Classic Polarized Sunglasses Gold',      emoji: '🕶️', price: 8490,  was: 11490, rating: 4.8, reviews: 9200,  badge: null,      isNew: false, delivery: 'Free delivery in 2 days',   featured: true,  flashSale: false },
  { id: 18, cat: 'fashion', brand: 'Nike',    name: 'Dri-FIT Training T-Shirt Slim Fit Black',        emoji: '👕', price: 1995,  was: 2995,  rating: 4.4, reviews: 21000, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days',   featured: false, flashSale: true  },

  // ── HOME & LIVING ─────────────────────────────
  { id: 19, cat: 'home', brand: 'IKEA',    name: 'SÖDERHAMN 3-Seat Sofa with Chaise Viarp Beige',  emoji: '🛋️', price: 49990, was: 64990, rating: 4.6, reviews: 3200,  badge: null,   isNew: false, delivery: 'Free delivery in 7 days',   featured: true,  flashSale: false },
  { id: 20, cat: 'home', brand: 'Philips', name: 'Hue White & Color Ambiance Smart Bulb Starter',  emoji: '💡', price: 5999,  was: 7999,  rating: 4.7, reviews: 8900,  badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days',   featured: true,  flashSale: true  },
  { id: 21, cat: 'home', brand: 'Dyson',   name: 'V15 Detect Absolute Cordless Vacuum Cleaner',    emoji: '🧹', price: 52900, was: 62900, rating: 4.8, reviews: 4100,  badge: null,   isNew: false, delivery: 'Free delivery in 3 days',   featured: true,  flashSale: false },
  { id: 22, cat: 'home', brand: 'IKEA',    name: 'KALLAX Shelf Unit 4x4 White 147x147cm',          emoji: '🗄️', price: 12990, was: 15990, rating: 4.5, reviews: 6700,  badge: 'sale', isNew: false, delivery: 'Free delivery in 5 days',   featured: false, flashSale: false },
  { id: 23, cat: 'home', brand: 'Prestige',name: 'Svachh Clip-on Pressure Cooker 5L Stainless',    emoji: '🍲', price: 2499,  was: 3499,  rating: 4.6, reviews: 19200, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days',   featured: false, flashSale: true  },
  { id: 24, cat: 'home', brand: 'Godrej',  name: 'Interio Slimline 3-Door Wardrobe Walnut Finish', emoji: '🚪', price: 24990, was: 32990, rating: 4.4, reviews: 2100,  badge: null,   isNew: false, delivery: 'Free delivery in 7 days',   featured: false, flashSale: false },

  // ── BEAUTY ───────────────────────────────────
  { id: 25, cat: 'beauty', brand: "L'Oréal",  name: 'Revitalift Laser Pure Retinol Night Serum 30ml', emoji: '✨', price: 1899, was: 2499, rating: 4.6, reviews: 14200, badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 26, cat: 'beauty', brand: 'Maybelline',name: 'Fit Me Matte+Poreless Foundation 30ml SPF22',   emoji: '💄', price: 599,  was: 899,  rating: 4.4, reviews: 38900, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 27, cat: 'beauty', brand: 'The Ordinary',name: 'Niacinamide 10% + Zinc 1% Serum 30ml',        emoji: '🧴', price: 699,  was: 999,  rating: 4.7, reviews: 52100, badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: false },
  { id: 28, cat: 'beauty', brand: 'Dyson',     name: 'Airwrap Multi-Styler Complete Long Nickel/Copper',emoji: '💇', price: 44900,was: 54900,rating: 4.8, reviews: 6700,  badge: null,   isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: false },
  { id: 29, cat: 'beauty', brand: 'Biotique',  name: 'Bio Honey Gel Refreshing Foaming Face Wash 150g',emoji: '🧼', price: 199,  was: 299,  rating: 4.3, reviews: 28400, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: true  },

  // ── SPORTS ───────────────────────────────────
  { id: 30, cat: 'sports', brand: 'Yonex',  name: 'Astrox 99 Pro Badminton Racket White Tiger',     emoji: '🏸', price: 14990, was: 19990, rating: 4.8, reviews: 3400,  badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 31, cat: 'sports', brand: 'Nike',   name: 'Metcon 9 Training Shoes Gym & Cross Training',   emoji: '👟', price: 11995, was: 14995, rating: 4.6, reviews: 5600,  badge: null,   isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: false },
  { id: 32, cat: 'sports', brand: 'Decathlon',name: 'Domyos 20kg Adjustable Dumbbell Set with Rack', emoji: '🏋️', price: 8999,  was: 12999, rating: 4.5, reviews: 7800,  badge: 'sale', isNew: false, delivery: 'Free delivery in 3 days', featured: false, flashSale: true  },
  { id: 33, cat: 'sports', brand: 'Adidas',  name: 'Tiro 23 League Training Pants Black/White',     emoji: '🩳', price: 2999,  was: 3999,  rating: 4.4, reviews: 9200,  badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: false },
  { id: 34, cat: 'sports', brand: 'Nivia',   name: 'Storm Football Size 5 FIFA Quality Pro',        emoji: '⚽', price: 1299,  was: 1999,  rating: 4.3, reviews: 12100, badge: null,   isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: false },

  // ── BOOKS ────────────────────────────────────
  { id: 35, cat: 'books', brand: 'Penguin',    name: 'Atomic Habits by James Clear Paperback',          emoji: '📗', price: 399,  was: 599,  rating: 4.9, reviews: 89200, badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 36, cat: 'books', brand: 'HarperCollins',name: 'The Psychology of Money by Morgan Housel',      emoji: '📘', price: 349,  was: 499,  rating: 4.8, reviews: 67400, badge: 'hot',  isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 37, cat: 'books', brand: 'Scholastic',  name: 'Harry Potter Complete 7-Book Collection Box Set',emoji: '📚', price: 3499, was: 4999, rating: 4.9, reviews: 43200, badge: null,   isNew: false, delivery: 'Free delivery in 3 days', featured: true,  flashSale: false },
  { id: 38, cat: 'books', brand: 'Westland',    name: 'The Alchemist by Paulo Coelho Special Edition',  emoji: '📙', price: 299,  was: 399,  rating: 4.8, reviews: 54100, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: false },

  // ── TOYS & GAMES ─────────────────────────────
  { id: 39, cat: 'toys', brand: 'LEGO',     name: 'Technic Bugatti Bolide 905 Pieces Age 18+',       emoji: '🧱', price: 12999, was: 16999, rating: 4.9, reviews: 4200,  badge: 'hot',     isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: false },
  { id: 40, cat: 'toys', brand: 'Hasbro',   name: 'Monopoly Classic Board Game Family Edition',      emoji: '🎲', price: 999,   was: 1499,  rating: 4.6, reviews: 28900, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 41, cat: 'toys', brand: 'Hot Wheels',name: 'Ultimate Garage Playset 140+ Cars Capacity',     emoji: '🚗', price: 4999,  was: 6999,  rating: 4.7, reviews: 8700,  badge: null,      isNew: false, delivery: 'Free delivery in 3 days', featured: false, flashSale: false },
  { id: 42, cat: 'toys', brand: 'Funskool',  name: 'Scrabble Classic Word Game 2-4 Players',         emoji: '🔤', price: 799,   was: 1199,  rating: 4.5, reviews: 14200, badge: 'sale',    isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: true  },

  // ── GROCERY ──────────────────────────────────
  { id: 43, cat: 'grocery', brand: 'Tata',    name: 'Tata Tea Gold Premium Blend 500g Pack of 2',    emoji: '🍵', price: 399,  was: 499,  rating: 4.6, reviews: 42100, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: true,  flashSale: true  },
  { id: 44, cat: 'grocery', brand: 'Amul',    name: 'Amul Butter Pasteurised 500g Refrigerated',     emoji: '🧈', price: 249,  was: 299,  rating: 4.7, reviews: 31200, badge: null,   isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: false },
  { id: 45, cat: 'grocery', brand: 'Organic India',name: 'Tulsi Green Tea 25 Bags Immunity Booster', emoji: '🌿', price: 199,  was: 299,  rating: 4.5, reviews: 18900, badge: 'new',  isNew: true,  delivery: 'Free delivery in 2 days', featured: false, flashSale: false },
  { id: 46, cat: 'grocery', brand: 'Fortune', name: 'Sunflower Oil Heart-Healthy 5L Pouch',          emoji: '🫙', price: 699,  was: 899,  rating: 4.4, reviews: 22400, badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: true  },

  // ── AUTOMOTIVE ───────────────────────────────
  { id: 47, cat: 'automotive', brand: '3M',       name: '3M Auto Care Scratch Remover Paste 200g',      emoji: '🚗', price: 599,  was: 899,  rating: 4.5, reviews: 9800,  badge: 'sale', isNew: false, delivery: 'Free delivery in 2 days', featured: false, flashSale: true  },
  { id: 48, cat: 'automotive', brand: 'Michelin', name: 'Michelin Pilot Sport 4 205/55 R16 Tyre',       emoji: '🛞', price: 8999, was: 11999,rating: 4.7, reviews: 3200,  badge: null,   isNew: false, delivery: 'Free delivery in 5 days', featured: true,  flashSale: false },
  { id: 49, cat: 'automotive', brand: 'Bosch',    name: 'Bosch S4 Car Battery 55Ah 12V Maintenance Free',emoji: '🔋', price: 4999, was: 6499, rating: 4.6, reviews: 5600,  badge: 'sale', isNew: false, delivery: 'Free delivery in 3 days', featured: false, flashSale: false },
  { id: 50, cat: 'automotive', brand: 'Varta',    name: 'Varta Dash Cam 4K UHD GPS Night Vision 170°',  emoji: '📹', price: 7999, was: 10999,rating: 4.4, reviews: 4100,  badge: 'new',  isNew: true,  delivery: 'Free delivery in 2 days', featured: false, flashSale: false },
];
