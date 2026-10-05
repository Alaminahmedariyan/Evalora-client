// Read by middleware and server components, never by browser code. The
// browser calls the same-origin /api/* paths that next.config.ts forwards.
const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:5000").replace(/\/$/, "");

export const serverConfig = {
  backendUrl,
  apiBaseUrl: `${backendUrl}/api/v1`,
};