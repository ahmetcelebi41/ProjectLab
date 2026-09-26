# 03 — PROJECTLAB | ÜRÜN & KULLANICI AKIŞLARI
**Durum:** FINAL / LOCKED

## 03.1 — Uygulamaya Giriş & Ana Kullanıcı Yolculuğu
- Uygulama doğrudan Ana Sayfa ile açılır.
- Kişisel Mod varsayılan deneyimdir.
- Portföy Modu uygulama içinden açılıp kapatılabilir; başlangıçta zorunlu mod seçim ekranı yoktur.
- Ana akış: Ana Sayfa → Projeler → Proje Detayı → Proje Yolculuğu / Öğrenme → Quiz → İlerleme.
- Ana Sayfa; Projeler, Devam Et ve Keşfet / Öğren alanlarını içerir.
- Kişisel Mod ve Portföy Modu ayrı roller değil, aynı içeriğin farklı sunum biçimleridir.

## 03.2 — Projeleri Keşfetme Akışı
- Projeler görsel kartlarla listelenir.
- V1 filtreleri: Tümü / Web / Mobil / Dashboard.
- Proje kartı; ad, kısa açıklama, tür, en fazla 2–3 ana teknoloji, durum ve kapak görseli içerir.
- Kart seçildiğinde kullanıcı doğrudan Proje Detayı'na gider.
- Varsayılan sıralama en güncel / öne çıkarılan projelere göre yapılır.
- İstenirse belirli bir proje “Öne Çıkan Proje” olarak işaretlenebilir.
- V1'de ek durum filtreleri gereksizdir; proje sayısı arttığında genişletilebilir.

## 03.3 — Proje Detayı Akışı
- Üst bölümde proje adı, kapak görseli, kısa özet, tür, durum, temel teknolojiler ve amaç yer alır.
- İçerik bölümleri modülerdir: Genel Bakış, Proje Yolculuğu, Teknolojiler, Öğrendiklerim, Sonuç.
- İçeriği olmayan bölüm gösterilmez.
- Ana CTA: “Yolculuğu Keşfet”.
- Canlı proje ve kaynak kod bağlantıları yalnız mevcutsa gösterilir.
- Her projede aynı miktarda içerik zorunlu değildir.

## 03.4 — Proje Yolculuğu Akışı
- Yolculuk dikey ve dinamik zaman çizelgesi olarak gösterilir.
- Her proje kendi gerçek geliştirme aşamalarını kullanır; sabit aşama sayısı yoktur.
- Mümkün olduğunda gerçek proje dokümantasyonundaki bölüm sırası korunur.
- Aşamalar; kısa açıklama, durum, görsel, kararlar, problem/kısıt, çözüm ve öğrenme noktası içerebilir.
- İçeriği olmayan alanlar gösterilmez.
- Her aşamada “Bu aşamada ne öğrendik?” katmanı bulunabilir.
- Öğrenme noktaları ilgili bilgi kartlarına bağlanabilir.
- Kişisel Mod'da “Aşamayı Tamamla” aksiyonu bulunabilir.
- Portföy Modu'nda kişisel ilerleme aksiyonları gizlenir.

## 03.5 — Öğrenme / Bilgi Kartları Akışı
- Öğrenme içerikleri kısa ve proje bağlamlı bilgi kartlarından oluşur.
- V1 kategorileri: Tasarım, Frontend, Backend & Veri, Yayınlama & Araçlar.
- Kartlara hem proje yolculuğundan hem bağımsız Öğren bölümünden erişilebilir.
- Her kartta konu, kısa açıklama, projede kullanım örneği ve ilgili proje bağlantısı bulunabilir.
- Aynı kavram için tekrar kart üretilmez; tek kart birden fazla projeyle ilişkilendirilebilir.
- Kişisel Mod'da kart sonunda “Öğrendim” aksiyonu bulunur.
- Tamamlanan kartlar ilerleme sistemine katkı sağlar ve ilgili quiz önerilebilir.
- Portföy Modu'nda kişisel ilerleme kontrolleri gizlenir.

