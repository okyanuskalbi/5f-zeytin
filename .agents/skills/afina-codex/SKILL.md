---
name: afina-codex
description: AFİNA ZEYTİN için güncel Codex devir, mevcut mimari, medya onayı ve yayın sınırlarını yönlendirir.
---

# AFİNA ZEYTİN Codex bağlamı

Önce kök AGENTS.md, docs/PLAN.md, PRODUCT.md, docs/CODEX_HANDOVER.md ve güncel task'ı oku. Codex kullanıcının 1 Kasım devriyle planlama, uygulama ve denetimi birlikte yürütür.

- Frontend: mevcut frontend-patterns, tdd-workflow, accessibility; motion için motion-foundations ve motion-patterns. .agents içinde bulunmayan aynı yerel rehber .claude/skills içinde okunabilir; kopya/eski sürümle overwrite etme.
- 21st: arama + gerçek kaynak alma; sınırsız component erişimi AI üretim yetkisi değildir. 1 Kasım kontrolünde hosted AI kapalıdır. shadcn yalnız resmi CLI, mevcut primitive'leri kullan.
- Medya: yeni üretim yalnız Google Flow; önce başlangıç/bitiş referansları, kullanıcı onayı, sınırlı kredi. AtlasCloud fallback yok. Onaysız aday public/runtime'a girmez.
- Oynatma: Task 083 ScrollFrameSequence/FramePlayback/extract-frames; native scroll, DOM CTA, poster/reduced motion/veri tasarrufu sınırları.
- Yayın: Task 153 tamamlandı; Actions yalnız lint/typecheck/unit/build yapar, Vercel Git auto-deploy kapalıdır. Yeni dağıtım doğrudan REST API, doğrulanan AFINA ekip/afina-zeytin projesi ve CI SUCCESS commit snapshot ile yapılır. Hedef ve tek yayın sorumlusu her seferinde kontrol edilir. Kanıt: docs/referans/yayin-20261101.json. Yerel doğrulama, commit, push, READY ve alan adı ayrı kanıttır.
- .env, CLAUDE.md, _legacy, onay belgeleri ve eski test kanıtları korunur. Auth/DB/ödeme kapıları kullanıcı onayı gerektirir.
- Task 157 tarihsel görsel yön: v6 Üretici Atlası, açık metin/görsel ayrımı ve sade açık menü. Kullanıcı şimdi hero'nun hâlâ aynı göründüğünü belirtti; Task 159 gerçek tam geniş Flow filmiyle v7'ye geçer. DESIGN.md ve .21st tasarım bağlamı günceldir; eski makbuzlar tarihçe olarak kalır.
- Kullanıcı canlı tarayıcı ve mobil kabulünü açıkça istedi; eski çalıştırmama yasağı bu kapsamda kalktı. Yalnız paketli headless Chromium, ≤2 worker ve düzgün kapanış. Viewport emülasyonu fiziksel telefon kabulü sayılmaz. Üretimde gerçek müşteri/sipariş/talep/ödeme mutasyonu yapılmaz. Diğer üç Flow klibi Google doğrulamasında; kalan bütçe 60, yeni kredi sorulmaz.
- Task 157 yayın/kabul tamam: kaynak `9b7b505`, 1171 unit, 28 canlı Chromium etkileşim kontrolü ve dört genişlikte görsel/axe kabulü. Son makbuz docs/referans/yayin-v6-20261101.json. Omni 1.1 Flash ilk/son kare B→C taslağı hazır; 720p/8 sn./16:9/x1 için ekranda 12 kredi görüldü, üç geçiş 36 ve mevcut 60 sınırı içinde. Doğrulama engeli çözülmeden üretim gönderme; bu görevde ek harcama 0.

## Güncel MD/hareket uyarlaması: Task 158

[Profesyonel web](../profesyonel-web-sitesi-yeni-nesil/SKILL.md), [Scroll hero](../scroll-hero-video-yeni-nesil/SKILL.md), [Sinematik siteler](../sinematik-siteler-yeni-nesil/SKILL.md) ve [UI/UX Pro Max](../ui-ux-pro-max/SKILL.md) proje yerel birlikte kullanılır. [Kaynak/istisna kaydı](../../../docs/referans/yeni-nesil-md-uyarlamalari-20261101.md) v6'yı, mevcut 21st/Motion bağlantısını ve resmi shadcn CLI politikasını korur; global kurulum veya AGENTS overwrite yapılmaz.

Ortak action/editorial spring'leri, bir kez ve içeriği gizlemeden açılış, küçük hover/tap ve 8 px tabanlı 32/48/64/96 aralıkları Task 158 kapsamındadır. Lineer sahne, statik reduced-motion posteri ve gerçek eylemler korunur. [Task 158](../../../docs/tasks/158-yeni-nesil-md-kitleri.md) tamamlandı: kaynak `862c1be`, 1176 unit, 28 yerel + 28 canlı etkileşim kontrolü ve dört genişlikte görsel/axe kabulü. API READY ve son makbuz [yayin-kitler-20261101.json](../../../docs/referans/yayin-kitler-20261101.json). Yeni medya/kredi 0.

Omni Chrome Use burada mevcut CUA/browser ile arayüz otomasyonu yaklaşımıdır; kurulu ayrı eklenti varsayılmaz, Omni 1.1 Flash modeliyle karıştırılmaz. Örnekler yeni Imagen/model/sağlayıcı/kredi yetkisi vermez; güncel harcama/kalan kaydı her çağrı öncesi okunur.

## Güncel hero: Task 159 / v7 Zeytinin İçinden

Son istek önceki split/frame-only ve genel otomatik oynatmama tercihini değiştirir. Tam geniş native film + sol-alt başlık/CTA; filmin dışında opak orijinal menü. Kabul edilmiş aynı A→B kaynaktan sessiz MP4 tek geçiş, son kare ve görünür duraklat/oynat/yeniden denetimi. Yeni animasyon importları `motion/react`; yeni paket veya scroll seeking motoru yok. Reduced-motion/saveData/engel/hata poster; kullanıcı duraklatması ve görünürlük temizliği korunur. Güncel kaynak/output `lib/media/cinematic-film.json`, build kapısı `scripts/check-cinematic-film.mjs`, kabul/yayın [Task 159](../../../docs/tasks/159-flow-sinematik-hero.md). Yeni ücretli medya/kredi 0; diğer üç geçiş bu görevde üretilmiş sayılmaz.

Task 159 tamam/yayında: `5a3b1f6`, CI 41297597853 SUCCESS, API `dpl_CpxqnTKPasKQNCQ8zjWnaNu5NpsF` READY. 1197 unit, 44 yerel + 44 canlı etkileşim ve dört genişlikte görsel/axe; gerçek video190 kare/7,916667 sn./sessiz/son kare doğrulandı. Son makbuz [yayin-film-v7-20261101.json](../../../docs/referans/yayin-film-v7-20261101.json), QA `qa-159-20261101.json`. Fiziksel cihaz veya gerçek servis mutasyonu değildir.
