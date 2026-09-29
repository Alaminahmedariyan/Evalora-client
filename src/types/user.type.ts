export type UserRole = "ADMIN" | "RECRUITER" | "CANDIDATE";

// Matches AuthenticatedUser in the backend's requireAuth.ts — that's the
// exact shape req.user (and therefore GET /auth/me's `data`) carries.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

// Matches USER_PUBLIC_SELECT on the backend.
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}