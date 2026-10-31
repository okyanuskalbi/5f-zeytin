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
- Yayın: Task 153 kontrol listesini oku. Actions üretim yayını açıkken ve doğru Vercel proje API erişimi yokken main push yapma. Yerel doğrulama, commit, push ve deploy ayrı kanıttır.
- .env, CLAUDE.md, _legacy, onay belgeleri ve eski test kanıtları korunur. Auth/DB/ödeme kapıları kullanıcı onayı gerektirir.
