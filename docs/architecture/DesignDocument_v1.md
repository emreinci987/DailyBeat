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

## 2. UML Diyagramları ile Temsil

*Bu diyagramlar, projenin mevcut kod tabanını yansıtmaktadır ve `docs/architecture/` altında saklanmalıdır.*

### 2.1 Component Diagram
Sistemin üst seviye bileşenlerini ve aralarındaki REST API tabanlı ilişkiyi gösterir.

![Component Diagram]

### 2.2 Class Diagram
Sistemin temel veri yapılarını, servis arayüzlerini ve bu arayüzlerin somut sınıflarını gösterir.

![Class Diagram]

### 2.3 Sequence Diagram
En kritik iş akışlarından biri olan "Kullanıcının Duygu Girmesi ve Müzik Önerisi Alması" sürecini adımlarıyla gösterir.

![Sequence Diagram]

### 2.4 Deployment Diagram
Sistemin farklı bileşenlerinin hangi platformlarda ve nasıl bir altyapıda çalışacağını gösterir.

![Deployment Diagram]

## 3. Arayüz Tanımları (Input/Output)

| Endpoint | Method | Input (Body/Query) | Output (Başarılı Durumda) |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | `{name, email, password}` | `201 Created` - `{user, token}` |
| `/api/auth/login` | POST | `{email, password}` | `200 OK` - `{user, token}` |
| `/api/mood` | POST | `{mood, intensity, note}` | `201 Created` - `{moodEntry}` |
| `/api/mood/history` | GET | `?limit=30&offset=0` | `200 OK` - `{summary, chartData, history[]}` |
| `/api/recommendations`| GET | `?mood=<mood_name>` | `200 OK` - `{songs[]}` |

Bu doküman, projenin mevcut mimarisini yansıtmaktadır ve "Architecture Review" sürecinin ilk aşaması için temel oluşturur.
