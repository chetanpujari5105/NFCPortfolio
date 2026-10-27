/** Canonical site URL: NEXT_PUBLIC_SITE_URL, else Vercel's production domain, else the intended domain. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://chetanpujari.com")
).replace(/\/+$/, "");
