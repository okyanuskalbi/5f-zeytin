import React from 'react';
import { Clock, ShieldCheck, Thermometer, Wind, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Elle Erken Hasat',
    time: 'Ekim - Kasım',
    temp: 'Sabah Serinliği',
    desc: 'Zeytinlerimiz yere düşmeden, silkeleme makineleri ve el tırmıklarıyla hava alabilen delikli kasalara özenle toplanır. Dip zeytini asla kullanılmaz.',
    badge: 'Dip Zeytini Sıfır'
  },
  {
    step: '02',
    title: '4 Saatte Sıkıma Ulaşım',
    time: 'Maksimum 4 Saat',
    temp: 'Bahçeden Tesisimize',
    desc: 'Toplanan zeytinler bekletilip fermente olmasın diye en geç 4 saat içinde çiftliğimizin sıkım ünitesine getirilir, yapraklarından arındırılıp kaynak suyuyla yıkanır.',
    badge: 'Oksidasyonsuz Hız'
  },
  {
    step: '03',
    title: '24°C Kontrollü Soğuk Sıkım',
    time: '35 - 40 Dakika',
    temp: 'Maksimum 24°C',
    desc: 'Kapalı devre malaksörlerde hamurun sıcaklığı asla 24°C üzerine çıkarılmaz. Böylece taze çimen, çağla ve enginar kokusu ile yüksek polifenol uçup gitmez.',
    badge: 'Gerçek Soğuk Sıkım'
  },
  {
    step: '04',
    title: 'Azot Korumalı Tanklar',
    time: 'Sürekli Koruma',
    temp: '16°C - 18°C Sabit',
    desc: 'Elde edilen saf zeytinyağı, hava ve ışıkla teması kesilerek inert azot gazı basılı konik tabanlı paslanmaz çelik tanklarda dinlendirilir.',
    badge: 'Işık ve Hava Yok'
  },
  {
    step: '05',
    title: 'Siparişe Özel Şişeleme',
    time: 'Aynı Gün Hazırlık',
    temp: 'Koyu UV Cam / Laklı Teneke',
    desc: 'Önceden aylarca şişede bekletilmez. Siparişiniz geldiğinde tanktan taze taze çekilerek koyu renkli UV korumalı cam şişelere doldurulur ve adresinize kargolanır.',
    badge: 'Taptaze Dolum'
  }
];

export const HarvestJourney: React.FC = () => {
  return (
    <section id="harvest" className="py-20 bg-stone-100/70 border-b border-stone-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-lime-800">
            Daldan Şişeye Şeffaf Süreç
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Zeytinin Hakiki Yolculuğu
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            İyi bir zeytinyağı tesadüf değildir; zamanlama, hijyen ve ısı kontrolünün mükemmel uyumudur.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-3xl font-black text-lime-900/30 group-hover:text-lime-800 transition-colors">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-lime-50 text-lime-800 border border-lime-200 px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 space-y-1 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-lime-700 shrink-0" />
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{item.temp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Laboratory Quote & Certification */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-lime-900 text-lime-300 flex items-center justify-center font-bold text-2xl shrink-0">
            🌿
          </div>
          <div className="space-y-1 text-center md:text-left flex-1">
            <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900">
              5F Zeytin Saflık ve Asitlik Taahhüdü
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              Ürünlerimizde rafine yağ, pirina yağı, tohum yağı veya kimyasal esans kesinlikle yer almaz. 
              Her parti sıkım Türk Gıda Kodeksi Zeytinyağı Tebliği gereğince tescillidir.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-lime-800 bg-lime-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-lime-700" /> %100 Orijinal Ürün
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
