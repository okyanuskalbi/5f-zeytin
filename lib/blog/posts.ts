export type BlogSection = Readonly<{
  heading: string;
  paragraphs: readonly string[];
  items?: readonly string[];
}>;
export type BlogPost = Readonly<{
  slug: string;
  title: string;
  excerpt: string;
  imageKey: "blog-salamura" | "blog-kirma" | "zeytinyagi-yatay" | "blog-sofra";
  date: string;
  updated: string;
  readingMinutes: number;
  category: "zeytin" | "kirma-zeytin" | "zeytinyagi";
  categoryHref: string;
  sections: readonly BlogSection[];
}>;

/** Original general guides; covers are the photographs approved on 12 Nov 2026 (lib/blog/cover.ts). */
export const blogPosts: readonly BlogPost[] = [
  {
    slug: "salamura-zeytin-nasil-hazirlanir",
    title: "Salamura Zeytin Nasıl Hazırlanır?",
    excerpt: "Zeytinin dalından sofraya uzanan geleneksel salamura yolculuğunu tanıyın.",
    imageKey: "blog-salamura", date: "2026-11-10", updated: "2026-11-11", readingMinutes: 4, category: "zeytin", categoryHref: "/?kategori=zeytin#urunler",
    sections: [
      {
        heading: "Dalından sofraya uzanan hazırlık",
        paragraphs: [
          "Kahvaltıda yediğimiz zeytin, toplandıktan sonra sofralık kullanıma uygun biçimde hazırlanır. Taze zeytinin kendine özgü belirgin acılığı vardır. Hazırlama yöntemleri bu tadın değişmesini ve seçilen çeşidin sofrada tüketilebilir hale gelmesini sağlar. Salamura da bu geleneksel yöntemlerden biridir.",
          "Salamura, zeytinin tuzlu su içinde belirli bir üretim sürecinden geçirilmesini anlatır. Kullanılan zeytin çeşidi ve olgunluk durumu, son ürünün lezzetini etkiler. Bu nedenle aynı isimle satılan ürünlerde bile doku, renk ve tat bakımından farklılıklar görülebilir.",
          "Üreticinin seçtiği yöntem, hazırlığın nasıl ilerleyeceğini belirler. Bütün zeytin, çizik zeytin ve kırma zeytin farklı hazırlıklarla ele alınabilir. Bir ürünü tanımak için ambalajdaki çeşidi ve hazırlama biçimini birlikte okumak, yalnızca rengine bakmaktan daha fazla bilgi verir.",
        ],
      },
      {
        heading: "Ayıklama ve temiz hazırlık",
        paragraphs: [
          "Hazırlık, toplanan zeytinlerin ayıklanmasıyla başlar. Üretime ayrılan meyveler gözden geçirilir ve seçilen yönteme göre hazırlanır. Bu aşama, ürünün görünümünü ve sonraki işlemlerin düzenini etkiler. Zeytinin toplandığı yer kadar, hasattan sonra nasıl ele alındığı da önem taşır.",
          "Zeytinlerin temizlenmesi ve uygun üretim kaplarına alınması, hazırlığın diğer parçalarıdır. Kullanılan kapların gıdayla temasa uygun olması gerekir. Evde yapılan uygulamalarla profesyonel üretim koşulları farklıdır. İnternette görülen bir karışımı, her zeytin çeşidi için geçerli bir tarif olarak değerlendirmemek gerekir.",
          "Hazır salamura zeytin alırken üretici bilgisi, ambalajın bütünlüğü ve etiketteki açıklamalar incelenebilir. Ürünün bütün, çizik ya da kırma olarak hazırlanması, sofrada beklenen dokuyu anlamaya yardımcı olur. Ambalaj boyunu seçerken evdeki tüketim alışkanlığını da düşünmek yararlıdır.",
        ],
      },
      {
        heading: "Salamurada lezzetin oluşması",
        paragraphs: [
          "Salamurada bekleme, üretim yönteminin bir parçasıdır. Zeytinin tadı ve dokusu bu süreçte değişir. Sürecin yönetimi, üreticinin kullandığı yönteme ve ürünün özelliklerine bağlıdır. Bütün zeytinler için aynı bekleme süresini varsaymak, çeşitler arasındaki farkları gözden kaçırmaya neden olabilir.",
          "Tat tercihi kişiden kişiye değişir. Bazı sofralarda daha belirgin zeytin tadı aranırken bazı sofralarda daha yumuşak bir tat tercih edilir. Seçim yaparken ambalajdaki ürün tanımına bakmak ve daha önce sevdiğiniz hazırlama biçimini hatırlamak işinizi kolaylaştırır.",
          "Bu süreci tanımak, sofralık zeytin çeşitlerini daha bilinçli karşılaştırmayı sağlar. Üreticiye soracağınız sorular da somutlaşır. Zeytinin çeşidi, hazırlanma biçimi ve açıldıktan sonraki saklama koşulları hakkında bilgi almak, yalnızca ambalajın ön yüzündeki ifadelerle karar vermekten daha açıklayıcıdır.",
        ],
      },
      {
        heading: "Ambalaj açıldıktan sonra",
        paragraphs: [
          "Hazır ürünün saklanmasında ambalaj üzerindeki talimatlar esas alınır. Açılmamış ürünle açılmış ürünün koşulları farklı olabilir. Etikette belirtilen muhafaza yöntemi ve tüketim bilgisi birlikte okunmalıdır. Ürünü başka bir kaba alırsanız bu bilgileri kaybetmemeye dikkat edin.",
          "Servis için temiz bir kaşık kullanmak ve yalnızca tüketilecek miktarı sofraya çıkarmak düzenli bir alışkanlıktır. Ürünün kendi sıvısının kullanımı konusunda üreticinin açıklamasını izleyin. Sofrada kalan zeytinleri ana ambalaja geri koymak yerine servis miktarını baştan ölçülü seçin.",
          "Zeytin çeşitlerini karşılaştırırken hazırlama biçimini ve ambalaj bilgisini birlikte değerlendirebilirsiniz. Sofranızda sevdiğiniz dokuyu bulduktan sonra, tüketiminize uygun bir boy seçmek daha kolay olur. Etiketi saklamak, ürünü açtığınızda ihtiyaç duyacağınız bilgilere yeniden ulaşmanızı da sağlar.",
        ],
        items: [
          "Ürün adını ve hazırlama biçimini ambalaj üzerinde birlikte okuyun.",
          "Ambalaj bütünlüğünü ve üretici tarafından verilen bilgileri kontrol edin.",
          "Açıldıktan sonraki saklama talimatını ürünü kullanmadan önce inceleyin.",
          "Servis için temiz bir gereç ve uygun bir kap kullanın.",
        ],
      },
    ],
  },
  {
    slug: "kirma-zeytin-nedir-nasil-saklanir",
    title: "Kırma Zeytin Nedir, Nasıl Saklanır?",
    excerpt: "Kırma zeytinin hazırlanışına ve sofranızdaki lezzetini korumaya dair sade bilgiler.",
    imageKey: "blog-kirma", date: "2026-11-10", updated: "2026-11-11", readingMinutes: 4, category: "kirma-zeytin", categoryHref: "/?kategori=kirma-zeytin#urunler",
    sections: [
      {
        heading: "Kırma adının anlattığı işlem",
        paragraphs: [
          "Kırma zeytin adını, meyvenin etli kısmının çatlatılarak hazırlanmasından alır. Bu işlemde zeytinin çekirdeği genellikle içinde kalır. Hazırlama biçimi, sofrada tanıdığımız görünümü ve dokuyu oluşturur. Ürün adındaki kırma ifadesi, zeytinin hangi yöntemle işlendiği hakkında başlangıç bilgisi verir.",
          "Kırma yöntemi çoğunlukla yeşil sofralık zeytinlerle ilişkilendirilir. Kullanılan çeşide ve üretim biçimine göre zeytinin büyüklüğü, tadı ve dokusu değişebilir. Bu farklılıkları değerlendirirken yalnızca görüntüyü değil, etiketteki ürün adını ve üreticinin verdiği açıklamaları da dikkate almak gerekir.",
          "Ellek zeytini ve geleneksel doğal kırma, AFİNA'nın ürün anlatımında yer alan başlıklardır. Bir ürün seçerken bu tanımları ambalaj bilgisiyle birlikte okuyabilirsiniz. Böylece sofrada aradığınız lezzet ile aldığınız ürünün hazırlama biçimi arasında daha açık bir bağ kurarsınız.",
        ],
      },
      {
        heading: "Sofrada doku ve lezzet tercihi",
        paragraphs: [
          "Kırma zeytinin etli kısmındaki açıklıklar, görünümünün doğal bir parçasıdır. Kahvaltıda sade olarak sunulabilir veya sofradaki diğer yiyeceklerle birlikte tüketilebilir. Servis tercihinde zeytinin kendi tadını önce tanımak, sonradan ekleyeceğiniz eşlikçilerin miktarına karar vermenizi kolaylaştırır ve seçimi kişisel hale getirir.",
          "Aynı sofrada farklı hazırlama biçimlerine yer veriyorsanız ürünleri ayrı kaplarda sunabilirsiniz. Bu düzen, her çeşidin tadını ve dokusunu ayırt etmeyi kolaylaştırır. Küçük servis kapları kullanmak, sofraya çıkarılan miktarı evdeki tüketim alışkanlığına göre ayarlamaya da yardımcı olur.",
          "Ambalaj seçerken yalnızca misafir sayısını düşünmek yeterli olmayabilir. Zeytini ne sıklıkla tükettiğiniz ve açılan ambalajı nasıl sakladığınız da seçimi etkiler. Günlük sofraya ayrılan bir kavanoz ile daha geniş tüketim için seçilen teneke farklı kullanım alışkanlıklarına karşılık gelir.",
        ],
      },
      {
        heading: "Saklamada ambalaj bilgisi",
        paragraphs: [
          "Hazır kırma zeytini saklarken öncelikle etiketini okuyun. Üreticinin açılmamış ambalaj için verdiği koşullarla açıldıktan sonraki açıklamalar ayrı olabilir. Ürünün bulunduğu sıvı ve kullanılan ambalaj da saklama biçimini etkileyebilir. Her ürün için aynı yöntemi varsaymadan kendi ambalajındaki bilgiyi izleyin.",
          "Ürünü başka bir kaba aktarmanız gerekiyorsa temiz ve gıdayla temasa uygun bir kap seçin. Etiketteki ürün ve saklama bilgilerini yeni kabın yanında tutun. Ambalajı değiştirmenin, üreticinin belirttiği tüketim ve muhafaza koşullarını değiştirmediğini günlük kullanım sırasında akılda tutmak yararlıdır.",
          "Servis sırasında kullanılan kaşığın temiz olması önemlidir. Ambalajın içinden yalnızca o öğünde tüketilecek kadar zeytin alın. Sofrada uzun süre beklemiş ürünü ana kaba geri eklemek yerine, bir sonraki serviste ihtiyacınız kadarını yeniden ayırmak daha düzenli bir kullanım sağlar.",
        ],
      },
      {
        heading: "Alışverişten günlük kullanıma",
        paragraphs: [
          "Yeni bir ürünü denerken sevdiğiniz hazırlama biçimini not etmek sonraki seçimleri kolaylaştırabilir. Kırma zeytin, çizik zeytin ve bütün zeytin tanımlarını karşılaştırın. Ambalajın ön yüzündeki fotoğrafın yanında içerik listesini, net miktarı ve üretici bilgisini de okumaya zaman ayırın.",
          "Etikette açıklanmayan bir noktayı ürünü aldığınız yere ya da üreticiye sorabilirsiniz. Açıldıktan sonra nerede saklanacağı ve servis öncesinde özel bir işlem gerekip gerekmediği, doğrudan ürünle ilgili sorulardır. Genel bir yazı, elinizdeki ambalaja ait açıklamaların yerine geçmez.",
          "Sofranıza uygun kırma zeytini seçmek, hazırlama biçimiyle günlük kullanımınızı birlikte düşünmekten geçer. Sevdiğiniz dokuyu bulduğunuzda ambalaj boyunu tüketiminize göre belirleyebilirsiniz. Böylece satın alma kararı, yalnızca raftaki görüntüye değil, evde ürünü nasıl kullanacağınıza da dayanır.",
        ],
        items: [
          "Kırma ifadesinin ürünün hazırlama biçimini anlattığını göz önünde bulundurun.",
          "Net miktarı evdeki tüketim sıklığıyla birlikte değerlendirerek boy seçin.",
          "Açılan ambalajın saklama açıklamalarını kullanım boyunca erişilebilir tutun.",
          "Sofraya yalnızca ihtiyacınız olan miktarı temiz bir gereçle çıkarın.",
        ],
      },
    ],
  },
  {
    slug: "naturel-sizma-zeytinyagi-nasil-saklanmali",
    title: "Natürel Sızma Zeytinyağı Nasıl Saklanmalı?",
    excerpt: "Işık, ısı ve havayla teması azaltarak zeytinyağını uygun koşullarda saklamak.",
    imageKey: "zeytinyagi-yatay", date: "2026-11-10", updated: "2026-11-11", readingMinutes: 4, category: "zeytinyagi", categoryHref: "/?kategori=zeytinyagi#urunler",
    sections: [
      {
        heading: "Önce etiketi ve mutfağınızı tanıyın",
        paragraphs: [
          "Zeytinyağını aldıktan sonra nereye koyacağınız, günlük kullanımın basit ama önemli bir parçasıdır. Mutfakta kolay erişilen her yer saklama için uygun olmayabilir. Ambalaj üzerindeki muhafaza açıklamalarını okumak, evde seçtiğiniz yerin ürün için uygun olup olmadığını değerlendirmenize yardımcı olur.",
          "Natürel sızma zeytinyağının kendine özgü koku ve tat özellikleri vardır. Bu özellikleri korumaya yönelik saklama alışkanlıklarında ışık, ısı ve havayla temas birlikte düşünülür. Ürünün kendi ambalajı ve üreticinin talimatları, bu konuda başvurulacak ilk bilgi kaynağıdır.",
          "Şişe ya da teneke seçerken tüketim sıklığınızı da hesaba katın. Sofrada kullanılan küçük bir şişeyle mutfak için ayrılan geniş ambalajın kullanım düzeni farklı olabilir. Hangi boyu seçerseniz seçin, ürüne ait etiketi ve saklama bilgisini ambalajla birlikte tutun.",
        ],
      },
      {
        heading: "Işık ve ısı kaynaklarından uzak bir yer",
        paragraphs: [
          "Zeytinyağını doğrudan güneş alan pencere önünde bırakmak yerine, ışık almayan uygun bir dolapta saklamayı değerlendirebilirsiniz. Şeffaf bir servis şişesi kullanıyorsanız kullanım sonrasında onu da korunaklı yerine kaldırın. Tezgâhın görünümü kadar, gün boyunca aldığı ışığı da düşünün.",
          "Ocak, fırın ve benzeri ısı kaynaklarının yanı, mutfakta sık kullanılan bir alan olabilir. Yağı kolayca uzanmak için bu noktada tutmak yerine daha uygun bir yer seçmek yararlıdır. Dolabın içinin de yakınındaki cihazların etkisiyle ısınıp ısınmadığını günlük kullanımda gözlemleyin.",
          "Saklama yerini sık sık değiştirmek yerine, ürün için uygun ve düzenli kullanabileceğiniz bir alan ayırın. Ambalajı kapalı tutabileceğiniz dik bir yer seçmek dökülmeyi önlemeye de yardımcı olur. Üreticinin özel bir muhafaza açıklaması varsa bu bilgiye öncelik verin.",
        ],
      },
      {
        heading: "Kapak ve servis alışkanlığı",
        paragraphs: [
          "Yağı kullandıktan sonra ambalajın kapağını düzgünce kapatın. Kapağı açık bırakmak ürünün havayla temasını artırır. Dökme ağzında biriken yağı temizlerken ambalajın içine yabancı bir madde girmemesine dikkat edin. Günlük kullanımda küçük bir düzen kurmak bu adımları kolaylaştırır.",
          "Yağı ayrı bir servis kabına aktarıyorsanız kabın temiz, kuru ve gıdayla temasa uygun olduğundan emin olun. Önceki kullanımdan kalan yağın üzerine sürekli yeni yağ eklemek yerine, kabı düzenli olarak temizleyip tamamen kurutarak kullanıma hazırlamak daha açık bir takip sağlar.",
          "Geniş bir tenekeden servis şişesine aktarım yaparken yalnızca günlük kullanım düzeninize uygun miktarı ayırın. Ana ambalajı yeniden kapatıp uygun yerine kaldırın. Aktarma sırasında ürünün etikette yer alan bilgilerini kaybetmeyin. Açılma zamanını takip etmek de tüketim düzenini planlamayı kolaylaştırabilir.",
        ],
      },
      {
        heading: "Ambalajı seçerken ve kullanırken",
        paragraphs: [
          "Alışveriş sırasında ambalajın kapalı ve bütün olduğunu kontrol edin. Ürün adı, net miktar ve üretici bilgisi, farklı seçenekleri karşılaştırırken birlikte okunmalıdır. Ambalajdaki renk ya da tasarım tek başına saklama koşullarını anlatmaz. Etiketin arka yüzündeki açıklamalara da bakın.",
          "Zeytinyağının görünümü ve rengi ürünler arasında değişebilir. Alışveriş kararını yalnızca renge dayandırmak yerine ürünün tanımını ve kullanım amacınızı değerlendirin. Sofrada ya da mutfakta nasıl kullanacağınızı bilmek, seçtiğiniz ambalaj boyunun günlük düzeninize uygun olmasına yardımcı olur.",
          "Evde uygun bir yer ayırmak, kapağı kapatmak ve servis kabını temiz tutmak birlikte sürdürülebilecek alışkanlıklardır. Elinizdeki ürüne özel bir sorunuz olduğunda üreticinin açıklamalarına başvurun. Böylece genel saklama bilgisini, satın aldığınız zeytinyağının kendi ambalajındaki bilgilerle birlikte değerlendirmiş olursunuz.",
        ],
        items: [
          "Ambalajın üzerindeki muhafaza açıklamasını ürünü açmadan önce okuyun.",
          "Işık ve ısı kaynaklarından uzak, uygun bir saklama yeri seçin.",
          "Her kullanımdan sonra kapağın düzgün kapandığını kontrol edin.",
          "Servis kabını temiz ve kuru tutarak ürün bilgisini koruyun.",
        ],
      },
    ],
  },
  {
    slug: "sofralik-zeytin-secerken-nelere-dikkat-edilmeli",
    title: "Sofralık Zeytin Seçerken Nelere Dikkat Edilmeli?",
    excerpt: "Çeşit, ambalaj ve kullanım alışkanlıklarını birlikte değerlendiren bir seçim rehberi.",
    imageKey: "blog-sofra", date: "2026-11-10", updated: "2026-11-11", readingMinutes: 4, category: "zeytin", categoryHref: "/?kategori=zeytin#urunler",
    sections: [
      {
        heading: "Seçime sofradaki alışkanlığınızdan başlayın",
        paragraphs: [
          "Sofralık zeytin seçerken önce evde nasıl bir tat ve doku sevildiğini düşünmek yararlıdır. Kahvaltıda sade tüketilen zeytinle bir tarifte kullanılacak zeytinden beklenen özellikler farklı olabilir. Alışverişe bu soruyla başlamak, raftaki seçenekleri daha kolay karşılaştırmanızı sağlar.",
          "Yeşil zeytin ve siyah zeytin, sofralık ürünler arasında tanıdık başlıklardır. Bunların yanında kırma, çizik ve salamura gibi hazırlama biçimleri de görülür. Bu ifadeleri birlikte okumak gerekir. Ürünün rengiyle hazırlanma biçimi, seçim sırasında farklı bilgiler sunar.",
          "Daha önce sevdiğiniz bir zeytinin ambalajındaki ürün adını hatırlamak işinizi kolaylaştırabilir. Yalnızca kavanozun şeklini ya da fotoğrafını anımsamak yerine, çeşidini ve hazırlama yöntemini not edin. Böylece bir sonraki alışverişte benzer ürünleri daha somut özellikler üzerinden değerlendirebilirsiniz.",
        ],
      },
      {
        heading: "Etikette birlikte okunacak bilgiler",
        paragraphs: [
          "Ürün adı, içindekiler listesi, net miktar ve üretici bilgisi alışverişte incelenebilecek temel alanlardır. Ön yüzde yer alan kısa bir ifade, ürünle ilgili bütün bilgiyi taşımaz. Ambalajı çevirip açıklamaları okumak, satın alacağınız zeytinin hazırlanışını ve kullanımını anlamaya yardımcı olur.",
          "Aynı büyüklükte görünen ambalajların içerdiği ürün miktarı farklı olabilir. Bu nedenle karşılaştırmayı yalnızca kavanozun ya da tenekenin dış ölçüsüne göre yapmayın. Etiketteki miktar bilgisini ve varsa ürüne ilişkin diğer açıklamaları birlikte okuyarak ambalaj seçeneklerini değerlendirin.",
          "İçindekiler listesi, üründe kullanılan bileşenleri tanımak için başvuracağınız bölümdür. Kendiniz veya sofrayı paylaştığınız kişiler için belirli bir tercih varsa bu listeyi dikkatle inceleyin. Emin olmadığınız bir ifadeyi üreticiye sormak, ambalaj fotoğrafından tahmin yürütmekten daha açıklayıcı olur.",
        ],
      },
      {
        heading: "Ambalaj boyunu tüketimle eşleştirin",
        paragraphs: [
          "Zeytini ne sıklıkla tükettiğiniz, uygun ambalaj boyunu seçmenizi etkiler. Kalabalık sofralar için düşünülen bir boy, daha seyrek tüketilen bir evde aynı kullanım kolaylığını sağlamayabilir. Alışveriş kararını verirken açılan ürünü nerede ve nasıl saklayacağınızı da düşünün.",
          "Yeni bir çeşidi denemek istiyorsanız tüketim planınıza uygun bir ambalajla başlayabilirsiniz. Tadını ve dokusunu tanıdıktan sonra sonraki alışverişinizin boyunu yeniden değerlendirirsiniz. Bu yaklaşım, sofradaki tercihlerinizi keşfederken aynı zamanda mutfakta ayırdığınız alanı daha düzenli kullanmanıza yardımcı olur.",
          "Birden fazla çeşit alırken hepsini aynı anda açmanız gerekip gerekmediğini planlayın. Açılmamış ve açılmış ürünlerin muhafaza koşulları farklı olabilir. Her ambalajın kendi açıklamasını izleyin. Ürünleri servis kabına aktarırken etiket bilgilerini erişilebilir tutmak daha sonraki kullanımlarda da kolaylık sağlar.",
        ],
      },
      {
        heading: "Görünümden sonra kullanım koşullarına bakın",
        paragraphs: [
          "Alışverişte ambalajın kapalı ve bütün olmasına dikkat edin. Ürünün görünümünü değerlendirirken hazırlama biçimini de göz önünde bulundurun. Kırma zeytindeki açıklıklar ve çeşitler arasındaki renk farklılıkları, ürünleri yalnızca fotoğraf üzerinden karşılaştırmanın sınırlı olduğunu hatırlatır ve etiketi okumayı önemli kılar.",
          "Saklama koşullarını ürünü aldıktan sonra değil, seçim sırasında okumak faydalıdır. Böylece evde uygun bir yeriniz olup olmadığını önceden değerlendirebilirsiniz. Ambalajın açıldıktan sonra nasıl korunacağı ve üreticinin tüketimle ilgili açıklamaları, ürün boyu kadar alışveriş kararının da bir parçasıdır.",
          "Sofranıza uygun zeytini bulmak, beğendiğiniz tadı ürün bilgisiyle birlikte düşünmeyi gerektirir. Hazırlama biçimini tanımak, etiketi okumak ve tüketiminize uygun ambalaj seçmek bu kararı kolaylaştırır. Yeni bir ürün denediğinizde kendi tercihlerinizi not ederek sonraki alışverişinizde daha bilinçli bir seçim yapabilirsiniz.",
        ],
        items: [
          "Sevdiğiniz doku ve hazırlama biçimini alışveriş öncesinde düşünün.",
          "Ürün adıyla birlikte içindekiler ve net miktar bilgisini okuyun.",
          "Ambalaj boyunu tüketim sıklığınıza ve saklama alanınıza göre seçin.",
          "Üreticinin açıldıktan sonraki muhafaza açıklamalarını kullanım boyunca izleyin.",
        ],
      },
    ],
  },
];
