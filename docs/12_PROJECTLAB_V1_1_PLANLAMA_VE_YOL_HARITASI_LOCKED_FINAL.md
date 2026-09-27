# 12 — PROJECTLAB | V1.1 PLANLAMA & YOL HARİTASI

**Durum:** FINAL / LOCKED  
**Hedef sürüm:** `v1.1.0`  
**Baz sürüm:** `v1.0.0` STABLE  
**Android package:** `com.projectlab.mobile`  
**Dağıtım:** Kişisel APK, store yayını kapsam dışı

---

## 12.1 — V1.1 Amacı

ProjectLab V1.1, V1.0’daki proje portföyü, öğrenme ve quiz temelini koruyarak; kullanıcı ilerlemesini daha görünür hale getiren, proje içeriklerini zenginleştiren ve günlük kullanım değerini artıran ilk özellik güncellemesidir.

Ana odaklar:
- İlerleme ve gamification görünürlüğü
- Proje deneyiminin zenginleştirilmesi
- Öğrenme ve quiz akışının derinleştirilmesi
- Ana Sayfa devamlılığı ve genel UX iyileştirmeleri

Büyük altyapı değişiklikleri V1.1 kapsamına alınmayacaktır.

---

## 12.2 — V1.0 Mevcut Durum Analizi

V1.0 teknik olarak stabil ve temel akışları tamamlanmış durumdadır. V1.1’in ana ihtiyacı yeni mimari değil, devamlılık hissini güçlendirmektir.

Temel eksikler:
- İlerleme görünürlüğünün sınırlı olması
- Projelerin statik kalması
- Öğrenme döngüsünün quiz sonrası zayıf kalması
- Ana Sayfa’nın kişisel devam merkezi olarak yeterince güçlü olmaması

V1.1 odağı:

**İlerleme + Öğrenme + Proje hikâyesi + Ana Sayfa devamlılığı**

---

## 12.3 — İyileştirme ve Yeni Özellik Havuzu

Adaylar şu gruplarda toplandı:
- Ana Sayfa
- Projeler
- Öğrenme
- Quiz
- XP / seviye
- Genel UX / kalite

Güçlü kümeler:
- Kaldığın yerden devam et + son aktivite
- Ders ilerleme + quiz geçmişi + yanlışları tekrar çözme
- Proje timeline + kilometre taşları + teknolojiler + öğrenilenler

Backend, cloud sync, hesap sistemi, mağaza yayını ve sosyal özellikler V1.1 için fazla büyük adaylar olarak ayrıldı.

---

## 12.4 — Özelliklerin Önceliklendirilmesi

### V1.1 çekirdeği
- Kaldığın yerden devam et
- Son aktivite
- Ders tamamlanma durumu
- Konu bazlı ilerleme
- Quiz sonuç geçmişi
- Yanlış cevapları tekrar çözme
- Quiz sonrası açıklamalar
- XP ilerleme çubuğu
- XP kazanma sebebi
- Proje timeline
- Kilometre taşları
- Kullanılan teknolojiler
- Projede öğrenilenler
- V1.0 → V1.1 veri migrasyonu
- Upgrade regression testleri

V1.1 ana prensibi:

**Devam et → Öğren → İlerle**

---

## 12.5 — V1.1 Kesin Kapsamı

### Ana Sayfa
- Kaldığın yerden devam et
- Son aktivite
- XP / seviye ilerlemesi

### Öğrenme
- Ders tamamlanma durumu
- Konu bazlı ilerleme
- Son kaldığın derse dönme
- Tamamlanan ders bilgisinin kalıcı tutulması

### Quiz
- Quiz sonuç geçmişi
- Doğru / yanlış sayısı
- Son skor
- En iyi skor
- Yanlış cevapları tekrar çözme
- Açıklamalı sonuç ekranı

### Projeler
- Timeline
- Kilometre taşları
- Teknolojiler
- “Bu projede ne öğrendim?” alanı

### XP
- İlerleme çubuğu
- XP kazanma sebebi
- Mevcut seviye sisteminin korunması

### Veri ve kalite
- V1.0 verisinin korunması
- Schema migration
- Gerçek cihaz QA
- Upgrade testi
- Otomatik testlerin genişletilmesi

Temel kabul akışı:

**Ders → tamamla → quiz → sonuç → XP → uygulamayı kapat/aç → ilerleme korunur → Ana Sayfa’dan devam et**

---

## 12.6 — Kapsam Dışı

V1.1 kapsamı dışında:
- Kullanıcı hesabı
- Supabase / Firebase / backend
- Cloud sync
- Çoklu cihaz
- Push notification
- Sosyal özellikler
- Online leaderboard
- Play Store / App Store
- Web sürümü
- Global arama
- Tema değiştirme
- Günlük hedef / streak
- Gelişmiş achievement sistemi
- Gelişmiş istatistik ekranları
- AI tabanlı içerik üretimi

ELORA, NOVA ve Moonphase için ayrı özel sistemler geliştirilmeyecek; ortak veri modeli kullanılacaktır.

---

## 12.7 — Ekran ve Navigasyon Etkileri

Ana navigasyon korunur:

