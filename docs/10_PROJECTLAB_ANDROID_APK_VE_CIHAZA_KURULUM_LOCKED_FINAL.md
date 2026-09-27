# 10 — PROJECTLAB | ANDROID APK & CİHAZA KURULUM

**Durum:** FINAL / LOCKED  
**Tarih:** 27 Eylül 2026

## 10.1 — Amaç

ProjectLab V1 uygulamasını Expo Go bağımlılığından çıkarıp Android cihazda bağımsız çalışan bir APK olarak üretmek, kurmak ve gerçek cihaz üzerinde doğrulamak.

ProjectLab kişisel kullanım içindir. Google Play Store / App Store yayını bu kapsamın dışındadır.

## 10.2 — Android Uygulama Kimliği

Android package kimliği:

`com.projectlab.mobile`

Bu kimlik sabit tutuldu. Aynı package ve aynı imza zinciri sayesinde sonraki APK sürümleri mevcut ProjectLab kurulumunun üzerine güncelleme olarak kurulabilir.

## 10.3 — EAS Yapılandırması

Expo / EAS hesabı bağlandı ve ProjectLab EAS projesi oluşturuldu.

`app.json` EAS projesine bağlandı ve `extra.eas.projectId` oluşturuldu.

APK için `eas.json` içine dahili dağıtım profili eklendi:

- Profile: `apk`
- Distribution: `internal`
- Android build type: `apk`
- Credentials: remote / Expo sunucusu

Android keystore EAS tarafından oluşturuldu ve sonraki build'lerde aynı imza zinciri kullanıldı.

İlk APK yapılandırma commit'i:

`28fd95d — build: configure Android APK`

## 10.4 — Build Bağımlılıklarının Düzeltilmesi

İlk EAS build denemesi dependency resolution nedeniyle başarısız oldu.

Başlıca uyuşmazlıklar:

- React / React DOM sürüm uyumu
- React Native Reanimated
- React Native Worklets
- Expo SDK 57 bağımlılıkları

Bağımlılıklar Expo SDK 57 ile uyumlu hale getirildi.

Commit:

`d0fab84 — fix: align Expo SDK 57 dependencies`

Sonrasında `npm ci --include=dev --dry-run` başarılı oldu ve EAS Android build tamamlandı.

## 10.5 — İlk Bağımsız APK Kurulumu

EAS Android APK build başarıyla üretildi.

APK QR / EAS dahili dağıtım bağlantısı üzerinden Android cihaza indirildi.

Google Play Protect, Play Store dışından gelen dahili APK olduğu için uyarı gösterdi. Uygulama kullanıcının kendi EAS build'i olduğu doğrulandıktan sonra kurulum tamamlandı.

ProjectLab, Expo Go olmadan bağımsız uygulama olarak açıldı.

## 10.6 — Standalone Gerçek Cihaz Smoke Testi

Gerçek cihazda aşağıdaki temel akışlar doğrulandı:

- Ana Sayfa
- Projeler
- Öğren
- Profil
- Proje detayları
- Ders ekranı
- Quiz
- Quiz sonucu
- XP / seviye sistemi
- Uygulama kapatılıp yeniden açıldığında veri kalıcılığı

### 10.6.1 — Proje Detay Çift Header Düzeltmesi

Proje detaylarında hem üst `Proje` header'ı hem de iç ekran header'ı aynı anda görünüyordu.

Kök neden nested stack yapısıydı.

`app/(tabs)/projects/_layout.tsx` içinde `[projectId]` üst route header'ı kapatıldı.

Commit:

`0f9bac1 — fix: remove duplicate project header`

Gerçek cihazda `Genel Bakış` ve `Yolculuk` ekranlarında tek header doğrulandı.

### 10.6.2 — Ders / Quiz Akışı

`Öğren → Konu → Quiz → Quiz Sonucu` akışı gerçek cihazda doğrulandı.

Kontroller:

