// middleware.ts
import { NextResponse } from "next/server";

//
// RELEASE INSTANT (UTC):
// 2025-08-28 01:39:40 UTC  ==  2025-08-27 18:39:40 PDT (California)
const RELEASE_ISO_UTC = "2025-08-28T01:39:40Z";
const RELEASE_TS = Date.parse(RELEASE_ISO_UTC); // milliseconds since epoch

// Optional: allowlist paths that you want accessible before launch
// If you truly want a "birth moment," keep this list empty or minimal.
const ALLOWLIST_BEFORE = new Set<string>([
  "/robots.txt",
  "/api/robots.txt"
]);


export const config = {
  // Apply to everything; you can exclude assets if desired
  matcher: ["/:path*"],
};

export function middleware(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;

  // If it's an allowlisted path, let it through
  if (ALLOWLIST_BEFORE.has(path)) return NextResponse.next();

  const now = Date.now();
  const isBefore = now < RELEASE_TS;

  if (!isBefore) {
    // After the release instant: full access
    return NextResponse.next();
  }

  // Before release: return a lightweight holding response.
  // - no-store to prevent caching of the placeholder
  // - X-Robots-Tag prevents accidental indexing
  // - Retry-After is a nice hint for well-behaved bots/tools
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Coming Soon</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;background:#0b1020;color:#f8fafc}
    .card{padding:28px 32px;background:#0f172a;border:1px solid #1f2937;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:center;max-width:680px}
    h1{margin:0 0 8px;font-size:28px}
    p{margin:6px 0 0;line-height:1.4;font-size:16px;opacity:.9}
    code{background:#111827;border-radius:6px;padding:2px 6px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Coming Soon</h1>
    <p>This page will be available on<br><strong>Aug 27, 2025 at 6:39:40 PM PDT</strong></p>
    <p>(<code>${RELEASE_ISO_UTC}</code> UTC)</p>
  </div>
</body>
</html>`;

  const res = new NextResponse(html, { status: 403 });
  res.headers.set("Content-Type", "text/html; charset=utf-8");
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  // Optional: estimate seconds until release for Retry-After
  const secondsUntil = Math.max(0, Math.floor((RELEASE_TS - now) / 1000));
  res.headers.set("Retry-After", String(secondsUntil));
  return res;
}
