export function dashboardPathFor(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "RECRUITER") return "/recruiter";
  return "/candidate";
}