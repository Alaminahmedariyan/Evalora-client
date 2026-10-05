export type ContactMessageStatus = "NEW" | "READ";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  // Honeypot field — must stay empty for real visitors.
  website: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  readAt: string | null;
  createdAt: string;
}

export interface ContactListParams {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
  search?: string;
}