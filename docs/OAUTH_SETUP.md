# OAuth Provider Setup Guide

This guide explains how to configure OAuth providers (Google and GitHub) for your Next.js application.

## Prerequisites

- Auth.js v5 is already configured in the project
- OAuth providers are defined in [auth.config.ts](../auth.config.ts)
- Environment variables are configured in [lib/env.ts](../lib/env.ts)

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Your app name (e.g., "Next Base Stack")
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### 3. Add to Environment Variables

Copy the Client ID and Client Secret to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Configure:
   - **Application name**: Your app name (e.g., "Next Base Stack")
   - **Homepage URL**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorization callback URL**:
     - `http://localhost:3000/api/auth/callback/github` (development)
     - `https://yourdomain.com/api/auth/callback/github` (production)

### 2. Generate Client Secret

1. After creating the app, click **Generate a new client secret**
2. Copy the Client ID and Client Secret immediately (you won't be able to see the secret again)

### 3. Add to Environment Variables

Add to your `.env` file:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Testing OAuth Flow

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page: `http://localhost:3000/tr/login`

3. Click on "Google ile devam et" or "GitHub ile devam et"

4. You should be redirected to the OAuth provider's login page

5. After authorization, you'll be redirected back to your app

## How OAuth Works in This App

### Flow Diagram

```
User clicks "Continue with Google/GitHub"
    ↓
Auth.js redirects to OAuth provider
    ↓
User authorizes on provider's page
    ↓
Provider redirects back with authorization code
    ↓
Auth.js exchanges code for access token
    ↓
Auth.js fetches user profile from provider
    ↓
User account is created/updated in database
    ↓
User is logged in with session
```

### Database Integration

When a user logs in with OAuth:

1. **First time**:
   - New user record created in `users` table
   - OAuth account linked in `accounts` table
   - Profile created in `profiles` table
   - Session created

2. **Returning user**:
   - Existing user account found
   - New session created
   - Access token updated in `accounts` table

### Account Linking

Users can link multiple OAuth providers to the same account:
- Users are matched by email address
- Same email across providers = same user account
- Multiple OAuth accounts can be linked to one user

## UI Components

### Login/Register Pages

OAuth buttons are already integrated in:
- [app/[locale]/(auth)/login/login-form.tsx](../app/[locale]/(auth)/login/login-form.tsx)
- [app/[locale]/(auth)/register/register-form.tsx](../app/[locale]/(auth)/register/register-form.tsx)

The buttons use the `signIn()` function from `next-auth/react`:

```typescript
import { signIn } from "next-auth/react";

// Google OAuth
<Button onClick={() => signIn("google", { callbackUrl: `/${locale}/dashboard` })}>
  Continue with Google
</Button>

// GitHub OAuth
<Button onClick={() => signIn("github", { callbackUrl: `/${locale}/dashboard` })}>
  Continue with GitHub
</Button>
```

## Security Considerations

### Environment Variables

- ✅ OAuth secrets are server-side only
- ✅ Never commit `.env` to version control
- ✅ Use different credentials for development and production

### Callback URLs

- ✅ Always use HTTPS in production
- ✅ Whitelist exact redirect URIs in OAuth provider settings
- ✅ Never use wildcards in redirect URIs

### Session Management

- ✅ Sessions use JWT with secure httpOnly cookies
- ✅ Session tokens are rotated on each request
- ✅ Sessions expire after inactivity

## Troubleshooting

### "Redirect URI mismatch" error

- Check that the callback URL in OAuth provider settings **exactly** matches your app's URL
- Format: `http://localhost:3000/api/auth/callback/{provider}`
- Include `/api/auth/callback/` in the path

### "OAuth client credentials are invalid"

- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check for extra spaces or line breaks in `.env` file
- Regenerate credentials if needed

### User email not available

- Some OAuth providers don't share email by default
- Request email scope in provider configuration
- Handle cases where email might be missing

### Account already exists with different provider

- Users are matched by email address
- If a user registers with email/password, they can still use OAuth with the same email
- The accounts will be automatically linked

## Production Deployment

### Before Going Live

1. ✅ Update OAuth redirect URIs with production domain
2. ✅ Set `AUTH_SECRET` to a strong random value
3. ✅ Use production credentials (not development ones)
4. ✅ Enable HTTPS
5. ✅ Test OAuth flow on production

### Environment Variables for Production

Update these in your production environment:

```env
AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=production-google-client-id
GOOGLE_CLIENT_SECRET=production-google-secret
GITHUB_CLIENT_ID=production-github-client-id
GITHUB_CLIENT_SECRET=production-github-secret
```

## Additional OAuth Providers

To add more OAuth providers (Twitter, Facebook, etc.):

1. Install the provider package if needed (most are included in `next-auth`)
2. Add provider configuration to [auth.config.ts](../auth.config.ts):

```typescript
import Twitter from "next-auth/providers/twitter";

export default {
  providers: [
    Google({ /* ... */ }),
    GitHub({ /* ... */ }),
    Twitter({
      clientId: env.TWITTER_CLIENT_ID!,
      clientSecret: env.TWITTER_CLIENT_SECRET!,
    }),
  ],
  // ...
}
```

3. Add environment variables to [lib/env.ts](../lib/env.ts)
4. Add UI buttons to login/register forms
5. Update this documentation

## References

- [Auth.js Documentation](https://authjs.dev/)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
