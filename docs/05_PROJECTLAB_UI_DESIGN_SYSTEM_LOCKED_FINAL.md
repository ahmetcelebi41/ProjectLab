# 05 — PROJECTLAB | UI / DESIGN SYSTEM

**Durum:** FINAL / LOCKED  
**Proje:** ProjectLab

## 05.1 — Genel Görsel Yön
ProjectLab mobile-first, koyu temelli, modern ve profesyonel bir görsel sisteme sahip olacaktır. Büyük proje görselleri, temiz tipografi, kontrollü vurgu renkleri ve hafif mikro etkileşimler kullanılacaktır.

Kişisel Mod ve Portföy Modu aynı temel design system'i paylaşacaktır. Projeler kendi karakterlerini sınırlı accent renkleri ve görsellerle yansıtacak; ana ProjectLab kimliği değişmeyecektir.

Öncelik sırası:
**İçerik ve okunabilirlik → kullanılabilirlik → proje görselleri → mikro etkileşim → dekorasyon**

## 05.2 — Renk Sistemi
Ana palet:

- Background: `#0B0D10`
- Surface 1: `#11151A`
- Surface 2: `#171C22`
- Border: `#262D36`
- Text Primary: `#F4F7FA`
- Text Secondary: `#A7B0BC`
- Text Muted: `#737D89`
- Primary: `#7C5CFC`
- Primary Hover: `#8D72FF`
- Primary Active: `#6D4AE8`
- On Primary: `#FFFFFF`

Semantik renkler:

- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Info: `#38BDF8`

ELORA, NOVA, Moonphase ve gelecekteki projeler kendi accent renklerine sahip olabilir ancak uygulamanın ana temasını değiştiremez.

## 05.3 — Tipografi
Ana font: **Inter**

- Display: 36–40 px / 700
- H1: 32 px / 700
- H2: 26 px / 700
- H3: 22 px / 600
- H4: 18 px / 600
- Body Large: 16 px / 400
- Body: 14 px / 400
- Small: 13 px / 400
- Caption: 12 px / 500
- Button: 14 px / 600

Ağırlıklar `400 / 500 / 600 / 700` ile sınırlandırılır. Teknik metadata ve kod alanlarında sınırlı monospace kullanımına izin verilir.

## 05.4 — Spacing & Layout
4 px tabanlı ölçek:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

Mobil yatay padding varsayılanı `16 px`, geniş ekranlarda `20–24 px`.

- Content max-width: yaklaşık `1200 px`
- Okuma alanı: yaklaşık `720–800 px`
- Mobil: ağırlıklı 1 kolon
- Tablet/geniş ekran: içeriğe göre 2–3 kolon

Safe-area bölgeleri desteklenecektir.

## 05.5 — Radius, Border, Shadow & Surface
Radius sistemi:

`6 / 8 / 12 / 16 px / pill`

Standart kart radius'u: `12 px`.

Yüzey ayrımında background tonları ve `1 px` border önceliklidir. Ağır shadow kullanılmaz. Glassmorphism ana tasarım dili değildir.

## 05.6 — Buton & Etkileşim Kontrolleri
Buton türleri:

- Primary
- Secondary
- Ghost
- Destructive

Boyutlar:

- Small: 36 px
- Medium: 44 px
- Large / CTA: 48 px

Minimum mobil dokunma alanı yaklaşık `44 × 44 px`.

Durumlar:

`default / hover / active / focus-visible / disabled / loading`

Destructive stil yalnız gerçek riskli aksiyonlarda kullanılır.

## 05.7 — Form Sistemi
Standart kontrol yüksekliği `44 px`, önemli kontrollerde `48 px`.

Placeholder label yerine kullanılmaz. Önemli alanlarda görünür label bulunur.

Durumlar:

`default / focus / filled / disabled / error / success`

Mobilde uygun olduğunda karmaşık dropdown yerine segmented control, radio veya bottom sheet tercih edilir. Toggle yalnız gerçek açık/kapalı durumları için kullanılır.

## 05.8 — Kartlar & İçerik Bileşenleri
Temel kart türleri:

- Project
- Learning
- Quiz
- Progress
- Achievement
- Stat
- Content

