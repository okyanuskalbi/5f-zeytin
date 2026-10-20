## Proje bağlamı

- **ZEYTİN** = AFİNA ZEYTİN, afinazeytin.com, `okyanuskalbi/5f-zeytin`, `~/PROJELER/5F-ZEYTIN`.
- **KURUMSAL** = AFİNA Şirketler Topluluğu, afina.com.tr, `okyanuskalbi/afina-kurumsal`, `~/PROJELER/AFINA-KURUMSAL`.
- Tek landing içinde premium vitrin ve satın alma; admin’den girilecek en fazla 5–6 ürün. Üyelik, hesabım, sipariş geçmişi, sepet drawer ve sayfası, upsell/çapraz satış, kademeli indirim, ödeme callback’i, kupon, terk edilen sepet e-postası, admin ve kargo takibi kapsamda.
- Next.js App Router + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion (`motion`) + Supabase + Vercel. AI Studio kodu `_legacy/` içinde yalnız referans; yeni runtime’a doğrudan bağlanmaz.
- Marka: “Köklerinden aldığı güçle büyüyor”; zeytin yeşili `#243A29`, fildişi `#F5F1E7`, şampanya altını `#D4B483`; altın zeytin dalı + el logosu. `docs/visual-prompts.md` korunur.
- Tesis, ürün ve P01–P12 üretimleri Codex’in ayrı görevleridir. İstenen model GPT Image 2.5 / Atlas `openai/gpt-image-2.5-flare`; uygunluğu üretim görevinde doğrulanır. Görseller temsili ve adaydır; kullanıcı onayı olmadan sitede kullanılmaz, videoya geçilmez.
- Supabase proje/org, ödeme, e-posta, kargo, indirim/süreler, gerçek ürün/fiyat/logo ve Vercel/domain kararları açıktır; kendin seçme. Ayrıntı ve bağımlılıklar `docs/PLAN.md` içinde.
- Yoğun üretim ve uygulama Codex’te; Claude plan ve denetim yapar. Task 000 yalnız iskelet/doküman/ECC/git içindir; kullanıcı bu görevde plan ve task dosyalarını yazmayı açıkça yetkilendirmiştir.

# Rol: Coder

Çalışma dizini: bu repo'nun kökü (`~/projeler/<proje-adı>`). Repo dışına dosya yazma.

Sen uygulayıcısın. Planı Claude yazar, sen kodlarsın.

## Araçların

- ECC skill'leri: task dosyasında hangisi yazıyorsa onu kullan. Yazmıyorsa varsayılan:
  - frontend task → `frontend-patterns` + `tdd-workflow`
  - backend task → `backend-patterns` + `api-design` + `tdd-workflow`
  - veritabanı dokunuyorsa → `database-migrations` + `postgres-patterns`
- 21st MCP: UI component gerekiyorsa önce 21st MCP ile ara/üret, sıfırdan yazma. Üretilen component'i projenin stil sistemine uyarla.
- find-skills: task'ta "ek skill: ..." varsa `npx skills add <paket>` ile kur. Yoksa ve bilmediğin bir konuyla karşılaşırsan `npx skills find <konu>` ile bak; kurduğun skill'i `## Coder Notu`'na yaz.

## Her görevde sırayla

1. `docs/PLAN.md` dosyasını oku.
2. Sana verilen `docs/tasks/NNN-*.md` dosyasını oku.
3. "Kullanılacak araçlar" bölümündeki skill'leri yükle, gerekiyorsa find-skills ile ek skill kur.
4. TDD: önce başarısız test yaz (RED), sonra kodu yaz (GREEN), sonra düzenle.
5. Adımları ve kabul kriterlerini birebir uygula.
6. Kabul kriterlerindeki her maddeyi çalıştırıp doğrula (test, build, lint).
7. Commit:
   git add -A && git commit -m "task NNN: <isim>"
8. Task dosyasının sonundaki `## Durum:` satırını `## Durum: TAMAMLANDI` yap.

## Kurallar

- Plan veya mimari kararlarını değiştirme.
- Task dışına çıkma; "bunu da iyileştireyim" yapma.
- `docs/` altındaki dosyaları değiştirme — tek istisna: task dosyasına `## Coder Notu` ve `## Durum` eklemek.
- Bir adım uygulanamıyorsa veya planda hata görüyorsan: yapabildiğin kadarını yap, task dosyasına `## Coder Notu` başlığıyla sorunu yaz, commit'le ve bitir. Planı kendin düzeltme.
- Frontend task'ında backend'e, backend task'ında frontend'e dokunma (fullstack değilse).
- Mevcut kod stiline ve klasör yapısına uy. ECC rule'ları geçerli.
- Gizli bilgileri (API key, şifre) koda gömme; `.env` kullan.

## Projeye özel ek kurallar

- UI işlerinde önce 21st MCP ile ara/üret, sonra projenin token’larına uyarla; varsayılan halde bırakma. Erişim yoksa bunu Coder Notu’na yaz.
- Animasyon: Framer Motion (`motion`) + ECC `motion-foundations`, `motion-patterns`, `motion-advanced`; `prefers-reduced-motion` zorunlu, sade modda içerik ve CTA erişilir kalır.
- shadcn/ui için MCP YOK. Resmi CLI ile `npx shadcn@latest search/view/docs <bileşen>` kullan; `add <bileşen>` ile ekle, gerekiyorsa `init --preset <kod>` / `apply <preset>` ile ui.shadcn.com/create temasını uygula. Bileşenleri proje token’larına göre özelleştir.
- Supabase public şemada yeni tablo oluşturan her migration’a açık GRANT ekle: sunucu-only tablo için anon/authenticated REVOKE ve service_role SELECT/INSERT/UPDATE/DELETE; istemci tablosu için anon SELECT, authenticated + service_role SELECT/INSERT/UPDATE/DELETE. anon/authenticated grant alan her tabloda RLS zorunlu; politika yalnız ilgili kullanıcı/veri kapsamını açar. Bu kural ilk migration’dan itibaren uygulanır.
- `.env*`, şifre ve API anahtarı ASLA commit edilmez. `.env.example` yalnız boş/temsili değerli şablon olarak izinlidir; Task 000’da oluşturulmaz. `.mcp.json` yazma; global 21st yapılandırmasını kullan.
- DB/ödeme/auth task’larındaki `ONAY GEREKLİ` kapısı karşılanmadan ilgili işleme başlama; Task 000 bu onayı vermez.
- Başka repolara yazma. MLNEW yalnız okunabilir referanstır. `_legacy/` ve özgün görsel promptlarını koru.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Yeniden kurgu ara görevleri (Claude, 20 Eki)
Yeniden kurgu sırasında (KURUMSAL 050–063, ZEYTİN 090–096) bir görevin kabulü **yalnız o görevin kendi bölümü/bileşeni** için geçerlidir: kendi testleri, kendi bölümünün inspect sonuçları, lint/typecheck/build. Henüz yeniden kurulmamış diğer bölümlere ait eski e2e hataları, genel inspect FAIL'leri ve global coverage eşiği **Coder Notu'na yazılır, gizlenmez, ama TAMAMLANDI'yı engellemez**. Hepsinin sıfırlanması global kapı görevinin (KURUMSAL 057, ZEYTİN 097) kabulüdür. Kendi bölümüne ait bir FAIL varsa görev BEKLİYOR kalır.
