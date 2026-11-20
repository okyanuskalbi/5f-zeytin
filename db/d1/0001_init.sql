-- Faz A (görev 213): Cloudflare D1 (SQLite) şeması. PostgreSQL tarihçesi db/migrations ve supabase/migrations içinde kalır.
-- Tür sözleşmesi:
--   uuid        -> TEXT (uygulama üretir; varsayılan olarak rastgele UUID v4 metni de üretilir)
--   timestamptz -> TEXT, UTC ISO 8601 ('2026-11-19T10:00:00.000Z'); metin sıralaması zaman sıralamasıdır
--   boolean     -> INTEGER 0/1 (CHECK ile kısıtlı)
--   jsonb       -> TEXT (json_valid ile kısıtlı)
--   para        -> INTEGER kuruş (price_kurus, total_kurus, unit_price_kurus); değer kaybı yok
-- Şema öneki yok (public.): SQLite'ta tek veritabanı vardır.

CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0 CHECK ("emailVerified" IN (0, 1)),
  image TEXT,
  phone TEXT,
  metadata TEXT CHECK (metadata IS NULL OR json_valid(metadata)),
  "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  "expiresAt" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX session_owner ON session("userId");
CREATE INDEX session_expiry ON session("expiresAt");
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TEXT,
  "refreshTokenExpiresAt" TEXT,
  scope TEXT,
  password TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE ("providerId", "accountId")
);
CREATE INDEX account_user ON account("userId");
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  "updatedAt" TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX verification_identifier ON verification(identifier);
CREATE INDEX verification_expiry ON verification("expiresAt");
CREATE TABLE "rateLimit" (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL,
  "lastRequest" INTEGER NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  weight TEXT NOT NULL,
  price_kurus INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 0,
  active_slot INTEGER,
  category_label TEXT,
  show_category_label INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CONSTRAINT products_id_not_blank CHECK (trim(id) <> ''),
  CONSTRAINT products_name_not_blank CHECK (trim(name) <> ''),
  CONSTRAINT products_category_valid CHECK (category IN ('sofralik-zeytin', 'salamura-zeytin', 'zeytinyagi')),
  CONSTRAINT products_weight_not_blank CHECK (trim(weight) <> ''),
  CONSTRAINT products_price_nonnegative CHECK (price_kurus >= 0),
  CONSTRAINT products_currency_try CHECK (currency = 'TRY'),
  CONSTRAINT products_stock_nonnegative CHECK (stock >= 0),
  CONSTRAINT products_is_active_bool CHECK (is_active IN (0, 1)),
  CONSTRAINT products_show_label_bool CHECK (show_category_label IN (0, 1)),
  CONSTRAINT products_active_slot_range CHECK (active_slot BETWEEN 1 AND 6),
  CONSTRAINT products_active_slot_unique UNIQUE (active_slot),
  CONSTRAINT products_category_label_valid CHECK (
    category_label IS NULL OR (length(category_label) <= 40 AND category_label NOT GLOB '*[<>]*')
  )
);
-- PostgreSQL'deki "products_assign_active_slot" tetikleyicisinin karşılığı. SQLite BEFORE tetikleyicisi satırı
-- değiştiremediği için slot atama AFTER'da yapılır; slot kalmazsa aynı ifade geri alınır (ABORT).
-- Kural: pasif ürünün slotu boş; aktif ürün slotsuzsa en küçük boş slot (1-6) verilir; boş slot yoksa hata.
CREATE TRIGGER products_assign_active_slot_insert AFTER INSERT ON products
BEGIN
  UPDATE products SET active_slot = CASE
    WHEN NEW.is_active = 0 THEN NULL
    WHEN NEW.active_slot IS NOT NULL THEN NEW.active_slot
    ELSE (SELECT min(column1) FROM (VALUES (1), (2), (3), (4), (5), (6))
          WHERE column1 NOT IN (SELECT active_slot FROM products WHERE active_slot IS NOT NULL))
  END WHERE id = NEW.id;
  SELECT RAISE(ABORT, 'At most six products can be active')
    WHERE EXISTS (SELECT 1 FROM products WHERE id = NEW.id AND is_active = 1 AND active_slot IS NULL);
