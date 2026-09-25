import type { AuthUser } from "./user.type";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SendEmailOtpPayload {
  email: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

export interface VerifyEmailOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordOtpPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

/**
 * POST /auth/login's `data` shape. This wraps Better Auth's raw
 * signInEmail response, which returns `{ twoFactorRedirect: true }` (no
 * user/token) when the account has 2FA enabled, or a session-ish payload
 * otherwise. The exact successful shape isn't fully confirmed yet — log
 * a real response once and tighten this type accordingly.
 */
export type LoginResponseData = {
  twoFactorRedirect?: boolean;
  redirect?: boolean;
  token?: string;
  user?: AuthUser;
};