## 03.6 — Mini Quiz Akışı
- Quizler 3–5 soruluk kısa oturumlardan oluşur.
- V1 soru tipleri: tek doğru cevaplı çoktan seçmeli ve Doğru / Yanlış.
- Her cevaptan sonra kısa öğretici açıklama gösterilir.
- Kullanıcı quizleri sınırsız tekrar çözebilir.
- Profil/ilerleme için en yüksek skor saklanır.
- İlk tamamlama ve başarı düzeyi XP sistemine bağlanabilir.
- Aynı quiz tekrar edilerek sınırsız XP kazanılamaz.
- Portföy Modu'nda quiz erişilebilir olabilir; XP ve kişisel ilerleme gösterilmez.
- Süre bazlı puan, negatif puan, global skor ve rekabet V1 kapsamında değildir.

## 03.7 — İlerleme, XP, Başarım & Profil Akışı
- Hafif oyunlaştırma kullanılır; ana deneyimin önüne geçmez.
- XP; proje aşaması, bilgi kartı, ilk quiz tamamlama, tam puan ve proje yolculuğu tamamlama gibi eylemlerden kazanılabilir.
- Aynı eylem tekrar edilerek sınırsız XP üretilemez.
- Basit seviye sistemi kullanılır.
- V1'de yaklaşık 5–8 anlamlı başarım yeterlidir.
- Profil; seviye, toplam XP, tamamlanan proje yolculukları, öğrenilen kartlar, quizler, başarımlar ve devam edilecek içeriği gösterir.
- Sosyal profil, takipçi, arkadaş ve liderlik tablosu V1 kapsamında değildir.
- Kullanıcı hesabı olmadığı için ilerleme cihaz üzerinde saklanır.
- Portföy Modu'nda XP, seviye, başarımlar ve kişisel ilerleme gizlenir.

## 03.8 — Portföy Modu Akışı
- Portföy Modu aynı proje verilerini kullanan sadeleştirilmiş sunum modudur.
- Moda geçildiğinde Portföy Ana Sayfası açılır.
- Proje amacı, problem, çözüm, teknolojiler, süreç, sonuç ve öğrenilenler öne çıkarılır.
- XP, seviye, başarımlar, kişisel ilerleme ve kişisel aksiyonlar gizlenir.
- Öğrenme içerikleri erişilebilir kalır ancak ikincil konumdadır.
- Quiz ana navigasyonda yer almaz.
- Portföy ana sayfası proje odaklıdır; uzun klasik CV yapısı kullanılmaz.
- Portföy Modu güvenlik veya gizlilik katmanı değildir.
- Moddan çıkış kolay erişilebilir olur.

## 03.9 — Modüller Arası Geçişler ve Uçtan Uca Yolculuk
- Ana zincir: Ana Sayfa → Projeler → Proje Detayı → Proje Yolculuğu → Öğrenme Kartı → Mini Quiz → XP / İlerleme → Profil.
- Ekranlar arası geçişte bağlam korunur.
- Bilgi kartları ilgili projelere; projeler ilgili öğrenme içeriklerine bağlanabilir.
- Ana Sayfa'daki “Devam Et” yalnız anlamlı proje/öğrenme aktivitelerini takip eder.
- Devam noktaları: proje aşaması, bilgi kartı, yarım kalmış quiz.
- Ayarlar gibi yardımcı ekranlar “Devam Et” konumunu değiştirmez.
- Yarım kalan quiz kaldığı sorudan devam edebilir.
- Mod değiştirmek kişisel ilerleme verisini sıfırlamaz.
- Kişisel Mod ana navigasyonu: Ana Sayfa / Projeler / Öğren / Profil.
- Portföy Modu daha sade navigasyon kullanır: Ana Sayfa / Projeler / Hakkında.
- Quiz, başarım ve proje aşaması gibi alt ekranlar ana navigasyona eklenmez.

## 03.10 — Nihai Kontrol
- Tüm modüller tek ve tutarlı kullanıcı yolculuğu oluşturur.
- Kişisel Mod ve Portföy Modu aynı veri kaynağını kullanır.
- Öğrenme ve quiz sistemi gerçek proje sürecine bağlıdır.
- V1 kapsamı gereksiz sosyal özellikler, ağır oyunlaştırma ve kullanıcı hesabı sistemiyle büyütülmez.
- Bölüm 03.1–03.10 itibarıyla FINAL / LOCKED kabul edilmiştir.
