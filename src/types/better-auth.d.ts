import "better-auth";
import "better-auth/client";

declare module "better-auth/types" {
  interface User {
    role?: "ADMIN" | "RECRUITER" | "CANDIDATE";
  }
}

declare module "better-auth" {
  interface User {
    role?: "ADMIN" | "RECRUITER" | "CANDIDATE";
  }
}