- Tek ve doğru header
- Soru ve seçenek render'ı
- Doğru / yanlış cevap geri bildirimi
- 3 soruluk quiz ilerlemesi
- 2/3 doğru sonucu = %67
- İlk tamamlama ödülü = +10 XP

Profil ekranında XP'nin işlendiği doğrulandı.

### 10.6.3 — Veri Kalıcılığı

Uygulama tamamen kapatılıp yeniden açıldı.

`Seviye 2 / 10 XP` korunmaya devam etti.

Yerel ilerleme verisinin uygulama yeniden açılışında kalıcı olduğu doğrulandı.

### 10.6.4 — Projeler Ekranı Kart Yüksekliği

`Tümü` filtresinde yalnız NOVA görünüyormuş gibi davranıyor, diğer kartlar çok aşağı itilmiş ve büyük boş alan oluşuyordu.

Kök neden:

`ProjectsScreen.tsx` içindeki `projectCard` stilinde bulunan:

`height: '100%'`

Bu değer `flexWrap` grid içinde kartı aşırı uzatıyordu.

Yalnızca bu yükseklik kaldırıldı.

Commit:

`38a842e — fix: correct project card height`

Gerçek cihazda üç proje de görünür hale geldi:

- NOVA
- ELORA
- Moonphase

### 10.6.5 — NOVA Proje Durumu

ProjectLab içindeki NOVA durumu güncel gerçeklikle eşleştirildi.

Eski:

`in-progress`

Yeni:

`completed`

Commit:

`1f6da78 — fix: mark NOVA project completed`

Nihai proje dağılımı:

- Toplam: 3
- Devam Eden: 1 — Moonphase
- Tamamlanan: 2 — NOVA + ELORA

### 10.6.6 — Öğren Ekranı Kart Yüksekliği

Öğren ekranında son içerikten sonra çok büyük boş alan oluşuyordu.

Kök neden Projeler ekranındaki sorunla aynıydı:

`LearnScreen.tsx` içindeki `lessonCard` stilinde:

`height: '100%'`

Yalnızca bu değer kaldırıldı.

Commit:

`5988a5d — fix: correct learn card height`

Gerçek cihazda aşırı boş alanın kalktığı doğrulandı.

## 10.7 — APK Üzerine Güncelleme & Veri Koruma

Yeni APK, eski ProjectLab kaldırılmadan mevcut uygulamanın üzerine kuruldu.

Sonuç:

- Android uygulamayı güncelleme olarak kabul etti.
- Aynı package kimliği korundu.
- Aynı keystore / imza zinciri kullanıldı.
- Yerel ilerleme verisi silinmedi.
- Güncelleme sonrası `Seviye 2 / 10 XP` korundu.

Bu akış PASS / FINAL / LOCKED olarak doğrulandı.

## 10.8 — Son Sürüm Genel Kontrolü

Final APK üzerinde kritik akışlar doğrulandı.

Son Git kontrolü:

- Branch: `main`
- `origin/main` ile güncel
- Working tree clean
- Bekleyen commit yok

Final doğrulama çıktısı:

`nothing to commit, working tree clean`

## Nihai Sonuç

ProjectLab V1 artık Android cihazda:

- Expo Go olmadan bağımsız çalışıyor.
- APK olarak kurulabiliyor.
- Mevcut kurulumun üzerine güncellenebiliyor.
- Yerel XP / seviye ilerlemesini güncellemeler arasında koruyor.
- Ana navigasyon ve nested route yapıları gerçek cihazda doğrulandı.
- Proje, ders ve quiz akışları çalışıyor.
- Projeler ve Öğren ekranlarında bulunan yüzde yükseklik kaynaklı layout hataları giderildi.
- Proje durumları güncel gerçeklikle eşleştirildi.
- Git çalışma alanı temiz ve `main` güncel.

**10 — PROJECTLAB | ANDROID APK & CİHAZA KURULUM → FINAL / LOCKED**
