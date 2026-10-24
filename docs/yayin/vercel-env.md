# Vercel ortam değişkenleri

Bu projenin GitHub Actions akışı Vercel yapılandırmasını `vercel pull` ile alıp yerelde build eder. Production kapsamındaki `NEXT_PUBLIC_*` değişkenleri **encrypted** tipte olmalıdır; **sensitive** işaretlenmemelidir. Preview aynı build akışını kullanıyorsa aynı kural geçerlidir.

Sensitive değerler oluşturulduktan sonra okunamaz. Bu akışta `vercel pull` ile boş gelirler; Next.js `NEXT_PUBLIC_*` değerlerini build sırasında istemci JavaScript'ine gömdüğü için boş değerler dağıtıma taşınır. Sonradan yalnız runtime değerini düzeltmek yeterli değildir; doğru yapılandırmayla yeniden build ve deploy gerekir.

Özellikle `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` public istemci yapılandırmasıdır. Supabase `service_role`/secret anahtarı hiçbir zaman `NEXT_PUBLIC_*` adına konulmaz. `SUPABASE_SERVICE_ROLE_KEY`, PayTR ve e-posta sırları gibi sunucu-yalnız değişkenler sensitive kalabilir; pull kullanan yerel build veya çalışma zamanı ihtiyaçları ayrıca doğrulanmalıdır.

Değişiklik gerekiyorsa yetkili kişi Production/Preview hedeflerini ve yalnız değişken adlarını/tiplerini kontrol eder. Anahtar değerlerini terminale, loga, ekran görüntüsüne veya Git'e koymaz. Task 136 canlı Supabase/Vercel ayarlarını değiştirmez; `.env*` dosyalarını okumaz veya yazmaz.

Kaynaklar: [Vercel sensitive değişkenler](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [Next.js public değişkenlerin build sırasında gömülmesi](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser).
