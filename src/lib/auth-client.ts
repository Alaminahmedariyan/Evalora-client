import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  inferAdditionalFields,
  twoFactorClient,
} from "better-auth/client/plugins";
import { config } from "./config";

// Mirrors the server's `user.additionalFields.role` (see lib/auth.ts on the
// backend) so `useSession()` and friends come back typed with `role`
// instead of `unknown`.
type BackendAuth = {
  user: {
    role: "ADMIN" | "RECRUITER" | "CANDIDATE";
  };
};

export const authClient = createAuthClient({
  // This is the frontend's own origin. Next.js rewrites /api/auth to the
  // backend (see next.config.ts), so the session cookie is first-party and
  // works in every browser. The bearer-token path on the backend exists
  // only for non-browser clients (Postman, a future mobile app).
  baseURL: config.authBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    twoFactorClient(),
    emailOTPClient(),
    inferAdditionalFields<BackendAuth>(),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;