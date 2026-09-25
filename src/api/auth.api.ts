import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponseData,
  RegisterPayload,
  ResetPasswordOtpPayload,
  SendEmailOtpPayload,
  VerifyEmailOtpPayload,
} from "@/types";

export function userRegister(payload: RegisterPayload) {
  return apiClient<ApiResponse<unknown>>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function userLogin(payload: LoginPayload) {
  return apiClient<ApiResponse<LoginResponseData>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function userLogout() {
  return apiClient<ApiResponse<unknown>>("/auth/logout", { method: "POST" });
}

export function refreshSession() {
  return apiClient<ApiResponse<unknown>>("/auth/refresh-token", { method: "POST" });
}

export function sendEmailOtp(payload: SendEmailOtpPayload) {
  return apiClient<ApiResponse<unknown>>("/auth/send-otp", {
    method: "POST",
    body: payload,
  });
}

export function verifyEmailOtp(payload: VerifyEmailOtpPayload) {
  return apiClient<ApiResponse<unknown>>("/auth/verify-email-otp", {
    method: "POST",
    body: payload,
  });
}

export function resetPasswordWithOtp(payload: ResetPasswordOtpPayload) {
  return apiClient<ApiResponse<unknown>>("/auth/reset-password-otp", {
    method: "POST",
    body: payload,
  });
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiClient<ApiResponse<unknown>>("/auth/change-password", {
    method: "POST",
    body: payload,
  });
}

export function getMe() {
  return apiClient<ApiResponse<AuthUser>>("/auth/me");
}