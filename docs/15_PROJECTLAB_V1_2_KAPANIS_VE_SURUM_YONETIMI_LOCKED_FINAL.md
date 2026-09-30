# 15 — PROJECTLAB | V1.2 KAPANIŞ & SÜRÜM YÖNETİMİ

**Durum:** STABLE / FINAL / LOCKED
**Resmî sürüm:** `v1.2.0`
**Android versionName:** `1.2.0`
**Android versionCode:** `3`
**Package:** `com.projectlab.mobile`
**Dağıtım:** Kişisel Android APK
**Store yayını:** Kapsam dışı

---

## 15.1 — Release Özeti

ProjectLab V1.2, V1.1'de kurulan ilerleme ve kalıcılık altyapısını koruyarak öğrenme ilerlemesini, quiz performansını ve kişisel gelişimi daha görünür ve ölçülebilir hale getiren minor release olarak tamamlandı.

Sürüm; merkezi learning statistics selectorlarını, Profile analytics alanlarını, Öğren ekranında kategori ilerlemesini, Ana Sayfa öğrenme özetini ve tek recommendation davranışını, ayrıca Lesson / Quiz entegrasyonlarını kapsar. Yeni bir ağır veri katmanı kurulmadı; mümkün olan istatistikler mevcut kalıcı veriden türetildi.

---

## 15.2 — Tamamlanan V1.2 Kapsamı

### Learning statistics selectorları

- Tamamlanan ve toplam lesson değerleri
- Tamamlanan ve toplam quiz değerleri
- Lesson completion oranı
- Quiz attempt ve doğruluk metrikleri
- İlk deneme ve retry ayrımı
- Kategori bazlı lesson progress
- Son aktivite ve öneri üretimi
- Ekranlar arasında ortak, merkezi hesaplama semantiği

### Profile analytics

- Level, XP ve achievement görünümü korundu.
- Öğrenme özeti eklendi.
- Kategori ilerlemeleri görünür hale getirildi.
- Quiz performansı ve attempt bilgileri eklendi.
- Yeterli veri bulunmayan analizler için güvenli durumlar sağlandı.

### Learn category progress

- Kategori kartlarında tamamlanan / toplam lesson bilgisi eklendi.
- İlerleme yüzdesi ve progress bar eklendi.
- `Başlanmadı / Devam Ediyor / Tamamlandı` durumları eklendi.
- Lesson progress ile quiz performance ayrı metrikler olarak korundu.

### Home learning summary + tek recommendation

- Ana Sayfa'ya kısa learning summary eklendi.
- Level, XP, lesson ve quiz ilerlemesi özetlendi.
- Son aktivite görünürlüğü korundu.
- Aynı anda en fazla tek, uygulanabilir recommendation gösterildi.
- Ana Sayfa özet ve aksiyon; Profil analiz merkezi olarak tutuldu.

### Lesson / Quiz entegrasyonu

- Lesson completion, ortak V1.2 progress hesaplamalarına bağlandı.
- Tamamlanan lesson tekrar açılabilir; tekrar açma ek XP üretmez.
- Idempotent lesson completion ve duplicate XP koruması sürdürüldü.
- Full quiz ve retry attempt ayrımı korundu.
- Quiz sonuçları ilk deneme, mevcut deneme ve gelişim bilgileriyle entegre edildi.
- Retry işlemi ikinci kez temel quiz XP'si üretmez.

---

## 15.3 — Quiz Completion Semantiği

V1.2'nin canonical quiz completion kaynağı:

- **Canonical completion:** `quizzes[].completedAt`
- **Attempt / performance geçmişi:** `quizHistory`

`quizHistory`, quiz completion için tek başına canonical kaynak değildir. Attempt sayısı, full/retry ayrımı, skor, doğruluk ve performans analizi için kullanılır. V1.1 → V1.2 upgrade sırasında mevcut tamamlanma durumu `quizzes[].completedAt` üzerinden korunur; history verisi completion durumunun üzerine yazmaz.

---

## 15.4 — Regression, Persistence ve Upgrade

V1.2 kapanış kapsamındaki kontroller:

- Learning statistics selector testleri
- Profile, Home, Learn, Lesson ve Quiz UI/regression testleri
- Canonical quiz completion regression testleri
- Full quiz / retry attempt semantiği
- Duplicate XP koruması
- Persistence ve uygulamayı yeniden açma testi
- V1.1 → V1.2 veri upgrade testi
- Eski fixture ve gerçek cihaz state uyumluluğu
- V1 uyumluluk regression kapsamı

Tüm otomatik regression ve persistence kontrolleri PASS durumundadır.

---

## 15.5 — Gerçek Cihaz Referans Durumu

Gerçek cihaz V1.1 → V1.2 upgrade ve V1.2 QA sonucu **PASS**.

Doğrulanan referans veriler:

