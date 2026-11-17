export type MessageSenderRole = 'CUSTOMER' | 'PROFESSIONAL' | 'SYSTEM' | 'ADMIN';
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';
export type MessageDeliveryStatus = 'sending' | 'sent' | 'failed';

export interface ChatAttachment {
  name: string;
  url: string; // Base64 Data URL or mock media URL
  size: number; // bytes
  mimeType: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  content: string;
  createdAt: string; // ISO 8601 string
  messageType: MessageType;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  isRead: boolean;
  status: MessageDeliveryStatus;
}

export interface SendMessagePayload {
  jobId: string;
  content: string;
  attachment?: {
    name: string;
    dataUrl: string;
    size: number;
    mimeType: string;
  };
}

export interface MessageSender {
  id: string;
  name: string;
  role: MessageSenderRole;
}

