# 11 — PROJECTLAB | V1 KAPANIŞ & SÜRÜM YÖNETİMİ

**Durum:** FINAL / LOCKED  
**V1 sürümü:** `v1.0.0`  
**Platform:** Android  
**Dağıtım:** Kişisel APK  
**Package ID:** `com.projectlab.mobile`  
**Store yayını:** Kapsam dışı

---

## 11.1 — V1 Kapanış Kriterleri

ProjectLab V1; temel kişisel mod akışları, proje ekranları, öğrenme/ders/quiz akışları, profil, XP/seviye ve yerel veri kalıcılığı gerçek cihazda doğrulandığı için tamamlanmış kabul edilir.

V1 sonrasında yeni özellikler doğrudan `v1.0.0` içine eklenmez. Yeni çalışmalar sürüm kurallarına göre `1.0.x`, `1.x.0` veya `2.0.0` hattına alınır.

---

## 11.2 — Git Tag & Release Baseline

Resmî V1 etiketi:

`v1.0.0`

Git tag, ilk tamamlanmış ve gerçek cihazda doğrulanmış stabil V1 baseline’ını temsil eder.

Annotated tag standardı kullanılır. Bir kez oluşturulan sürüm etiketi başka commit’e taşınmaz ve yeniden kullanılmaz.

---

## 11.3 — Sürüm Numaralandırma Kuralları

Format:

`MAJOR.MINOR.PATCH`

- `1.0.x` → hata düzeltmeleri
- `1.x.0` → geriye uyumlu yeni özellikler
- `2.0.0` → büyük ürün, mimari veya veri modeli değişiklikleri

Sürüm numarası yalnızca gerçek dağıtılabilir sürüm oluştuğunda artırılır.

---

## 11.4 — APK Sürümleme & Android Version Code

V1:

- Version: `1.0.0`
- Git tag: `v1.0.0`
- V1 baseline versionCode: `1`

`versionCode` her yeni dağıtılan APK’da artar ve tekrar kullanılmaz.

Yeni sürüm sırası:

1. Version belirlenir.
2. `versionCode` artırılır.
3. APK üretilir.
4. Gerçek cihazda mevcut uygulamanın üzerine kurulur.
5. Veri kalıcılığı ve smoke test doğrulanır.
6. Ardından release commit/tag tamamlanır.

---

## 11.5 — Release APK İsimlendirme & Arşivleme

APK isim standardı:

`ProjectLab-v1.0.0.apk`

Sonraki sürümler aynı kalıbı izler.

Önerilen arşiv:

`ProjectLab-Releases/v1.0.0/`

Release APK’ları Git repository içine eklenmez; repo dışında arşivlenir.

Her release klasöründe kısa bir `RELEASE_NOTES.md` bulunabilir.

---

## 11.6 — Güncelleme ve Geri Dönüş Prosedürü

Normal güncelleme mevcut uygulamanın üzerine yapılır. Güncelleme sonrası XP, seviye ve diğer yerel veriler kontrol edilir.

Daha düşük `versionCode` taşıyan eski APK doğrudan kurulamayabileceği için uninstall son çaredir.

Gerekirse stabil eski kaynak koddan daha yüksek `versionCode` ile recovery build üretilir.

Eski Git tag’leri ve stabil APK’lar korunur.

---

## 11.7 — V1 Bilinen Sınırlar & Sonraki Sürüm Kuralları

V1 kişisel kullanım içindir ve store dağıtımı içermez.

V1 çekirdeği:

- Ana Sayfa
- Projeler
- Proje Detay
- Öğren
- Ders
- Quiz
- Profil
- XP / seviye
- Yerel veri kalıcılığı

Yeni fikirler önce bug fix, yeni özellik veya mimari değişiklik olarak sınıflandırılır; sonra uygun sürüm hattına alınır.

---

## 11.8 — Release Checklist

Bir sürüm STABLE kabul edilmeden önce:

- Version ve `versionCode` doğrulanır.
- Package ID değişmemiş olmalıdır.
- Build başarılı olmalıdır.
- Gerçek cihaz kurulumu yapılmalıdır.
- Ana akışlar smoke testten geçmelidir.
- XP/seviye ve yerel veri korunmalıdır.
- Upgrade testi yapılmalıdır.
- Kritik crash bulunmamalıdır.
- Yeni sürüme özgü değişiklikler test edilmelidir.
- Working tree temiz olmalıdır.
- `main = origin/main` olmalıdır.
- Stable olduktan sonra tag oluşturulmalıdır.
- APK standart adla arşivlenmelidir.
- Release notes hazırlanmalıdır.

Sonuç yalnızca `PASS` veya `FAIL` olarak kapanır.

---

## 11.9 — Release Notes & Changelog Standardı

Repository kökünde tek `CHANGELOG.md` tutulur.

Kullanılan başlıklar:

- Added
- Changed
- Fixed
- Removed
- Verified

Boş başlık eklenmez.

Tarih formatı:

`YYYY-MM-DD`

Changelog commit günlüğü değildir; yalnız release seviyesindeki anlamlı değişiklikleri içerir.

---

## 11.10 — V1 Final Release Uygulaması & Git Kapanışı

V1 kapanışı gerçek repository üzerinde tamamlandı.

Oluşturulan / dahil edilen dosyalar:

- `CHANGELOG.md`
- `docs/10_PROJECTLAB_ANDROID_APK_VE_CIHAZA_KURULUM_LOCKED_FINAL.md`
- `docs/11_PROJECTLAB_V1_RELEASE_NOTES_LOCKED_FINAL.md`

Final doğrulama:

- Tests: `22/22 PASS`
- Typecheck: `PASS`
- Lint: `NOT AVAILABLE`
- `main = origin/main`: `PASS`
- Working tree: `CLEAN`
- `v1.0.0` tag: `PASS`
- Release status: `STABLE`

Final release commit:

`ad9b6094941eaeccb32efc5191b9d607bd1dec3c`

`v1.0.0` tag aynı commit’i işaret eder.

---

## 11.11 — V1 Release Arşivi & Nihai Kapanış Kaydı

Resmî V1 referansı:

- Version: `v1.0.0`
- Status: `STABLE`
- Release commit: `ad9b6094941eaeccb32efc5191b9d607bd1dec3c`
- Git tag: `v1.0.0`
- Tests: `22/22 PASS`
- Typecheck: `PASS`
- Real device: `PASS`
- Upgrade / data persistence: `PASS`

Resmî APK dosya adı:

`ProjectLab-v1.0.0.apk`

Bu tag ve commit ProjectLab V1’in değişmez baseline referansıdır.

---

## 11.12 — Bölüm Nihai Kontrolü

`11.1–11.11` arasında alınan kararlar birbiriyle uyumludur.

V1 kapanışını engelleyen açık bir sorun bulunmamaktadır.

Bundan sonraki dağıtılabilir sürümlerde temel sıra:

`Build → gerçek cihaz testi → veri kalıcılığı → release checklist → commit/push → tag → APK arşivi`

Eski sürüm tag’leri yeniden kullanılmaz veya başka commit’e taşınmaz.

**11 — PROJECTLAB | V1 KAPANIŞ & SÜRÜM YÖNETİMİ → FINAL / LOCKED**
