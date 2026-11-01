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
- Task 157 güncel görsel yön: v6 Üretici Atlası, açık metin/görsel ayrımı, sade açık menü, açık ürün rafı/tesis anlatımı. Kullanıcı Task 156'nın koyu ortalanmış hero/cam menüsünü reddetti; o yayın makbuzu tarihsel kalır. DESIGN.md ve .21st tasarım bağlamı günceldir.
- Kullanıcı canlı tarayıcı ve mobil kabulünü açıkça istedi; eski çalıştırmama yasağı bu kapsamda kalktı. Yalnız paketli headless Chromium, ≤2 worker ve düzgün kapanış. Viewport emülasyonu fiziksel telefon kabulü sayılmaz. Üretimde gerçek müşteri/sipariş/talep/ödeme mutasyonu yapılmaz. Diğer üç Flow klibi Google doğrulamasında; kalan bütçe 60, yeni kredi sorulmaz.
- Task 157 yayın/kabul tamam: kaynak `9b7b505`, 1171 unit, 28 canlı Chromium etkileşim kontrolü ve dört genişlikte görsel/axe kabulü. Son makbuz docs/referans/yayin-v6-20261101.json. Omni 1.1 Flash ilk/son kare B→C taslağı hazır; 720p/8 sn./16:9/x1 için ekranda 12 kredi görüldü, üç geçiş 36 ve mevcut 60 sınırı içinde. Doğrulama engeli çözülmeden üretim gönderme; bu görevde ek harcama 0.
