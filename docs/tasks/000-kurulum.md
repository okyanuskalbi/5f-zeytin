# Task 000: İki projenin kurulumu (ZEYTİN + KURUMSAL) — iskelet, ECC, plan, task listesi

## Tür
kurulum (kod yazma YOK — sadece iskelet, doküman, ECC dosyaları, git)

## Amaç
`claude-codex-workflow.md` düzenini iki repoya kur, ECC rule + skill'lerini repolara kopyala, her iki proje için `docs/PLAN.md` ve sıralı task taslaklarını (`docs/tasks/001-...`) yaz.

## Kısaltmalar (kullanıcı böyle diyecek)
- **ZEYTİN** = afinazeytin.com → repo `okyanuskalbi/5f-zeytin` → yerel `~/PROJELER/5F-ZEYTIN`
- **KURUMSAL** = afina.com.tr → YENİ private repo `okyanuskalbi/afina-kurumsal` → yerel `~/PROJELER/AFINA-KURUMSAL`

## Referans
- İş akışı: `~/PROJELER/5F-ZEYTIN/docs/referans/claude-codex-workflow.md` (bölüm 2–6 şablonları BİREBİR kullanılacak)
- E-ticaret örneği (SADECE OKU, ASLA DEĞİŞTİRME): `~/PROJELER/MLNEW` — Next.js + Supabase + iyzico/PayTR callback (`app/api/payments/*`), sepet, ödeme, sipariş-takip, admin, nodemailer
- Mevcut ZEYTİN kodu: Google AI Studio çıktısı, React+Vite, EKSİK (`src/main.tsx`/`App.tsx` yok). Bileşenler (Hero, ScrollProductCard, CinematicScrollExperience, ThreeOliveBottleViewer, CartDrawer, CheckoutModal...) ve `docs/visual-prompts.md` referans olarak korunacak.

## Ortam (kontrol edildi)
- macOS, codex-cli 0.162.1, gh giriş yapılı (okyanuskalbi)
- ECC: Claude'da `ecc@ecc` plugin, Codex'te `ecc@ecc` 2.2.3 kurulu → TEKRAR KURMA
- ECC kaynak: `~/.claude/plugins/marketplaces/ecc/` (`rules/`, `skills/`)
- 21st MCP: Claude'da global (`mcp__21st`), Codex'te `~/.codex/config.toml` `[mcp_servers.21st]` → `.mcp.json` YAZMA, key repoya girmesin
- find-skills: global kurulu (`~/.claude/skills/find-skills`)

## Adımlar

### A. ZEYTİN (`~/PROJELER/5F-ZEYTIN`, main branch)
1. Mevcut AI Studio kodunu silme; `git mv` ile `_legacy/` altına taşı (`src/`, `app/`, `index.html`, `vite.config.ts`, `metadata.json`, `bun.lock`, `tsconfig.json`, `package.json`). `docs/` yerinde kalır.
2. Workflow bölüm 2'deki iskeleti oluştur: `docs/tasks/`, `.claude/commands/`, `.claude/rules/ecc/`, `.claude/skills/`, `.agents/skills/`. (`src/frontend` / `src/backend` AÇMA — Next.js App Router kullanılacak; yapı PLAN.md'de tanımlanır.)
3. `CLAUDE.md` = workflow bölüm 3 birebir + en üste "Proje bağlamı" bölümü (aşağıdaki ZEYTİN gereksinimleri özeti + kısaltmalar).
4. `AGENTS.md` = workflow bölüm 4 birebir + "Proje bağlamı" bölümü + şu ek kurallar:
   - UI işlerinde 21st MCP ile ara/üret, sonra projenin token'larına uyarla; varsayılan halde bırakma.
   - Animasyon: Framer Motion (`motion`) + ECC `motion-foundations`/`motion-patterns`/`motion-advanced`; `prefers-reduced-motion` desteklenecek.
   - shadcn/ui gerekiyorsa resmi CLI (`npx shadcn@latest add ...`), MCP yok.
   - Supabase'de public şemada yeni tablo oluşturan her migration'a açık GRANT ekle (sunucu-only tablo: anon/authenticated revoke + service_role select/insert/update/delete; istemci tablosu: anon select, authenticated+service_role s/i/u/d). anon/authenticated grant alan tabloda RLS zorunlu.
   - `.env*`, şifre, API anahtarı ASLA commit edilmez.
