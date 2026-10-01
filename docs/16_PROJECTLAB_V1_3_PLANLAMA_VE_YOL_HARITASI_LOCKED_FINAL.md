# 16 — PROJECTLAB | V1.3 PLANLAMA & YOL HARİTASI

**Durum:** FINAL / LOCKED  
**Sürüm hedefi:** `v1.3.0`  
**Tema:** İlerleme, İstatistik ve Aktivite Deneyimi

---

## 16.1 — V1.3 Sürüm Hedefi

ProjectLab V1.3; V1.2'de oturtulan öğrenme, ilerleme ve proje takip altyapısını koruyarak uygulamayı daha kullanışlı, daha bilgilendirici ve günlük kullanımda daha değerli hâle getirecek bir geliştirme sürümüdür.

Temel ilkeler:
- V1.2'nin çalışan mimarisi korunur.
- Gereksiz büyük refactor yapılmaz.
- Veri migration riski minimumda tutulur.
- Yeni özellikler mevcut Zustand/persist yapısıyla uyumlu olur.
- Her özellik ayrı geliştirilebilir ve test edilebilir olur.
- Kişisel kullanım odağı korunur; mağaza yayını kapsam dışıdır.
- Release sonunda APK + gerçek cihaz QA + tag + kapanış dokümanı uygulanır.

Ana geliştirme eksenleri:
1. İstatistikler ve ilerleme görünürlüğü
2. Aktivite geçmişi
3. Öğrenme deneyiminin geliştirilmesi
4. Ana Sayfa'nın güçlendirilmesi
5. Profil ekranının ilerleme merkezi hâline getirilmesi

---

## 16.2 — V1.3 Kapsamı

### Dahil
- İstatistik ve ilerleme görünürlüğü
- Aktivite geçmişi
- Ana Sayfa özet alanlarının geliştirilmesi
- Profil ekranının ilerleme merkezi hâline getirilmesi
- Ders ve quiz ilerleme bilgilerinin iyileştirilmesi
- Mevcut XP, lesson progress, quiz history ve project progress verilerinin etkin kullanımı
- Gerekirse minimum veri şeması değişiklikleri
- Persist/migration uyumluluğu
- Unit/integration testleri
- Typecheck ve QA
- Gerçek cihaz testi
- Release APK
- `v1.3.0` sürümleme, Git tag ve kapanış dokümantasyonu

### Kapsam dışı
- Kullanıcı hesabı / login
- Cloud sync
- Harici backend / veritabanı
- Firebase / Supabase
- Çoklu kullanıcı
- Sosyal özellikler
- Push notification
- AI/LLM entegrasyonu
- Yeni ücretli servisler
- Google Play / App Store yayını
- Büyük navigasyon değişiklikleri
- Gereksiz UI redesign
- Büyük state-management refactor
- V1.2'de çalışan özelliklerin yeniden yazılması

**Prensip:** Yeni özellik mevcut mimariye uyuyorsa ekle; yalnız yeni özellik eklemek için mimariyi yeniden kurma.

---

## 16.3 — Özellik Listesi ve Önceliklendirme

### Must Have
- İstatistik özeti
- Aktivite geçmişi
- Profil geliştirmesi
- Ana Sayfa geliştirmesi
- Ders ve quiz ilerleme görünürlüğü

### Should Have
- Kategori bazlı ders ilerlemesi
- Quiz geçmişi özeti
- Son 7 gün aktivite metrikleri
- Son tamamlanan ders / son quiz sonucu
- Proje ilerleme özetleri

### Nice to Have
- Basit streak sistemi
- Haftalık aktivite özeti
- Küçük grafik / progress bar'lar
- Aktivite filtreleme
- Detaylı quiz performans geçmişi

**Not:** Streak, grafik ve gelişmiş filtreleme release blocker değildir.

---

## 16.4 — İstatistik Sistemi Tasarımı ve Veri Kaynakları

Ana veri kaynakları:
- XP / level
- lesson completion
- `quizHistory`
- `lastActivity`
- project progress
- kategori + tamamlanan ders eşleşmeleri

Türetilecek temel istatistikler:
- Toplam XP
- Mevcut seviye
- Tamamlanan ders / toplam ders
- Öğrenme tamamlanma yüzdesi
- Tamamlanan quiz
- Toplam quiz denemesi
- İlk deneme / retry ayrımı
- Doğru cevap oranı
- Tamamlanan / devam eden proje
- Son aktivite zamanı
- Son 7 gün anlamlı aktivite sayısı

