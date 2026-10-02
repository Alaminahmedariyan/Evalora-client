/**
 * Generates a fresh idempotency key for ONE logical user action (one
 * button click, one form submit) — call this once per action, store the
 * result, and reuse it across any retries of that same action. Never call
 * crypto.randomUUID() directly inside an API function itself; that would
 * mint a new key on every retry, defeating the backend's idempotency
 * middleware entirely.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}