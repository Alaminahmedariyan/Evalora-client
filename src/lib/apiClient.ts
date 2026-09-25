import { ofetch } from "ofetch";

import { config } from "./config";

const TOKEN_STORAGE_KEY = "evalora_auth_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null; // SSR guard
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function storeToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export type ApiErrorShape = {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string }>;
  errorCode?: string;
};

export class ApiError extends Error {
  statusCode: number;
  errorCode?: string;
  fieldErrors: Array<{ field?: string; message: string }>;

  constructor(statusCode: number, body: Partial<ApiErrorShape>) {
    super(body.message ?? "Something went wrong");
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = body.errorCode;
    this.fieldErrors = body.errors ?? [];
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

const apiClient = ofetch.create({
  // config.apiBaseUrl already includes /api/v1 — single source of truth,
  // don't redefine a second base URL here.
  baseURL: config.apiBaseUrl,
  // Frontend (localhost:3000) and backend (localhost:5000) are different
  // origins — without this the browser drops the session cookie the
  // backend's applyAuthCookies() sets on login/register/etc.
  credentials: "include",
  onRequest({ options }) {
    const token = getStoredToken();
    if (token) {
      options.headers = new Headers(options.headers);
      options.headers.set("Authorization", `Bearer ${token}`);
    }
  },
  onResponse({ response }) {
    // authController.login/register/etc call applyAuthCookies(), which
    // forwards Better Auth's "set-auth-token" header onto every auth
    // response — capture it so non-cookie contexts (or a future mobile
    // app) can authenticate via this Authorization header instead.
    const token = response.headers.get("set-auth-token");
    if (token) storeToken(token);
  },
  onResponseError({ response }) {
    const body = response._data as Partial<ApiErrorShape> | undefined;
    throw new ApiError(response.status, body ?? { message: response.statusText });
  },
});

export default apiClient;