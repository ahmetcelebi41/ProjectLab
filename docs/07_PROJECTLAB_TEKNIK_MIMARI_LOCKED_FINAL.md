# 07 — PROJECTLAB | TEKNİK MİMARİ
**Durum:** FINAL / LOCKED  
**Kapsam:** 07.1–07.21

## 07.1 — Temel Platform
- React Native + Expo + TypeScript.
- Expo Router ile navigasyon.
- Android + iOS, tek kod tabanı.
- Local-first mimari.
- V1’de backend ve authentication yok.
- Cloudflare Workers + D1 yalnız gerçek uzak veri/senkronizasyon ihtiyacında değerlendirilecek.

## 07.2 — Klasör ve Katman Yapısı
- `app/`: yalnız route ve navigasyon girişleri.
- `src/`: asıl uygulama kodu.
- Ana alanlar: `components/`, `features/`, `data/`, `stores/`, `storage/`, `hooks/`, `utils/`, `types/`, `constants/`, `theme/`.
- `stores/`: runtime application state.
- `storage/`: persistence, key ve migration altyapısı.
- Gereksiz enterprise/DDD katmanları eklenmeyecek.

## 07.3 — Navigasyon
- Ana sekmeler: **Ana Sayfa · Projeler · Öğren · Profil**.
- Expo Router JavaScript Tabs + Stack.
- Proje içi bölümler: **Genel Bakış · Yolculuk · Öğren · Quiz**.
- Portföy Modu ayrı route/Stack alanı olacak; ana tab’a eklenmeyecek.
- `+not-found.tsx` kullanılacak.
- Deep link’e hazır yapı kurulacak.

## 07.4 — State ve Yerel Veri
- Global state: Zustand.
- Kalıcı hassas olmayan state: AsyncStorage.
- Statik içerik: `src/data/`.
- Ekrana özgü geçici state: React local state.
- Persisted state migration destekli olacak.
- Hydration tamamlanmadan kalıcı veriye bağlı UI gösterilmeyecek.
- SQLite, Redux ve TanStack Query V1’e eklenmeyecek.
- Auth gelirse token/secret için Expo SecureStore kullanılacak.

## 07.5 — Veri Modelleri
- Merkezi TypeScript contract’ları: Project, Lesson, Quiz, Progress, Achievement.
- İlişkiler sabit ID’lerle kurulacak.
- Kişisel Mod ve Portföy Modu mümkün olduğunca aynı proje kaynağını paylaşacak.
- Dersler kontrollü içerik bloklarından oluşacak; executable HTML kullanılmayacak.
- Quiz doğru cevabı option ID ile tutulacak.
- Level/progress gibi türetilebilir değerler ayrıca saklanmayacak.
- V1 yerel TS verilerinde ek runtime validation dependency’si olmayacak.

## 07.6 — XP, Seviye ve Başarımlar
- Tek XP sistemi.
- XP yalnız anlamlı öğrenme/proje aksiyonlarından kazanılacak.
- Aynı içerikten tekrar XP kazanılamayacak.
- V1 ödülleri: ders +20; quiz +10; %70–84 +10; %85–99 +20; %100 +30; proje öğrenme bölümü +30; önemli kilometre taşı +50 XP.
- Seviye XP’den hesaplanacak; yaklaşık 10 seviye.
- İlerleme tamamlanan içeriklerden türetilecek.
- Achievement kuralları merkezi engine’de çalışacak.
- V1’de yaklaşık 8–12 başarım.

## 07.7 — İçerik Sistemi
- Proje/ders/quiz/başarım içerikleri modüler TypeScript dosyalarında tutulacak.
- Her içerik türünün merkezi registry’si olacak.
- ELORA, NOVA, Moonphase ve sonraki projeler ortak ekran altyapısını kullanacak.
- Her proje için ayrı React ekranı varsayılan olmayacak.
- İçerik ile görsel sunum ayrılacak.
- V1’de Markdown, CMS veya remote content API yok.
- Duplicate ID ve bozuk referansları yakalayan content-integrity kontrolü olacak.

## 07.8 — Tema ve UI
- Design token’lar `src/theme/` altında.
- Renk, spacing, typography, radius, shadow, motion merkezi.
- Primary `#7C5CFC`, spacing 4 px, kart radius 12 px.
- Ortak UI: Button, Card, AppText, ProgressBar, Screen vb.
- Styling: React Native `StyleSheet`.
- NativeWind/styled-components/hazır UI framework yok.
- Resmi V1 tema: dark.
- Minimum dokunma alanı 44×44 px; Safe Area ve reduced-motion korunacak.

## 07.9 — Form ve Validation
- V1’de React Hook Form + Zod yok.
- Küçük formlar local state ile yönetilecek.
- Validation saf fonksiyonlarda, ilgili feature altında tutulacak.
- Veriler validation sonrası store/storage’a aktarılacak.
- Hatalarda draft değerler korunacak.
- Karmaşıklık artarsa RHF + Zod değerlendirilecek.

