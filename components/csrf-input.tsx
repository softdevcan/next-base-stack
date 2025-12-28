/**
 * CSRF Token Input Component
 *
 * Automatically includes CSRF token in forms for Server Actions
 * Usage: <CsrfInput />
 */

import { ensureCsrfToken } from "@/lib/csrf";

export async function CsrfInput() {
  const token = await ensureCsrfToken();

  return (
    <input
      type="hidden"
      name="csrf_token"
      value={token}
      aria-hidden="true"
    />
  );
}