5. `.claude/commands/build.md` = workflow bölüm 5 birebir; içindeki `codex exec --full-auto` yerine `codex exec --approve-for-me` yaz.
6. ECC rules kopyala: `common`, `typescript`, `react`, `web` → `.claude/rules/ecc/`.
7. ECC skills kopyala (hem `.agents/skills/` hem `.claude/skills/`): `frontend-patterns`, `backend-patterns`, `api-design`, `tdd-workflow`, `e2e-testing`, `security-review`, `database-migrations`, `postgres-patterns`, `nextjs-turbopack`, `motion-foundations`, `motion-patterns`, `motion-advanced`, `design-system`, `frontend-design-direction`, `accessibility`, `seo`, `deployment-patterns`, `verification-loop`, `coding-standards`.
8. find-skills proje bazlı: `npx skills add https://github.com/vercel-labs/skills --skill find-skills` (hata verirse Coder Notu'na yaz, devam et).
9. `.gitignore`: `node_modules`, `.next`, `.env*` (`!.env.example`), `.vercel`, `.DS_Store`, `*.log`, `.mcp.json`.
10. `docs/PLAN.md` = workflow bölüm 6 şablonu, aşağıdaki ZEYTİN gereksinimleriyle doldurulmuş (Next.js App Router + TS + Tailwind 4 + shadcn + Framer Motion + Supabase + Vercel). "Açık kararlar" bölümü ekle (aşağıdaki liste).
11. Task taslakları `docs/tasks/001-...` ile başlayıp sıralı; her biri workflow'daki task şablonunda, tek sorumluluk, komutla doğrulanabilir kabul kriteri, ilgili ECC skill'i ve 21st MCP satırı dolu. Hepsi `## Durum: BEKLİYOR`. Ödeme/DB/auth task'larının başına `> ONAY GEREKLİ (DB/ödeme/auth)` yaz.
12. Commit `chore: proje iskeleti + plan` → `git push origin main`.

### B. KURUMSAL (`~/PROJELER/AFINA-KURUMSAL`)
1. `gh repo create okyanuskalbi/afina-kurumsal --private --clone` (zaten varsa sadece clone) → `~/PROJELER/AFINA-KURUMSAL`, branch `main`.
2. A2–A9 aynısı (legacy yok; DB/ödeme olmadığı için `database-migrations`, `postgres-patterns`, `backend-patterns` skill'lerini kopyalama).
3. `docs/PLAN.md` KURUMSAL gereksinimleriyle (Next.js App Router + TS + Tailwind 4 + Framer Motion + Vercel, statik/SSG).
4. Task taslakları `docs/tasks/001-...`.
5. `README.md` kısa. Commit `chore: proje iskeleti + plan` → `git push -u origin main`.

## ZEYTİN gereksinimleri (afinazeytin.com)
- Tek landing page içinde vitrin + satın alma akışı; **en fazla 5–6 ürün** (ör. Doğal Kırma Yeşil Zeytin 10 kg teneke, siyah zeytin, natürel sızma zeytinyağı vb. — temsili; gerçek liste admin'den girilecek).
- Kartlar ve ürünler scroll ile sahneye girsin (Framer Motion scroll-linked / whileInView, ürün başına sahne hissi), premium UX; 21st MCP bileşenleri.
- Marka: AFİNA ZEYTİN, "Köklerinden aldığı güçle büyüyor", renkler zeytin yeşili #243A29, fildişi #F5F1E7, şampanya altını #D4B483; logo: altın zeytin dalı + el (KURUMSAL referansındaki Afina Zeytin logosu). `docs/visual-prompts.md` görsel prompt paketi korunur.
- Ürün görselleri şimdilik TEMSİLİ (kullanıcının Instagram örneği: yeşil-beyaz "AFİNA Doğal Kırma Yeşil Zeytin 10 KG" teneke). Görsel üretim modeli: GPT Image 2.5 (Atlas `openai/gpt-image-2.5-flare`) — görsel üretimi ayrı task, kullanıcı onayına sunulacak.
- **Fabrika / tesis görseli (ayrı görsel task'ı, Codex üretir):** kullanıcının temsili fotoğrafı — iki katlı modern tesis, cephe **parlak zeytin-yeşili + mat siyah** bloklar, üstte siyah tabela "Afina ZEYTİN" (el yazısı "Afina" yeşil, "ZEYTİN" beyaz), büyük cam vitrinler, önde gri beton platform + basamaklar, saksıda zeytin ağaçları, yanında "AFİNA" bayrakları, kilitli parke taşı avlu, Osmaniye/Çukurova arka planı, parçalı bulutlu mavi gök. Görev: bu kimliği koruyup **daha premium** sinematik versiyonlar üret (altın saat ışığı, tone mapping, temiz avlu, plaka/kişi yok, tabela okunur ve doğru yazılı) → hero/"Tesisimiz" bölümü + KURUMSAL Zeytin sahnesi için 16:9 ve 9:16. Model: Atlas MCP `openai/gpt-image-2.5-flare` (Codex'te `atlascloud` MCP kurulu). Çıktılar `public/images/generated/` + `docs/gorsel-onay.md` listesi; **kullanıcı onayı olmadan sitede kullanılmaz, videoya geçilmez.** Aynı task ürün görselleri (≤6, teneke/şişe) ve `docs/visual-prompts.md` P01–P12 için de geçerli.
- **Yoğun işlerin tamamı Codex'te:** her görsel üretimi, bileşen, animasyon, entegrasyon ayrı task; Claude sadece plan + denetim yapar.
- Üyelik (kayıt/giriş, hesabım, sipariş geçmişi).
- Sepet: drawer + sepet sayfası, **sepet görünümünde upsell/çapraz satış** (ör. zeytin alana zeytinyağı, adet artırınca kademeli indirim).
- Ödeme: MLNEW yapısı gibi (iyzico ve/veya PayTR callback) — sağlayıcı kararı açık.
- **Sepette bırakılanlar**: terk edilen sepet tespiti → zamanlı e-posta + **% indirim kuponu** (mail marketing).
- **Promo/reklam kodları**: kupon sistemi (yüzde/tutar, süre, kullanım limiti, UTM kaynağı).
- **Admin paneli**: ürün (≤6), sipariş, kupon/kampanya, terk edilen sepetler, müşteri, kargo bilgisi girişi; shadcn tabanlı.
- **Kargo takip**: admin kargo firması + takip no girer → müşteriye e-posta + `siparis-takip` sayfası.
- SEO/AEO: Product + Organization schema, sitemap, robots, llms.txt; KVKK/mesafeli satış/iade sayfaları.
- Yayın: Vercel; alan adı afinazeytin.com (DNS Cloudflare'de).

## KURUMSAL gereksinimleri (afina.com.tr)
- **AFİNA Şirketler Topluluğu** kurumsal sitesi. Ana kurgu: **her scroll adımı tam ekran bir geçiş sayfası, her biri bir markayı tanıtır** (scroll-snap + Framer Motion sahne geçişleri: renk/arka plan morph, logo girişi, parallax görsel). Sıra ve kimlikler (kullanıcının referans görselinden):
  1. **AFİNA İNŞAAT** — lacivert blueprint + kırmızı (#E31E24 civarı); "PLANDAN → YAPIYA", "Hayalinizdeki yaşam alanını birlikte inşa edelim."; sol yarı çizim/plan, sağ yarı modern beton villa (plan→yapı geçişi animasyonu).
  2. **AFİNA ZEYTİN** — zeytin yeşili bokeh + şampanya altın logo; "Zeytin", "Zeytinyağı" etiketleri, "%100 Organik %100 Doğal" rozeti; zeytin dalı, zeytinyağı şişesi. ZEYTİN sitesine (afinazeytin.com) yönlendiren CTA.
  3. **AFİNA BÖREK** — bordo/kırmızı + turuncu-sarı buğday başağı logo; "Her Diliminde Lezzet Saklı"; tepsi börek görseli.
  4. **AFİNA COFFEE** — kahve kahverengi + krem; "Kahveden daha fazlası…", COFFEE · DESSERT · BAKERY; fincan + kahve çekirdekleri.
  5. **AFİNA MOTORS** — siyah + altın/bronz şerit "AFİNA MOTORS"; at başlı logo; "GÜVENLE ALIN KEYİFLE SÜRÜN"; Alım · Satım · Takas; spor otomobil.
  6. **AFİNA ŞİRKETLER TOPLULUĞU** (kapanış) — krem/altın; sektör kartları İnşaat · Otomotiv · Tarım · Gastronomi + 5 marka logosu ızgarası.
- Ek: hero/intro (topluluk logosu), hakkımızda, iletişim (form + harita), her marka için alt sayfa veya modal (ileride), KVKK. Mobilde dikey tam ekran geçişler, `prefers-reduced-motion` ile sade mod.
- Logo ve görseller şimdilik placeholder; kullanıcı orijinal logoları verecek (referans görsel dosyası `docs/referans/` altına kullanıcı tarafından eklenecek).
- Statik/SSG, DB yok. Yayın: Vercel; alan adı afina.com.tr (19 Eki 2026 alındı, DNS Cloudflare'de, A kaydı yok).

## Açık kararlar (PLAN.md'ye yaz, KENDİN KARAR VERME)
1. ZEYTİN veritabanı: yeni Supabase projesi (ad/org) — kullanıcı onayı
2. Ödeme sağlayıcı: iyzico mu PayTR mı (ikisi mi), mağaza hesapları
3. E-posta servisi: Resend / SMTP (nodemailer) — gönderen alan adı doğrulaması
4. Kargo firması/firmaları ve otomatik takip API'si gerekip gerekmediği
5. Terk edilen sepet indirim oranı ve bekleme süreleri
6. Orijinal logolar, ürün listesi (≤6) ve fiyatlar
7. Vercel ekip/proje ve alan adı bağlama zamanı

## Kabul kriterleri
- [ ] `git -C ~/PROJELER/5F-ZEYTIN log -1 --oneline` → "chore: proje iskeleti + plan", `git status` temiz, origin/main ile eşit
- [ ] `gh repo view okyanuskalbi/afina-kurumsal --json visibility` → PRIVATE; yerel repo push'lu
- [ ] Her iki repoda: `CLAUDE.md`, `AGENTS.md`, `.claude/commands/build.md`, `docs/PLAN.md`, `.claude/rules/ecc/common`, `.agents/skills/frontend-patterns/SKILL.md`, `.gitignore` mevcut
- [ ] Her iki repoda `docs/tasks/001-*.md` ve sonrası mevcut, hepsi `## Durum: BEKLİYOR`
- [ ] `git ls-files | grep -E "\.env|\.mcp\.json"` → boş (her iki repo)
- [ ] ZEYTİN `_legacy/` altında eski kod duruyor

## Yapılmaması gerekenler
- Uygulama kodu yazma, `npm install`/`create-next-app` çalıştırma (bu task'ta değil)
- Supabase projesi açma, ödeme/e-posta hesabı/anahtarı oluşturma, Vercel projesi kurma
- `~/PROJELER/MLNEW` veya başka bir repoya YAZMA
- Branch/PR açma — doğrudan main
- ECC'yi yeniden kurma

## Durum: BEKLİYOR
