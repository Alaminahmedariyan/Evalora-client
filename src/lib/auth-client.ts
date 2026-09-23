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
  baseURL: config.authBaseUrl,
  // The backend's CORS config already allows credentials, and cookies are
  // set with SameSite=None in production — so the cookie-based session
  // (the default for createAuthClient) works cross-origin without extra
  // wiring. We don't lean on the bearer-token header at all here; that
  // path exists on the backend mainly for non-browser clients (Postman,
  // a future mobile app).
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