**Karar:** İstatistiklerin çoğu persist edilmez; mevcut state'ten selector/helper ile hesaplanır.

---

## 16.5 — Aktivite Geçmişi Veri Modeli ve Event Sistemi

Önerilen event modeli:

```ts
type ActivityEvent = {
  id: string;
  type:
    | "lesson_completed"
    | "quiz_completed"
    | "quiz_retry"
    | "project_progress";
  entityId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
};
```

Kaydedilecek aktiviteler:
- Ders tamamlandı
- Quiz ilk kez tamamlandı
- Quiz retry tamamlandı
- Projede anlamlı ilerleme

Kurallar:
- Ders completion idempotent; duplicate event yok.
- Quiz retry yeni event oluşturabilir.
- Sadece ekran açma gibi düşük değerli ziyaretler kaydedilmez.
- Maksimum 100 event persist edilir.
- UI en yeni → en eski sıralar.
- `lastActivity` korunur ve ayrı amaçla kullanılmaya devam eder.

Yeni persist alanı:
```ts
activityHistory: ActivityEvent[]
```

---

## 16.6 — Aktivite Geçmişi UI/UX

Ana giriş:
**Profil → Son Aktiviteler → Tümünü Gör**

Profilde son 3–5 aktivite gösterilir; tam geçmiş ayrı child/detail ekranda açılır.

Aktivite satırı:
- ikon
- başlık
- ilgili ders / quiz / proje adı
- kısa ek bilgi
- zaman

Tarih gruplaması:
- Bugün
- Dün
- Son 7 Gün
- Daha Eski

Navigasyon:
- Ders → ders ekranı
- Quiz → quiz ekranı
- Proje → proje detayı

Geçersiz entity uygulamayı çökertmez; satır gösterilebilir, navigation devre dışı kalabilir.

---

## 16.7 — Ana Sayfa V1.3 Geliştirmeleri

Korunacak:
- mevcut Continue mantığı
- `lastActivity`
- project `lastVisitedAt`
- ders / quiz / proje önceliklendirmesi

Yeni alanlar:
- Genel ilerleme özeti
- Öğrenme ilerlemesi
- Son aktivite özeti
- Son 7 gün aktivite özeti

Önerilen hiyerarşi:
1. Karşılama / kullanıcı özeti
2. Devam Et
3. İlerleme Özeti
4. Öğrenme İlerlemesi
5. Son Aktivite
6. Mevcut diğer bölümler

---

## 16.8 — Profil Ekranı: İlerleme Merkezi

Korunacak:
- Seviye
- XP
- Başarımlar
- Mevcut profil yapısı

Yeni bölümler:
- Genel istatistikler
- Öğrenme ilerlemesi
- Proje ilerlemesi
- Son aktiviteler
- Tüm aktiviteleri görüntüleme

Kategori bazlı ilerleme:
- UI/UX
- Frontend
- Backend
- DevOps

Profil detaylı ilerleme merkezi; Ana Sayfa ise hızlı özet / devam et merkezi olacaktır.

---

## 16.9 — Öğrenme & Quiz Deneyimi

Öğren ekranında:
- Tamamlanan / toplam ders
- Kategori ilerleme yüzdesi
- Son tamamlanan ders
- Sıradaki ders

Quiz tarafında:
- Doğru / toplam soru
- Başarı oranı
- Deneme türü
- İlk sonuç / retry ayrımı
- Kısa geçmiş

XP kuralı:
> XP yalnız ilk geçerli completion sırasında kazanılır.

Quiz başarı oranı:
> Tüm kaydedilmiş denemelerdeki toplam doğru cevap / cevaplanan toplam soru

Event eşleşmeleri:
- İlk completion → `quiz_completed`
- Retry → `quiz_retry`
- Ders completion → `lesson_completed`

---

## 16.10 — Streak ve Haftalık Aktivite

### Kapsam dışı
- Günlük streak
- En uzun streak
- Freeze / telafi
- Günlük hedef sistemi

### Dahil
- Son 7 gün aktivite özeti

Hesaplanacak:
- Toplam anlamlı aktivite
- Tamamlanan ders
- Quiz denemesi
- Proje ilerleme event'i

7 günlük mini grafik: **Nice to Have**

---

## 16.11 — Persist Schema, Migration ve Geriye Dönük Uyumluluk

Korunacak:
- XP
- Seviye
- Ders completion
- Quiz history
- Quiz completion
- Proje ilerlemeleri
- `lastActivity`
- Başarımlar

Yeni alan:
```ts
activityHistory: []
```