**Ana Sayfa · Projeler · Öğren · Profil**

Değişecek ekranlar:
- Ana Sayfa
- Proje Detay
- Öğren
- Ders
- Quiz
- Profil

Yeni ekran:
- **Quiz Sonuç Detayı**

Büyük ölçüde korunacak:
- Projeler listesi
- Alt navigasyon
- Portföy Modu

Prensip:

**Mevcut ekran içinde çözülebilen özellik için yeni navigasyon seviyesi oluşturulmaz.**

---

## 12.8 — Veri Modeli & Kalıcılık

Kalıcı kullanıcı verisi:

```text
UserProgress
├── schemaVersion
├── xp / level
├── lessons
├── quizzes
└── lastActivity
```

Statik içerik:

```text
AppContent
├── projects
├── lessons
├── quizzes
└── technologies
```

Kurallar:
- V1.0 XP ve seviye korunur
- Ders tamamlanması kalıcıdır
- Quiz geçmişi saklanır
- Yanlış soru ID’leri saklanır
- Konu ilerleme yüzdesi hesaplanır, ayrıca saklanmaz
- Aynı ders/quiz temel XP’si yalnız ilk uygun tamamlamada verilir
- `schemaVersion` ile V1 → V2 migration uygulanır
- Migration başarısızlığında eski veri silinmez

---

## 12.9 — Teknik Etki & Risk

En kritik riskler:
1. Migration sırasında veri kaybı
2. XP’nin iki kez / sınırsız verilmesi
3. Quiz retry state hatası
4. Temiz kurulum ile eski kullanıcı davranışının ayrışması
5. Yeni UI değişikliklerinin mobil layout’u bozması

Dokunulmaması gereken alanlar:
- Alt navigasyon temeli
- Mevcut route isimleri
- `com.projectlab.mobile`
- Android build yaklaşımı
- V1.0 design system
- Portföy Modu
- APK güncelleme modeli

Kodlama prensibi:

**Önce mevcut çalışan yapıyı genişlet; yalnız zorunluysa refactor yap.**

---

## 12.10 — Geliştirme Sırası

1. Stable baseline doğrulaması — **GPT-5.6 Sol / Düşük**
2. Veri modeli & schema — **Yüksek**
3. V1.0 → V1.1 migration — **Yüksek**
4. Progress servisleri — **Orta**
5. Quiz veri & davranış katmanı — **Yüksek**
6. Öğren & Ders entegrasyonu — **Orta**
7. Quiz UI & Sonuç Detayı — **Orta-Yüksek**
8. Ana Sayfa V1.1 — **Orta**
9. Proje Detayı — **Orta**
10. Profil & XP görünürlüğü — **Düşük-Orta**
11. UX polish — **Düşük-Orta**
12. Otomatik testler — **Yüksek**
13. Gerçek cihaz V1.0 → V1.1 upgrade testi — **Düşük**

Bağımlılık sırası korunacak; kritik hata bulunan aşamadan sonraki aşamaya geçilmeyecek.

---

## 12.11 — Test & Release Stratejisi

Zorunlu doğrulamalar:
- Otomatik testler PASS
- Typecheck PASS
- Lint varsa PASS; yoksa `NOT AVAILABLE`
- Temiz V1.1 kurulum testi
- V1.0 → V1.1 upgrade testi
- Veri kalıcılığı
- XP duplicate engeli
- Quiz retry
- Navigasyon regression
- Gerçek Android cihaz QA

Release blocker:
- Crash
- Veri kaybı
- Migration hatası
- APK update hatası
- Yanlış / sınırsız XP
- Quiz sonucunun kaybolması
- Kullanılamaz navigasyon

Release adayı gerekirse `v1.1.0-rc.1` ile doğrulanır.

Final sürüm:
- Tag: `v1.1.0`
- APK: `ProjectLab-v1.1.0.apk`
- Tag yalnız doğrulanmış final commit’i gösterir
- `main = origin/main`
- working tree clean

V1.1 ancak tüm kritik kontroller PASS olduğunda **STABLE** kabul edilir.

---

## 12.12 — Nihai V1.1 Yol Haritası & Kapanış

ProjectLab V1.1; yeni bir mimari veya yeniden tasarım sürümü değil, V1.0’ın güvenli biçimde derinleştirildiği kontrollü bir minor release olacaktır.

Resmi geliştirme hattı:

**V1.0 STABLE → Veri modeli → Migration → Progress → Quiz → Öğren/Ders → Ana Sayfa → Proje Detayı → Profil → UX → Test → Gerçek cihaz upgrade → `v1.1.0`**

Başarı ölçütü yalnızca yeni özelliklerin görünmesi değildir. Başarı:

**V1.0 kullanıcı verisini koruyarak, öğrenme ve proje deneyimini daha anlamlı hale getiren, güvenli şekilde güncellenebilir bir V1.1 üretmektir.**

### Kapanış Kararı

`12 — PROJECTLAB | V1.1 PLANLAMA & YOL HARİTASI`

**FINAL / LOCKED**

Bir sonraki aşama artık planlama değil, bu dokümandaki sıraya göre **V1.1 geliştirme sürecidir**.
