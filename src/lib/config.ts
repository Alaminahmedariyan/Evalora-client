// Only NEXT_PUBLIC_-prefixed vars are readable in the browser — never put a
// secret here. The backend's own secrets (Stripe key, DB url, etc.) live in
// the Evalora backend project, not this one.

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(
      `Missing required env var "${name}". Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}

export const config = {
  apiBaseUrl: requireEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:5000/api/v1"),
  authBaseUrl: requireEnv("NEXT_PUBLIC_AUTH_BASE_URL", "http://localhost:5000"),
};