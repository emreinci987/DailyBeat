# DailyBeat - Yazılım Mimarisi Tasarım Dokümanı v1

## 1. Seçilen Yazılım Mimarisi: Katmanlı Mimari (Layered Architecture)

DailyBeat projesi, sorumlulukların net bir şekilde ayrıldığı, modüler ve ölçeklenebilir bir yapı sunan **Katmanlı Mimari (Layered Architecture)** prensibine göre tasarlanmıştır. Bu mimari, ekip üyelerinin farklı katmanlarda paralel çalışmasına olanak tanır ve sistemin bakımını kolaylaştırır.

| Katman | Teknoloji | Sorumluluk | Projedeki Karşılığı |
| :--- | :--- | :--- | :--- |
| **Presentation Layer** | React (Vite), CSS | Kullanıcı arayüzünü oluşturmak, kullanıcı etkileşimlerini yönetmek ve API katmanına istek göndermek. | `frontend/` |
| **API Layer** | Node.js, Express.js | RESTful API endpoint'lerini sunmak, gelen istekleri doğrulamak (validation), ve iş mantığı katmanına yönlendirmek. | `backend/src/controllers`, `backend/src/routes` |
| **Business Logic Layer** | Node.js | Uygulamanın temel mantığını çalıştırmak. Duygu kaydetme, müzik öneri algoritması gibi işlemler bu katmanda yer alır. | `backend/src/services` |
| **Data Access Layer** | Firebase SDK (Firestore) | Veritabanı ile olan tüm iletişimi yönetmek (CRUD operasyonları). | `backend/src/models` |
| **External Services Layer**| Spotify Web API, YouTube Data API | Dış servislerden müzik verisi çekmek ve zengin içerik sağlamak. | `backend/src/services/music` |

## 2. Arayüz Tanımları (Input/Output)

| Endpoint | Method | Input (Body/Query) | Output (Başarılı Durumda) |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | `{name, email, password}` | `201 Created` - `{user, token}` |
| `/api/auth/login` | POST | `{email, password}` | `200 OK` - `{user, token}` |
| `/api/auth/me` | GET | `Authorization: Bearer <token>` | `200 OK` - `{user}` |
| `/api/mood/types` | GET | - | `200 OK` - `{moodTypes[]}` |
| `/api/mood` | POST | `{mood, intensity, note}` | `201 Created` - `{moodEntry}` |
| `/api/mood/history` | GET | `?limit=30&offset=0` | `200 OK` - `{summary, chartData, history[]}` |
| `/api/mood/stats` | GET | - | `200 OK` - `{stats}` |
| `/api/mood/:id` | DELETE | `:id` (path param) | `200 OK` - `{deletedMood}` |
| `/api/music/search` | GET | `?q=<query>&limit=<n>` | `200 OK` - `{songs[]}` |
| `/api/recommendations` | POST | `{mood, limit, save}` | `200 OK` - `{songs[], playlist?}` |
| `/api/recommendations/discover` | GET | - | `200 OK` - `{genre, songs[]}` |
| `/api/users/profile` | GET | `Authorization: Bearer <token>` | `200 OK` - `{user}` |
| `/api/users/profile` | PUT | `{name, photoURL}` | `200 OK` - `{user}` |
| `/api/users/playlists` | GET | - | `200 OK` - `{playlists[]}` |
| `/api/users/playlists/:id` | DELETE | `:id` (path param) | `200 OK` - `{deletedPlaylist}` |
| `/api/health` | GET | - | `200 OK` - `{success, message, timestamp}` |

Bu doküman, projenin mevcut mimarisini yansıtmaktadır ve "Architecture Review" sürecinin ilk aşaması için temel oluşturur.

## 3. Tasarım Örüntüleri (Design Patterns) ve Alınan Kararlar

Projede gözlemlenen iki temel probleme (Sıkı Bağımlılık ve Sabit Kodlanmış Mantık) çözüm getirmek amacıyla aşağıdaki tasarım örüntüleri (Design Patterns) mimariye dahil edilmiştir.

### 3.1. Dış Müzik Servisleri Entegrasyonu (Adapter Pattern)

- Problem: Mevcut `musicService.js` doğrudan Spotify ve YouTube API'lerine bağımlıdır. İleride Apple Music veya SoundCloud gibi yeni bir müzik platformu eklenmek istendiğinde, ana müzik servisinin kodunun değiştirilmesi gerekmektedir (Sıkı Bağımlılık - Tight Coupling).
- Çözüm (Adapter Pattern): Dış servisler ile sistemimiz arasına bir `IMusicAdapter` (Arayüz) yerleştirilmiştir. Her dış servis (`SpotifyAdapter`, `YouTubeAdapter`) bu arayüzü uygular.
- Mimarideki Yeri: `backend/src/services/music` (External Services Layer).
- UML Diyagramlarının Güncellenmesi: Sınıf diyagramına (Class Diagram) `IMusicAdapter` arayüzü eklenmiş, `SpotifyAdapter` ve `YouTubeAdapter` sınıflarının bu arayüzü uyguladığı gösterilmiştir. Component diyagramında ise `MusicService` bileşeni artık doğrudan dış API'ler yerine `IMusicAdapter` arayüzüne bağımlı kılınmıştır.
- Tasarım Kararının Alınma Sebebi (Kalite Faktörleri):
	- Değiştirilebilirlik (Modifiability): Yeni bir müzik servisi eklemek için mevcut kod değiştirilmez, sadece yeni bir Adapter sınıfı yazılır (Açık/Kapalı Prensibi - Open/Closed Principle sağlanır).
	- Test Edilebilirlik (Testability): Dış servislere olan bağımlılık arayüzler üzerinden sağlandığı için birim testlerde (unit test) "Mock Adapter" kullanılarak dış API çağrısı yapmadan test yazılabilir.

### 3.2. Müzik Öneri Algoritmasının Yönetimi (Strategy Pattern)

- Problem: `recommendationService.js` içerisinde bulunan öneri algoritmaları (duyguya göre, keşif moduna göre vb.) aynı metodun içinde sabit kodlanmış (hardcoded) durumdadır. İleride "Hava Durumuna Göre Öneri", "Aktiviteye Göre Öneri" gibi yeni algoritmalar eklendiğinde metodun karmaşıklığı artacaktır.
- Çözüm (Strategy Pattern): Öneri algoritmaları `IRecommendationStrategy` arayüzünü uygulayan ayrı alt sınıflara (`MoodBasedStrategy`, `DiscoveryStrategy`) ayrılmıştır.
- Mimarideki Yeri: `backend/src/services/recommendation` (Business Logic Layer).
- UML Diyagramlarının Güncellenmesi: Sınıf diyagramına `IRecommendationStrategy` arayüzü ve bunu uygulayan strateji sınıfları eklenmiştir. Sequence diyagramda, `RecommendationService` (Context) sınıfının, çalışma zamanında bağlama uygun stratejiyi seçerek `generateRecommendations()` metodunu çağırdığı adım dahil edilmiştir.
- Tasarım Kararının Alınma Sebebi (Kalite Faktörleri):
	- Sürdürülebilirlik (Maintainability): Öneri mantığı tek, karmaşık bir metottan çıkarılarak bağımsız, küçük sınıflara bölünmüş ve kod okunabilirliği artırılmıştır.
	- Genişletilebilirlik (Extensibility): Yeni bir önerme stratejisi eklemek için mevcut servisi değiştirmeden `IRecommendationStrategy`'den türeyen yeni bir sınıf yaratmak yeterlidir.