# Task 003: Görsel aday ve onay kaydı

## Tür
frontend

## Amaç
Görsel üretimlerin kaynak, adaylık ve kullanıcı onayı kaydını kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 001 (bootstrap). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-design-direction, verification-loop
- 21st MCP: hayır
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `docs/gorsel-onay.md` (oluştur / düzenle)
- `public/images/generated/manifest.json` (oluştur / düzenle)
- `scripts/check-assets.mjs` (oluştur / düzenle)
- `tests/unit/asset-registry.test.ts` (oluştur / düzenle)
- `package.json` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. npm run check:assets komutu --id, --candidate ve --approved parametrelerini desteklesin; hash, dosya, oran, model, prompt ID, temsili etiketi, referans, kullanıcı karar tarihi/kaydı doğrulansın. Kamuya açık manifest kişisel veri içermesin. Onaysız dosya uygulama importuna giremesin. Video bu planın kapsamında değil.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/asset-registry.test.ts` onaysız kullanım, eksik dosya ve sahte onay durumlarını reddeder.
- [ ] `npm run check:assets -- --candidate` boş ilk manifesti güvenle doğrular; üretim veya API çağrısı yapmaz.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Boş, sürümlü manifest ve `docs/gorsel-onay.md` kayıt sözleşmesi oluşturuldu. `check:assets`, `--id`, `--candidate`, `--approved` seçeneklerini destekler; yalnız yerel dosya okur. Görsel üretimi, model/API çağrısı veya kullanıcı adına onay yapılmadı.
- Dosya/kaynak SHA-256, gerçek piksel ölçüleri ve oran, model, prompt ID, temsili etiketi, kullanıcı karar tarihi/referansı doğrulanır. Onay, ayrı karar kaydıyla kimlik/hash/tarih üzerinden eşleşir. Fazladan kamuya açık alanlar, kişisel iletişim bilgisi taşıyabilen model değerleri, symlink, kayıtsız çıktı ve belirsiz parametreler reddedilir.
- Uygulama kaynaklarında statik import, JSX/URL, CSS, JSON, template ve sabit birleştirme yolları taranır. Onaysız/kayıtsız görsel veya manifest kullanımı hata verir; ID/mod seçimi bütün kayıt ve runtime denetimini atlayamaz. P08–P12 onaylansa bile runtime görseli olamaz. `predev` ve `prebuild` aynı korumayı çalıştırır.
- Sharp **0.35.5**, mevcut transitive sürümü korunarak doğrudan geliştirme bağımlılığına eklendi; bunun zorunlu eşliği olarak `package-lock.json` güncellendi. Paket/lock tutarlılığı doğrulandı. Yeni skill kurulmadı; görev gereği 21st kullanılmadı. UI/animasyon değişikliği olmadığı için rendered UI/viewport/erişilebilirlik kontrolü bu görevde uygulanabilir değil.
- Yerel karar tutarlılığı kontrolü, harici kullanıcı mesajının gerçekliğini tek başına kanıtlamaz; `evidenceRef` gerçek kullanıcı kararından kaydedilmeli ve incelenmelidir. Henüz gerçek aday veya kullanıcı onayı yoktur; manifest ve karar listesi boş bırakıldı. Testlerdeki görseller/kararlar yalnız `.cache/` altında geçici fixture'dır ve temizlenir.

### Komutla doğrulama — 19 Ekim 2026

| Kontrol | Sonuç |
| --- | --- |
| İlk RED: `npm run test -- tests/unit/asset-registry.test.ts` | Exit 1; `scripts/check-assets.mjs` henüz olmadığından suite kurulumu `Cannot find module` ile durdu; 45 test çalıştırılamadı. Checkpoint: `1cacc98`. |
| İlk GREEN: aynı komut | Exit 0, **45 test başarılı**. Uygulama checkpoint'i: `0143279`. |
| JSON regresyonu RED: aynı komut | Exit 1, **1 başarısız / 45 başarılı**; JSON'daki aday yolu yanlışlıkla geçiyordu. Checkpoint: `730459a`. |
| Son GREEN / birinci kabul: aynı komut | Exit 0, **46 test başarılı**; onaysız kullanım, eksik dosya ve sahte/uyuşmayan onay reddedildi. JSON düzeltmesi: `868a658`. |
| İkinci kabul: `npm run check:assets -- --candidate` | Exit 0, **0 görsel**, boş başlangıç manifesti güvenle geçti; üretim/API çağrısı yok. |
| `npm run check:assets -- --approved` | Exit 0, **0 görsel**; henüz onaylı varlık yok. |
| `npm run build` | Exit 0; önce `prebuild` varlık denetimi geçti, production build tamamlandı. |
| `npm run lint` ve `npm run typecheck` | Exit 0; lint uyarısı veya tip hatası yok. |
| `npm run test -- --coverage --coverage.include='scripts/check-assets.mjs' --coverage.include='app/**/*.{ts,tsx}'` | Exit 0, **53/53 test**. Doğrulayıcı statement **%93,71**, branch **%95,20**, function **%100**, line **%94,55**. CLI başarı/hata akışı ayrıca gerçek Node alt süreciyle test edildi. |
| `git diff --check 8a571e3` ve kapsam/gizli bilgi taraması | Başarılı; `_legacy/`, `docs/visual-prompts.md`, PLAN ve AGENTS değişmedi. İlgisiz dosya, gizli bilgi veya gerçek kişisel veri eklenmedi. |

Her iki kabul kriteri tamamlandı; uygulanamayan adım veya kalan engel yok.

## Durum: TAMAMLANDI