V1.3 öncesi geçmişe yapay event üretilmez; güvenilir timestamp yoksa geçmiş yalnız V1.3 sonrasında birikir.

Migration:
- Mevcut schema gerçek koddan doğrulanır.
- Yalnız gerekli version increment yapılır.
- Additive yaklaşım tercih edilir.
- Bozuk/eksik veri için güvenli fallback sağlanır.

Gerçek cihaz upgrade testi zorunludur.

---

## 16.12 — İstatistik Hesaplama Katmanı

İstatistikler saf fonksiyon / selector katmanında hesaplanır.

Örnek gruplar:
- `getLearningStats(...)`
- `getQuizStats(...)`
- `getProjectStats(...)`
- `getActivityStats(...)`
- `getCategoryProgress(...)`

Kurallar:
- UI hesap yapmaz, sonucu gösterir.
- Aynı metrik tek tanıma sahiptir.
- Zustand store'un tamamına gereksiz subscription yapılmaz.
- Erken optimizasyon yapılmaz.
- 100 event için basit `filter/reduce/map` yeterlidir.

Son 7 gün tanımı:
- Takvim günü bazlı son 7 gün
- cihazın yerel zamanı esas alınır

---

## 16.13 — Navigasyon, Route ve Ekran Değişiklikleri

Ana alt sekmeler korunur:
- Ana Sayfa
- Projeler
- Öğren
- Profil

Yeni tek gerekli route:
- Aktivite Geçmişi child/detail ekranı

Önerilen başlık:
**Aktiviteler**

Kurallar:
- Yeni alt sekme yok.
- Genel istatistikler için ayrı ekran yok.
- Quiz geçmişi için ayrı detay route zorunlu değil.
- Ders/quiz/proje event'leri mevcut route'lara gider.
- Geçersiz entity crash üretmez.
- Tek header gösterilir.
- Teknik route adı kullanıcıya görünmez.
- Typed routes korunur.

---

## 16.14 — Test Stratejisi ve Kabul Kriterleri

Yeni otomatik test alanları:
- Activity event üretimi
- Duplicate lesson event engeli
- Quiz retry event'i
- 100 event sınırı
- Son 7 gün hesabı
- Quiz başarı oranı
- Kategori ilerleme hesabı
- Project progress istatistikleri
- V1.2 → V1.3 migration
- Boş/eksik/bozuk veri fallback'i
- `lastActivity` korunması

Regresyon testleri:
- Continue
- Lesson completion
- Duplicate XP engeli
- Quiz full/retry
- Project detail
- Profil
- Öğren
- Typed navigation
- Persist yeniden açılış

Release blocker:
- Veri kaybı
- XP çift verilmesi
- Migration hatası
- Activity duplicate
- Continue regresyonu
- Yanlış istatistik
- Crash
- Persist kaybı
- Kritik cihaz UI/navigation sorunu

---

## 16.15 — Geliştirme Sırası ve Codex İş Paketleri

Sıra:
1. Mevcut V1.2 durumunu doğrula
2. Activity veri modeli
3. Persist schema & migration
4. Activity event entegrasyonu
5. İstatistik helper/selector katmanı
6. Profil V1.3 entegrasyonu
7. Aktivite Geçmişi ekranı
8. Ana Sayfa V1.3 entegrasyonu
9. Öğren & Quiz geliştirmeleri
10. Nice to Have değerlendirmesi
11. Tam otomatik QA
12. Gerçek cihaz upgrade QA
13. Release hazırlığı

Kritik sıra:
> Schema → migration → event sistemi → stats helpers → UI → QA → build

Her ana iş paketi ayrı Codex sohbetinde yürütülecek.

---

## 16.16 — Release, Sürümleme ve Kapanış Stratejisi

Resmî sürüm:
**`v1.3.0`**

Release öncesi zorunlu:
- Tests PASS
- Typecheck PASS
- `git diff --check` PASS
- Working tree CLEAN
- `main = origin/main`
- Migration PASS
- Upgrade QA PASS
- Clean install PASS
- Device UI QA PASS
- Release APK VERIFIED

APK arşivi:
```text
releases/
  v1.3.0/
    ProjectLab-v1.3.0.apk
```

`releases/` Git ignore politikası korunur.

Kapanışta ayrı ayrı kaydedilir:
- Release commit
- APK build source commit

Numaralandırma:
- 16 — V1.3 Planlama & Yol Haritası
- 17 — V1.3 Codex & Geliştirme
- 18 — V1.3 Kapanış & Sürüm Yönetimi

