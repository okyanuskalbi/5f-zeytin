-- Görev 215 Aşama 3: çerezsiz ziyaretçi sayacı. Yalnız EK; mevcut tablolar değişmez.
-- Ham IP, UA, çerez ve kişisel veri SAKLANMAZ. visitor = günlük tuzlu tek yönlü özet (HMAC-SHA256, gün + sunucu sırrı);
-- gün değişince aynı kişinin özeti de değişir. day = Europe/Istanbul günü (YYYY-MM-DD). Bot istekleri hiç yazılmaz (is_bot hep 0).
-- Saklama: 180 günden eski satırlar yazım sırasında fırsatçı silinir.
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  day TEXT NOT NULL CHECK (day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  path TEXT NOT NULL CHECK (length(path) BETWEEN 1 AND 200),
  referrer_host TEXT CHECK (referrer_host IS NULL OR length(referrer_host) <= 100),
  utm_source TEXT CHECK (utm_source IS NULL OR length(utm_source) <= 64),
  utm_medium TEXT CHECK (utm_medium IS NULL OR length(utm_medium) <= 64),
  utm_campaign TEXT CHECK (utm_campaign IS NULL OR length(utm_campaign) <= 64),
  device TEXT NOT NULL CHECK (device IN ('mobile', 'tablet', 'desktop')),
  country TEXT CHECK (country IS NULL OR (length(country) = 2 AND country NOT GLOB '*[^A-Z]*')),
  visitor TEXT NOT NULL CHECK (length(visitor) = 32),
  is_bot INTEGER NOT NULL DEFAULT 0 CHECK (is_bot IN (0, 1))
);
CREATE INDEX page_views_day ON page_views(day);
CREATE INDEX page_views_path ON page_views(path);
