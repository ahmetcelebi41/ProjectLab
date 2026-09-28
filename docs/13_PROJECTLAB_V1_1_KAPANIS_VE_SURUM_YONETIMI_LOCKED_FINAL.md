# 13 — PROJECTLAB | V1.1 KAPANIŞ & SÜRÜM YÖNETİMİ

**Durum:** FINAL / LOCKED / STABLE  
**Resmî sürüm:** `v1.1.0`  
**Final commit:** `cd662d7cbdd1e0549612f345d4ad7d80b1fb5ea2`  
**Android versionName:** `1.1.0`  
**Android versionCode:** `2`  
**Package:** `com.projectlab.mobile`  
**Dağıtım:** Kişisel Android APK  
**Store yayını:** Kapsam dışı

---

## 13.1 — Release Özeti

ProjectLab V1.1, V1.0 temelini koruyarak ilerleme, öğrenme, quiz, proje detayları ve Ana Sayfa devamlılığını geliştiren kontrollü bir minor release olarak tamamlandı.

Temel Expo/React Native mimarisi, ana navigasyon, Android package, design system ve kişisel APK dağıtım modeli korunmuştur.

---

## 13.2 — Tamamlanan Geliştirmeler

### Progress & Kalıcılık
- V1.1 progress schema eklendi.
- `schemaVersion: 2` kullanıldı.
- Zustand persist envelope version `3` ile legacy migration tetiklendi.
- V1.0 verilerinin V1.1’e güvenli migration’ı eklendi.
- Ders tamamlama idempotent hale getirildi.
- Duplicate lesson XP engellendi.
- Konu ilerlemesi completed lessons üzerinden türetildi.
- `lastActivity` sistemi eklendi.

### Quiz
- Quiz attempt history eklendi.
- Stable `wrongQuestionIds` desteği eklendi.
- Full quiz ve retry attempt’leri ayrıldı.
- Optional `attemptType: full | retry` backward-compatible biçimde eklendi.
- Retry attempt’leri full quiz best/last score metriklerini etkilemiyor.
- Temel quiz XP yalnız ilk uygun completion’da veriliyor.
- Yanlışları tekrar çözme akışı eklendi.
- Quiz Sonuç Detayı ekranı eklendi.

### Öğren & Ders
- Ders tamamlandı durumu görünür hale getirildi.
- Konu ilerleme yüzdesi eklendi.
- “Dersi tamamla” davranışı progress store’a bağlandı.
- Quiz’e geçiş belirginleştirildi.
- Ders açılışı ve completion ayrı aktivite timestamp’leri kullanıyor.

### Ana Sayfa
- “Kaldığın Yerden Devam Et” eklendi.
- Lesson, quiz ve project aktiviteleri timestamp’e göre karşılaştırılıyor.
- Son aktivite kullanıcı dostu başlıkla gösteriliyor.
- XP / seviye ilerlemesi görünür hale getirildi.
- Son öğrenme özeti ve yeni kullanıcı empty state’i eklendi.

### Proje Detayı
ELORA, NOVA ve Moonphase için ortak veri modeliyle:
- Timeline
- Kilometre taşları
- Kullanılan teknolojiler
- “Bu Projede Ne Öğrendim?” bölümü

eklendi.

### Profil
- Toplam XP
- Mevcut seviye
- Sonraki seviyeye ilerleme
- Tamamlanan dersler
- Full quiz deneme sayısı
- En iyi full quiz skoru

görünür hale getirildi.

### UX
- Ders completion XP geri bildirimi
- Profil empty state’leri
- Küçük ekran profil yerleşimi
- Uzun metin wrap/shrink davranışı
- Perfect quiz sonucunda daha doğru birincil aksiyon

tamamlandı.

---

## 13.3 — Önemli Commitler

- `3c48acf971f9bcd13aee1624851426801f76a4cb` — V1.1 progress schema
- `8df50b9b6cd0d8617a925f8435fd1d96b0b6fb3d` — V1 → V1.1 migration
- `40de320553539c1c15f16264292bd6e554e23bfc` — progress services
- `bf4465fcf63886abdca61db2cece1b3b6cd14526` — quiz attempt logic
- `afb6923d3d0146ca2bfc1f05f7037ab8c473a646` — lesson progress UI
- `febb6e7b1a20ebb98e776545113f88660eee0a30` — quiz result & retry flow
- `741f411bc99e73cbf3e0120d791834d682ccfa80` — Home V1.1
- `6b5e18dbb8df2ef24ad79d966fb6cabccf2336ca` — project details
- `55d1e37062cd863f893467bf055e1548e4d68407` — profile progress
- `8365264610539a0fe01e879ddc1e13944189a2b3` — UX polish
- `849d40ac396acea2525af5b04696b17d083d6393` — V1 compatibility regression
- `cd662d7cbdd1e0549612f345d4ad7d80b1fb5ea2` — V1.1 Android release config / final HEAD

