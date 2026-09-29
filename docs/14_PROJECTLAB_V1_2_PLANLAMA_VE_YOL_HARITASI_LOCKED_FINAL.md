# 14 — PROJECTLAB | V1.2 PLANLAMA & YOL HARİTASI

**Durum:** FINAL / LOCKED  
**Taban sürüm:** `v1.1.0`  
**Hedef sürüm:** `v1.2.0`  
**Amaç:** V1.1’de kurulan ilerleme altyapısını değiştirmeden; öğrenme takibi, quiz performansı ve kişisel ilerlemeyi daha görünür, ölçülebilir ve anlamlı hale getirmek.

---

## 14.1 — V1.2 Ana Hedefi

V1.2’nin ana teması:

> **ProjectLab V1.2 — Öğrenme Takibi & Kişisel İlerleme**

V1.1’de tamamlanan lesson progress, `quizHistory`, `lastActivity`, XP güvenliği ve `Devam Et` altyapısı korunacaktır. V1.2; yeni ve ağır bir altyapı kurmak yerine mevcut veriyi kullanıcıya anlamlı biçimde sunacaktır.

Ana odaklar:
- Öğrenme istatistikleri
- Kategori bazlı ilerleme
- Quiz performans analizi
- Profil ve Ana Sayfa iyileştirmeleri

---

## 14.2 — V1.2 Özellik Kapsamı

### Öğrenme İstatistikleri
- Tamamlanan / toplam ders
- Tamamlanan / toplam quiz
- Toplam XP
- Genel ders ilerlemesi
- Son aktivite

### Kategori Bazlı İlerleme
Kategoriler:
- UI/UX
- Frontend
- Backend
- DevOps

Her kategori için tamamlanan / toplam ders, yüzde ve progress bar gösterilecektir.

### Quiz Performansı
- Toplam quiz denemesi
- İlk deneme sonucu
- Retry sonucu
- Doğruluk oranı
- Quiz geçmişi
- Tekrar önerileri

### Profil
Mevcut seviye, XP ve başarımlar korunacak; öğrenme ve quiz analizi eklenecektir.

### Ana Sayfa
Mevcut `Devam Et` sistemi korunacak; kısa ilerleme özeti ve son aktivite gösterilecektir.

---

## 14.3 — İstatistik Veri Modeli ve Hesaplama Mantığı

V1.2’de istatistikler mümkün olduğunca kalıcı olarak saklanmayacak, mevcut verilerden **türetilerek** hesaplanacaktır.

Örnek hesaplama katmanı:
- `getLearningStats()`
- `getCategoryProgress()`
- `getQuizStats()`

Türetilmesi planlanan başlıca değerler:
- `completedLessons`
- `totalLessons`
- `lessonCompletionRate`
- `completedQuizzes`
- `totalQuizzes`
- `quizAttempts`
- `quizAccuracy`
- `firstAttemptAccuracy`
- `retryAccuracy`
- kategori bazlı ilerleme
- son aktivite

Aynı bilginin hem store’da hem hesaplama katmanında tutulmasından kaçınılacaktır.

Quiz doğruluğu mümkünse gerçek `doğru cevap / toplam cevap` verisinden hesaplanacaktır.

Ders ilerlemesi ve quiz performansı tek yüzdeye birleştirilmeyecektir.

---

## 14.4 — Quiz Performansı ve Zayıf Alanlar

Başlangıç sınıflandırması:

- `%80–100` → İyi
- `%60–79` → Tekrar edilebilir
- `%0–59` → Geliştirilmeli

Bu etiketler yalnızca bilgilendirici olacak; XP veya seviye sistemini etkilemeyecektir.

İlk deneme ve retry ayrı değerlendirilecektir.

Örnek:
- İlk deneme: `%60`
- Retry: `%90`
- Gelişim: `+30 puan`

Kategori analizi, kategori içindeki quiz sonuçlarından üretilecektir. Tek quiz sonucundan “zayıf alan” sonucu çıkarılmayacaktır.

Bir kategori için zayıf alan analizi yapılabilmesi için **en az 2 tamamlanmış quiz** gereklidir. Yeterli veri yoksa `Yeterli veri yok` gösterilecektir.

---

## 14.5 — Profil Ekranı V1.2

Profil ekranı kişisel ilerleme analizinin merkezi olacaktır.

Yapı:
1. Seviye, XP ve bir sonraki seviyeye ilerleme
2. Mevcut başarımlar
3. Öğrenme özeti
4. Kategori ilerlemeleri
5. Quiz performansı
6. Son aktivite

Ayrı bir `İstatistikler` sekmesi açılmayacaktır.

Bar chart / pie chart gibi ağır grafikler yerine progress bar ve sayısal özetler tercih edilecektir.

---

## 14.6 — Ana Sayfa V1.2

Ana Sayfa analiz ekranına dönüştürülmeyecektir.

Korunacak / eklenecek alanlar:
- `Devam Et`
- Kısa öğrenme özeti
- Seviye ve XP
- Son aktivite
- Gerekirse tek bir tekrar önerisi
- ELORA / NOVA / Moonphase proje erişimi

İlke:

> **Ana Sayfa özet ve aksiyon verir; Profil analiz yapar.**

Streak, günlük hedef, aktivite feed’i ve büyük grafikler V1.2 kapsamı dışındadır.

---

## 14.7 — Öğren Ekranı V1.2

Öğren ekranı derslere erişim ve ilerlemeyi görünür kılmaya devam edecektir.

