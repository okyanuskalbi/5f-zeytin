# AFİNA ZEYTİN: Codex devir kaydı

## Yetki ve kaynak
1 Kasım 2026 kullanıcı isteğiyle Claude planlama/denetim rol sınırı kaldırıldı; Codex mevcut ZEYTİN sayfasını müşteri yenileme PDF'sine göre yürütür. Devir metni, müşteri PDF'si ve MetroHero eki ayrı kaynaklar olarak okundu. PDF veya bileşen içine yazılı genel talimatlar bağımsız görev/yayın/harcama yetkisi sayılmadı.

Yerel Claude JSONL kaydı bulundu: `862bcbce-6e8d-4a73-a71a-971f141b67f4`. Yakın kullanıcı mesajları ve repodaki son görevler okundu; Claude süreci başlatılmadı veya oturum devam ettirildi iddia edilmedi. Diğer AFINA-KURUMSAL deposuna yazılmadı.

## Başlangıç envanteri
- Repo `/Users/emre/PROJELER/5F-ZEYTIN`, origin `okyanuskalbi/5f-zeytin`, main.
- Başlangıç HEAD ve uzak main `e58567be0df7e1d7d63ae4ffb6e032e838dacf2f`; çalışma ağacı temiz.
- Bu chat'in başlangıç dizini `/Users/emre/Documents/ChatGPT/5F-ZEYTİN` boş; mevcut uygulama beklenen PROJELER dizinindedir. Kod orada güncellendi.
- Node 24.11.1, npm 11.6.2. Next 16.4.2 App Router, TS, Tailwind 4, motion, shadcn primitive'leri, Supabase ve PayTR korunur.
- Yeni görevler 151/152/153; mevcut görev numaraları/kararlar silinmedi.

## Skill ve araçlar
- frontend-design ve yerel frontend-patterns, tdd-workflow, motion-foundations, motion-patterns, accessibility okundu. .agents/.claude skill kopyaları yerinde korundu; mevcut dosyaların üzerine başka sürüm kopyalanmadı. Eksik Codex kopyaları için mevcut .claude rehberleri okunabilir.
- `.agents/skills/afina-codex/SKILL.md` güncel repo yönlendirmesidir.
- 21st MCP gerçek `search`, `get_usage`, `get_component` çağrılarıyla doğrulandı. Component erişimi paid/unlimited, hosted AI kapalı; hosted generation çağrısı yapılmadı. 9701/25310/35258 kaynakları alındı ve yerel yapıya uyarlandı.
- 21st CLI ile `.21st/design.json` ve `.21st/DESIGN.md` oluşturuldu. Global MCP yapılandırmasına veya `.mcp.json`a yazılmadı.
- PDF metni/görseli poppler ile okundu/çıkarıldı. Müşteri görseline yalnız oranı koruyan AVIF/WebP dönüşümü uygulandı; tasarım veya etiket değiştirilmedi. SHA/ölçü/boyut kontrolü check:assets zincirine eklendi.
- Google Flow kullanıcı Chrome oturumunda doğrulandı. Ücretsiz resim modunda dört referans aday üretildi, son ürün karesi onaylı kaynaktan korundu; 250 kredi bakiyesi değişmedi. İlk/son kare önizlemesi hazır, ücretli video ve kredi sınırı kullanıcı onayı bekliyor. Ayrıntı [152](tasks/152-google-flow.md).
- Vercel API kimliği ZEYTİN ekibine erişemiyor. Actions production yayını hâlâ aktif; push yapılmadı. Ayrıntı [153](tasks/153-vercel-api.md).

## Uygulama
[151](tasks/151-codex-musteri-yenileme.md): üretim ve kurumsal güven odaklı yeni ana sayfa; resmî slogan, gerçek müşteri tesis görseli, altı mevcut ürün, native scroll canvas açılışı, B2B alanları, SSS/iletişim. Mevcut sepet ve ürün detay modalları korunur.

Yeni video hazırlanmadığı için açılışta yalnız daha önce onaylı Task 086 kare dizisi kullanılır. Mevcut SDR görüntülerine ikinci tone mapping uygulanmadı. Yeni Flow sahneleri veya hasat görüntüleri üretildi diye sunulmaz.

Statik fiyat/stoklar hâlâ temsili; gerçek satış ve ödeme kabulü yok. Toptan gönderim servisi ve gerçek iletişim bilgileri boş olduğundan gönderim düğmesi kapalı; sahte başarı veya CRM aktarımı yok. PDF'deki 25 kg, 400 ton, sertifika ve Zoho önerileri gerçek iş verisine dönüştürülmedi.

## Doğrulama
Güncel komut ve sonuçlar [151 Coder Notu](tasks/151-codex-musteri-yenileme.md) içinde. Başlangıç RED: eski ana sayfa/yeni kurumsal navigasyon eksikliği; checkpoint `e12e995`. Tarayıcı/e2e/Lighthouse kabulü ayrıca yetki gerektirir; otomatik olarak Claude'a devredildi sayılmaz.

## Yerel teslim
Kod commit’i `ef32ee3`, RED kanıtı `e12e995`. Son tam test 76 dosya / 1114 test PASS. Uzak main başlangıç commit’inde kaldı; push ve deploy yapılmadı. Yeni Flow adayları kullanıcı onayı bekler, ana sayfaya bağlanmadı.