---

## 13.4 — Final Test Sonucu

- Unit/UI suite: **20/20 PASS**
- Test: **124/124 PASS**
- Typecheck: **PASS**
- `git diff --check`: **PASS**
- Lint: **NOT AVAILABLE**
- Working tree: **CLEAN**
- `main = origin/main`: **PASS**

V1 uyumluluk regression kapsamı:
- Android package kimliği
- Dört alt navigasyon sekmesi
- Nested route tek-header davranışı
- Portföy Modu route/navigasyon davranışı

---

## 13.5 — Android Release

### V1.1 Build
- EAS build ID: `c518dbfb-8474-4891-bbca-3d1508bed6c8`
- Durum: `FINISHED`
- Profil: `apk`
- Version: `1.1.0`
- versionCode: `2`
- Package: `com.projectlab.mobile`
- Mevcut remote EAS Android credential kullanıldı.
- Yeni keystore oluşturulmadı.

### V1.0 Kontrol Build
Gerçek upgrade testi için resmî `v1.0.0` tag’inden APK yeniden üretildi.

- Tag: `v1.0.0`
- Commit: `ad9b6094941eaeccb32efc5191b9d607bd1dec3c`
- Version: `1.0.0`
- versionCode: `1`
- Package: `com.projectlab.mobile`
- Aynı remote EAS credential kullanıldı.

---

## 13.6 — Gerçek Cihaz V1.0 → V1.1 Upgrade Testi

### V1.0 temiz başlangıç
- Seviye 1
- 0 XP
- 0 tamamlanan ders
- 0 tamamlanan quiz

### V1.0 kontrollü veri
1 ders + 1 quiz sonrası:
- Seviye 4
- 30 XP
- 1 tamamlanan ders
- 1 tamamlanan quiz

### V1.1 üzerine güncelleme sonrası
Hiçbir yeni işlem yapılmadan:
- Seviye 4
- 30 XP
- 1 tamamlanan ders
- 1 tamamlanan quiz

**V1.0 kullanıcı verisi eksiksiz korundu.**

### V1.1 yeni veri testi
Yeni ders sonrası:
- Seviye 6
- 50 XP
- 2 ders
- 1 quiz

Yeni quiz sonrası:
- Seviye 7
- 60 XP
- 2 ders
- 2 quiz

Uygulama tamamen kapatılıp yeniden açıldıktan sonra:
- Seviye 7
- 60 XP
- 2 ders
- 2 quiz

**V1.1 yeni progress verisinin kalıcılığı PASS.**

---

## 13.7 — Git & Tag Durumu

### V1.0
- Tag: `v1.0.0`
- Commit: `ad9b6094941eaeccb32efc5191b9d607bd1dec3c`

### V1.1
- Tag: `v1.1.0`
- Commit: `cd662d7cbdd1e0549612f345d4ad7d80b1fb5ea2`

`v1.0.0` tag’i değiştirilmedi.  
`v1.1.0` tag’i doğrulanmış final HEAD commit’ini göstermektedir.

---

## 13.8 — Release Kriterleri

- V1.0 → V1.1 migration PASS
- XP / level korunması PASS
- Ders progress korunması PASS
- Quiz progress korunması PASS
- Duplicate XP koruması PASS
- Full/retry quiz ayrımı PASS
- Ana Sayfa continue davranışı PASS
- Proje detayları PASS
- Profil progress görünürlüğü PASS
- Gerçek cihaz APK upgrade PASS
- Uygulama yeniden başlatma sonrası persistence PASS
- Otomatik testler PASS
- Typecheck PASS
- Git temizliği PASS
- Final tag PASS

---

## 13.9 — Nihai Karar

ProjectLab V1.1 resmî olarak:

**`v1.1.0` — STABLE / FINAL / LOCKED**

durumundadır.

V1.1 geliştirme hattı kapanmıştır. Bundan sonraki yeni özellik veya davranış değişiklikleri ayrı bir V1.2 planlama sürecinde ele alınmalıdır.
