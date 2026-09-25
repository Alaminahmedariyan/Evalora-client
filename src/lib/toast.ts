import { toast } from "sonner";

// Single wrapper around sonner so every future component calls notify.*
// instead of importing `toast` directly — keeps styling/copy conventions
// (and any future swap of toast library) in one place.
export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    toast.error(message, description ? { description } : undefined),
  warning: (message: string, description?: string) =>
    toast.warning(message, description ? { description } : undefined),
  info: (message: string, description?: string) =>
    toast.info(message, description ? { description } : undefined),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
  promise: toast.promise,
};