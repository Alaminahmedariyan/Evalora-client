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