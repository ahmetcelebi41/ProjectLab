# ProjectLab

ProjectLab, gerçek yazılım projelerini yalnızca sonuçlarıyla değil; geliştirme yolculukları, kısa öğrenme içerikleri ve mini quizlerle birlikte sunan mobil odaklı bir portföy deneyimidir.

## Teknoloji

- Expo SDK 57 ve React Native
- TypeScript ve Expo Router
- Zustand ve AsyncStorage
- Jest

## Temel özellikler

- Ana sayfa, proje listesi ve proje detay/yolculuk akışları
- Projelerle bağlantılı dersler, quizler ve sonuç ekranları
- XP, seviye, başarımlar ve kalıcı ilerleme
- Profil, ilerleme, başarımlar ve ayarlar
- Ziyaretçiler için sade Portföy Modu

## Yerel çalıştırma

Node.js ve npm kurulu olmalıdır.

```bash
npm install
npm start
```

Android geliştirme ortamı hazırsa uygulamayı doğrudan açmak için:

```bash
npm run android
```

## Doğrulama

```bash
npm test
npm run typecheck
npx expo-doctor
npx expo export --platform android
git diff --check
```

## Proje yapısı

- `app/`: Expo Router route ve layout dosyaları
- `src/features/`: ekranlar ve özellik bazlı uygulama mantığı
- `src/data/`: proje, ders, quiz ve başarım içerikleri
- `src/stores/` ve `src/storage/`: ilerleme state'i, persistence ve migration
- `src/components/` ve `src/theme/`: ortak UI bileşenleri ve tasarım token'ları
- `docs/`: V1 ürün, akış, tasarım ve teknik mimari kararları

## V1 durumu

V1 özellik kapsamı uygulanmış ve otomatik testlerden geçmektedir. Store release öncesinde kalıcı Android application ID, üretim marka asset'leri ve gerçek cihaz QA kontrolü tamamlanmalıdır.
