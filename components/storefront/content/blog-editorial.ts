/** Presentation-only reading aids, drawn from the existing four article bodies. */
export const blogEditorial: Record<string, { answer: string; headings: readonly string[]; faq: readonly { question: string; answer: string }[] }> = {
  "salamura-zeytin-nasil-hazirlanir": {
    answer: "Salamura zeytin, ayıklanan zeytinin tuzlu su içinde üreticinin belirlediği yöntemle hazırlanmasıyla elde edilir. Zeytinin çeşidi, olgunluğu ve hazırlama biçimi tadını ve dokusunu etkiler. Her çeşit için aynı süre ya da karışım geçerli değildir. Hazır ürün seçerken ambalajdaki hazırlama ve saklama bilgilerini birlikte okuyun; açıldıktan sonra üreticinin talimatlarını izleyin.",
    headings: ["Salamura hazırlığı nasıl başlar?", "Ayıklama ve temiz hazırlıkta nelere dikkat edilir?", "Salamurada lezzet nasıl oluşur?", "Ambalaj açıldıktan sonra ne yapılmalı?"],
    faq: [
      { question: "Salamura ne demektir?", answer: "Zeytinin tuzlu su içinde belirli bir üretim sürecinden geçirilmesidir." },
      { question: "Her zeytin aynı sürede mi hazırlanır?", answer: "Hayır. Çeşit, olgunluk ve üreticinin yöntemi hazırlama sürecini etkiler." },
      { question: "Açılan ürün nasıl saklanır?", answer: "Ürünün kendi ambalajındaki muhafaza talimatını izleyin. Açılmamış ve açılmış ürünün koşulları farklı olabilir." },
    ],
  },
  "kirma-zeytin-nedir-nasil-saklanir": {
    answer: "Kırma zeytin, meyvenin etli kısmı çatlatılarak hazırlanan sofralık zeytindir; çekirdeği genellikle içinde kalır. Bu işlem ürünün görünümünü ve dokusunu belirler. Saklama için kendi ambalajındaki açıklamaları izleyin, temiz bir gereçle yalnızca tüketeceğiniz miktarı alın. Ürünü başka bir kaba aktarırsanız etiketindeki muhafaza ve tüketim bilgilerini de erişilebilir tutun.",
    headings: ["Kırma adı hangi işlemi anlatır?", "Sofrada doku ve lezzet nasıl seçilir?", "Saklamada hangi ambalaj bilgileri izlenmeli?", "Günlük kullanıma uygun boy nasıl seçilir?"],
    faq: [
      { question: "Kırma zeytinin çekirdeği çıkarılır mı?", answer: "Etli kısım çatlatılır; çekirdek genellikle zeytinin içinde kalır." },
      { question: "Kavanoz mu, teneke mi seçilmeli?", answer: "Ambalaj boyunu tüketim sıklığınıza ve açılan ürünü saklayacağınız yere göre seçin." },
      { question: "Her kırma zeytin aynı şekilde saklanır mı?", answer: "Ürünün sıvısı ve ambalajı farklı olabilir. Her zaman elinizdeki ürünün kendi saklama açıklamalarını izleyin." },
    ],
  },
  "naturel-sizma-zeytinyagi-nasil-saklanmali": {
    answer: "Natürel sızma zeytinyağını, ambalajındaki talimatlara uygun biçimde ışık ve ısı kaynaklarından uzak tutun. Her kullanımdan sonra kapağını kapatın. Servis kabı kullanıyorsanız kabın temiz, kuru ve gıdayla temasa uygun olmasına dikkat edin. Ocak yanı ve güneş alan pencere önü yerine uygun bir dolap seçin; ürün bilgisini ambalajla birlikte saklayın.",
    headings: ["Saklama yeri seçerken nereden başlanmalı?", "Zeytinyağı ışık ve ısıdan nasıl korunur?", "Kapak ve servis kabı nasıl kullanılmalı?", "Ambalaj seçerken nelere bakılmalı?"],
    faq: [
      { question: "Zeytinyağı ocak yanında tutulur mu?", answer: "Isı kaynaklarının yanı yerine ürünün talimatlarına uygun, ışık ve ısıdan uzak bir yer seçin." },
      { question: "Kapak neden kapalı tutulmalı?", answer: "Kapağı kapatmak yağın havayla temasını sınırlar ve dökülmesini önlemeye yardımcı olur." },
      { question: "Servis şişesine yağ eklerken neye dikkat edilmeli?", answer: "Kabı temiz ve kuru tutun. Eski yağın üzerine sürekli yeni yağ eklemek yerine kabı düzenli olarak temizleyip kurutun." },
    ],
  },
  "sofralik-zeytin-secerken-nelere-dikkat-edilmeli": {
    answer: "Sofralık zeytin seçerken sevdiğiniz tat ve dokuyu, hazırlama biçimini ve tüketim sıklığınızı birlikte düşünün. Ürün adını, içindekileri, net miktarı ve üretici bilgisini okuyun. Ambalajın kapalı ve bütün olduğunu kontrol edin. Boy seçmeden önce açılan ürünü nerede saklayacağınızı planlayın; yalnızca fotoğrafa ya da ambalajın dış büyüklüğüne göre karar vermeyin.",
    headings: ["Sofradaki alışkanlıklar seçimi nasıl etkiler?", "Etikette hangi bilgiler birlikte okunmalı?", "Ambalaj boyu tüketime göre nasıl seçilir?", "Görünümden sonra hangi koşullara bakılmalı?"],
    faq: [
      { question: "Renk ve hazırlama biçimi aynı bilgiyi mi verir?", answer: "Hayır. Yeşil veya siyah olmasıyla kırma, çizik ya da salamura hazırlanması farklı özellikleri anlatır." },
      { question: "Büyük ambalaj herkes için uygun mudur?", answer: "Uygun boy tüketim sıklığına ve açılan ürünü saklama koşullarına bağlıdır." },
      { question: "Etikette hangi bilgiler incelenmeli?", answer: "Ürün adı, içindekiler, net miktar, üretici ve muhafaza açıklamalarını birlikte okuyun." },
    ],
  },
};
