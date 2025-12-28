# Cookie Consent System

This document explains the GDPR/CCPA compliant cookie consent system implemented in this Next.js application.

## Overview

Our application features a comprehensive cookie consent management system that complies with GDPR and CCPA regulations:

- **Banner UI** - User-friendly cookie consent banner with customization options
- **Database Storage** - Authenticated users' preferences stored in the database
- **Cookie Storage** - Non-authenticated users' preferences stored in browser cookies
- **Category Management** - Four cookie categories: Necessary, Functional, Analytics, and Marketing
- **Privacy-First** - Only necessary cookies are active until user gives consent

## Cookie Categories

### 1. Necessary Cookies (Always Enabled)

Required for the website to function properly. These cannot be disabled.

**Examples:**
- `authjs.session-token` - Authentication session
- `csrf-token` - CSRF protection token
- `NEXT_LOCALE` - User's language preference
- `cookie-consent` - Cookie consent preferences

### 2. Functional Cookies

Enable enhanced functionality and personalization.

**Examples:**
- Theme preferences (dark/light mode)
- UI customization settings
- User interface preferences

**When to use:** For features that improve user experience but aren't essential.

### 3. Analytics Cookies

Help us understand how visitors interact with our website.

**Examples:**
- Google Analytics
- Plausible Analytics
- Custom analytics tracking

**When to use:** Only load analytics scripts if this category is enabled.

### 4. Marketing Cookies

Used to track visitors across websites for advertising purposes.

**Examples:**
- Google Ads
- Facebook Pixel
- Retargeting cookies

**When to use:** Only load marketing/advertising scripts if this category is enabled.

## How It Works

### For Non-Authenticated Users

1. User visits the website
2. Cookie consent banner appears
3. User selects preferences (Accept All / Reject All / Customize)
4. Preferences are saved in a browser cookie (`cookie-consent`)
5. Banner doesn't show again unless cookie expires (365 days) or is cleared

### For Authenticated Users

1. Same flow as above, but preferences are saved in both:
   - Browser cookie (for immediate use)
   - Database (for persistence across devices)
2. When user logs in on a new device, their preferences are loaded from the database

## Implementation

### Database Schema

Cookie preferences are stored in the `profiles` table:

```typescript
cookieConsentGiven: boolean // Whether user has responded to banner
cookieConsentDate: timestamp // When consent was given
cookieNecessary: boolean // Always true
cookieFunctional: boolean
cookieAnalytics: boolean
cookieMarketing: boolean
```

### API Endpoint

`POST /api/cookie-consent`

Saves cookie preferences for both authenticated and non-authenticated users.

**Request Body:**
```json
{
  "necessary": true,
  "functional": true,
  "analytics": false,
  "marketing": false
}
```

**Response:**
```json
{
  "success": true
}
```

### Client Component

`<CookieConsentBanner />` - The main UI component that users interact with.

**Features:**
- Modal overlay design
- Customization panel with toggles for each category
- "Accept All", "Reject All", and "Customize" buttons
- Link to Privacy Policy
- Responsive design for mobile and desktop

### Server Utilities

```typescript
import {
  getCookiePreferences,
  setCookiePreferences,
  isCookieCategoryAllowed,
} from "@/lib/cookie-consent";

// Check if analytics is allowed
const canUseAnalytics = await isCookieCategoryAllowed("analytics");

if (canUseAnalytics) {
  // Load analytics scripts
}
```

### DAL Queries

```typescript
import {
  getUserCookiePreferences,
  hasGivenCookieConsent,
  updateUserCookiePreferences,
} from "@/lib/db/queries/cookie-preferences";

// Get user's preferences from database
const preferences = await getUserCookiePreferences();

// Check if user has given consent
const hasConsent = await hasGivenCookieConsent();

// Update preferences
await updateUserCookiePreferences({
  necessary: true,
  functional: true,
  analytics: true,
  marketing: false,
});
```

## Using Cookie Categories in Your Code

### Conditional Script Loading

```tsx
import { isCookieCategoryAllowed } from "@/lib/cookie-consent";

export default async function RootLayout({ children }) {
  const analyticsAllowed = await isCookieCategoryAllowed("analytics");
  const marketingAllowed = await isCookieCategoryAllowed("marketing");

  return (
    <html>
      <head>
        {analyticsAllowed && (
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"
          />
        )}
        {marketingAllowed && (
          <script
            async
            src="https://www.facebook.com/tr?id=FB_PIXEL_ID"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Client-Side Conditional Loading

```typescript
"use client";

