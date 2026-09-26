# 02 — PROJECTLAB | HEDEFLER & KAPSAM

**Durum:** FINAL / LOCKED

## 02.1 — Ana Hedef
ProjectLab’in ana hedefi; gerçek yazılım projelerini klasik bir portföy listesinden çıkarıp, ziyaretçinin hem inceleyebildiği, hem geliştirme sürecini öğrenebildiği, hem de etkileşimli içeriklerle sürece katılabildiği mobil odaklı bir deneyime dönüştürmektir.

**Temel tanım:**
> ProjectLab = İnteraktif Portföy + Proje Yolculuğu + Öğrenme Deneyimi

ProjectLab bir proje yönetim aracı değildir. Jira/Trello benzeri görev takibi, ekip yönetimi ve issue yönetimi V1 kapsamı dışındadır.

## 02.2 — Hedef Kullanıcılar
ProjectLab üç ana kullanıcı grubunu hedefler:

- Portföyü inceleyen işveren, müşteri, geliştirici veya ziyaretçiler
- Yazılım geliştirme sürecini öğrenmek isteyen kullanıcılar
- İçerik sahibi ve proje üreticisi olarak uygulama sahibi

**V1 kullanıcı modeli:**
- Tek içerik sahibi
- Genel kullanıcılar salt okunur + etkileşimli ziyaretçi
- Kullanıcı hesabı, kayıt ve giriş sistemi yok

## 02.3 — V1 Ana Kapsamı
V1 ana modülleri:

- Ana Sayfa
- Projeler
- Proje Detayı
- Proje Yolculuğu
- Öğren / Bilgi Kartları
- Mini Quiz
- Profil / Hakkında

Ana deneyim:
> Ana Sayfa → Projeler → Proje Detayı → Proje Yolculuğu → Öğrenme → Mini Quiz → Profil

## 02.4 — V1 Başarı Kriterleri
ProjectLab V1 tamamlanmış sayılmak için:

- En az 3 gerçek proje içermeli: ELORA, NOVA ve Moonphase
- Her projede özet, teknoloji bilgileri, görseller ve proje yolculuğu bulunmalı
- En az bir projede bilgi kartları ve mini quiz tam çalışmalı
- Mobil kullanım akıcı ve anlaşılır olmalı
- Projeler arası gezinme tutarlı olmalı
- Canlı proje ve GitHub bağlantıları varsa doğru çalışmalı
- Yeni proje eklemek mevcut yapıyı bozmayacak kadar düzenli olmalı
- Temel deneyim üyelik veya zorunlu ücretli servis gerektirmemeli
- Yayına alınmış ve gerçek cihazdan erişilebilir bir V1 bulunmalı

Kullanıcı sayısı, indirme, gelir veya benzeri büyüme metrikleri V1 başarı kriteri değildir.

## 02.5 — V1 Kapsam Dışı Özellikler
V1’e dahil edilmeyecek başlıca özellikler:

- Kullanıcı kayıt / giriş sistemi
- Sosyal giriş
- Kullanıcı profilleri
- Kullanıcıların kendi projelerini eklemesi
- Yorum, beğeni, takip
- Mesajlaşma
- Takım / ekip yönetimi
- Görev ve issue takibi
- Gerçek zamanlı bildirim altyapısı
- Ücretli üyelik / ödeme
- Sertifika sistemi
- Uzun eğitim kursları
- Leaderboard
- Gelişmiş oyunlaştırma
- AI sohbet asistanı
- Karmaşık CMS / yönetim paneli

**Kapsam filtresi:**
> Bir özellik “projeyi keşfet → süreci gör → bir şey öğren” akışına doğrudan katkı sağlamıyorsa V1’e girmeyecek.

## 02.6 — Platform ve Dağıtım Kapsamı
V1 platform kararı:

- Android + iOS
- Tek kod tabanı
- Telefon odaklı mobil tasarım
- Tablet desteği responsive olabilir; ayrı tablet tasarımı yapılmaz
- Web sürümü V1 için zorunlu değildir

Uygulama yalnızca mobil web sitesi gibi hissettirilmemeli; geçişler, kart etkileşimleri, proje yolculuğu ve quiz deneyimi gerçek mobil uygulama hissi vermelidir.

## 02.7 — İçerik ve Veri Kapsamı
V1’de içerikler uygulamanın kendi kontrollü veri yapısından yönetilecektir.

