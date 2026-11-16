// [DEV-ONLY FIXTURE]: Client-side job messaging prototype simulation.
// Does NOT provide production security, backend persistence, or real Socket.IO connections.

import type { ChatMessage, SendMessagePayload, MessageSender } from '@/types/message';
import type { IMessageService } from './messageService';

const STORAGE_MESSAGES_KEY = 'solvebid_mock_job_messages';
const SIMULATED_LATENCY_MS = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' ? 0 : 200;

function delay(ms = SIMULATED_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const INITIAL_SEED_MESSAGES: ChatMessage[] = [
  // JOB-00847: In Progress (Sarthak Chavan & Arun HVAC Services)
  {
    id: 'MSG-847-1',
    jobId: 'JOB-00847',
    senderId: 'user-demo-pro',
    senderName: 'Arun HVAC Services (Arun Kumar)',
    senderRole: 'PROFESSIONAL',
    content: 'Hello Sarthak, I am preparing the diagnostic equipment and manifold gauges for the AC inspection.',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
  {
    id: 'MSG-847-2',
    jobId: 'JOB-00847',
    senderId: 'user-demo-customer',
    senderName: 'Sarthak Chavan',
    senderRole: 'CUSTOMER',
    content: 'Thanks Arun! Please let me know once you are near the society gate so I can approve visitor entry on the app.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
  {
    id: 'MSG-847-3',
    jobId: 'JOB-00847',
    senderId: 'user-demo-pro',
    senderName: 'Arun HVAC Services (Arun Kumar)',
    senderRole: 'PROFESSIONAL',
    content: 'Understood. The capacitor and compressor electrical tests take about 30 to 45 minutes.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
  {
    id: 'MSG-847-4',
    jobId: 'JOB-00847',
    senderId: 'user-demo-customer',
    senderName: 'Sarthak Chavan',
    senderRole: 'CUSTOMER',
    content: 'Perfect, looking forward to getting the cooling restored.',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },

  // JOB-00831: Scheduled (Sarthak Chavan & Pune Precision Electricals)
  {
    id: 'MSG-831-1',
    jobId: 'JOB-00831',
    senderId: 'pro-precision-elec',
    senderName: 'Pune Precision Electricals (Mahesh Patil)',
    senderRole: 'PROFESSIONAL',
    content: 'Hi Sarthak, Mahesh from Pune Precision Electricals here. Looking forward to diagnosing the water heater tripping issue tomorrow.',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
  {
    id: 'MSG-831-2',
    jobId: 'JOB-00831',
    senderId: 'user-demo-customer',
    senderName: 'Sarthak Chavan',
    senderRole: 'CUSTOMER',
    content: 'Hi Mahesh, the breaker trips almost immediately when the 25A geyser switch is turned on.',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },

  // JOB-00790: Completed (Sarthak Chavan & QuickChill HVAC Solutions)
  {
    id: 'MSG-790-1',
    jobId: 'JOB-00790',
    senderId: 'pro-quickchill',
    senderName: 'QuickChill HVAC Solutions',
    senderRole: 'PROFESSIONAL',
    content: 'Good afternoon Mr. Chavan, the replacement split system compressor has been installed and tested for 30 minutes at optimal pressure.',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
  {
    id: 'MSG-790-2',
    jobId: 'JOB-00790',
    senderId: 'user-demo-customer',
    senderName: 'Sarthak Chavan',
    senderRole: 'CUSTOMER',
    content: 'Thank you for the prompt work! Cold air is flowing evenly now.',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    messageType: 'TEXT',
    isRead: true,
    status: 'sent',
  },
];

export class MockMessageAdapter implements IMessageService {
  private messages: ChatMessage[] = [];

  constructor() {
    this.reloadFromStorage();
  }

  private isStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private reloadFromStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        const stored = window.localStorage.getItem(STORAGE_MESSAGES_KEY);
        if (stored) {
          this.messages = JSON.parse(stored);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse mock messages from localStorage:', err);
      }
    }
    // Default clone
    this.messages = JSON.parse(JSON.stringify(INITIAL_SEED_MESSAGES));
    this.persistToStorage();
  }

  private persistToStorage(): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(this.messages));
      } catch (err) {
        console.warn('Failed to persist mock messages to localStorage:', err);
      }
    }
  }

  public async getMessages(jobId: string, _currentUserId?: string): Promise<ChatMessage[]> {
    await delay();
    this.reloadFromStorage();

    const jobMessages = this.messages
      .filter((m) => m.jobId === jobId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // If currentUserId is passed, we don't automatically mark read in getMessages (that is explicit in markAsRead)
    return JSON.parse(JSON.stringify(jobMessages));
  }

  public async sendMessage(payload: SendMessagePayload, sender: MessageSender): Promise<ChatMessage> {
    await delay();
    this.reloadFromStorage();

    const trimmedContent = (payload.content || '').trim();
    if (!trimmedContent && !payload.attachment) {
      throw new Error('Message content cannot be empty.');
    }

    if (payload.attachment) {
      if (payload.attachment.size > 5 * 1024 * 1024) {
        throw new Error('Attachment exceeds maximum allowed size of 5MB.');
      }
      if (!payload.attachment.mimeType.startsWith('image/')) {
        throw new Error('Invalid file format. Only image attachments (JPEG, PNG, WebP) are supported.');
      }
    }

    const newMessage: ChatMessage = {
      id: `MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      jobId: payload.jobId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
      messageType: payload.attachment ? 'IMAGE' : 'TEXT',
      attachmentUrl: payload.attachment?.dataUrl,
      attachmentName: payload.attachment?.name,
      attachmentSize: payload.attachment?.size,
      attachmentMimeType: payload.attachment?.mimeType,
      isRead: false,
      status: 'sent',
    };

    this.messages.push(newMessage);
    this.persistToStorage();

    return JSON.parse(JSON.stringify(newMessage));
  }

  public async getLatestMessage(jobId: string): Promise<ChatMessage | null> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    const jobMessages = this.messages
      .filter((m) => m.jobId === jobId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (jobMessages.length === 0) return null;
    return JSON.parse(JSON.stringify(jobMessages[jobMessages.length - 1]));
  }

  public async getUnreadCount(jobId: string, currentUserId: string): Promise<number> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    const unread = this.messages.filter(
      (m) => m.jobId === jobId && m.senderId !== currentUserId && !m.isRead
    );
    return unread.length;
  }

  public async markAsRead(jobId: string, currentUserId: string): Promise<void> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 50 : 0);
    this.reloadFromStorage();

    let updated = false;
    this.messages.forEach((m) => {
      if (m.jobId === jobId && m.senderId !== currentUserId && !m.isRead) {
        m.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      this.persistToStorage();
    }
  }

  public async simulateIncomingReply(jobId: string, customContent?: string): Promise<ChatMessage> {
    await delay(SIMULATED_LATENCY_MS > 0 ? 300 : 0);
    this.reloadFromStorage();

    // Determine counterparty from existing messages or fallback
    const jobMsgs = this.messages.filter((m) => m.jobId === jobId);
    const lastMsg = jobMsgs[jobMsgs.length - 1];

    let senderId = 'user-demo-pro';
    let senderName = 'Arun HVAC Services (Arun Kumar)';
    let senderRole: 'PROFESSIONAL' | 'CUSTOMER' = 'PROFESSIONAL';

    if (lastMsg && lastMsg.senderRole === 'PROFESSIONAL') {
      senderId = 'user-demo-customer';
      senderName = 'Sarthak Chavan';
      senderRole = 'CUSTOMER';
    } else if (lastMsg && lastMsg.senderRole === 'CUSTOMER') {
      senderId = lastMsg.senderId === 'user-demo-customer' ? 'user-demo-pro' : 'user-demo-customer';
      senderName = senderId === 'user-demo-pro' ? 'Arun HVAC Services (Arun Kumar)' : 'Sarthak Chavan';
      senderRole = senderId === 'user-demo-pro' ? 'PROFESSIONAL' : 'CUSTOMER';
    }

    const defaultReply =
      senderRole === 'PROFESSIONAL'
        ? 'Received your update. The tools are ready and work is progressing according to schedule.'
        : 'Thank you for the update! Please let me know if you need any additional access.';

    const replyMsg: ChatMessage = {
      id: `MSG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      jobId,
      senderId,
      senderName,
      senderRole,
      content: customContent || defaultReply,
      createdAt: new Date().toISOString(),
      messageType: 'TEXT',
      isRead: false,
      status: 'sent',
    };

    this.messages.push(replyMsg);
    this.persistToStorage();

    return JSON.parse(JSON.stringify(replyMsg));
  }

  public async retryMessage(messageId: string): Promise<ChatMessage> {
    await delay();
    this.reloadFromStorage();

    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) {
      throw new Error(`Message with ID "${messageId}" not found.`);
    }

    msg.status = 'sent';
    this.persistToStorage();

    return JSON.parse(JSON.stringify(msg));
  }

  public async deleteMessage(messageId: string): Promise<boolean> {
    await delay();
    this.reloadFromStorage();

    const initialLen = this.messages.length;
    this.messages = this.messages.filter((m) => m.id !== messageId);
    if (this.messages.length !== initialLen) {
      this.persistToStorage();
      return true;
    }
    return false;
  }

  // Direct injection for automated test harnesses
  public __injectMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.persistToStorage();
  }

  public __resetToSeed(): void {
    this.messages = JSON.parse(JSON.stringify(INITIAL_SEED_MESSAGES));
    this.persistToStorage();
  }
}

export const mockMessageAdapter = new MockMessageAdapter();

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__solvebid_message_adapter = mockMessageAdapter;
}

