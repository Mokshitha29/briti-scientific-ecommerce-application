export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'Contacted' | 'Resolved';
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