Kategori kartlarında:
- Tamamlanan / toplam ders
- Yüzde
- Progress bar
- `Başlanmadı / Devam Ediyor / Tamamlandı`

Quiz performansı ikincil bilgi olarak gösterilebilir.

Örnek:

`Frontend — Dersler: 3/5 · %60 — Quiz: %80`

Ders ilerlemesi ile quiz başarısı tek bir “genel başarı” yüzdesine dönüştürülmeyecektir.

Yeni kategori, toplu yeni ders veya quiz içeriği V1.2 kapsamına dahil değildir.

---

## 14.8 — Ders ve Quiz Ekranları

### Ders
- Mevcut içerik yapısı korunur.
- Tamamlanan ders tekrar açılabilir.
- Tekrar açmak XP kazandırmaz.
- Idempotent completion korunur.

### Quiz
- `full` ve `retry` ayrımı korunur.
- İlk completion XP kazandırabilir.
- Retry ikinci kez XP kazandırmaz.
- İlk deneme geçmişi silinmez.

Sonuç ekranında:
- Doğru / toplam soru
- Başarı yüzdesi
- İlk deneme
- Bu deneme
- Gelişim

Ana aksiyonlar:
- `Tekrar Dene`
- `Öğren'e Dön`

---

## 14.9 — Veri Uyumluluğu ve Migration

Öncelik V1.1 verisinin korunmasıdır.

Varsayılan hedef:
- Persist envelope version `3` korunur.
- `schemaVersion 2` mümkünse korunur.
- Yeni istatistikler türetilir.
- `quizHistory`, `lastActivity`, lesson completion ve XP yapısı korunur.

Yalnızca mevcut `quizHistory` analiz için gerekli veriyi taşımıyorsa minimal migration değerlendirilecektir.

Örneğin gerekirse:
`schemaVersion 2 → 3`

Upgrade sırasında şu verilerin korunması zorunludur:
- XP
- Seviye
- Tamamlanan dersler
- Quiz geçmişi
- Başarımlar
- Proje ilerlemeleri
- Son aktivite
- Mevcut kullanıcı tercihleri

Veri kaybı **release blocker** olacaktır.

---

## 14.10 — Test, QA ve Kabul Kriterleri

Zorunlu kontroller:
- Mevcut V1.1 regression testleri
- Yeni istatistik testleri
- İlk deneme / retry testleri
- Kategori analizi
- Yetersiz veri senaryoları
- Duplicate XP engeli
- TypeScript `typecheck`
- Persist / restart testi
- V1.1 → V1.2 upgrade testi
- Gerçek cihaz QA: Samsung S24 Ultra

Kontrol edilecek ana ekranlar:
- Ana Sayfa
- Öğren
- Ders
- Quiz
- Profil

Release blocker örnekleri:
- Veri kaybı
- Duplicate XP
- Yanlış istatistik
- `NaN` / `undefined`
- Uygulama çökmesi
- Persist bozulması
- Upgrade başarısızlığı
- Aynı verinin farklı ekranlarda farklı görünmesi

---

## 14.11 — Geliştirme Sırası ve Codex İş Paketleri

Önerilen sıra:

1. Repository ve veri modeli incelemesi
2. İstatistik hesaplama katmanı
3. Profil V1.2
4. Öğren ekranı
5. Ana Sayfa
6. Ders ve Quiz ekranları
7. Regression + veri uyumluluğu
8. Gerçek cihaz QA
9. Release hazırlığı

### Codex Kullanım Stratejisi

Başlangıç:
- **Model:** GPT-5.6 Sol
- **Reasoning:** Orta

Basit UI entegrasyonlarında düşük reasoning tercih edilebilir. Persist, migration veya karmaşık regression sorunlarında orta; gerçekten zor sorunlarda yüksek reasoning kullanılabilir.

Her ana geliştirme iş paketi ayrı Codex sohbetinde ele alınacak. Promptlar kısa, dar kapsamlı ve token tasarruflu olacaktır.

---

## 14.12 — Kapsam Dışı, Riskler ve Nihai Yol Haritası

### V1.2 Kapsam Dışı
- Hesap / kullanıcı sistemi
- Backend
- Cloud sync
- Sosyal özellikler
- AI entegrasyonu
- Yeni XP ekonomisi
- Streak / günlük hedef
- Ayrıntılı süre takibi
- Yeni ana navigasyon sekmesi
- Büyük tasarım revizyonu
- Store yayını
- Toplu yeni ders / quiz içeriği

### Ana Riskler
- `quizHistory` verisinin analiz için yetersiz çıkması
- Aynı istatistiğin farklı ekranlarda farklı hesaplanması
- V1.1 verisinin upgrade sırasında bozulması
- Retry sonuçlarının genel başarıyı yapay olarak yükseltmesi
- UI’ın fazla yoğunlaşması

### Risk Azaltma
- Tek merkezi hesaplama katmanı
- Minimal migration
- İlk deneme / retry ayrımı
- Upgrade testi
- Ana Sayfa = özet
- Profil = analiz

---

# Nihai Karar

ProjectLab V1.2:

> **V1.1’de oluşturulan ilerleme altyapısını koruyarak öğrenme ilerlemesini, quiz performansını ve kişisel gelişimi görünür ve ölçülebilir hale getiren sürüm olacaktır.**

`14 — PROJECTLAB | V1.2 PLANLAMA & YOL HARİTASI` bölümü **FINAL / LOCKED** olarak tamamlanmıştır.

Bir sonraki ana aşama, ayrı bir sohbette V1.2 geliştirme sürecinin başlatılmasıdır.
