> ONAY VERİLDİ (kullanıcı, 25 Eki 2026): "ok" + "Kart yerinde kalsın".

# Task 139: Hero ürün katmanı ince ayar (boyut, renk, kart boşluğu)

## Tür
frontend (yalnız CSS/token, yerel)

## Amaç
Task 138 ekran testinde masaüstünde iki sorun görüldü: teneke ve kavanoz sahneye göre büyük ve stüdyo ışıklı duruyor, "yapıştırılmış" hissi var. Kart yerinde kalacak; yalnız ürünler küçülüp sıcaklaşacak, kart biraz aşağı inecek.

## Kullanılacak araçlar
- `scroll-craft` (`references/hero-depth.md`), `frontend-design`. Coder Notu'na kısa skill tablosu.

## İstenen (yalnız `components/landing/SofraHero.module.css` ve gerekiyorsa `lib/ui-motion.ts`)
1. Masaüstü `.products`: `height: 44svh; width: 40svh` → `height: 38svh; width: 35svh`. Teneke/kavanoz oranı ve ortak taban aynı kalsın. `--table-contact` değişmez.
2. Renk: `.tin, .jar` filtresi `saturate(.94) brightness(.96) sepia(.06)` → `saturate(.86) brightness(.9) contrast(.96) sepia(.14)`. Etiket okunur kalmalı; beyaz alanlar parlamamalı.
3. Temas gölgesi biraz koyulaşsın: `.contactShadow` ilk durak `rgba(43,24,9,.48)` → `.58`, yüksekliği `8%` → `10%`.
4. Masaüstü kart: `.layout` alt boşluğu `56px` → `32px` (kart aşağı iner, ürünlerin daha çoğu görünür). Mobil (≤ 900 px) kurallarına dokunma.
5. Mobilde yalnız madde 2 ve 3'teki renk/gölge değişikliği geçerli olsun (aynı seçiciler zaten ortak).

## Kabul kriterleri
- [ ] Yalnız yukarıdaki değerler değişti; mobil yerleşim, hareket, yükleme ve reduced-motion davranışı aynı.
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testi Claude'da.

## Yapılmaması gerekenler
- Görsel dosyalarına, kart içeriğine, metne, hareket değerlerine dokunma.
- `docs/tasks` içinde yalnız Coder Notu/Durum.

## Coder Notu

25 Ekim 2026:

| Skill / araç | Uygulama |
|---|---|
| `scroll-craft` + `references/hero-depth.md` | Mevcut katmanlar, ortak temas tabanı ve ayrı mobil kompozisyon korundu. |
| `frontend-design` | Yalnız görevde belirtilen boyut, filtre, gölge ve alt boşluk değerleri uygulandı. |
| 21st MCP | Bu oturumun erişilebilir araçlarında yok. Yeni bileşen eklenmedi; mevcut hero CSS'iyle sınırlı kalındı. |
| ECC kod incelemesi | Bağımsız, salt okunur incelemede değişiklik kapsamı ve aşağıdaki plan çelişkisi doğrulandı. |

- Runtime'da yalnız `components/landing/SofraHero.module.css` içindeki altı deklarasyon değişti. Mobil media kuralları, `--table-contact`, ürün oranları/ortak tabanı, yükleme kodu, reduced-motion kuralları ve hareket tokenları değiştirilmedi. Görsel dosyaları ve kart içeriği korundu.
- Komutla kaynak kabul kontrolü değişiklikten önce altı eski değerle RED, sonrasında GREEN verdi. PostCSS ile HEAD sürümünden yalnız izinli altı deklarasyon değiştirilerek beklenen dosya oluşturuldu; çalışma dosyasının tamamıyla birebir eşleştiği ve `lib/ui-motion.ts` farkının boş olduğu doğrulandı. Kalıcı test dosyası eklenmedi.

| Komut / kabul kanıtı | Sonuç |
|---|---|
| `npm test -- --maxWorkers=2 --reporter=dot` | PASS: 66 dosya, 1046/1046 test. |
| `npm run lint` | PASS, sıfır uyarı. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; prebuild varlık kontrolleri de geçti. |
| `npm run check:assets` | PASS: 18 kayıt, 112 v3 çıktı, 20 hero katmanı çıktısı. |
| Kaynak kapsam kontrolü ve `git diff --check` | PASS. |

**Plan çelişkisi / karşılanamayan amaç:** `.products` kapsayıcısı `38svh × 35svh` yapıldı; ancak `.tin` yüksekliği bağımsız `42svh`, `.jar` yüksekliği bağımsız `28svh`. Bu nedenle istenen kapsayıcı değerleri gerçek teneke/kavanoz boyutlarını küçültmez; daralan kapsayıcı kavanozun konumunu ve ürünlerin örtüşmesini değiştirir. Gerçek küçültme için bu bağımsız yüksekliklerin veya ölçek ilişkisinin ayrıca planlanması gerekir. Görev “yalnız yukarıdaki değerler” dediğinden bunlara müdahale edilmedi.

Ayrıca ürün hareketindeki `%14` translateY kapsayıcı yüksekliğine bağlıdır: hareket tokenı değişmese de masaüstü son konumdaki düşey mesafe `44svh × .14 = 6.16svh` yerine `38svh × .14 = 5.32svh` olur. Bu, istenen yükseklik değişikliği ile “hareket davranışı aynı” kabulünün çeliştiği ikinci noktadır. Mobil kapsayıcı ölçüleri ve hareketi değişmedi.

**Claude doğrulayacak:** masaüstü/mobil renk ve etiket okunurluğu, beyaz alanların parlamaması, gölgenin masa teması ve kart boşluğunun görsel sonucu. AGENTS.md gereği Playwright, Lighthouse, inspect veya ekran görüntüsü çalıştırılmadı. BEKLİYOR nedeni tarayıcı kabulü değil, yukarıdaki koddan doğrulanan plan çelişkileridir.

## Durum: BEKLİYOR

## Düzeltme 139-1 (Claude, 25 Eki)
Haklısın, gerçek boyutlar `.tin`/`.jar` üzerinde. Plan güncellendi:
- Masaüstü `.tin { height: 42svh }` → `36svh`, `.jar { height: 28svh }` → `24svh`. Kapsayıcı `38svh × 35svh` kalır (kavanoz solda, tenekenin önünde hafif örtüşerek durur). Mobil `.tin`/`.jar` değerleri değişmez.
- Ürün hareketinin kapsayıcıya bağlı olarak 6.16svh → 5.32svh olması kabul; hareket tokenına dokunma.
- Bitince Durum'u TAMAMLANDI yap.