Gerçek proje ekran görüntüleri önceliklidir. Badge ve metadata kullanımı sınırlı tutulur. Her içerik kart içine zorlanmaz.

## 05.9 — Navigasyon
Mobilde en fazla beş ana öğeli, ikon + label kullanan safe-area destekli bottom navigation kullanılacaktır.

Ana yapı:

- Ana Sayfa
- Projeler
- Öğren
- Portföy
- Profil

Root ve detay ekranları için sade üst barlar kullanılacaktır. Kişisel/Portföy modu toggle yerine uygun mod switcher ile yönetilecektir.

Geniş ekranlarda navigasyon sidebar veya üst navigasyona dönüşebilir; bilgi mimarisi değişmez.

## 05.10 — İkonografi & Görsel Dil
Tek ve tutarlı outline ikon ailesi kullanılacaktır.

Standart ikon boyutları:

`16 / 20 / 24 px`

Stroke yaklaşık `1.75–2 px`.

Lucide güçlü adaydır ancak kesin teknik dependency kararı geliştirme aşamasında verilecektir.

Ana görsel güç gerçek proje ekran görüntülerinden gelecektir. İllüstrasyon, gradient, blur ve glow yalnız destekleyici olarak kullanılacaktır.

## 05.11 — Motion & Mikro Etkileşim
Süre sistemi:

- Fast: 150–180 ms
- Standard: 220 ms
- Emphasis: 250–300 ms

Transform ve opacity önceliklidir. Büyük bounce, elastic ve ağır page transition kullanılmaz.

`prefers-reduced-motion` desteklenmesi zorunludur.

## 05.12 — Responsive Sistem
Mobile-first breakpoint seti:

`480 / 768 / 1024 / 1440 px`

Breakpointler cihaz adına değil içerik ihtiyacına göre kullanılacaktır.

Mobilde bottom navigation ve ağırlıklı tek kolon; geniş ekranlarda 2–3 kolon ve uygun navigasyon dönüşümü uygulanabilir.

Hover yalnız gerçek hover/pointer desteğinde çalışır.

## 05.13 — Erişilebilirlik
Hedef: **WCAG 2.2 AA**

Temel kurallar:

- Normal metinde en az 4.5:1 kontrast hedefi
- Görünür `focus-visible`
- Klavye navigasyonu
- Yaklaşık 44 × 44 px minimum etkileşim alanı
- Semantik form yapısı
- Ekran okuyucu desteği
- Anlamlı alt metinler
- Rengin tek başına bilgi taşımaması
- Reduced-motion ve metin ölçekleme desteği

Erişilebilirlik ile görsel tercih çelişirse erişilebilirlik önceliklidir.

## 05.14 — Ortak Durumlar
Ortak sistemler:

- Loading
- Skeleton
- Empty
- Error
- Success
- Toast / Snackbar
- Offline durumu

Skeleton mümkün olduğunca gerçek layout ölçülerini korur.

Hatalar bileşen, sayfa ve kritik uygulama seviyelerinde ele alınır. Kritik bilgi yalnız geçici toast mesajına bırakılmaz.

## 05.15 — Design Token Yapısı
Merkezi token grupları:

- Color
- Typography
- Spacing
- Radius
- Border
- Shadow
- Layout
- Motion
- Z-index

Tokenlar mümkün olduğunca semantik isimlendirilir. Yalnız tekrar eden ve sistemsel değerler tokenlaştırılır.

Z-index katmanları kontrollü tutulur:

`base → sticky/navigation → dropdown → overlay → modal → toast`

Ana tema **dark** olacaktır. Light theme V1 kapsamında değildir; token mimarisi gelecekte eklenmesine izin verecektir.

## 05.16 — Nihai Sistem Kararı
Bu doküman ProjectLab'in görsel ve etkileşimsel ana referansıdır.

Yeni ekran ve bileşenler bu sisteme uymalıdır. FINAL / LOCKED kararlar yalnız somut teknik gereklilik, erişilebilirlik problemi veya belirgin kullanılabilirlik sorunu ortaya çıkarsa yeniden değerlendirilir.

**05 — PROJECTLAB | UI / DESIGN SYSTEM: FINAL / LOCKED**
