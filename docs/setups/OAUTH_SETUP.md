# OAuth Setup Guide (Google & GitHub)

Bu rehber Google ve GitHub OAuth entegrasyonunu adım adım açıklar.

## ✅ Mevcut Durum

Proje OAuth için **hazır durumda**:
- ✅ Google & GitHub providers eklendi ([auth.config.ts:13-22](auth.config.ts))
- ✅ Login/Register formlarında OAuth butonları var
- ✅ Supabase PostgreSQL `accounts` tablosu OAuth için hazır
- ⚠️ Sadece OAuth credentials eklenmesi gerekiyor

## 🔑 Google OAuth Setup

### 1. Google Cloud Console'a Git

https://console.cloud.google.com adresine git ve Google hesabınla giriş yap.

### 2. Proje Oluştur

1. Üst menüden **"Select a project"** → **"New Project"**
2. **Project name**: `Next Base Stack` (veya istediğin ad)
3. **Create** butonuna tıkla
4. Proje oluşana kadar bekle (30 saniye)

### 3. OAuth Consent Screen Yapılandır

1. Sol menüden **APIs & Services** → **OAuth consent screen**
2. **User Type**: **External** seç → **Create**
3. Form doldur:
   - **App name**: `Next Base Stack`
   - **User support email**: Email adresin
   - **Developer contact**: Email adresin
4. **Save and Continue** (Scopes adımını skip et)
5. **Save and Continue** (Test users adımını skip et)

### 4. OAuth Credentials Oluştur

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**
3. **Application type**: **Web application**
4. **Name**: `Next Base Stack Web`
5. **Authorized redirect URIs** ekle:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   Production için:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. **Create** butonuna tıkla

### 5. Credentials Kopyala

Ekranda gösterilen:
- **Client ID**: `123456789-abc...apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-...`

**Bu bilgileri güvenli bir yere kaydet!**

### 6. `.env` Dosyasına Ekle

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789-abc...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret-here"
```

---

## 🐙 GitHub OAuth Setup

### 1. GitHub Settings'e Git

https://github.com/settings/developers adresine git.

### 2. OAuth App Oluştur

1. **OAuth Apps** → **New OAuth App**
2. Form doldur:
   - **Application name**: `Next Base Stack`
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: (opsiyonel)
   - **Authorization callback URL**:
     ```
     http://localhost:3000/api/auth/callback/github
     ```
3. **Register application** butonuna tıkla

### 3. Client Secret Generate Et

1. **Generate a new client secret** butonuna tıkla
2. Client Secret gösterilecek - **HEMEN KOPYALA!** (Bir daha gösterilmez)

### 4. Credentials Kopyala

- **Client ID**: `Iv1.abc123...`
- **Client Secret**: `ghp_abc123...` (方才 kopyaladığın)

### 5. `.env` Dosyasına Ekle

```env
# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.abc123..."
GITHUB_CLIENT_SECRET="ghp_abc123..."
```

---

## 🚀 Test Etme

### 1. Dependency'leri Yükle

```bash
npm install
```

### 2. Development Server'ı Başlat

```bash
npm run dev
```

### 3. Login Sayfasına Git

http://localhost:3000/tr/login

### 4. OAuth Butonlarını Test Et

**Google ile Giriş:**
1. "Google ile devam et" butonuna tıkla
2. Google hesabını seç
3. İzinleri onayla
4. Dashboard'a yönlendirileceksin (`/tr/dashboard`)

**GitHub ile Giriş:**
1. "GitHub ile devam et" butonuna tıkla
2. GitHub'da Authorize et
3. Dashboard'a yönlendirileceksin

### 5. Veritabanını Kontrol Et

Supabase Studio'da:
- **users** tablosunda kullanıcı oluştu mu?
- **accounts** tablosunda provider bilgileri var mı?

```sql
SELECT * FROM users;
SELECT * FROM accounts WHERE provider IN ('google', 'github');
```

---

## 📊 Nasıl Çalışır?

### OAuth Flow

```
1. User clicks "Google ile devam et"
   ↓
2. Next.js → signIn("google")
   ↓
3. Redirect to Google OAuth page
   ↓
4. User authorizes
   ↓
5. Google → /api/auth/callback/google
   ↓
6. Auth.js creates/finds user in database
   ↓
7. Session created
   ↓
8. Redirect to /tr/dashboard
```

### Database Tables

**users** tablosu:
```sql
id, name, email, image, emailVerified
-- Google/GitHub'dan gelen bilgiler
```

**accounts** tablosu:
```sql
userId, provider, providerAccountId, access_token, refresh_token
-- OAuth bağlantı bilgileri
```

**sessions** tablosu:
```sql
userId, sessionToken, expires
-- Aktif oturum bilgileri
```

---

## 🔐 Production Deployment

### Vercel'de Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-production-client-id
GITHUB_CLIENT_SECRET=your-production-secret

# Auth.js
AUTH_SECRET=your-generated-secret
AUTH_URL=https://yourdomain.com

# Diğerleri...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### OAuth Redirect URLs Güncelle

**Google Cloud Console:**
- Authorized redirect URIs'e ekle:
  ```
  https://yourdomain.com/api/auth/callback/google
  ```

**GitHub OAuth App:**
- Authorization callback URL güncelle:
  ```
  https://yourdomain.com/api/auth/callback/github
  ```

---

## 🐛 Troubleshooting

### Hata: "Redirect URI mismatch"

**Çözüm:**
- `.env` dosyasında `AUTH_URL` doğru mu?
- OAuth provider'da redirect URL doğru mu?
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

### Hata: "Client ID not found"

**Çözüm:**
- `.env` dosyasında GOOGLE_CLIENT_ID veya GITHUB_CLIENT_ID var mı?
- Dev server'ı restart et: `npm run dev`

### Hata: "Invalid client secret"

**Çözüm:**
- Client secret'i doğru kopyaladın mı?
- GitHub'da yeni secret generate edip tekrar dene

### OAuth çalışıyor ama database'e kaydolmuyor

**Çözüm:**
- Supabase connection string doğru mu?
- `npm run db:push` ile tables oluşturuldu mu?
- `accounts` tablosu var mı?

---

## ✨ Özellikler

### Otomatik Account Linking

Kullanıcı aynı email ile:
1. Google ile giriş yapar
2. Sonra GitHub ile giriş yapar

→ Aynı kullanıcıya bağlanır! (`accounts` tablosunda 2 provider)

### Profil Bilgileri

OAuth'dan gelen bilgiler otomatik kaydedilir:
- `name` - Kullanıcı adı
- `email` - Email adresi
- `image` - Profil fotoğrafı URL'i

### i18n Uyumlu Redirects

OAuth callback'ler dil bilgisini korur:
```typescript
signIn("google", { callbackUrl: `/${locale}/dashboard` })
// Türkçe: /tr/dashboard
// İngilizce: /en/dashboard
```

---

## 📚 Ek Kaynaklar

- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [Auth.js Providers](https://authjs.dev/reference/core/providers)
- [Next.js Auth.js Guide](https://authjs.dev/getting-started/installation?framework=next.js)

---

**Notlar:**
- Google OAuth'da test mode'dayken sadece eklediğin email adresleri giriş yapabilir
- Production'a almadan **OAuth consent screen**'i Google'da verify ettirmen gerekebilir
- GitHub OAuth'un rate limit'i var (saatte 5000 request)
