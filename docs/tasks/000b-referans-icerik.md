# Task 000b: Resmi içerik + logolar + video referansı → PLAN ve task'ları güncelle (ZEYTİN + KURUMSAL)

## Tür
doküman + varlık yerleştirme (uygulama kodu YOK)

## Amaç
Kullanıcının verdiği resmi kaynakları iki repoya `docs/referans/` altına koy; 000'da yazılan `docs/PLAN.md` ve `docs/tasks/*` taslaklarını bu kaynaklara göre güncelle; marka varlıkları için ayrı task yaz.

## Kaynaklar (kalıcı kaynak klasörü: `~/PROJELER/AFINA-KAYNAK/`)
- `icerik/AFINA_Sirketler_Toplulugu_Web_Sitesi_Icerikleri_Guncel.pdf` + `icerik/icerik.txt` — **RESMİ İÇERİK BELGESİ (Sürüm 2.0, 19 Eki 2026) — metinlerde TEK KAYNAK**
- `logo/` — asıl kaynak `logo/AFİNA Logolar2.pdf` (Illustrator vektör); `afina-{topluluk,zeytin,borek,coffee,motors,insaat}.png` (600 dpi şeffaf) + `.svg` (şimdilik tam sayfa vektörü + viewBox kırpma, ~2,6 MB — optimize edilecek)
- `video/video-metni.md` + `video/kareler/*.jpg` — kurumsal video metni/kurgusu (video sitede KULLANILMAZ)

## Adımlar
1. **KURUMSAL** `docs/referans/`: `icerik.pdf` + `icerik.md` (icerik.txt'yi düzgün markdown'a çevir, metni DEĞİŞTİRME), `logolar/` (PDF + PNG + SVG), `video-metni.md`, `video-kareler/`.
2. **ZEYTİN** `docs/referans/`: `icerik.md` (yalnız 01 Çatı + 04 Zeytin bölümleri), `logolar/` (zeytin + topluluk PNG/SVG + asıl PDF).
3. **KURUMSAL PLAN.md güncelle** (resmi belgeye göre):
   - Ana mesaj: **"Farklı sektörler. Ortak bir imza."** Hero metni + kurumsal tanıtım belgeden birebir.
   - Site akışı (belge bölüm 09): 01 HERO → 02 MARKALAR → 03 HİKÂYEMİZ → 04 DETAY (her marka ayrı sayfa) → 05 İLETİŞİM.
   - **02 MARKALAR = kullanıcının istediği scroll kurgusu:** her scroll adımı tam ekran marka geçiş sahnesi, sıra belgedeki gibi: **İnşaat → Zeytin → Börek → Coffee → Motors**. Her sahnede: alan etiketi, slogan, 2–3 satır kart metni, CTA (belgeden birebir), markanın banner renk kimliği.
   - **Börek ve Coffee "ÇOK YAKINDA"** rozetiyle; CTA "Açılış Duyurularını/Gelişmelerini Takip Edin" (e-posta/Instagram takip). Açılışa kadar korunur.
   - 03 HİKÂYEMİZ: 2010 Antalya inşaat → farklı alanlar; video metnindeki manifesto ("Bazı başarılar tek bir alana sığmaz / Kimi zaman bir yapıda… yollara… toprağa kök salar / Farklı alanlarda aynı değerlerle büyüdük / Emek. Güven. / Yılların birikimi tek bir kimlikte buluşuyor / …geleceğe attığı imza") scroll ile kelime kelime altın açılış olarak kullanılabilir. **"Tuna İnşaat" / "Mehmet Tuna Otomotiv" adları KULLANILMAZ** (resmi belgede yok) — açık karar olarak işaretle.
   - Detay sayfaları: `/insaat`, `/zeytin`, `/borek`, `/coffee`, `/motors` — hikâye, hizmet başlıkları, slogan, CTA, SEO başlığı/açıklaması belgeden birebir.
   - Görsel dil: video (koyu sinematik + altın gradyan vurgu + italik serif giriş) + çatı krem/altın; marka sahnelerinde banner renkleri.
   - Konumlar: İnşaat **Antalya, 2010'dan beri**; Zeytin **Osmaniye üretim tesisi**.
   - **İddia kuralı:** "%100 organik / %100 doğal", ciro, proje adedi, sertifika, liderlik iddiası KULLANILMAZ (belge "Yayın öncesi kontrol"). Banner'daki "%100 Organik %100 Doğal" rozeti kullanılmaz.
   - Görsel/scroll motoru, logolar, iletişim, KVKK, SEO (belgedeki SEO başlıkları), Vercel task'larını buna göre yeniden sırala.
