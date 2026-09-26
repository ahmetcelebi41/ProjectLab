# 06 — PROJECTLAB | SAYFA TASARIMLARI
**Durum:** FINAL / LOCKED  
**Tarih:** 2026-09-26

Bu doküman, ProjectLab için onaylanan sayfa tasarımı kararlarının nihai özetidir. 04 — Bilgi Mimarisi ve 05 — UI / Design System kararları esas alınır. Yeni ekranlarda bu kararlar varsayılan referanstır.

## 06.1 — Ana Sayfa
Ana sayfanın önceliği: **Devam Et → Projeler → Öğrenme → Oyunlaştırma**.

Sıralama:
1. Header: kısa karşılama + profil/avatar.
2. Seviye & XP özeti.
3. Ana vurgu kartı: **Devam Et**.
4. Projelerim: ELORA, NOVA, Moonphase.
5. Bugün Öğren.
6. Günlük Görev.
7. Son Başarım.
8. Mobil sabit alt navigasyon: **Ana Sayfa · Projeler · Öğren · Profil**.

Kartlar aynı yükseklikte olmak zorunda değildir; bütünlük radius, spacing, surface ve tipografi ile sağlanır. Portföy Modu ana sayfada büyük kart değildir. Mobil tek kolon; tablette uygun ikincil alanlar iki kolon; masaüstünde merkezi max-width ve kontrollü grid.

## 06.2 — Projeler
Filtreler: **Tümü · Devam Eden · Tamamlanan**. `Planlandı` kart durumu olarak bulunur ancak ayrı filtre değildir. V1’de arama kutusu yoktur.

Her proje kartı:
- kapak görseli,
- proje adı ve türü,
- durum,
- kısa açıklama,
- ilerleme,
- son aşama,
- son güncelleme,
- bağlama göre `Devam Et / Projeyi Gör / Projeyi İncele`.

Varsayılan sıralama: son çalışılan/aktif projeler önce, tamamlananlar sonra. Kartın tamamı tek semantik link hedefidir. Detaydan geri dönüşte filtre durumu korunur. Mobil 1, tablet 2, masaüstü 3 kolon.

## 06.3 — Proje Detay
Ana anlatım: **İlerleme → Yolculuk → Öğrenme → Sonuç**.

Bölümler:
- Hero: proje adı, kısa açıklama, durum, kapak, teknoloji etiketleri, varsa Canlı Demo/GitHub.
- İlerleme & Devam Et: genel ilerleme, mevcut aşama, son tamamlanan ve sıradaki adım.
- Proje Yolculuğu: 01–08 ana aşamalar için dikey timeline.
- Öğrendiklerim.
- Teknolojiler.
- Proje Sonucu.

Timeline durumları: **Tamamlandı / Devam Ediyor / Henüz Başlanmadı**. Uzun ana aşamalarda alt adımlar açılır/kapanır; aktif aşama varsayılan açık olabilir. Timeline aynı zamanda doküman, öğrenme içeriği ve geliştirme checkpoint’lerine navigasyon sağlar.

Proje Sonucu 1–3 güçlü ekran görüntüsü, kısa sonuç özeti, temel özellikler ve varsa demo/repo bağlantısı içerir. Uzun galeri yerine gerektiğinde lightbox kullanılır. Mobil tek kolon; masaüstünde hero iki kolon, timeline her cihazda dikey.

## 06.4 — Öğren
Öncelik: **Devam Et → Bugün Öğren → Konular → Projelerden Öğren**.

Kategoriler:
**Tümü · UI/UX · Frontend · Backend & API · Veritabanı · Git & GitHub · Deploy & Cloud · Proje Planlama**.

Teknoloji isimleri ana kategori değil, etiket olabilir. Kartlarda başlık, kısa açıklama, bağlı proje, süre, XP ve durum bulunur. Durumlar: **Başlanmadı / Devam Ediyor / Tamamlandı**. V1’de arama ve zorluk seviyesi etiketi yoktur.

İçerik ilerlemesi korunur. Son yarım içerik `Devam Et` alanında gösterilir. Ders tamamlandığında XP yalnız bir kez verilir. Tamamlanan içerikler geçmiş olarak listede kalır. Quiz opsiyonel pekiştirme adımıdır. Mobil tek kolon; tablet ve masaüstünde 2–3 kolon kullanılabilir.

## 06.5 — Öğrenme İçeriği / Ders
Mikro ders hedefi yaklaşık **2–5 dakika**.

İçerik yapısı:
- üst bilgi,
- kısa öğrenme hedefi,
- Kavram,
- Neden önemli?,
- Projede nerede kullandık?,
- küçük örnek,
- kritik nokta,
- proje bağlantısı,
- 3–5 maddelik kısa özet,
- `Dersi Tamamla`.

Masaüstünde okuma kolonu yaklaşık **640–760 px**. Kod blokları kısa, açıklamalı, mobilde yatay kaydırılabilir ve `Kopyala` aksiyonlu olur. Scroll sonuna gelmek dersi otomatik tamamlamaz. XP ilk tamamlamada bir kez verilir. Sonraki aksiyon bağlama göre `Bilgini Test Et`, `Sonraki Dersi Aç` veya `Öğren’e Dön` olur. V1’de not editörü, bookmark, kod playground veya AI tutor yoktur.

## 06.6 — Quiz
Quizler **3–5 soru**. V1 soru tipleri:
- Tek seçimli
- Doğru / Yanlış

Akış:
**Soru → seçim → Cevabı Kontrol Et → açıklama → Sonraki Soru → Sonuç**.

