// pages/api/robots.txt.ts
import { NextResponse } from "next/server";

const RELEASE_ISO_UTC = "2025-08-28T01:39:40Z"; // 18:39:40 PDT
const RELEASE_TS = Date.parse(RELEASE_ISO_UTC);

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const now = Date.now();

  let body: string;

  if (now < RELEASE_TS) {
    // BEFORE release: block all bots
    body = `User-agent: *
Disallow: /`;
  } else {
    // AFTER release: allow crawling + sitemap
    body = `User-agent: *
Allow: /

Sitemap: https://www.goalweightcalc.com/sitemap.xml`;
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
