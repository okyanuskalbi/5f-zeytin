-- Görev 215 Aşama 1: yönetim paneli genişletme. Yalnız EK; mevcut tablolar değişmez.
-- leads: iletişim/bayilik/teklif formlarından gelen kayıtlar. status: new | contacted | closed.
CREATE TABLE leads (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)), 2) || '-' || substr('89ab', 1 + (abs(random()) % 4), 1) || substr(hex(randomblob(2)), 2) || '-' || hex(randomblob(6)))),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 200),
  email TEXT CHECK (email IS NULL OR length(email) <= 254),
  phone TEXT CHECK (phone IS NULL OR length(phone) <= 40),
  message TEXT NOT NULL DEFAULT '' CHECK (length(message) <= 4000),
  source TEXT NOT NULL DEFAULT 'iletisim' CHECK (length(source) BETWEEN 1 AND 40),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  note TEXT CHECK (note IS NULL OR length(note) <= 2000),
  CONSTRAINT leads_contact_present CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX leads_status_created ON leads(status, created_at DESC);
CREATE INDEX leads_created ON leads(created_at DESC);
-- Panel sipariş listesi için (durum süzgeci + tarih sırası); tablo yapısı değişmez.
CREATE INDEX orders_status_created ON orders(status, created_at DESC);
CREATE INDEX orders_created ON orders(created_at DESC);
