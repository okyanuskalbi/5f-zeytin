-- Görev 215 Aşama 2: indirim kodları. Yalnız EK; mevcut tablolar değişmez. Para birimi: kuruş (INTEGER), siparişlerle aynı.
-- type: percent (value = 1-100 tam yüzde) | fixed (value = kuruş). Kod her zaman BÜYÜK harf/rakam/-/_ olarak saklanır.
CREATE TABLE discount_codes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  code TEXT NOT NULL UNIQUE CHECK (length(code) BETWEEN 3 AND 32 AND code NOT GLOB '*[^A-Z0-9_-]*'),
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value INTEGER NOT NULL CHECK (value >= 1),
  min_subtotal INTEGER NOT NULL DEFAULT 0 CHECK (min_subtotal >= 0),
  starts_at TEXT,
  ends_at TEXT,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses >= 1),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  note TEXT CHECK (note IS NULL OR length(note) <= 500),
  CONSTRAINT discount_percent_range CHECK (type <> 'percent' OR value <= 100),
  CONSTRAINT discount_window_order CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at),
  CONSTRAINT discount_uses_within_limit CHECK (max_uses IS NULL OR used_count <= max_uses)
);
CREATE INDEX discount_codes_created ON discount_codes(created_at DESC);

-- Siparişe uygulanan indirim. order_id PRIMARY KEY: aynı sipariş ikinci kez sayılamaz.
CREATE TABLE order_discounts (
  order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE RESTRICT,
  discount_code_id TEXT NOT NULL REFERENCES discount_codes(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  amount_kurus INTEGER NOT NULL CHECK (amount_kurus >= 1)
);
CREATE INDEX order_discounts_code ON order_discounts(discount_code_id);

-- Toplu çağrı içi koşul: ok = 0 eklenirse tetikleyici çağrının tamamını geri alır (sql_guard ile aynı yöntem).
CREATE TABLE discount_guard (ok INTEGER NOT NULL);
CREATE TRIGGER discount_guard_check BEFORE INSERT ON discount_guard
BEGIN
  SELECT RAISE(ABORT, 'guard:discount_unavailable') WHERE NEW.ok = 0;
  SELECT RAISE(IGNORE);
END;
