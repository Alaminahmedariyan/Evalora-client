// Only NEXT_PUBLIC_-prefixed vars are readable in the browser — never put a
// secret here. The backend's own secrets (Stripe key, DB url, etc.) live in
// the Evalora backend project, not this one.

export const config = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://evalora-server.vercel.app/api/v1",

  authBaseUrl:
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    "https://evalora-server.vercel.app",

  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://evalora-client.vercel.app"
  ).replace(/\/$/, ""),
};