import { useEffect, useState } from "react";

export function Analytics() {
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    // Get preferences from cookie
    const consentCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie-consent="));

    if (consentCookie) {
      const prefs = JSON.parse(decodeURIComponent(consentCookie.split("=")[1]));
      setPreferences(prefs);

      if (prefs.analytics) {
        // Initialize analytics
        initializeGoogleAnalytics();
      }
    }
  }, []);

  return null;
}
```

## Compliance

### GDPR Compliance

✅ **Explicit Consent** - Users must actively consent to non-necessary cookies
✅ **Granular Control** - Users can choose which cookie categories to enable
✅ **Easy Withdrawal** - Users can change their preferences at any time
✅ **Data Portability** - Cookie preferences can be exported with user data
✅ **Right to be Forgotten** - Preferences are deleted when account is deleted

### CCPA Compliance

✅ **Opt-Out Option** - "Reject All" button for easy opt-out
✅ **Notice at Collection** - Banner explains what cookies are used for
✅ **Privacy Policy Link** - Direct link to full privacy policy
✅ **Do Not Sell** - Marketing cookies can be individually disabled

## Customization

### Adding New Cookie Categories

1. Update the database schema in `lib/db/schema.ts`:
```typescript
cookieMyNewCategory: boolean("cookie_my_new_category").default(false).notNull(),
```

2. Generate and apply migration:
```bash
npm run db:generate
npm run db:push
```

3. Update the `CookiePreferences` type in `lib/cookie-consent.ts`:
```typescript
export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  myNewCategory: boolean; // Add this
}
```

4. Add translations to `messages/en.json` and `messages/tr.json`

5. Update the banner component to include the new category

### Changing Cookie Expiry

Edit `lib/cookie-consent.ts`:

```typescript
const COOKIE_CONSENT_EXPIRY = 365; // Change this value (in days)
```

### Customizing Banner Appearance

Edit `components/cookie-consent-banner.tsx` to modify colors, layout, and styling using Tailwind CSS classes.

## Testing

### Manual Testing

1. **First Visit** - Verify banner appears on first visit
2. **Accept All** - Verify all categories are enabled and banner disappears
3. **Reject All** - Verify only necessary cookies are enabled
4. **Customize** - Test individual category toggles
5. **Persistence** - Refresh page and verify banner doesn't show again
6. **Authenticated User** - Log in and verify preferences sync across devices
7. **Clear Cookies** - Clear browser cookies and verify banner appears again

### Automated Testing (Future)

```typescript
// Example Playwright test
test("cookie consent banner should appear on first visit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Cookie Preferences")).toBeVisible();
});

test("accept all should hide banner", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Accept All" }).click();
  await expect(page.getByText("Cookie Preferences")).not.toBeVisible();
});
```

## Troubleshooting

### Banner Not Appearing

- Check browser console for errors
- Verify translations are loaded correctly
- Check that `cookie-consent` cookie doesn't already exist
- Verify the component is included in the layout

### Preferences Not Saving

- Check `/api/cookie-consent` endpoint is accessible
- Verify database migration has been applied
- Check browser console for API errors
- Ensure cookies are enabled in the browser

### Preferences Not Persisting

- Verify cookie is being set (check browser DevTools > Application > Cookies)
- Check cookie expiry is set correctly (365 days)
- Ensure cookie is not being deleted by other code

## Migration Guide

If you're adding this to an existing application:

1. Apply database migration:
```bash
npm run db:generate
npm run db:push
```

2. Update existing users to have default cookie preferences:
```sql
UPDATE profiles SET
  cookie_consent_given = false,
  cookie_necessary = true,
  cookie_functional = false,
  cookie_analytics = false,
  cookie_marketing = false;
```

3. Review and update your existing cookie usage to respect user preferences

## References

- [GDPR Cookie Compliance](https://gdpr.eu/cookies/)
- [CCPA Cookie Requirements](https://oag.ca.gov/privacy/ccpa)
- [ICO Cookie Guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
