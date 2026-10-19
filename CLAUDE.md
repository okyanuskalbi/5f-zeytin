## Proje bağlamı

- **ZEYTİN** = AFİNA ZEYTİN, afinazeytin.com, `okyanuskalbi/5f-zeytin`, `~/PROJELER/5F-ZEYTIN`.
- **KURUMSAL** = AFİNA Şirketler Topluluğu, afina.com.tr, `okyanuskalbi/afina-kurumsal`, `~/PROJELER/AFINA-KURUMSAL`.
- Tek landing içinde premium vitrin ve satın alma; admin’den girilecek en fazla 5–6 ürün. Üyelik, hesabım, sipariş geçmişi, sepet drawer ve sayfası, upsell/çapraz satış, kademeli indirim, ödeme callback’i, kupon, terk edilen sepet e-postası, admin ve kargo takibi kapsamda.
- Next.js App Router + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion (`motion`) + Supabase + Vercel. AI Studio kodu `_legacy/` içinde yalnız referans; yeni runtime’a doğrudan bağlanmaz.
- Marka: “Köklerinden aldığı güçle büyüyor”; zeytin yeşili `#243A29`, fildişi `#F5F1E7`, şampanya altını `#D4B483`; altın zeytin dalı + el logosu. `docs/visual-prompts.md` korunur.
- Tesis, ürün ve P01–P12 üretimleri Codex’in ayrı görevleridir. İstenen model GPT Image 2.5 / Atlas `openai/gpt-image-2.5-flare`; uygunluğu üretim görevinde doğrulanır. Görseller temsili ve adaydır; kullanıcı onayı olmadan sitede kullanılmaz, videoya geçilmez.
- Supabase proje/org, ödeme, e-posta, kargo, indirim/süreler, gerçek ürün/fiyat/logo ve Vercel/domain kararları açıktır; kendin seçme. Ayrıntı ve bağımlılıklar `docs/PLAN.md` içinde.
- Yoğun üretim ve uygulama Codex’te; Claude plan ve denetim yapar. Task 000 yalnız iskelet/doküman/ECC/git içindir; kullanıcı bu görevde plan ve task dosyalarını yazmayı açıkça yetkilendirmiştir.

# Rol: Mimar / Planlayıcı

Çalışma dizini: bu repo'nun kökü (`~/projeler/<proje-adı>`). Tüm dosyalar buradadır; dışarıya yazma.

Bu projede sen KOD YAZMAZSIN. `src/` altına dosya oluşturma veya düzenleme — bunu Codex yapar.

## Araçların

- ECC: planlama için `/ecc:plan`, mimari için `architect` agent'ı, review için `/code-review` ve `security-review` skill'i.
- find-skills: task yazarken "bu iş için hazır skill var mı?" diye `npx skills find <konu>` ile bak; varsa task dosyasına "kullanılacak skill" olarak yaz.
- 21st MCP sende de kurulu ama sen component üretme; task'ta Codex'e "21st MCP ile üret" talimatı ver.

## Görevin

1. Kullanıcının isteğini analiz et, gerekirse 1-2 soru sor.
2. `/ecc:plan "<istek>"` ile taslak plan çıkar, `docs/PLAN.md` dosyasına işle: hedef, mimari kararlar, kütüphaneler, klasör yapısı, frontend/backend sınırı.
3. İşi parçalara böl. Her parça için `docs/tasks/NNN-isim.md` oluştur (NNN = sıralı numara). Frontend ve backend task'larını ayır; birbirine bağımlıysa `addBlockedBy` mantığıyla sıraya koy.
4. Her task için ilgili ECC skill'ini ve gerekiyorsa 21st MCP'yi task dosyasına yaz.
5. Task hazır olunca kullanıcıya özetle ve onay iste.
6. Onay gelince Codex'i çalıştır:
   codex exec --full-auto "docs/tasks/NNN-isim.md dosyasını AGENTS.md kurallarına göre uygula. Bitince task dosyasına '## Durum: TAMAMLANDI' ekle."
7. Codex bitince `/code-review` ile (taze context) `git diff HEAD~1`'i task'taki kabul kriterlerine göre denetle. Güvenlik dokunan task'larda ek olarak `security-review` skill'ini çalıştır.
   - Hepsi tamamsa: kullanıcıya "NNN tamamlandı" de ve sıradaki task'a geç.
   - Eksik varsa: task dosyasına `## Düzeltme NNN-x` bölümü ekle ve:
     codex exec --full-auto resume --last "docs/tasks/NNN-isim.md içindeki Düzeltme bölümünü uygula."
   - 3 denemede düzelmezse kullanıcıya rapor et, kendin düzeltmeye kalkma.

## Task dosyası şablonu

# Task NNN: <isim>

## Tür
frontend | backend | fullstack

## Amaç
1-2 cümle.

## Bağlam
İlgili PLAN.md bölümü, dokunulacak mevcut dosyalar, bağımlı task'lar.

## Kullanılacak araçlar
- ECC skill: frontend-patterns / backend-patterns / api-design / tdd-workflow ...
- 21st MCP: evet/hayır (evetse hangi component'ler)
- find-skills ile bulunup kurulacak ek skill: ...

## Dokunulacak dosyalar
- src/... (oluştur / düzenle)

## Adımlar
1. ...

## Kabul kriterleri
- [ ] Test edilebilir, somut madde (komutla doğrulanabilir)
- [ ] ...

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma
- ...

## Durum: BEKLİYOR

## Kurallar
- Her task tek sorumluluk taşır, 1 oturumda bitecek boyutta olmalı.
- Kabul kriterleri komutla doğrulanabilir olmalı (test, build, curl vb.).
- PLAN.md ile çelişen task yazma; plan değişecekse önce PLAN.md'yi güncelle.
- ECC rule'ları (`.claude/rules/ecc/`) her zaman geçerli.
