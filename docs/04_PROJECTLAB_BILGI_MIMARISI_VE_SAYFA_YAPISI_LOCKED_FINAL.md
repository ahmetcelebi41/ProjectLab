# 04 — PROJECTLAB | BİLGİ MİMARİSİ & SAYFA YAPISI

**Durum:** FINAL / LOCKED  
**Kapsam:** V1 bilgi mimarisi ve temel sayfa yapısı

## 04.1 — Ana Navigasyon Yapısı

ProjectLab iki ayrı kullanım bağlamına sahiptir: **Kişisel Mod** ve **Portföy Modu**.

### Kişisel Mod
Alt navigasyon:
- Ana Sayfa
- Projeler
- Öğren
- Profil

Quizler, Başarımlar ve Ayarlar ayrı ana sekmeler değildir; ilgili ana bölümlerin altında yer alır.

### Portföy Modu
Ana navigasyon:
- Ana Sayfa
- Projeler
- Hakkında

Kişisel Mod / Portföy Modu geçişi ayrı bir ana navigasyon sekmesi değildir. Modlar kendi amaçlarına göre ayrışır.

---

## 04.2 — Kişisel Mod Sayfa Haritası

### Ana Sayfa
Kişisel kullanımın başlangıç ekranıdır.

### Projeler
- Proje listesi
- Proje detayı
- Proje yolculuğu
- Yolculuk aşamaları

Başlangıç projeleri:
- ELORA
- NOVA
- Moonphase

Gelecekteki projeler aynı proje modeli altında eklenebilir.

### Öğren
- Öğrenme kategorileri / içerikleri
- Bilgi kartları
- Mini quizler

Öğrenme içerikleri gerçek projelerden üretilir; ProjectLab bağımsız bir genel kurs platformuna dönüşmez.

### Profil
- İlerleme
- XP
- Başarımlar
- Ayarlar

Her ekranın tek bir ana bilgi sahibi vardır. Bölümler arasında çapraz bağlantı kurulabilir ancak aynı işlev farklı yerlerde gereksiz yere çoğaltılmaz.

---

## 04.3 — Portföy Modu Sayfa Haritası

Portföy Modu, ProjectLab’in sade ve profesyonel proje sunum alanıdır.

### Ana Sayfa
- Kısa tanıtım
- Öne çıkan projeler
- Yetkinlik / teknoloji özeti
- Tüm projelere erişim

### Projeler
- Proje listesi
- Proje detayı
- Problem
- Çözüm
- Teknolojiler
- Geliştirme süreci
- Sonuç
- Öğrenilenler
- Varsa canlı demo
- Varsa kaynak kod bağlantısı

### Hakkında
- Kısa profil
- Çalışma yaklaşımı
- Ana teknolojiler
- İletişim / dış bağlantılar

Portföy Modunda kişisel ilerleme, XP, başarımlar, Profil ve Ayarlar gösterilmez. Öğrenme içerikleri yalnız proje bağlamında ikincil bağlantı olarak kullanılabilir; quizler Portföy Modunun ana bilgi mimarisinde yer almaz.

---

## 04.4 — Ana Sayfa Yapısı

### Kişisel Mod Ana Sayfası

Hiyerarşi:
1. **Karşılama**
   - Selamlama
   - Seviye / XP özeti
   - Portföy Moduna geçiş

2. **Devam Et**
   - Son proje aşaması, öğrenme kartı veya yarım kalan quiz içinden yalnız en anlamlı aktivite

3. **Öne Çıkan Proje**
   - Kapak
   - Proje adı
   - Kısa açıklama
   - İlerleme bilgisi
   - “Projeyi Aç” aksiyonu

4. **Bugün Keşfet / Öğren**
   - 1–3 öneri
   - Öğrenme kartı veya quiz

5. **İlerleme Özeti**
   - Proje aşaması
   - Öğrenme kartı ilerlemesi
   - Quiz performansı

Ana sayfa ağır bir dashboard olmayacaktır. Çok sayıda KPI, detaylı grafik, aşırı rozet veya istatistik kullanılmaz.

### Portföy Modu Ana Sayfası

Hiyerarşi:
**Kısa Tanıtım → Öne Çıkan Projeler → Teknolojiler / Yetkinlikler → Tüm Projeler**

---

## 04.5 — Proje Detay Sayfası Yapısı

Proje detayının üst alanında:
- Proje adı
- Kapak / proje görseli
- Kısa tanım
- Proje durumu
- Temel teknolojiler
- Varsa canlı proje bağlantısı
- Varsa kaynak kod bağlantısı

Proje içi ana navigasyon:
**Genel Bakış | Yolculuk | Öğren | Quiz**

### Genel Bakış
Projenin amacı, kapsamı ve ortaya çıkan sonuç.

### Yolculuk
Fikir → planlama → tasarım → teknik mimari → geliştirme → test → yayınlama gibi aşamalar.

### Öğren
Projede karşılaşılan önemli teknik ve tasarımsal konular.

### Quiz
Projeden üretilen kısa bilgi testleri.

Önemli kararlar ayrıca bağımsız bir ana sekme oluşturmaz; Yolculuk ve Öğren bölümlerinde bağlama göre gösterilir.

---

## 04.6 — Öğrenme İçeriği & Quiz Sayfa Yapısı