## 07.10 — Loading ve Hatalar
- Ortak `LoadingState`, `EmptyState`, `ErrorState`, `NotFoundState`.
- Hydration için kontrollü başlangıç durumu.
- Gereksiz skeleton/spinner yok.
- Not-found ile gerçek crash ayrılacak.
- Uygulama seviyesinde Error Boundary bulunacak.
- Tek global `isLoading` store’u olmayacak.
- Toast yalnız kısa geri bildirimlerde kullanılacak.

## 07.11 — Test
- Jest + `jest-expo` + React Native Testing Library.
- Öncelik: XP, level, quiz, progress, achievement, migration, content-integrity.
- Kritik navigation/interaction testleri yapılacak.
- Snapshot minimumda tutulacak.
- V1 başlangıcında ağır E2E CI yok.
- Cihaz/emulator smoke testleri yapılacak.
- Kalite kapısı: typecheck + lint + test + content-integrity PASS.

## 07.12 — Accessibility
- Accessibility ortak UI bileşenlerinin parçası olacak.
- Doğru role/label/state, 44×44 touch target, font scaling ve screen-reader sırası korunacak.
- Bilgi yalnız renk, ikon, animasyon veya titreşimle aktarılmayacak.
- Quiz/progress erişilebilir olacak.
- Reduced-motion ve manuel accessibility QA uygulanacak.

## 07.13 — Güvenlik ve Gizlilik
- Veri-minimal, local-first yaklaşım.
- Gereksiz permission, analytics, tracking, telemetry yok.
- AsyncStorage yalnız hassas olmayan state için.
- Secret/token mobil bundle’a gömülmeyecek.
- Dış URL’ler doğrulanacak.
- Destructive veri silme açık onay gerektirecek.
- Release öncesi privacy/dependency denetimi yapılacak.

## 07.14 — Build ve Ortamlar
- Profiller: development, preview, production.
- Resmi geliştirme: Expo Development Build + `expo-dev-client`.
- `app.json`: temel config; `eas.json`: build profilleri.
- `android/ios` CNG/prebuild ile üretilecek; kalıcı manuel native patch yok.
- Android yerel geliştirilecek.
- EAS: preview, production ve gerektiğinde iOS cloud build.
- `EXPO_PUBLIC_*` yalnız public client config için.

## 07.15 — Paket ve Kod Kalitesi
- Paket yöneticisi pnpm; `pnpm-lock.yaml` Git’e girecek.
- TypeScript strict, ESLint, Prettier.
- Tek `@/*` import alias.
- `pnpm validate`: typecheck + lint + test + content-integrity.
- Expo/native paketlerinde mümkün olduğunca `npx expo install`.
- Husky, lint-staged ve update botları başlangıçta yok.
- Gereksiz dependency eklenmeyecek.

## 07.16 — Git ve Sürümleme
- Ana branch `main`; doğrulanmış çalışan durum.
- Küçük işler main, riskli işler kısa ömürlü feature/fix branch.
- Uzun yaşayan `develop` yok.
- Sade Conventional Commits.
- Commit öncesi `pnpm validate` + gerekli smoke test.
- Rutin force-push yok.
- Production sürümleri SemVer + `vX.Y.Z` tag.

## 07.17 — CI/CD
- GitHub Actions: `pnpm validate`.
- EAS Workflows: mobil build/release.
- Her committe Android+iOS cloud build yok.
- Preview gerektiğinde manuel; production kontrollü.
- İlk sürümlerde store submission otomatik değil.
- EAS Update ve ağır E2E CI V1 başlangıç kapsamı dışında.

## 07.18 — Performans ve Asset
- Görseller `expo-image`.
- Asset’ler kullanımına göre optimize edilecek.
- Küçük heterojen ekranlarda ScrollView; büyüyen listelerde FlatList.
- FlatList ayarları yalnız ölçülen ihtiyaçta değiştirilecek.
- Zustand selector’ları seçici kullanılacak.
- Gereksiz memoization yok.
- Tüm asset’ler startup’ta preload edilmeyecek.
- Performans gerçek cihaz ve preview/release build’de doğrulanacak.

## 07.19 — İkon, Splash ve Platform Kimliği
- Uygulama adı: ProjectLab.
- Marka: dark tema + `#7C5CFC`.
- Android adaptive icon.
- V1 portrait odaklı.
- Package/bundle kimliği kararlı seçilecek.
- URI scheme: `projectlab`.
- App asset’leri ile içerik asset’leri ayrı tutulacak.

## 07.20 — Dağıtım ve Release
- Akış: Development → Preview/RC → Store Testing → Production.
- Android: `.aab`, önce Internal Testing.
- iOS: App Store Connect → TestFlight → App Review.
- İlk sürümlerde production yayını manuel son onaylı.
- Her release commit + version + Git tag ile eşleşecek.
- Release gate: validate, cihaz QA, permission/privacy, metadata ve secret kontrolü.
- OTA Update ve tam otomatik submission V1 başlangıç kapsamı dışında.

## 07.21 — Nihai Bütünlük
- 07.1–07.20 birlikte kontrol edildi; kritik teknik çelişki yok.
- `stores/` ve `storage/` ayrımı nihai klasör yapısında standardize edildi.
- Mimari sade, test edilebilir, local-first ve gelecekte backend/sync eklenmesine açık.
- **07 — PROJECTLAB | TEKNİK MİMARİ: FINAL / LOCKED.**