- Level: **13**
- XP: **120**
- Lessons: **3/3**
- Quizzes: **3/3**
- Achievements: **5/6**
- ELORA: **completed**
- NOVA: **completed**
- Moonphase: **in progress**

Uygulama tamamen kapatılıp yeniden açıldıktan sonra progress verisinin korunması doğrulandı. Persistence/reopen sonucu **PASS**.

---

## 15.6 — Final Test Sonucu

- Test suite: **22/22 PASS**
- Test: **161/161 PASS**
- Typecheck: **PASS**
- `git diff --check`: **PASS**
- Gerçek cihaz QA: **PASS**
- Persistence/reopen: **PASS**
- V1.1 → V1.2 upgrade: **PASS**
- Working tree (kapanış işlemi öncesi): **CLEAN**
- `main = origin/main` (kapanış işlemi öncesi): **PASS**

---

## 15.7 — Android Release APK

- EAS build ID: `705f7f8b-cf7b-4ab5-8201-b1ef7658c1ce`
- Build durumu: `FINISHED`
- Build profili: `apk`
- Version: `1.2.0`
- versionCode: `3`
- Package: `com.projectlab.mobile`
- APK build source commit: `dff0f2076988f268c323c21cbd196d49246fcca1`
- Arşiv adı: `releases/v1.2.0/ProjectLab-v1.2.0.apk`

Bu APK gerçek cihazda QA edilen fixed V1.2 artefaktıdır.

Build kaynak commit'i `dff0f20` sonrasında mevcut `main` commit'i `66dcc2846164c5eb15af4e6307b4fd73268c26a9` olmuştur. `66dcc` yalnızca test fixture ve test semantiği değişiklikleri içerir; production runtime kodunu değiştirmez. Bu test-only fark nedeniyle yeni APK build'i alınmamış, QA edilen `dff0f20` kaynaklı APK resmî V1.2 artefaktı olarak arşivlenmiştir.

`releases/` dizini Git tarafından ignore edilmeye devam eder; APK repository commit'ine eklenmez.

---

## 15.8 — Önemli Commitler

- `9dd212b6209a33992eb864e947d8336047523264` — V1.2 version / versionCode
- `88c0a50f48a46011bf9de5723d674dfb79434713` — learning statistics selectorları
- `e9126cc4383d6363704bd570caa1fb702558045e` — Profile analytics
- `ff0168ccbef4588205752f8cce06d6bab24d2197` — Learn category progress
- `6e89d7529bc250cefdea6b08ef5735f855b405d2` — Home learning summary ve recommendation
- `c0de634c4682bf0a2dbf2b325765f5fdf65c60ab` — Lesson / Quiz progress entegrasyonu
- `fd9e309a9039b8893776c5da1184b80b38898dfe` — V1.2 regression ve persistence testleri
- `dff0f2076988f268c323c21cbd196d49246fcca1` — canonical quiz completion düzeltmesi ve release APK kaynak commit'i
- `66dcc2846164c5eb15af4e6307b4fd73268c26a9` — gerçek cihaz state'iyle uyumlu test fixture/semantik güncellemesi; kapanış öncesi `main`

---

## 15.9 — Release Kriterleri

- V1.2 hedef ve kapsamı tamamlandı.
- Learning statistics selectorları tek hesaplama katmanında doğrulandı.
- Profile analytics PASS.
- Learn category progress PASS.
- Home learning summary ve tek recommendation PASS.
- Lesson / Quiz entegrasyonu PASS.
- Canonical quiz completion semantiği PASS.
- Regression ve persistence testleri PASS.
- V1.1 → V1.2 gerçek cihaz upgrade PASS.
- Gerçek cihaz QA PASS.
- Otomatik testler PASS.
- Typecheck PASS.
- Git whitespace kontrolü PASS.
- QA edilmiş APK arşivlendi.
- Final kapanış commit'i ve resmî tag oluşturuldu.

---

## 15.10 — Git & Tag Politikası

- Resmî tag: `v1.2.0`
- Tag, bu kapanış dokümanını içeren final kapanış commit'ini işaret eder.
- Kapanış commit'i `main` ve `origin/main` üzerinde aynı commit olarak tutulur.
- `v1.0.0` ve `v1.1.0` tag'leri değiştirilmez.

---

## 15.11 — Değişmez Release Kararları

- Production kodunda kapanışa özel değişiklik yapılmadı.
- Version ve versionCode değiştirilmedi.
- Yeni dependency eklenmedi.
- Yeni build başlatılmadı.
- QA edilen APK aynen korundu ve arşivlendi.
- Release sonrası yeni özellik veya davranış değişiklikleri yeni sürüm planlamasına bırakıldı.

---

## 15.12 — Nihai Karar

ProjectLab V1.2 resmî olarak:

**`v1.2.0` — STABLE / FINAL / LOCKED**

durumundadır.

V1.2 geliştirme ve release hattı kapanmıştır. Bundan sonraki production değişiklikleri ayrı bir sürüm kapsamında ele alınmalıdır.