4. **ZEYTİN PLAN.md güncelle**: slogan **"Kökü toprakta. Yeri sofrada."** (alt: "Toprağın sunduğu lezzet, Afina'nın özeniyle."); mevcut "Köklerinden aldığı güçle büyüyor" ikincil/hikâye metni olarak kalabilir. Ürün kapsamı: sofralık zeytin, salamura zeytin, zeytinyağı; **perakende (site satışı) + toptan** ("Toptan Satış İçin İletişime Geçin" formu/CTA → task ekle). Osmaniye fabrikası "Tesisimiz" bölümü. SEO başlık/açıklama belgeden. Aynı iddia kuralı ("%100" iddiaları kullanılmaz). Ürün ≤6.
5. **Yeni task (her iki repoda, sıradaki numara): "Marka varlıkları"**
   - SVG'leri gerçek kırpılmış, optimize SVG'ye çevir (görünür alan dışındaki path'leri at, `svgo`), hedef her biri < 60 KB; PNG'den görsel karşılaştırma ile doğrula.
   - Koyu zemin varyantları: siyah yazılı logolar (topluluk, zeytin, motors wordmark) için fildişi #F5F1E7 / altın yazılı `-dark` sürümler.
   - `public/brand/` altına yerleştir, favicon/OG görseli (topluluk / zeytin amblemi) üret.
   - Kabul: `ls public/brand/*.svg` 6+6 dosya, her biri < 60 KB; `docs/referans/logolar/karsilastirma.png` kontrol şeridi.
6. **ZEYTİN "Fabrika görseli" task'ı**: 000'da yazıldıysa kaynağa "Osmaniye üretim tesisi" notunu ekle; yazılmadıysa oluştur.
7. İki repoda `CLAUDE.md` içindeki `codex exec --full-auto` geçen komutları `codex exec --skip-git-repo-check --approve-for-me -c sandbox_workspace_write.network_access=true` ile değiştir (bölüm 6 ve 7).
8. Her iki repoda commit `docs: resmi içerik + logolar + plan güncellemesi` → push main.

## Kabul kriterleri
- [x] `ls ~/PROJELER/AFINA-KURUMSAL/docs/referans/{icerik.md,video-metni.md,logolar}` var; ZEYTİN'de `docs/referans/{icerik.md,logolar}` var
- [x] `grep -c "Farklı sektörler. Ortak bir imza." ~/PROJELER/AFINA-KURUMSAL/docs/PLAN.md` ≥ 1
- [x] `grep -ci "çok yakında" ~/PROJELER/AFINA-KURUMSAL/docs/PLAN.md` ≥ 1
- [x] `grep -c "Kökü toprakta" ~/PROJELER/5F-ZEYTIN/docs/PLAN.md` ≥ 1
- [x] `grep -rn "Tuna" ~/PROJELER/AFINA-KURUMSAL/docs/PLAN.md ~/PROJELER/AFINA-KURUMSAL/docs/tasks` yalnız "kullanılmaz / açık karar" bağlamında
- [x] `grep -rn "%100" docs/PLAN.md docs/tasks` → yalnız "kullanılmaz" kuralı bağlamında (iki repo)
- [x] İki repoda da "Marka varlıkları" task'ı `## Durum: BEKLİYOR`
- [x] İki repo push'lu, `git status` temiz

## Yapılmaması gerekenler
- Uygulama kodu, npm install
- Resmi belge metinlerini yeniden yazma/uydurma (yalnız biçim düzeltmesi)
- `AFINA-KAYNAK` (salt okunur), `~/Downloads` veya başka repoya yazma

## Coder Notu

- 19 Ekim 2026: iki reponun PLAN ve görev taslakları resmi Sürüm 2.0 içeriğine göre güncellendi. Kullanıcının 000b talimatı, bu görev için docs düzenleme ve iki repoda çalışma yetkisidir; uygulama kodu/deploy yapılmadı, npm install çalıştırılmadı.
- KURUMSAL: resmi PDF + tüm metnin Markdown eşleniği, altı PNG/SVG çifti + asıl logo PDF, video metni + 8 referans kare yerleştirildi. ZEYTİN: yalnız 01+04 metni, zeytin/topluluk PNG/SVG + asıl PDF yerleştirildi. Kaynakta olmayan 08 bölümü üretilmedi. Video dosyası kopyalanmadı/oynatılmadı; video metninin eski ad/sırası yerine PLAN'daki resmi içerik kararı uygulanır.
- Yeni BEKLİYOR görevler: KURUMSAL 029 Marka varlıkları + 030–034 beş ayrı detay sayfası; ZEYTİN 080 Marka varlıkları + 081 toptan formu + 082 gönderim entegrasyonu. İki marka görevi 6+6 optimize normal/dark SVG, dosya başına <60 KB, PNG karşılaştırma şeridi, favicon/OG kabulü içerir. ZEYTİN 080'de eksik dört logo referansı salt okunur kaynaktan kendi reposuna alınacaktır. Bu görevde SVG optimizasyonu/görsel üretimi yapılması istenmedi; bu işler BEKLİYOR kalır.
- ZEYTİN 004/005 tesis görseli görevlerine “Osmaniye üretim tesisi” kaynağı eklendi; gerçek tesis fotoğrafı ve görsel onayı bu görevlerin ayrı kapısıdır. 000 taslağında kalan eski rozet yönlendirmesi kullanılmaz kararıyla güncellendi. CLAUDE.md bölüm 6/7 komutları iki repoda istenen bayraklarla değiştirildi.

Komutla doğrulanan kabul sonuçları:

- `ls ~/PROJELER/AFINA-KURUMSAL/docs/referans/{icerik.md,video-metni.md,logolar}` ve ZEYTİN `ls docs/referans/{icerik.md,logolar}`: mevcut.
- KURUMSAL PLAN ana mesaj `grep -c`: **2**; `grep -ci "çok yakında"`: **13**. ZEYTİN PLAN `grep -c "Kökü toprakta"`: **1**.
- KURUMSAL PLAN/tasks eski ad `grep` sonuçları yalnız açık kullanılmaz kararı; iki repo PLAN/tasks iddia `grep` sonuçları yalnız kullanılmaz kuralı bağlamında. Python ile her eşleşen satır ayrıca denetlendi.
- Python karşılaştırması: resmi metin, yalnız sayfa üst/alt bilgisi ile Markdown biçimi/boşluklar ayrıldıktan sonra birebir. KURUMSAL hero, kurumsal tanıtım, beş hikâye/hizmet/CTA ve SEO alanları PLAN ile eşleşiyor. Kopyalanan tüm logo/PDF/video metni/kare dosyaları kaynakla byte eşit. Referans .gitattributes dosyaları PDF’leri binary işaretler; Illustrator içindeki kaynak boşlukları değiştirilmez.
- Python bağımlılık/bağlantı denetimi: KURUMSAL **34**, ZEYTİN **82** BEKLİYOR görev; eksik veya döngüsel bağımlılık yok, PLAN satır sırası topolojik, yerel task linkleri mevcut. İki CLAUDE.md'de eski komut yok ve yeni komut ikişer kez mevcut.
- AFINA-KAYNAK dosya listesi, SHA-256, boyut ve mtime_ns başlangıç kaydıyla aynı; kaynak salt okunur kaldı. Değişen dosyalar yalnız ilgili iki reponun docs/ ve CLAUDE.md kapsamındadır. `git diff --check` iki repoda başarılı. Uygulama manifesti/runtime kurulmadığından build/lint bu doküman görevine uygulanmaz.
- Bağımsız salt okunur doküman incelemesi tamamlandı; kalan somut eksik bulunmadı. Son yayın kontrolü: iki repoda `git push origin main`, ardından `git status --porcelain` ve `git ls-remote origin refs/heads/main` / yerel HEAD eşitliği ile doğrulanır.

Yapılamayan 000b adımı yok. Yeni uygulama/varlık görevleri bu görevin talep ettiği gibi BEKLİYOR durumundadır.

## Durum: TAMAMLANDI