END;
CREATE TRIGGER products_assign_active_slot_update AFTER UPDATE OF is_active, active_slot ON products
BEGIN
  UPDATE products SET active_slot = CASE
    WHEN NEW.is_active = 0 THEN NULL
    WHEN NEW.active_slot IS NOT NULL THEN NEW.active_slot
    ELSE (SELECT min(column1) FROM (VALUES (1), (2), (3), (4), (5), (6))
          WHERE column1 NOT IN (SELECT active_slot FROM products WHERE active_slot IS NOT NULL))
  END WHERE id = NEW.id;
  SELECT RAISE(ABORT, 'At most six products can be active')
    WHERE EXISTS (SELECT 1 FROM products WHERE id = NEW.id AND is_active = 1 AND active_slot IS NULL);
END;

CREATE TABLE admin_users (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE product_upsells (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  upsell_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, upsell_id),
  CONSTRAINT product_upsells_not_self CHECK (product_id <> upsell_id)
);
CREATE INDEX product_upsells_target ON product_upsells(upsell_id);
CREATE TABLE customer_addresses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 100),
  recipient TEXT NOT NULL CHECK (length(recipient) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (length(phone) BETWEEN 10 AND 20),
  city TEXT NOT NULL CHECK (length(city) BETWEEN 2 AND 100),
  district TEXT NOT NULL CHECK (length(district) BETWEEN 2 AND 100),
  line TEXT NOT NULL CHECK (length(line) BETWEEN 2 AND 500),
  postal_code TEXT NOT NULL CHECK (length(postal_code) = 5 AND postal_code NOT GLOB '*[^0-9]*'),
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX customer_addresses_owner ON customer_addresses(user_id, created_at);
CREATE UNIQUE INDEX customer_addresses_one_default ON customer_addresses(user_id) WHERE is_default = 1;
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  order_no TEXT NOT NULL UNIQUE CHECK (
    length(order_no) BETWEEN 3 AND 40 AND substr(order_no, 1, 1) GLOB '[A-Za-z0-9]' AND order_no NOT GLOB '*[^A-Za-z0-9-]*'
  ),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','preparing','shipped','delivered','cancelled','refunded')),
  total_kurus INTEGER NOT NULL CHECK (total_kurus >= 0),
  currency TEXT NOT NULL DEFAULT 'TRY' CHECK (currency = 'TRY'),
  delivery_address TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(delivery_address) AND json_type(delivery_address) = 'object'),
  shipping_carrier TEXT CHECK (length(shipping_carrier) <= 100),
  tracking_no TEXT CHECK (length(tracking_no) <= 100),
  tracking_url TEXT CHECK (length(tracking_url) <= 2000),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX orders_customer_history ON orders(user_id, created_at DESC, id DESC);
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL CHECK (length(product_name) BETWEEN 1 AND 200),
  weight TEXT NOT NULL CHECK (length(weight) BETWEEN 1 AND 100),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 10000),
  unit_price_kurus INTEGER NOT NULL CHECK (unit_price_kurus >= 0)
);
CREATE INDEX order_items_order ON order_items(order_id);

-- Hesap bazlı giriş hız sınırı: e-posta yerine yalnız HMAC özeti tutulur.
CREATE TABLE auth_account_limits (
  key TEXT PRIMARY KEY CHECK (length(key) = 64 AND key NOT GLOB '*[^a-f0-9]*'),
  attempts INTEGER NOT NULL CHECK (attempts BETWEEN 1 AND 1000000),
  window_started TEXT NOT NULL,
  blocked_until TEXT,
  permitted INTEGER NOT NULL DEFAULT 0 CHECK (permitted IN (0, 1))
);
CREATE INDEX auth_account_limits_window ON auth_account_limits(window_started);

-- Toplu çağrı (batch) içinde koşul denetimi: PostgreSQL işlevlerindeki RAISE EXCEPTION'ın karşılığı.
-- ok = 0 eklenirse tetikleyici toplu çağrının tamamını geri alır; satır hiçbir zaman saklanmaz.
CREATE TABLE sql_guard (code TEXT NOT NULL, ok INTEGER NOT NULL);
CREATE TRIGGER sql_guard_check BEFORE INSERT ON sql_guard
BEGIN
  SELECT RAISE(ABORT, 'guard:product_not_found') WHERE NEW.code = 'product_not_found' AND NEW.ok = 0;
  SELECT RAISE(ABORT, 'guard:invalid_upsell') WHERE NEW.code = 'invalid_upsell' AND NEW.ok = 0;
  SELECT RAISE(ABORT, 'guard:address_not_found') WHERE NEW.code = 'address_not_found' AND NEW.ok = 0;
  SELECT RAISE(ABORT, 'guard:address_limit') WHERE NEW.code = 'address_limit' AND NEW.ok = 0;
  SELECT RAISE(IGNORE);
END;