Temel akış:
**Proje → Öğren → Konu Detayı → Mini Quiz → Sonuç**

### Öğren
Kartlarda:
- Başlık
- Kısa açıklama
- Konu türü
- Yaklaşık süre

### Konu Detayı
- Başlık
- Kısa açıklama
- Gerçek projedeki kullanım
- Teknik açıklama
- Küçük örnek
- “Quiz’e Geç”

Teori mutlaka gerçek proje deneyimiyle ilişkilendirilir.

### Mini Quiz
V1:
- 3–5 soru
- Tek doğru seçenek
- Doğru / Yanlış

### Quiz Sonucu
- Doğru / toplam soru
- Doğru ve yanlış cevapların özeti
- Kısa açıklamalar
- Tekrar Dene
- Öğrenme İçeriğine Dön

V1’de bağımsız kurs kataloğu, sertifika sistemi, leaderboard, coin, mağaza veya ağır oyunlaştırma yoktur.

---

## 04.7 — Profil, İlerleme & Başarımlar

Hiyerarşi:
**Profil Özeti → İlerlemem → Başarımlar → Ayarlar**

### Profil Özeti
- Avatar / profil görseli
- Kullanıcı adı
- Kısa açıklama
- İncelenen proje sayısı
- Tamamlanan öğrenme içeriği
- Tamamlanan quiz
- Toplam XP

### İlerlemem
İlerleme proje bazında gösterilir. ELORA, NOVA, Moonphase ve gelecekteki projeler aynı yapı altında izlenir.

### Başarımlar
Başarımlar gerçek kullanım davranışlarından üretilir. Rozetler ana amaç değil, öğrenmenin yan ürünüdür.

### Ayarlar
- Görünüm / tema
- Gerektiğinde bildirim tercihleri
- Uygulama bilgileri
- Gizlilik / veri tercihleri
- Çıkış yap

---

## 04.8 — Sayfalar Arası Geçişler & Navigasyon Kuralları

- Ana navigasyon mantığı tutarlı kalır.
- Proje kartı doğrudan Genel Bakış bölümünü açar.
- Proje içi navigasyon: Genel Bakış | Yolculuk | Öğren | Quiz.
- Geri dönüş önceki seviyeye yapılır.
- Aynı öğrenme içeriğine farklı giriş noktalarından ulaşılabilir; içerik çoğaltılmaz.
- Mobilde uzun breadcrumb zincirleri kullanılmaz.
- Alt navigasyondan ana uygulama seviyesine dönüş kolay kalır.
- Derin bağlantılar kullanıcıyı doğru bağlama taşır.
- Bilgi mimarisi mümkün olduğunca **2–3 seviye** derinliği geçmez.

Örnek:
**Projeler → NOVA → Öğren → Design Token**

---

## 04.9 — Boş, Yükleniyor, Hata ve İlk Kullanım Durumları

### Yükleniyor
Tam ekran spinner yerine mümkün olduğunda içerik iskeleti (skeleton) kullanılır.

### Boş Durum
Sebep ve sonraki anlamlı adım gösterilir.

### Hata
Kısa, anlaşılır mesaj ve mümkünse **Tekrar Dene** aksiyonu sunulur. Teknik hata kodları doğrudan kullanıcıya gösterilmez.

### İlk Kullanım
Akış:
**Karşılama → ProjectLab’in kısa amacı → Projeleri Keşfet**

Uzun onboarding, hesap kurulum yükü veya tercih anketleri ilk açılışa eklenmez.

Veri yokluğu ile teknik hata birbirinden açık şekilde ayrılır.

---

## 04.10 — Responsive / Mobil Sayfa Davranışları

ProjectLab **mobile-first** tasarlanır.

- Ana navigasyon mobilde alt sekme çubuğudur.
- Proje içi sekmeler mobilde yatay / kaydırılabilir olabilir.
- Kartlar telefonda çoğunlukla tek kolondur.
- Geniş ekranlarda uygun yerlerde çoklu kolon kullanılabilir.
- Uzun içerikler doğal dikey kaydırma ile ilerler.
- Hover’a bağımlı etkileşim yoktur.
- Dokunma hedefleri yeterince büyüktür.
- Yatay kaydırma yalnız anlamlı bileşenlerde kullanılır.
- ProjectLab arayüzü masaüstü dashboard mantığına dönüştürülmez.
- Tablet ve geniş ekranlarda içerik genişleyebilir ancak navigasyon mantığı değişmez.

---

## 04.11 — Bilgi Mimarisi Nihai Kontrolü

04.1–04.10 kararları birlikte değerlendirildiğinde yapısal bir çelişki bulunmamaktadır.

Nihai mimari ilkeleri:
- Projeler uygulamanın merkezindedir.
- Öğrenme gerçek projelere bağlıdır.
- Profil kişisel ilerleme ve başarımları toplar.
- Portföy Modu profesyonel sunumu kişisel kullanım verilerinden ayırır.
- ELORA, NOVA, Moonphase ve gelecekteki projeler aynı temel proje modeli altında çalışır.
- V1 gereksiz sayfa, derin navigasyon ve kapsam şişmesinden korunur.

**04 — PROJECTLAB | BİLGİ MİMARİSİ & SAYFA YAPISI tamamlanmış ve FINAL / LOCKED kabul edilmiştir.**
