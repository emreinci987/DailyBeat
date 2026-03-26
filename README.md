# bil481Project
bil481 project

DailyBeat, kullanıcıların duygusal farkındalıklarını artırmayı ve ruh hallerine en uygun müzik eşleşmesini sağlamayı hedefleyen web tabanlı bir uygulamadır. Kullanıcılara anlık duygu durumları sorulur ve toplanan bu veriler işlenerek kullanıcının o anki modunu iyileştirecek veya destekleyecek kişiselleştirilmiş şarkı önerileri sunulur.


🚀 Temel Özellikler
Duygu Kaydı: Kullanıcılar emoji veya 1-10 arası kaydırma çubuğu ile anlık ruh hallerini hızlıca sisteme girebilir.

Akıllı Müzik Önerisi: Girilen duygu durumuna göre Spotify veya YouTube API'leri ile iletişim kurularak uygun şarkı önerilir.

Keşif Modu (Macera Modu): Kullanıcıya algoritma dışına çıkarak farklı türlerden sürpriz ve alternatif şarkı önerileri sunulur.

Geçmiş Paneli (History Dashboard): Kullanıcılar son 7 güne ait veya haftalık/aylık duygu değişimlerini liste ve grafik halinde görüntüleyebilir.

Profil Yönetimi: Kullanıcılar favori müzik türlerini seçerek öneri algoritmasını kişiselleştirebilir.

Geri Bildirim: Kullanıcılar önerilen şarkılar için geri bildirim vererek algoritmanın sürekli iyileşmesini sağlayabilir.

💻 Kullanılan Teknolojiler
Frontend (Ön Yüz): Next.js (Mobil ve masaüstü uyumlu responsive tasarım) 

Backend (Arka Yüz): Node.js 

Veritabanı: Firebase 

Harici API'ler: Spotify Web API, YouTube Data API 

Versiyon Kontrol & Araçlar: Git, GitHub, Visual Studio Code 

Dağıtım (Deployment): Cloudflare (veya benzeri bir bulut platformu) 

👥 Proje Ekibi ve Sorumluluklar
Emre İnci (Project Manager & Backend Developer & Requirement Analyst): Proje takibi, veritabanı mimarisi, kimlik doğrulama ve sunucu taraflı mantığın (API, DB) geliştirilmesi.

Orhan Faruk Demir (Lead Frontend Developer & UI/UX Designer & Tester): Kullanıcı arayüzünün tasarlanması, responsive yapının kurulması ve kullanıcı deneyiminin (UX) iyileştirilmesi.

Bekir Ata Yıldırım (Data Analyst & Algorithm Specialist & Tester): API entegrasyonu, veri analizi, müzik öneri algoritması ve test süreçleri.

📌 Proje Kapsamı Dışı (Out of Scope)
Telif hakları nedeniyle uygulama içinde doğrudan müzik çalma (playback) özelliği bulunmamaktadır; şarkılar için sadece yönlendirme linki verilir.

Sosyal medya paylaşımı ve arkadaş ekleme sistemi.

Anlık bildirimler (Push Notifications) ve hatırlatıcı servisleri.

🛡️ Güvenlik ve Gizlilik
Kullanıcı şifreleri veritabanında hashlenmiş olarak saklanır.

Kullanıcıya ait duygu verileri yalnızca sistem içi analiz amacıyla kullanılır, üçüncü kişilerle paylaşılmaz.

Hesap silindiğinde tüm duygu ve profil verileri kalıcı olarak silinir.