Kapanış dokümanı:
`18_PROJECTLAB_V1_3_KAPANIS_VE_SURUM_YONETIMI_LOCKED_FINAL.md`

---

## 16.17 — Riskler, Geri Alma Planı ve Koruma Kuralları

Ana riskler:
- Veri kaybı
- Migration hatası
- Duplicate event
- Retry'de tekrar XP
- İstatistik tutarsızlığı
- Continue regresyonu
- Geçersiz entity
- UI regresyonu

Koruma:
- Çalışan akışları gereksiz yeniden yazma.
- Migration öncesi gerçek state yapısını doğrula.
- Additive migration tercih et.
- Her ana iş paketini ayrı commit et.
- Değişiklik → hedefli test → typecheck → commit.
- Hatalı iş paketi gerekirse hedefli fix veya revert ile geri alınır.
- Her kod değişikliğinde EAS build alma.
- QA edilmiş APK sonrası runtime değişirse yeni build + QA gerekir.

Stop koşulları:
- Migration FAIL
- Veri kaybı
- XP duplicate
- Continue regresyonu
- Persist hydration crash
- Navigation crash
- Activity history'nin kontrolsüz büyümesi
- Mevcut davranışlarda regresyon

---

## 16.18 — Nihai Kapsam Matrisi ve Definition of Done

### Must Have
- `activityHistory`
- Activity event üretimi
- Lesson / quiz / retry / project event'leri
- 100 event sınırı
- V1.2 → V1.3 migration
- Progress verilerinin korunması
- Stats helper/selector katmanı
- Öğrenme / quiz / proje istatistikleri
- Son 7 gün aktivite
- Profil ilerleme merkezi
- Aktivite Geçmişi ekranı
- Ana Sayfa ilerleme özeti
- Continue korunması
- Öğren kategori ilerlemeleri
- Quiz sonuç/gelişim iyileştirmesi
- Otomatik testler
- Migration QA
- Gerçek cihaz upgrade QA
- Clean install QA

### Should Have
- Profilde son 7 gün özeti
- Ana Sayfa haftalık aktivite özeti
- Ayrıntılı kategori ilerlemesi
- Quiz kısa geçmişi
- Son tamamlanan ders
- Sıradaki ders
- Profilde proje ilerleme özeti

### Nice to Have
- 7 günlük mini grafik
- Aktivite filtreleri
- Gelişmiş quiz geçmişi
- Ek görsel istatistikler

Definition of Done:
- Özellik çalışıyor
- Hedefli test PASS
- TypeScript hatası yok
- Regresyon yok
- Persist doğru
- Gerçek cihazda kullanılabilir
- Gereksiz refactor yok

---

## 16.19 — V1.3 Planlama Nihai Kontrolü ve Kapanışı

V1.3 ana teması:
> **İlerleme, İstatistik ve Aktivite Deneyimi**

Nihai zincir:
- `activityHistory`
- event üretimi
- migration
- stats helper/selector
- Profil ilerleme merkezi
- Aktivite Geçmişi
- Ana Sayfa ilerleme özeti
- Öğren/Quiz iyileştirmeleri
- Son 7 gün özeti
- Gerçek cihaz upgrade doğrulaması

Plan boyunca kilitlenen teknik kararlar birbiriyle uyumludur:
- V1.2 mimarisi korunur.
- Migration additive tutulur.
- `lastActivity` korunur.
- `activityHistory` ayrı sorumluluk taşır.
- İstatistikler türetilmiş veri olarak hesaplanır.
- UI mantık tekrar etmez.
- Navigasyon minimum değişir.
- Gereksiz dependency eklenmez.
- 100 event sınırı korunur.

Geliştirme sırası:
```text
Mevcut durum doğrulama
→ Activity modeli
→ Schema / migration
→ Event entegrasyonu
→ Stats helper/selectors
→ Profil
→ Aktivite ekranı
→ Ana Sayfa
→ Öğren / Quiz
→ Otomatik QA
→ Gerçek cihaz QA
→ Release
```

Sonraki ana sohbet:
**17 — PROJECTLAB | V1.3 CODEX & GELİŞTİRME**

V1.3 tamamlandıktan sonraki kapanış sohbeti:
**18 — PROJECTLAB | V1.3 KAPANIŞ & SÜRÜM YÖNETİMİ**

---

# FINAL / LOCKED

**16 — PROJECTLAB | V1.3 PLANLAMA & YOL HARİTASI**  
tamamlanmıştır ve **FINAL / LOCKED** durumundadır.