- ELORA, NOVA ve Moonphase içerikleri yerel veri yapısında tutulur
- Harici CMS zorunlu değildir
- Gerçek zamanlı senkronizasyon yoktur
- GitHub’dan otomatik commit veya istatistik çekilmez
- Veri yapısı ileride API veya CMS’e taşınabilecek şekilde düzenli tasarlanır

**Temel karar:**
> V1’de dış servis bağımlılığı minimumda tutulacaktır.

## 02.8 — V1 Fonksiyonel Sınırlar
### Projeler
Proje listesi, kategori/teknoloji bilgileri ve proje detayına geçiş sağlar. Gelişmiş arama, karmaşık filtreleme ve kişiselleştirilmiş öneriler V1’de yoktur.

### Proje Detayı
Amaç, teknolojiler, öne çıkan özellikler, ekran görüntüleri ve varsa canlı proje/GitHub bağlantıları gösterilir. Kaynak kod tarayıcısı veya canlı kod editörü yoktur.

### Proje Yolculuğu
Önemli aşamalar kronolojik gösterilir. Tüm commit geçmişi değil, anlamlı kararlar ve dönüm noktaları sunulur.

### Öğrenme Alanı
Kısa teknik kavramlar ve projelerde gerçekten kullanılan yöntemler anlatılır. Genel amaçlı programlama kursuna dönüşmez.

### Mini Quiz
Kısa çoktan seçmeli sorular ve sonuç geri bildirimi içerir. Kalıcı skor veya leaderboard yoktur.

### Profil
Kısa tanıtım, kullanılan teknolojiler ve projelere genel bakış sunar. CV yönetim sistemi veya profesyonel sosyal ağ değildir.

**Genel kural:**
> Her modül tek bir ana işi iyi yapacaktır.

## 02.9 — V1 Kalite Hedefleri
ProjectLab V1:

- Mobil öncelikli
- Hızlı açılan
- Akıcı
- Görsel olarak tutarlı
- Erişilebilir
- Hata toleranslı
- Bakımı kolay
- Mümkün olduğunca ücretsiz / düşük bağımlılıklı

Animasyonlar yalnızca bilgi hiyerarşisini ve deneyimi desteklediği yerde kullanılacaktır.

**Kalite prensibi:**
> Hızlı, sade, görsel olarak güçlü ve akıcı bir mobil deneyim; gösteriş uğruna kullanılabilirlik veya performanstan ödün verilmeyecek.

## 02.10 — Gelecek Sürümler İçin Açık Alanlar
V2+ adayları:

- GitHub API entegrasyonu
- Commit ve gelişim istatistikleri
- CMS / yönetim paneli
- Web sürümü
- Kullanıcı hesapları
- Quiz ilerleme kaydı
- Rozet / başarı sistemi
- Gelişmiş oyunlaştırma
- AI destekli anlatım / soru-cevap
- Push bildirimleri
- Proje favorileme
- Daha ayrıntılı öğrenme içerikleri
- Yeni proje ekleme sürecinin otomatikleştirilmesi

**Kural:**
> V2 özelliği, V1 tamamlanmadan mimariye zorla sokulmayacaktır.

## 02.11 — V1 Kapsam Önceliği
Öncelik sırası:

1. İçerik ve kullanılabilirlik
2. Öğretici deneyim
3. Görsel zenginlik

Zorunlu çekirdek:
- Ana Sayfa
- Projeler
- Proje Detayı
- Proje Yolculuğu
- ELORA, NOVA ve Moonphase içerikleri
- Mobil navigasyon
- Temel görseller ve teknoloji bilgileri

Gerektiğinde sadeleştirilebilecek alanlar:
- Gelişmiş animasyonlar
- Çok sayıda quiz
- Ek filtreler
- Fazla detaylı istatistikler
- Dekoratif efektler

## 02.12 — Nihai Kapsam Özeti
ProjectLab V1; Android ve iOS için tek kod tabanlı, telefon odaklı bir mobil uygulamadır. Ana değeri; gerçek projeleri sergilemek, proje geliştirme yolculuğunu görünür kılmak ve kısa öğretici içeriklerle ziyaretçiye etkileşimli bir deneyim sunmaktır.

V1’de kullanıcı hesabı, sosyal özellikler, ödeme, mesajlaşma, görev yönetimi, gelişmiş oyunlaştırma, AI asistanı, harici CMS ve GitHub API entegrasyonu bulunmaz.

**Bölüm durumu:** FINAL / LOCKED
