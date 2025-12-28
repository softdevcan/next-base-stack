# CSRF Protection

This document explains the CSRF (Cross-Site Request Forgery) protection implemented in this Next.js application.

## Overview

Our application uses multiple layers of CSRF protection:

1. **Next.js Built-in Protection** - Server Actions automatically validate same-origin
2. **Origin Header Validation** - Middleware checks origin for state-changing requests
3. **CSRF Token Validation** - Double Submit Cookie pattern for critical operations

## Built-in Protection

Next.js Server Actions have built-in CSRF protection. For most forms, you don't need to do anything special:

```tsx
// Server Action
"use server";

export async function updateProfile(formData: FormData) {
  // This is automatically protected against CSRF
  const session = await auth();
  // ... your logic
}
```

```tsx
// Form Component
<form action={updateProfile}>
  <input name="name" />
  <button type="submit">Update</button>
</form>
```

## Middleware Protection

The middleware automatically validates the `Origin` header for all state-changing requests (POST, PUT, DELETE, PATCH):

```typescript
// middleware.ts
if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
  // Validates that origin matches host
  // Blocks cross-origin requests
}
```

This protects against:
- Cross-origin form submissions
- Cross-site request forgery
- Malicious third-party sites

## Enhanced Protection for Critical Operations

For highly sensitive operations (e.g., account deletion, payment processing), use explicit CSRF token validation:

### 1. Add CSRF Token to Form

```tsx
import { CsrfInput } from "@/components/csrf-input";

export default function CriticalForm() {
  return (
    <form action={deletAccount}>
      <CsrfInput />
      <button type="submit">Delete Account</button>
    </form>
  );
}
```

### 2. Validate CSRF Token in Server Action

```typescript
"use server";

import { validateCsrfAction } from "@/lib/csrf";

export async function deleteAccount(formData: FormData) {
  // Validate CSRF token
  await validateCsrfAction(formData.get("csrf_token") as string);

  // Validate session
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // ... proceed with account deletion
}
```

## API Route Protection

For API routes (if you add them), use the CSRF utilities:

```typescript
import { verifyOrigin, verifyCsrfToken } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify origin
  const isValidOrigin = await verifyOrigin();
  if (!isValidOrigin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  // For critical endpoints, also verify CSRF token
  const token = request.headers.get("x-csrf-token");
  const isValidToken = await verifyCsrfToken(token);
  if (!isValidToken) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  // ... your API logic
}
```

## Client-Side Implementation

For client components that make fetch requests:

```typescript
"use client";

import { useState } from "react";

export function ClientForm() {
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/endpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: "..." }),
      credentials: "same-origin", // Important: includes cookies
    });

    // ... handle response
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

## Security Best Practices

1. **Use Server Actions** - Prefer Server Actions over API routes when possible
2. **Always Validate Sessions** - Check `auth()` in every Server Action
3. **Use HTTPS in Production** - Cookies require secure connections
4. **Set SameSite Cookies** - Already configured to `lax` for CSRF cookies
5. **Critical Operations** - Use explicit CSRF tokens for sensitive actions

## When to Use Enhanced Protection

Use explicit CSRF token validation (`<CsrfInput />` + `validateCsrfAction()`) for:

- ✅ Account deletion
- ✅ Payment processing
- ✅ Subscription changes
- ✅ Email/password changes
- ✅ 2FA setup/removal
- ✅ API key generation
- ✅ Webhook configuration

For regular forms (profile updates, settings), the built-in protection is sufficient.

## Testing CSRF Protection

To test that CSRF protection is working:

1. **Valid Request** - Should work normally
2. **Cross-Origin Request** - Should be blocked with 403
3. **Missing CSRF Token** - Should be rejected
4. **Invalid CSRF Token** - Should be rejected

Example test:

```typescript
// This should fail (cross-origin)
await fetch("https://your-app.com/api/endpoint", {
  method: "POST",
  headers: {
    Origin: "https://malicious-site.com",
  },
  body: JSON.stringify({ data: "..." }),
});
// Expected: 403 Forbidden
```

## Troubleshooting

### "Invalid origin" Error

- Check that requests are coming from the same domain
- Verify HTTPS is used in production
- Check that `Origin` and `Host` headers match

### "Invalid CSRF token" Error

- Ensure `<CsrfInput />` is included in the form
- Verify the form is submitting correctly
- Check that cookies are enabled
- Ensure the CSRF token cookie hasn't expired (24h default)

### Form Submission Fails

- Check browser console for errors
- Verify Server Action is properly exported
- Check that `auth()` validation isn't blocking the request
- Ensure FormData is being passed correctly

## Implementation Details

### Double Submit Cookie Pattern

We use the Double Submit Cookie pattern:

1. Server generates a random CSRF token
2. Token is stored in an HttpOnly cookie
3. Token is also embedded in the form as a hidden field
4. On submission, both tokens are compared
5. Request is rejected if tokens don't match

### Timing-Safe Comparison

Token comparison uses constant-time comparison to prevent timing attacks:

```typescript
function timingSafeEqual(a: string, b: string): boolean {
  // Prevents attackers from guessing tokens via timing analysis
}
```

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security)
- [MDN: CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)