Seçim yapılmadan cevap butonu aktif olmaz. Cevap kontrolünden sonra seçim değiştirilemez. Yanlış cevap kullanıcıyı kilitlemez; doğru cevap ve açıklama gösterilir. Quiz sırasında toplam skor sürekli gösterilmez.

Sonuç ekranında doğru/toplam, yüzde, kısa değerlendirme ve varsa XP gösterilir. Sert `geçti/kaldı` sistemi yoktur. XP ilk tamamlamada bir kez verilir; tekrar çözme ek XP kazandırmaz. V1’de süreli sınav, serbest soru navigasyonu, ayrıntılı sınav geçmişi veya ranking yoktur.

## 06.7 — Profil / İlerleme / Başarımlar
Profil üst alanı:
- avatar,
- görünen isim,
- kısa açıklama,
- seviye,
- toplam XP,
- progress bar.

Özet metrikler: toplam proje, tamamlanan proje, tamamlanan ders, tamamlanan quiz, başarım sayısı. Öğrenme ilerlemesi konu bazında; proje ilerlemesi kompakt proje kartlarıyla gösterilir. Tek bir yapay `ProjectLab tamamlanma yüzdesi` kullanılmaz.

Başarımlar gerçek ilerlemeyi ödüllendirir. Kilitli başarımlar gizlenmez; düşük vurguyla gösterilir. V1’de ikinci rütbe sistemi, gizli başarım, ranking veya sosyal medya metrikleri yoktur. Profil düzenleme yalnız avatar, görünen isim ve kısa açıklamayı kapsar. `Portföyü Gör` sakin secondary/ghost erişimdir.

## 06.8 — Portföy Modu
Portföy, kişisel modun halka açık kopyası değil, dış ziyaretçiye yönelik ayrı sunum katmanıdır.

Ana bölümler:
- Hero,
- Öne Çıkan Projeler,
- Nasıl Çalışıyorum,
- Yetkinlikler,
- Hakkımda,
- İletişim / dış bağlantılar.

Portföy kartları görsel ve sunum odaklıdır; XP, kişisel ilerleme ve son çalışma adımı gösterilmez.

Proje detay akışı:
**Hero → Problem/Amaç → Ben ne yaptım? → Geliştirme süreci → Çözüm ve Sonuç → Galeri → Diğer Projeler**.

Dahili 01/02/03 numaraları dış sunumda sadeleştirilir. Her proje için `Portföyde Göster: Açık/Kapalı` kontrolü öngörülür. Tamamlanmak otomatik yayın anlamına gelmez. Gizli veri yalnız frontend’de saklanmaz; API/backend seviyesinde portföy istemcisine gönderilmez.

Portföy navigasyonu: **Ana Sayfa · Projeler · Hakkımda**. Tasarım aynı Inter, `#7C5CFC`, radius ve spacing sistemini korur ancak daha fazla boşluk ve daha büyük görsel alan kullanır.

## 06.9 — Ortak Durumlar
**Loading:** skeleton-first, bölüm bazlı, layout-stable. Sahte veri gösterilmez.  
**Empty:** `Henüz veri yok / Filtre sonucu yok / Opsiyonel bölüm boş`. CTA yalnız anlamlıysa.  
**Error:** en küçük alanı etkiler, kullanıcı girdisini korur, anlamlı `Tekrar Dene` sunar. Teknik hata kodları UI’a sızmaz.  
**Success:** küçük işlemlerde toast, önemli sonuçlarda inline feedback.  
**Confirm:** yalnız destructive veya geri dönüşü zor işlemlerde.  
**Disabled:** yalnız gerçekten işlem yapılamıyorsa; gerekirse nedeni açıklanır.

Ortak primitives: `Skeleton`, `EmptyState`, `ErrorState`, `Toast`, `ConfirmDialog`, işlem durumlu `Button`.

## 06.10 — Responsive & Sayfalar Arası Bütünlük
Genel bölgeler:
- Mobil `<768 px`
- Tablet `768–1023 px`
- Masaüstü `≥1024 px`

Mobil birincil deneyimdir. Minimum dokunma hedefi **44×44 px**. Yatay scroll yalnız bilinçli bileşenlerde kullanılır. Masaüstünde merkezi max-width korunur. Okuma ve quiz ekranları geniş ekranda da kontrollü tek kolon kalabilir.

Ana navigasyon yeni bağlam açar; geri navigasyon eski filtre/scroll bağlamını mümkün olduğunca geri getirir. Sticky kullanım sınırlıdır. Karmaşık route animasyonları yoktur.

Erişilebilirlik: görünür focus, renk dışında anlam göstergeleri, mantıklı heading sırası, erişilebilir ikon isimleri, anlamlı alt metinler ve `prefers-reduced-motion`.

Edge-case yaklaşımı:
**Taşmayı kontrol et → güvenli fallback kullan → diğer içeriği çalışır tut.**

## 06.11 — Nihai Kontrol
06 kapsamındaki tüm ekranlar 04 Bilgi Mimarisi ve 05 UI / Design System ile uyumludur. ELORA, NOVA, Moonphase ve gelecekteki projeler aynı model içinde çalışabilir.

V1 dışında bırakılan başlıca alanlar: leaderboard, streak, sertifika, karmaşık grafikler, AI tutor, kod playground, sosyal özellikler, gelişmiş arama, gereksiz dashboard/istatistik ekranları.

**06 — PROJECTLAB | SAYFA TASARIMLARI: FINAL / LOCKED**

**Sıradaki ana bölüm:** `07 — PROJECTLAB | TEKNİK MİMARİ`
